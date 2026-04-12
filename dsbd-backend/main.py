from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.tree import DecisionTreeClassifier
import joblib, io, os, warnings
warnings.filterwarnings('ignore')

app = FastAPI(title="Customer Segmentation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model store (in-memory for now)
MODEL = {}
SEGMENT_MAP = {0: 'Champions', 1: 'Loyal', 2: 'At-Risk', 3: 'Lost'}
SEGMENT_DESC = {
    'Champions': 'Bought recently, buy often, spend the most.',
    'Loyal':     'Buy regularly with good frequency and spend.',
    'At-Risk':   'Used to buy but have not returned recently.',
    'Lost':      'Low recency, frequency and monetary value.'
}

# -----------------------------------------------------------
# POST /upload  — receives CSV, runs full ML pipeline
# -----------------------------------------------------------
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents), encoding='unicode_escape')

    # --- Clean ---
    df.columns = df.columns.str.strip()

    # Handle both column name variants
    cid = 'Customer ID' if 'Customer ID' in df.columns else 'CustomerID'
    inv = 'Invoice'     if 'Invoice'     in df.columns else 'InvoiceNo'
    dt  = 'InvoiceDate'
    qty = 'Quantity'
    prc = 'Price'       if 'Price'       in df.columns else 'UnitPrice'

    df.dropna(subset=[cid], inplace=True)
    df = df[~df[inv].astype(str).str.startswith('C')]
    df = df[(df[qty] > 0) & (df[prc] > 0)]
    df[cid] = df[cid].astype(int)
    df['TotalAmount'] = df[qty] * df[prc]
    df[dt] = pd.to_datetime(df[dt])

    # Outlier removal
    Q1, Q3 = df['TotalAmount'].quantile(0.25), df['TotalAmount'].quantile(0.75)
    IQR = Q3 - Q1
    df = df[(df['TotalAmount'] >= Q1 - 1.5*IQR) & (df['TotalAmount'] <= Q3 + 1.5*IQR)]

    # --- RFM ---
    snapshot = df[dt].max() + pd.Timedelta(days=1)
    rfm = df.groupby(cid).agg(
        Recency   = (dt,  lambda x: (snapshot - x.max()).days),
        Frequency = (inv, 'nunique'),
        Monetary  = ('TotalAmount', 'sum')
    ).reset_index()

    # --- Scale ---
    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm[['Recency','Frequency','Monetary']])

    # --- PCA ---
    pca = PCA(n_components=2)
    rfm_pca = pca.fit_transform(rfm_scaled)

    # --- KMeans ---
    km = KMeans(n_clusters=4, random_state=42, n_init=10)
    rfm['Cluster'] = km.fit_predict(rfm_scaled)

    # --- Auto-assign labels based on cluster means ---
    profile = rfm.groupby('Cluster')[['Recency','Frequency','Monetary']].mean()
    # Champions = lowest recency + highest monetary
    sorted_by_monetary = profile['Monetary'].sort_values(ascending=False).index.tolist()
    dynamic_map = {}
    labels = ['Champions', 'Loyal', 'At-Risk', 'Lost']
    for i, cluster_id in enumerate(sorted_by_monetary):
        dynamic_map[cluster_id] = labels[i]
    rfm['Segment'] = rfm['Cluster'].map(dynamic_map)

    # --- Train classifier ---
    clf = DecisionTreeClassifier(random_state=42)
    clf.fit(rfm_scaled, rfm['Cluster'])

    # Save to memory
    MODEL['scaler']  = scaler
    MODEL['kmeans']  = km
    MODEL['clf']     = clf
    MODEL['seg_map'] = dynamic_map

    # Save to disk too
    joblib.dump(MODEL, 'model.pkl')

    # --- Build response ---
    cluster_profiles = []
    for cluster_id, seg_name in dynamic_map.items():
        row = profile.loc[cluster_id]
        cluster_profiles.append({
            'segment':   seg_name,
            'recency':   round(row['Recency'], 1),
            'frequency': round(row['Frequency'], 1),
            'monetary':  round(row['Monetary'], 2)
        })

    sample = rfm.head(20)
    sample_customers = []
    for _, row in sample.iterrows():
        sample_customers.append({
            'customer_id': int(row[cid]) if cid in row else int(row.iloc[0]),
            'recency':     int(row['Recency']),
            'frequency':   int(row['Frequency']),
            'monetary':    round(row['Monetary'], 2),
            'segment':     row['Segment']
        })

    return {
        "total_customers":  len(rfm),
        "summary":          rfm['Segment'].value_counts().to_dict(),
        "cluster_profiles": cluster_profiles,
        "sample_customers": sample_customers,
        "pca_points":       rfm_pca.tolist()
    }


# -----------------------------------------------------------
# POST /predict — predict segment for one customer
# -----------------------------------------------------------
class CustomerInput(BaseModel):
    recency:   int
    frequency: int
    monetary:  float

@app.post("/predict")
def predict(customer: CustomerInput):
    if not MODEL:
        # Try loading from disk
        if os.path.exists('model.pkl'):
            saved = joblib.load('model.pkl')
            MODEL.update(saved)
        else:
            return {"error": "No model trained yet. Upload data first."}

    X = MODEL['scaler'].transform([[customer.recency, customer.frequency, customer.monetary]])
    cluster = int(MODEL['clf'].predict(X)[0])
    segment = MODEL['seg_map'][cluster]

    return {
        "segment":     segment,
        "description": SEGMENT_DESC[segment],
        "cluster":     cluster
    }


# -----------------------------------------------------------
# GET /health — check if backend is alive
# -----------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": bool(MODEL)}