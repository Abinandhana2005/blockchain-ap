import os
import pandas as pd
import json
from sklearn.utils import shuffle

# Load dataset
df = pd.read_csv("data/kaggle_raw/UpdatedResumeDataSet.csv")

os.makedirs("data/resumes", exist_ok=True)

resumes = []
labels = []

# 🔹 Load existing data (so you KEEP synthetic)
try:
    with open("data/labels.json", "r") as f:
        existing = json.load(f)
        resumes = existing["resumes"]
        labels = existing["labels"]
except:
    pass

start_index = len(resumes)

# 🔹 Process Kaggle data
for i, row in df.iterrows():
    text = str(row["Resume"])
    category = str(row["Category"])
    
    # 🎯 YOUR LOGIC: Software vs Others
    if any(x in category for x in ["Software", "Developer", "Data", "DevOps", "Web", "IT"]):
        label = 1
    else:
        label = 0
    
    filename = f"kaggle_{start_index + i + 1}.txt"
    
    with open(f"data/resumes/{filename}", "w", encoding="utf-8") as f:
        f.write(text)
    
    resumes.append(filename)
    labels.append(label)

# 🔥 IMPORTANT: Shuffle
resumes, labels = shuffle(resumes, labels)

# Save labels
with open("data/labels.json", "w") as f:
    json.dump({
        "resumes": resumes,
        "labels": labels
    }, f, indent=2)

print("✅ Kaggle dataset added successfully!")