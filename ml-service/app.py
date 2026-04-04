import os
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)

ZONE_RISK_MAP = {
    "Banjara Hills": 0.30,
    "LB Nagar": 0.75,
    "Kukatpally": 0.55,
    "Secunderabad": 0.45,
    "Kondapur": 0.35,
    "Madhapur": 0.30,
    "Dilsukhnagar": 0.65,
    "Mehdipatnam": 0.60,
    "Andheri": 0.50,
    "Bandra": 0.48,
    "Dadar": 0.52,
    "Kurla": 0.58,
    "Thane": 0.45,
    "Koramangala": 0.42,
    "Whitefield": 0.48,
    "Indiranagar": 0.40,
    "Marathahalli": 0.46,
    "HSR Layout": 0.44,
    "default": 0.50,
}


def _month():
    return datetime.now().month


def _season_scores():
    m = _month()
    if 6 <= m <= 9:
        return 0.80, "monsoon"
    if 3 <= m <= 5:
        return 0.60, "summer"
    return 0.30, "winter"


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/risk-score", methods=["POST", "OPTIONS"])
def risk_score():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    city = data.get("city", "")
    zone = data.get("zone", "")
    platform = data.get("platform", "")

    zone_score = ZONE_RISK_MAP.get(zone, ZONE_RISK_MAP["default"])
    season_score, season_name = _season_scores()

    final_score = (zone_score * 0.6) + (season_score * 0.4)

    if final_score > 0.6:
        risk_level = "HIGH"
        mult = 1.6
    elif final_score > 0.35:
        risk_level = "MEDIUM"
        mult = 1.3
    else:
        risk_level = "LOW"
        mult = 1.0

    m = _month()
    if 6 <= m <= 9:
        season_mult = 1.4
    elif 3 <= m <= 5:
        season_mult = 1.2
    else:
        season_mult = 1.0

    BASE = 30
    premium_hint = min(max(BASE * mult * season_mult, 30), 120)

    zone_factors = [
        f"Zone baseline risk for '{zone or 'unknown'}'",
        f"{season_name.capitalize()} season adjustment",
    ]
    if platform:
        zone_factors.append(f"Platform: {platform}")
    if city:
        zone_factors.append(f"City: {city}")

    return jsonify(
        {
            "risk_score": round(final_score, 2),
            "risk_level": risk_level,
            "zone_factors": zone_factors,
            "premium_hint": round(premium_hint, 2),
        }
    )


@app.route("/fraud-check", methods=["POST", "OPTIONS"])
def fraud_check():
    if request.method == "OPTIONS":
        return "", 204
    return jsonify(
        {
            "fraud_score": 0.1,
            "is_fraudulent": False,
            "reasons": [],
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
