package com.gigshield.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.gigshield.model.DisruptionType;
import com.gigshield.model.Severity;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private static final Map<String, double[]> CITY_COORDS = Map.of(
            "Hyderabad", new double[]{17.3850, 78.4867},
            "Mumbai", new double[]{19.0760, 72.8777},
            "Bangalore", new double[]{12.9716, 77.5946},
            "Delhi", new double[]{28.6139, 77.2090},
            "Chennai", new double[]{13.0827, 80.2707}
    );

    private final RestTemplate restTemplate;
    private final DisruptionService disruptionService;

    @Value("${weather.api.key:}")
    private String weatherApiKey;

    @Value("${weather.api.url:https://api.openweathermap.org/data/2.5}")
    private String weatherApiUrl;

    public void pollCity(String city) {
        if (weatherApiKey == null || weatherApiKey.isBlank() || "YOUR_OPENWEATHERMAP_KEY_HERE".equals(weatherApiKey)) {
            return;
        }
        String base = weatherApiUrl.replaceAll("/$", "");
        String weatherUri = UriComponentsBuilder.fromHttpUrl(base + "/weather")
                .queryParam("q", city + ",IN")
                .queryParam("appid", weatherApiKey)
                .queryParam("units", "metric")
                .build()
                .toUriString();

        JsonNode root;
        try {
            root = restTemplate.getForObject(weatherUri, JsonNode.class);
        } catch (Exception e) {
            return;
        }
        if (root == null) {
            return;
        }

        double temp = root.path("main").path("temp").asDouble(0);
        double rain1h = 0;
        JsonNode rain = root.path("rain");
        if (rain.has("1h")) {
            rain1h = rain.path("1h").asDouble(0);
        }

        String desc = root.path("weather").isArray() && root.path("weather").size() > 0
                ? root.path("weather").get(0).path("description").asText("")
                : "";

        String raw = root.toString();

        if (rain1h > 60.0) {
            disruptionService.processWeatherDisruption(DisruptionType.FLOOD, city, Severity.EXTREME, "OPENWEATHER", raw);
        } else if (rain1h > 20.0) {
            disruptionService.processWeatherDisruption(DisruptionType.HEAVY_RAIN, city, Severity.HIGH, "OPENWEATHER", raw);
        }

        if (temp > 42.0) {
            disruptionService.processWeatherDisruption(DisruptionType.EXTREME_HEAT, city, Severity.HIGH, "OPENWEATHER", raw);
        }

        double[] ll = CITY_COORDS.get(city);
        if (ll != null) {
            pollAqi(city, ll[0], ll[1], raw);
        }

        if (Math.random() < 0.05) {
            disruptionService.processWeatherDisruption(DisruptionType.PLATFORM_OUTAGE, city, Severity.MEDIUM, "SIMULATED", "{\"simulated\":true}");
        }
    }

    private void pollAqi(String city, double lat, double lon, String weatherRaw) {
        String base = weatherApiUrl.replaceAll("/$", "");
        String uri = UriComponentsBuilder.fromHttpUrl(base + "/air_pollution")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", weatherApiKey)
                .build()
                .toUriString();
        try {
            JsonNode root = restTemplate.getForObject(uri, JsonNode.class);
            if (root == null || !root.path("list").isArray() || root.path("list").isEmpty()) {
                return;
            }
            int aqi = root.path("list").get(0).path("main").path("aqi").asInt(1);
            if (aqi > 3) {
                disruptionService.processWeatherDisruption(
                        DisruptionType.HIGH_AQI,
                        city,
                        Severity.HIGH,
                        "OPENWEATHER_AQI",
                        root.toString()
                );
            }
        } catch (Exception ignored) {
        }
    }
}
