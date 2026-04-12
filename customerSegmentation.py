# ============================================================
# Mini Project: Customer Segmentation for E-Commerce
# Dataset: Online Retail II (UCI / Kaggle)
# Author: DSBD Mini Project
# ============================================================

# -----------------------------------------------------------
# STEP 0: Install required packages (run once in terminal)
# pip install kagglehub pandas numpy matplotlib seaborn scikit-learn openpyxl
# -----------------------------------------------------------

# -----------------------------------------------------------
# STEP 1: Import Libraries (CO1)
# -----------------------------------------------------------
import os
import kagglehub
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC

from sklearn.model_selection import train_test_split
from sklearn.metrics import (confusion_matrix, classification_report,
                             accuracy_score, ConfusionMatrixDisplay)

import warnings
warnings.filterwarnings('ignore')

os.environ["KAGGLE_API_TOKEN"] = "KGAT_2fd20af24aad9169d914af4d78f8af00"

print("=" * 60)
print("  CUSTOMER SEGMENTATION FOR E-COMMERCE")
print("  Mini Project — DSBD")
print("=" * 60)

# -----------------------------------------------------------
# STEP 2: Download & Load Dataset (CO1)
# Source: https://www.kaggle.com/datasets/mashlyn/online-retail-ii-uci
# -----------------------------------------------------------
print("\n[STEP 2] Downloading dataset from Kaggle...")

path = kagglehub.dataset_download("mashlyn/online-retail-ii-uci")
print("Dataset downloaded to:", path)
print("Files available:", os.listdir(path))

# Use correct filename from the downloaded folder
csv_file = os.path.join(path, 'online_retail_II.csv')

print("\nLoading CSV file (this may take a moment)...")
df = pd.read_csv(csv_file, encoding='unicode_escape')

print(f"Dataset Shape: {df.shape}")
print("\nFirst 5 rows:")
print(df.head())

# -----------------------------------------------------------
# STEP 3: Initial Statistics (CO1)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 3] Initial Statistics")
print("=" * 60)

print("\n--- Basic Info ---")
df.info()

print("\n--- Descriptive Statistics ---")
print(df.describe())

print("\n--- Data Types ---")
print(df.dtypes)

# -----------------------------------------------------------
# STEP 4: Missing Values & Inconsistencies (CO1)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 4] Handling Missing Values & Inconsistencies")
print("=" * 60)

print("\n--- Missing Values Before Cleaning ---")
print(df.isnull().sum())
print(f"\nMissing % in Customer ID: {df['Customer ID'].isnull().mean() * 100:.2f}%")

# Drop rows without CustomerID — RFM analysis is not possible without it
df.dropna(subset=['Customer ID'], inplace=True)

# Remove cancelled orders (Invoice starting with 'C')
df = df[~df['Invoice'].astype(str).str.startswith('C')]

# Remove rows with negative or zero Quantity or Price
df = df[(df['Quantity'] > 0) & (df['Price'] > 0)]

# Fix Customer ID data type
df['Customer ID'] = df['Customer ID'].astype(int)

print(f"\nCleaned Dataset Shape: {df.shape}")
print("\n--- Missing Values After Cleaning ---")
print(df.isnull().sum())

# -----------------------------------------------------------
# STEP 5: Outlier Detection & Treatment (CO1)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 5] Outlier Detection & Treatment")
print("=" * 60)

df['TotalAmount'] = df['Quantity'] * df['Price']

# IQR Method
Q1 = df['TotalAmount'].quantile(0.25)
Q3 = df['TotalAmount'].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

outlier_count = ((df['TotalAmount'] < lower_bound) | (df['TotalAmount'] > upper_bound)).sum()
print(f"\nIQR Method:")
print(f"  Q1        = {Q1:.2f}")
print(f"  Q3        = {Q3:.2f}")
print(f"  IQR       = {IQR:.2f}")
print(f"  Lower Bound = {lower_bound:.2f}")
print(f"  Upper Bound = {upper_bound:.2f}")
print(f"  Outliers removed: {outlier_count}")

