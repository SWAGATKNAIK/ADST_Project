"""
app.py
-------
Flask API that serves the trained crop recommendation model
for the SmartAgri AI website.

Run:
    python3 app.py

Then from your frontend (smartagri.html), call:
    POST http://localhost:5000/predict
    Body (JSON): {"N":90,"P":42,"K":43,"temperature":20.9,"humidity":82,"ph":6.5,"rainfall":202.9}
"""

import os
import pandas as pd
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

MODEL_DIR = "model"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "market_prices.csv")

app = Flask(__name__)
CORS(app)  # allow the HTML frontend (different origin / file://) to call this API

# Load trained artifacts once at startup
model = joblib.load(os.path.join(MODEL_DIR, "crop_model.pkl"))
label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": True})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True, silent=True)

    if not data:
        return jsonify({"error": "No JSON body received."}), 400

    missing = [f for f in FEATURES if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        values = [float(data[f]) for f in FEATURES]
    except (TypeError, ValueError):
        return jsonify({"error": "All fields must be numeric."}), 400

    X = np.array(values).reshape(1, -1)
    X_scaled = scaler.transform(X)

    # Top-3 crop predictions with probabilities
    probs = model.predict_proba(X_scaled)[0]
    top_idx = np.argsort(probs)[::-1][:3]

    results = [
        {
            "crop": label_encoder.inverse_transform([i])[0],
            "confidence": round(float(probs[i]) * 100, 2),
        }
        for i in top_idx
    ]

    return jsonify({
        "recommended_crop": results[0]["crop"],
        "confidence": results[0]["confidence"],
        "top_3": results,
    })

from weather_api import get_weather


@app.route("/weather", methods=["GET"])
def weather():
    city = request.args.get("city", "Bangalore").strip()
    if not city:
        return jsonify({"error": "The city query parameter must not be empty."}), 400

    try:
        return jsonify(get_weather(city))
    except Exception as exc:
        return jsonify({"error": str(exc)}), 502
    

@app.route("/market-prices", methods=["GET"])
def market_prices():
    try:
        df = pd.read_csv(CSV_PATH)
        df.columns = (
            df.columns.str.strip()
            .str.lower()
            .str.replace(" ", "_")
        )

        # Support common CSV column names
        aliases = {
            "commodity": ["commodity", "crop"],
            "state": ["state"],
            "district": ["district"],
            "market": ["market", "market_name"],
            "min_price": ["min_price", "min_price_rs_quintal"],
            "max_price": ["max_price", "max_price_rs_quintal"],
            "modal_price": ["modal_price", "modal_price_rs_quintal"],
            "date": ["date", "arrival_date"],
        }

        selected = {}
        for target, possible_names in aliases.items():
            for name in possible_names:
                if name in df.columns:
                    selected[target] = name
                    break

        required = [
            "commodity", "state", "district", "market",
            "min_price", "max_price", "modal_price"
        ]
        missing = [c for c in required if c not in selected]
        if missing:
            return jsonify({
                "error": "CSV columns missing",
                "missing": missing,
                "available_columns": list(df.columns)
            }), 400

        crop = request.args.get("crop", "").strip()
        state = request.args.get("state", "").strip()
        district = request.args.get("district", "").strip()
        market = request.args.get("market", "").strip()

        for field, value in [
            ("commodity", crop),
            ("state", state),
            ("district", district),
            ("market", market)
        ]:
            if value:
                df = df[
                    df[selected[field]].astype(str).str.contains(
                        value, case=False, na=False, regex=False
                    )
                ]

        result_columns = {
            "crop": selected["commodity"],
            "state": selected["state"],
            "district": selected["district"],
            "market": selected["market"],
            "min_price": selected["min_price"],
            "max_price": selected["max_price"],
            "modal_price": selected["modal_price"],
        }

        if "date" in selected:
            result_columns["date"] = selected["date"]

        result = df[list(result_columns.values())].rename(
            columns={v: k for k, v in result_columns.items()}
        )

        result = result.where(pd.notna(result), None)
        records = result.head(500).to_dict(orient="records")

        return jsonify({
            "count": len(records),
            "unit": "rupees per quintal (verify CSV source)",
            "data": records
        })

    except FileNotFoundError:
        return jsonify({"error": "market_prices.csv not found in Backend folder"}), 404
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    
    
    
if __name__ == "__main__":
    app.run(debug=True, port=5000)
    
