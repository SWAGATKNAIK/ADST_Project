"""
train_model.py
----------------
Trains a crop recommendation model for SmartAgri AI.

Dataset: Crop_recommendation.csv (2200 rows, 22 crop classes)
Features: N, P, K, temperature, humidity, ph, rainfall
Target  : label (crop name)

Run:
    python3 train_model.py

Produces:
    model/crop_model.pkl       - trained RandomForestClassifier
    model/label_encoder.pkl    - encodes crop name <-> integer class
    model/scaler.pkl           - StandardScaler used before prediction
    model/metrics.json         - accuracy + classification report
"""

import os
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

DATA_PATH = "crop_data.csv"
MODEL_DIR = "model"

os.makedirs(MODEL_DIR, exist_ok=True)

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
TARGET = "label"


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip() for c in df.columns]
    return df


def train():
    print("Loading dataset...")
    df = load_data(DATA_PATH)
    print(f"Dataset shape: {df.shape}")
    print(f"Crops: {sorted(df[TARGET].unique())}")
    print("\nCrop counts:")
    print(df[TARGET].value_counts())

    X = df[FEATURES].values
    y_raw = df[TARGET].values

    # Encode crop labels to integers
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)

    # Scale features (helps consistency if you swap in other models later)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy: {acc * 100:.2f}%")

    cv_scores = cross_val_score(model, X_scaled, y, cv=5)
    print(f"5-fold CV Accuracy: {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")

    report = classification_report(
        y_test, y_pred, target_names=label_encoder.classes_, output_dict=True
    )

    # Feature importance (useful for your project report/viva)
    importances = dict(zip(FEATURES, model.feature_importances_.round(4).tolist()))
    print("\nFeature importances:")
    for f, imp in sorted(importances.items(), key=lambda x: -x[1]):
        print(f"  {f}: {imp}")

    # Save artifacts
    joblib.dump(model, os.path.join(MODEL_DIR, "crop_model.pkl"))
    joblib.dump(label_encoder, os.path.join(MODEL_DIR, "label_encoder.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))

    metrics = {
        "test_accuracy": acc,
        "cv_mean_accuracy": cv_scores.mean(),
        "cv_std": cv_scores.std(),
        "feature_importances": importances,
        "classification_report": report,
    }

    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nSaved model + scaler + label encoder to '{MODEL_DIR}/'")
    print("Done.")


if __name__ == "__main__":
    train()