# Save boxplot BEFORE removal
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
axes[0].boxplot(df['TotalAmount'], vert=False)
axes[0].set_title('TotalAmount BEFORE Outlier Removal')
axes[0].set_xlabel('TotalAmount')

# Remove outliers
df = df[(df['TotalAmount'] >= lower_bound) & (df['TotalAmount'] <= upper_bound)]

# Boxplot AFTER removal
axes[1].boxplot(df['TotalAmount'], vert=False)
axes[1].set_title('TotalAmount AFTER Outlier Removal')
axes[1].set_xlabel('TotalAmount')

plt.tight_layout()
plt.savefig('outlier_boxplot.png', dpi=150, bbox_inches='tight')
plt.show()
print("  Saved: outlier_boxplot.png")

# -----------------------------------------------------------
# STEP 6: Data Transformation (CO1)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 6] Data Transformation")
print("=" * 60)

df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])

# Log transformation on TotalAmount to reduce right skew
df['LogAmount'] = np.log1p(df['TotalAmount'])

print(f"\nSkewness BEFORE log transform: {df['TotalAmount'].skew():.3f}")
print(f"Skewness AFTER  log transform: {df['LogAmount'].skew():.3f}")

# Plot distribution before and after
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
axes[0].hist(df['TotalAmount'], bins=50, color='steelblue', edgecolor='white')
axes[0].set_title('TotalAmount Distribution (Original)')
axes[0].set_xlabel('TotalAmount')

axes[1].hist(df['LogAmount'], bins=50, color='coral', edgecolor='white')
axes[1].set_title('LogAmount Distribution (Log Transformed)')
axes[1].set_xlabel('log(1 + TotalAmount)')

plt.tight_layout()
plt.savefig('transformation_distribution.png', dpi=150, bbox_inches='tight')
plt.show()
print("  Saved: transformation_distribution.png")

# -----------------------------------------------------------
# STEP 7: Encode Categorical Variables (CO1)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 7] Encoding Categorical Variables")
print("=" * 60)

le = LabelEncoder()
df['Country_Enc'] = le.fit_transform(df['Country'])

print("\nCountry → Label Encoded (sample):")
print(df[['Country', 'Country_Enc']].drop_duplicates().sort_values('Country').head(10))

# -----------------------------------------------------------
# STEP 8: RFM Feature Engineering (CO1)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 8] RFM Feature Engineering")
print("=" * 60)

snapshot_date = df['InvoiceDate'].max() + pd.Timedelta(days=1)
print(f"\nSnapshot date (reference): {snapshot_date.date()}")

rfm = df.groupby('Customer ID').agg(
    Recency   = ('InvoiceDate',  lambda x: (snapshot_date - x.max()).days),
    Frequency = ('Invoice',      'nunique'),
    Monetary  = ('TotalAmount',  'sum')
).reset_index()

print(f"\nRFM Table Shape: {rfm.shape}")
print("\nFirst 5 rows of RFM:")
print(rfm.head())
print("\nRFM Statistics:")
print(rfm[['Recency', 'Frequency', 'Monetary']].describe().round(2))

# -----------------------------------------------------------
# STEP 9: PCA — Dimensionality Reduction (CO1)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 9] PCA — Dimensionality Reduction")
print("=" * 60)

scaler = StandardScaler()
rfm_scaled = scaler.fit_transform(rfm[['Recency', 'Frequency', 'Monetary']])

pca = PCA(n_components=2)
rfm_pca = pca.fit_transform(rfm_scaled)

print(f"\nExplained Variance Ratio:")
print(f"  PC1: {pca.explained_variance_ratio_[0]*100:.2f}%")
print(f"  PC2: {pca.explained_variance_ratio_[1]*100:.2f}%")
print(f"  Total: {sum(pca.explained_variance_ratio_)*100:.2f}%")

