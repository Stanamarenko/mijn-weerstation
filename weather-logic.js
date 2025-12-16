// --- OpenWeatherMap API Configuratie ---
const API_KEY = "b66a17397558e3758d141f9593e66013"; 
const CITY_ID = "2789886"; // Olen
const UNITS = "metric";
const LANG = "nl";

// Functie om windgraden om te zetten naar windrichting
function degToDirection(degrees) {
    if (degrees > 337.5 || degrees <= 22.5) return "N";
    if (degrees > 22.5 && degrees <= 67.5) return "NO";
    if (degrees > 67.5 && degrees <= 112.5) return "O";
    if (degrees > 112.5 && degrees <= 157.5) return "ZO";
    if (degrees > 157.5 && degrees <= 202.5) return "Z";
    if (degrees > 202.5 && degrees <= 247.5) return "ZW";
    if (degrees > 247.5 && degrees <= 292.5) return "W";
    if (degrees > 292.5 && degrees <= 337.5) return "NW";
    return "?";
}

// Functie om meters/seconde om te zetten naar Beaufort
function speedToBeaufort(m_per_s) {
    if (m_per_s < 0.3) return 0;
    if (m_per_s < 1.6) return 1;
    if (m_per_s < 3.4) return 2;
    if (m_per_s < 5.5) return 3;
    if (m_per_s < 8.0) return 4;
    if (m_per_s < 10.8) return 5;
    if (m_per_s < 13.9) return 6;
    if (m_per_s < 17.2) return 7;
    if (m_per_s < 20.8) return 8;
    if (m_per_s < 24.5) return 9;
    if (m_per_s < 28.5) return 10;
    if (m_per_s < 32.7) return 11;
    return 12;
}

// Functie om UNIX epoch tijd om te zetten naar HH:MM
function formatTime(epochTime) {
    return new Date(epochTime * 1000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

// Functie om de eerste letter van een string hoofdletter te maken
function toUpperFirst(s) {
    if (s.length === 0) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Functie voor Actuele Data
async function fetchCurrentData() {
    const CURRENT_URL = `https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&units=${UNITS}&appid=${API_KEY}&lang=${LANG}`;
    try {
        const response = await fetch(CURRENT_URL);
        const data = await response.json();

        if (data.cod !== 200) throw new Error(data.message || "Onbekende fout bij actuele data.");
        return data;
    } catch (error) {
        console.error("Fout bij ophalen actuele data:", error);
        return null;
    }
}

// Functie om de coördinaten van de stad op te halen
async function fetchCoordinates() {
    const data = await fetchCurrentData();
    if (data && data.coord) {
        return data.coord;
    }
    return null;
}

// Functie om de forecast data op te halen (met fallback voor 3-uurlijkse data)
async function fetchForecastData() {
    
    // Standaard 5-daagse / 3-uurlijkse forecast API (2.5)
    let FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?id=${CITY_ID}&units=${UNITS}&appid=${API_KEY}&lang=${LANG}`;

    try {
        const response = await fetch(FORECAST_URL);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Fout (${response.status}): ${errorData.message}`);
        }
        
        const data = await response.json();
        
        // Verwerk de 3-uurlijkse forecast data en voeg de velden toe
        // We loggen hier de eerste entry om de structuur te controleren:
        console.log("Eerste forecast data entry voor debugging:", data.list[0]);
        
        const processedData = {
            hourly: data.list.map(item => ({
                dt: item.dt,
                temp: item.main.temp,
                humidity: item.main.humidity,
                pressure: item.main.pressure,
                // Dit zijn de juiste paden in de 2.5/forecast structuur:
                feels_like: item.main.feels_like, // Correct pad: item.main.feels_like
                clouds: item.clouds.all,         // Correct pad: item.clouds.all (Percentage)
                wind_speed: item.wind.speed,
                wind_deg: item.wind.deg
            }))
        };
        return processedData;
        
    } catch (error) {
        console.error("Fout bij forecast API:", error); 
        return null;
    }
}
