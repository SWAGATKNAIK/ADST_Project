# SmartAgri AI — Project Setup Guide

## 📁 Folder structure (open the SmartAgriAI folder in VS Code)

```
SmartAgriAI/
│
├── frontend/
│   └── smartagri.html          ← the website (open this in a browser)
│
├── ml_backend/
│   ├── crop_data.csv           ← training dataset (2200 rows, 22 crops)
│   ├── train_model.py          ← trains the model (run this FIRST, once)
│   ├── app.py                  ← Flask API server (run this to serve predictions)
│   ├── requirements.txt        ← Python packages needed
│   └── model/                  ← created automatically by train_model.py
│       ├── crop_model.pkl      ← trained Random Forest model
│       ├── label_encoder.pkl   ← converts crop names <-> numbers
│       ├── scaler.pkl          ← feature scaler used before prediction
│       └── metrics.json        ← accuracy + evaluation report
│
└── README.md                   ← this file
```

## 📊 About the dataset

- **Name:** Crop Recommendation Dataset
- **Source:** Built by the Indian Chamber of Food and Agriculture (ICFA) by combining publicly
  available Indian rainfall, climate and soil-fertilizer datasets.
- **Coverage:** Pan-India average conditions — **not tied to one specific state, district, or
  collection year.** It is a synthetic/aggregated dataset, not live sensor or government
  year-wise records. Mention this honestly in your project report/viva.
- **Size:** 2,200 rows, 22 crops, 100 samples per crop.
- **Features:** N, P, K (soil nutrients), temperature, humidity, pH, rainfall.

## ✅ Step-by-step: what to do in VS Code

### Step 1 — Open the project
Open VS Code → File → Open Folder → select `SmartAgriAI`.

### Step 2 — Install Python (if not already installed)
Check in VS Code terminal:
```bash
python3 --version
```
If missing, install Python 3.9+ from python.org, then install the VS Code **Python extension**
(Extensions panel → search "Python" → install Microsoft's official one).

### Step 3 — Create a virtual environment (recommended, keeps packages isolated)
In the VS Code terminal (make sure you're inside `SmartAgriAI/ml_backend`):
```bash
cd ml_backend
python3 -m venv venv
```

Activate it:
- **Windows:** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

### Step 4 — Install dependencies
```bash
pip install -r requirements.txt
```

### Step 5 — Train the model
```bash
python3 train_model.py
```
This reads `crop_data.csv`, trains a Random Forest Classifier, and saves the trained model
files into the `model/` folder. You only need to do this once (re-run it only if you change
the dataset or want to retrain).

You should see output like:
```
Test Accuracy: 99.55%
5-fold CV Accuracy: 99.45%
Saved model + scaler + label encoder to 'model/'
```

### Step 6 — Start the API server
```bash
python3 app.py
```
Leave this running. It starts a Flask server at `http://127.0.0.1:5000`.

### Step 7 — Open the website
Go to the `frontend` folder and open `smartagri.html` directly in your browser
(double-click it, or right-click → Open with Live Server if you have that VS Code extension).

### Step 8 — Test it
Login as a farmer (demo: phone `9999999999`, Aadhaar `123456789012`) → go to
**AI Crop Forecast** → enter N, P, K, temperature, humidity, pH, rainfall → click
**Generate AI Forecast**. The page calls your running Flask server and shows the model's
real prediction with confidence %.

### Weather API
The Flask server also provides live current weather from Open-Meteo, which does not require
an API key. The default city is Bangalore; pass a city to the endpoint to request another:
```text
GET http://127.0.0.1:5000/weather?city=Mysore
```
The JSON response includes `city`, `temperature` (°C), `humidity` (%), `feels_like`,
`precipitation`, `weather_code`, `wind_speed`, and `time`. The frontend reads
`temperature` and `humidity` from this response.

## ⚠️ Important notes for your project report

1. The ML model's 22 crops (rice, maize, mango, cotton, coffee, etc.) do **not** overlap with
   the vegetables (tomato, onion, potato...) used in the Market Prices / Profit Calculator
   pages — those still use separate hardcoded demo data, not the trained model.
2. The dataset is a generic India-wide aggregate, not localized to your actual farm's state/
   district — a real deployment would need region-specific agricultural data.
3. `app.py` runs Flask's built-in development server — fine for a demo/viva, but not meant
   for production deployment (the terminal will warn you about this; it's expected).
