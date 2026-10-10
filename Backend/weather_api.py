import requests
import os

API_KEY = "ef0be66aaffcb42c0dd2022786e59739"

def get_weather(city="Bangalore"):
    if not API_KEY: 
        raise ValueError("API key missing. Set OPENWEATHER_API_KEY.")

    url = "https://api.openweathermap.org/data/2.5/weather"

    response = requests.get(
        url,
        params={
            "q": city,
            "appid": API_KEY,
            "units": "metric"
        },
        timeout=10
    )

    response.raise_for_status()
    data = response.json()

    return {
        "city": data["name"],
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "description": data["weather"][0]["description"]
    }


if __name__ == "__main__":
    print(get_weather("Bangalore"))