plt.figure(figsize=(7, 5))
plt.scatter(rfm_pca[:, 0], rfm_pca[:, 1], alpha=0.3, s=10, color='steelblue')
plt.title('PCA of RFM Features (2D Projection)')
plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% variance)')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% variance)')
plt.tight_layout()
plt.savefig('pca_scatter.png', dpi=150, bbox_inches='tight')
plt.show()
print("  Saved: pca_scatter.png")

# -----------------------------------------------------------
# STEP 10: K-Means Clustering + Elbow Method (CO3)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 10] K-Means Clustering + Elbow Method")
print("=" * 60)

inertia    = []
sil_scores = []
K_range    = range(2, 11)

print("\nRunning K-Means for K = 2 to 10...")
for k in K_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(rfm_scaled)
    inertia.append(km.inertia_)
    sil_scores.append(silhouette_score(rfm_scaled, km.labels_))
    print(f"  K={k}  Inertia={km.inertia_:.1f}  Silhouette={sil_scores[-1]:.4f}")

# Plot Elbow + Silhouette
fig, axes = plt.subplots(1, 2, figsize=(12, 4))

axes[0].plot(list(K_range), inertia, 'o-', color='steelblue', linewidth=2, markersize=6)
axes[0].set_title('Elbow Method — Inertia vs K')
axes[0].set_xlabel('Number of Clusters (K)')
axes[0].set_ylabel('Inertia')
axes[0].grid(True, alpha=0.3)

axes[1].plot(list(K_range), sil_scores, 's-', color='coral', linewidth=2, markersize=6)
axes[1].set_title('Silhouette Score vs K')
axes[1].set_xlabel('Number of Clusters (K)')
axes[1].set_ylabel('Silhouette Score')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('elbow_silhouette.png', dpi=150, bbox_inches='tight')
plt.show()
print("  Saved: elbow_silhouette.png")

# Final K-Means with optimal K
OPTIMAL_K = 4
print(f"\nOptimal K selected: {OPTIMAL_K} (based on elbow + silhouette)")

km_final = KMeans(n_clusters=OPTIMAL_K, random_state=42, n_init=10)
rfm['Cluster'] = km_final.fit_predict(rfm_scaled)

print(f"\nCluster Distribution:")
print(rfm['Cluster'].value_counts().sort_index())

print("\n--- Cluster Profiles (Mean RFM per cluster) ---")
cluster_profile = rfm.groupby('Cluster')[['Recency', 'Frequency', 'Monetary']].mean().round(2)
print(cluster_profile)

# Cluster visualisation in PCA space
colors = ['#7F77DD', '#1D9E75', '#D85A30', '#BA7517']
plt.figure(figsize=(8, 6))
for c in range(OPTIMAL_K):
    mask = rfm['Cluster'] == c
    plt.scatter(rfm_pca[mask, 0], rfm_pca[mask, 1],
                label=f'Cluster {c}', alpha=0.5, s=15, color=colors[c])
plt.title(f'K-Means Clusters (K={OPTIMAL_K}) in PCA Space')
plt.xlabel('PC1')
plt.ylabel('PC2')
plt.legend()
plt.tight_layout()
plt.savefig('clusters_pca.png', dpi=150, bbox_inches='tight')
plt.show()
print("  Saved: clusters_pca.png")

# Heatmap of cluster profiles
plt.figure(figsize=(7, 4))
cluster_profile_norm = (cluster_profile - cluster_profile.min()) / (cluster_profile.max() - cluster_profile.min())
sns.heatmap(cluster_profile_norm, annot=cluster_profile.values, fmt='.1f',
            cmap='YlOrRd', linewidths=0.5, cbar=True)
plt.title('Cluster Profile Heatmap (normalised, raw values shown)')
plt.ylabel('Cluster')
plt.tight_layout()
plt.savefig('cluster_heatmap.png', dpi=150, bbox_inches='tight')
plt.show()
print("  Saved: cluster_heatmap.png")

