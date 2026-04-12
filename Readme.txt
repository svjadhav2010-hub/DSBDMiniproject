# Customer Segmentation for E-Commerce
## DSBD Mini Project

### Dataset
- Name : Online Retail II (UCI Machine Learning Repository)
- URL  : https://www.kaggle.com/datasets/mashlyn/online-retail-ii-uci
- The dataset is downloaded automatically by the script using kagglehub.

---

## How to Run in VS Code — Step by Step

### STEP 1: Install Python
- Download Python 3.10+ from https://www.python.org/downloads/
- During install, CHECK "Add Python to PATH"
- Verify: open Terminal in VS Code → type:  python --version

### STEP 2: Install VS Code Extensions
- Open VS Code
- Go to Extensions (Ctrl+Shift+X)
- Install: "Python" by Microsoft
- Install: "Jupyter" by Microsoft (optional, for notebook view)

### STEP 3: Set Up Kaggle API Key
kagglehub needs your Kaggle credentials to download the dataset.

1. Go to https://www.kaggle.com → click your profile → Settings
2. Scroll to "API" section → click "Create New Token"
3. This downloads a file called kaggle.json
4. Place kaggle.json here:
   - Windows : C:\Users\YourName\.kaggle\kaggle.json
   - Mac/Linux: ~/.kaggle/kaggle.json
5. On Mac/Linux, run:  chmod 600 ~/.kaggle/kaggle.json

### STEP 4: Open the Project Folder in VS Code
1. Open VS Code
2. File → Open Folder → select the "customer_segmentation" folder

### STEP 5: Create a Virtual Environment (Recommended)
Open Terminal in VS Code (Ctrl+` ) and run:

  python -m venv venv

Activate it:
  Windows : venv\Scripts\activate
  Mac/Linux: source venv/bin/activate

You should see (venv) in your terminal prompt.

### STEP 6: Install Required Packages
In the VS Code Terminal (with venv active), run:

  pip install -r requirements.txt

Wait for all packages to install. This takes 2-3 minutes.

### STEP 7: Select Python Interpreter in VS Code
1. Press Ctrl+Shift+P
2. Type: "Python: Select Interpreter"
3. Choose the one that shows "venv" in the path

### STEP 8: Run the Script
In the Terminal:

  python customer_segmentation.py

OR right-click the file → "Run Python File in Terminal"

---

## What the Script Does (in order)

| Step | What happens                         | Output                        |
|------|--------------------------------------|-------------------------------|
| 0    | Libraries imported                   | —                             |
| 2    | Dataset downloaded from Kaggle       | Cached in ~/.cache/kagglehub  |
| 3    | Initial statistics printed           | Terminal output               |
| 4    | Missing values removed               | Terminal output               |
| 5    | Outliers detected & removed (IQR)    | outlier_boxplot.png           |
| 6    | Log transformation applied           | transformation_distribution.png |
| 7    | Country encoded                      | Terminal output               |
| 8    | RFM table computed                   | Terminal output               |
| 9    | PCA applied (2D)                     | pca_scatter.png               |
| 10   | K-Means + Elbow + Silhouette         | elbow_silhouette.png, clusters_pca.png, cluster_heatmap.png |
| 11   | 4 classifiers trained & evaluated   | Terminal output               |
| 12   | Confusion matrices plotted           | confusion_matrices.png        |
| 13   | Accuracy bar chart                   | accuracy_comparison.png       |

---

## Output Files (saved in same folder as the script)
- outlier_boxplot.png
- transformation_distribution.png
- pca_scatter.png
- elbow_silhouette.png
- clusters_pca.png
- cluster_heatmap.png
- confusion_matrices.png
- accuracy_comparison.png

---

## Common Errors & Fixes

| Error                                      | Fix                                                  |
|--------------------------------------------|------------------------------------------------------|
| FileNotFoundError: online_retail_II.xlsx   | The kagglehub path is used automatically — ensure internet connection |
| ModuleNotFoundError: No module named 'X'   | Run: pip install X                                   |
| 401 Unauthorized (Kaggle)                  | Check kaggle.json is placed correctly (Step 3)       |
| Script is slow on Excel load               | Normal — 1M rows takes 2-3 min. Wait for it.        |
| Wrong cluster labels (segment_map)         | Read STEP 10 terminal output → reassign segment_map  |

---

## Important Note on segment_map
After running STEP 10, the terminal prints "Cluster Profiles (Mean RFM per cluster)".
Look at the Recency, Frequency, Monetary values for each cluster and assign labels:
- Low Recency + High Frequency + High Monetary  → Champions
- Medium values                                 → Loyal
- High Recency + Low Frequency                  → At-Risk
- Very High Recency + Very Low all              → Lost

Update the segment_map dictionary in the script accordingly before final run.