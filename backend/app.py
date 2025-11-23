from flask import Flask, request, jsonify, send_from_directory, render_template
import requests
import os

app = Flask(__name__, static_folder="static", template_folder="templates")

USER_AGENT = "hello-react-flask/1.0 (example)"

@app.route("/api/weather", methods=["POST"])
def weather():
    data = request.get_json() or {}
    lat = data.get("latitude")
    lon = data.get("longitude")
    username = data.get("username", "Friend")

    if lat is None or lon is None:
        return jsonify({"error": "latitude and longitude required"}), 400

    try:
        wm_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&current_weather=true&temperature_unit=celsius"
        )
        r = requests.get(wm_url, timeout=5)
        r.raise_for_status()
        weather_data = r.json()
        temp = None
        if "current_weather" in weather_data and "temperature" in weather_data["current_weather"]:
            temp = weather_data["current_weather"]["temperature"]
    except:
        temp = None

    city = "Unknown"
    try:
        nom_url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}"
        headers = {"User-Agent": USER_AGENT}
        r2 = requests.get(nom_url, headers=headers, timeout=5)
        r2.raise_for_status()
        place = r2.json()
        city = (
            place.get("address", {}).get("city")
            or place.get("address", {}).get("town")
            or place.get("address", {}).get("village")
            or place.get("address", {}).get("municipality")
            or place.get("address", {}).get("county")
            or place.get("name")
            or "Unknown"
        )
    except:
        city = "Unknown"

    return jsonify({
        "username": username,
        "city": city,
        "temperature_c": temp
    })

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