# Assign business labels based on cluster profile
# Note: Reassign the mapping below based on YOUR cluster means output
# Example mapping (update after checking cluster_profile above):
#   Low Recency + High Frequency + High Monetary  → Champions
#   Medium R + Medium F + Medium M               → Loyal
#   High R + Low F + Medium M                    → At-Risk
#   Very High R + Very Low F + Low M             → Lost
segment_map = {0: 'Champions', 1: 'Loyal', 2: 'At-Risk', 3: 'Lost'}
rfm['Segment'] = rfm['Cluster'].map(segment_map)

print("\n--- Final Segment Counts ---")
print(rfm['Segment'].value_counts())

# -----------------------------------------------------------
# STEP 11: Classification — Predict Customer Segment (CO4)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 11] Classification — Predict Segment")
print("=" * 60)

X = rfm_scaled
y = rfm['Cluster']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

print(f"\nTrain size: {X_train.shape[0]}  |  Test size: {X_test.shape[0]}")

classifiers = {
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
    'KNN':                 KNeighborsClassifier(n_neighbors=5),
    'Decision Tree':       DecisionTreeClassifier(random_state=42),
    'SVM':                 SVC(kernel='rbf', random_state=42)
}

results = {}
for name, clf in classifiers.items():
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    results[name] = {'model': clf, 'y_pred': y_pred, 'accuracy': acc}
    print(f"\n{'=' * 50}")
    print(f"  Classifier : {name}")
    print(f"  Accuracy   : {acc * 100:.2f}%")
    print(f"\n{classification_report(y_test, y_pred, target_names=list(segment_map.values()))}")

# -----------------------------------------------------------
# STEP 12: Confusion Matrices (CO2)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 12] Confusion Matrices")
print("=" * 60)

fig, axes = plt.subplots(2, 2, figsize=(14, 11))
axes = axes.flatten()

for i, (name, res) in enumerate(results.items()):
    cm   = confusion_matrix(y_test, res['y_pred'])
    disp = ConfusionMatrixDisplay(cm, display_labels=list(segment_map.values()))
    disp.plot(ax=axes[i], colorbar=False, cmap='Blues')
    axes[i].set_title(f'{name}\nAccuracy: {res["accuracy"]*100:.1f}%', fontsize=12)

plt.suptitle('Confusion Matrices — All Classifiers', fontsize=14, y=1.01)
plt.tight_layout()
plt.savefig('confusion_matrices.png', dpi=150, bbox_inches='tight')
plt.show()
print("  Saved: confusion_matrices.png")

# -----------------------------------------------------------
# STEP 13: Accuracy Comparison Bar Chart (CO2)
# -----------------------------------------------------------
print("\n" + "=" * 60)
print("[STEP 13] Accuracy Summary")
print("=" * 60)

acc_df = pd.DataFrame({
    'Classifier': list(results.keys()),
    'Accuracy':   [v['accuracy'] * 100 for v in results.values()]
}).sort_values('Accuracy', ascending=False)

plt.figure(figsize=(8, 5))
bar_colors = ['#7F77DD', '#1D9E75', '#D85A30', '#BA7517']
bars = plt.bar(acc_df['Classifier'], acc_df['Accuracy'], color=bar_colors, width=0.5)
plt.ylim(0, 115)
for bar, val in zip(bars, acc_df['Accuracy']):
    plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1.5,
             f'{val:.1f}%', ha='center', va='bottom', fontsize=11, fontweight='bold')
plt.title('Classifier Accuracy Comparison', fontsize=13)
plt.ylabel('Accuracy (%)')
plt.xticks(rotation=10)
plt.grid(axis='y', alpha=0.3)
plt.tight_layout()
plt.savefig('accuracy_comparison.png', dpi=150, bbox_inches='tight')
plt.show()
print("  Saved: accuracy_comparison.png")

print("\n--- Final Accuracy Summary ---")
print(acc_df.to_string(index=False))
best = acc_df.iloc[0]
print(f"\nBest Classifier : {best['Classifier']} ({best['Accuracy']:.2f}%)")

print("\n" + "=" * 60)
print("  ALL STEPS COMPLETE — Check saved PNG files")
print("=" * 60)