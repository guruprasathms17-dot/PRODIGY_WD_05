// ─── CONFIG ───────────────────────────────────────────────────────────────────
const GEO_URL  = "https://geocoding-api.open-meteo.com/v1/search";
const WX_URL   = "https://api.open-meteo.com/v1/forecast";
const WX_PARAMS = [
  "current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,winddirection_10m,relative_humidity_2m,surface_pressure,uv_index,precipitation",
  "hourly=temperature_2m,weathercode",
  "daily=weathercode,temperature_2m_max,temperature_2m_min",
  "timezone=auto",
  "forecast_days=7",
  "hourly_units=temperature_2m"
].join("&");

// ─── STATE ────────────────────────────────────────────────────────────────────
let useFahrenheit = false;
let lastData = null;

// ─── ELEMENTS ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const panel       = $("panel");
const sky         = $("sky");
const searchForm  = $("searchForm");
const searchInput = $("searchInput");
const locateBtn   = $("locateBtn");
const unitToggle  = $("unitToggle");
const statusBar   = $("statusBar");

// ─── WEATHER CODE MAP ─────────────────────────────────────────────────────────
const WX_INFO = {
  0:  { label: "Clear Sky",          icon: "sun" },
  1:  { label: "Mostly Clear",       icon: "sun" },
  2:  { label: "Partly Cloudy",      icon: "cloud-sun" },
  3:  { label: "Overcast",           icon: "cloud" },
  45: { label: "Foggy",              icon: "fog" },
  48: { label: "Icy Fog",            icon: "fog" },
  51: { label: "Light Drizzle",      icon: "drizzle" },
  53: { label: "Drizzle",            icon: "drizzle" },
  55: { label: "Heavy Drizzle",      icon: "drizzle" },
  61: { label: "Light Rain",         icon: "rain" },
  63: { label: "Rain",               icon: "rain" },
  65: { label: "Heavy Rain",         icon: "rain" },
  71: { label: "Light Snow",         icon: "snow" },
  73: { label: "Snow",               icon: "snow" },
  75: { label: "Heavy Snow",         icon: "snow" },
  77: { label: "Snow Grains",        icon: "snow" },
  80: { label: "Light Showers",      icon: "showers" },
  81: { label: "Showers",            icon: "showers" },
  82: { label: "Heavy Showers",      icon: "showers" },
  85: { label: "Snow Showers",       icon: "snow" },
  86: { label: "Heavy Snow Showers", icon: "snow" },
  95: { label: "Thunderstorm",       icon: "storm" },
  96: { label: "Thunderstorm + Hail",icon: "storm" },
  99: { label: "Thunderstorm + Hail",icon: "storm" },
};

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function icon(type) {
  const d = {
    sun:       `<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>`,
    "cloud-sun":`<path d="M12 2a5 5 0 0 1 4.9 6H17a5 5 0 0 1 0 10H7a5 5 0 0 1-.5-9.97A5 5 0 0 1 12 2z"/><line x1="3" y1="7" x2="1" y2="7"/><line x1="10" y1="3" x2="10" y2="1"/><line x1="18" y1="5" x2="19.5" y2="3.5"/>`,
    cloud:     `<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>`,
    fog:       `<line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/>`,
    drizzle:   `<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="12" y1="18" x2="12" y2="20"/><line x1="16" y1="19" x2="16" y2="21"/>`,
    rain:      `<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="16" y1="19" x2="16" y2="21"/>`,
    snow:      `<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="12" y1="18" x2="12" y2="20"/><line x1="16" y1="19" x2="16" y2="21"/><circle cx="8" cy="21" r=".5"/><circle cx="12" cy="20" r=".5"/><circle cx="16" cy="21" r=".5"/>`,
    showers:   `<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="17" x2="6" y2="21"/><line x1="12" y1="17" x2="10" y2="21"/><line x1="16" y1="17" x2="14" y2="21"/>`,
    storm:     `<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d[type] || d.cloud}</svg>`;
}

// ─── UNIT HELPERS ─────────────────────────────────────────────────────────────
const toF   = c  => Math.round(c * 9 / 5 + 32);
const fmt   = c  => useFahrenheit ? `${toF(c)}°F` : `${Math.round(c)}°C`;
const fmtShort = c => useFahrenheit ? `${toF(c)}°` : `${Math.round(c)}°`;
const dir   = d  => { const dirs = ["N","NE","E","SE","S","SW","W","NW"]; return dirs[Math.round(d / 45) % 8]; };
const wxInfo = code => WX_INFO[code] ?? { label: "Unknown", icon: "cloud" };

// ─── SKY THEME ────────────────────────────────────────────────────────────────
function setSkyTheme(code, hour) {
  sky.className = "sky";
  if (code >= 95) sky.classList.add("sky--storm");
  else if (hour < 6 || hour >= 20) sky.classList.add("sky--night");
  else if (code <= 1) sky.classList.add("sky--clear-day");
}

// ─── STATUS ───────────────────────────────────────────────────────────────────
function setStatus(msg) {
  statusBar.textContent = msg;
  statusBar.hidden = !msg;
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render(data, name) {
  lastData = { data, name };
  const c = data.current;
  const hourNow = new Date().getHours();
  setSkyTheme(c.weathercode, hourNow);

  // Main readout
  $("locationName").textContent = name.toUpperCase();
  $("tempValue").textContent    = fmtShort(c.temperature_2m);
  $("conditionText").textContent = wxInfo(c.weathercode).label;
  $("feelsLike").textContent    = `Feels like ${fmt(c.apparent_temperature)}`;

  // Compass needle
  $("needle").style.setProperty("--angle", `${c.winddirection_10m}deg`);
  $("windSpeed").textContent = `${Math.round(c.windspeed_10m)} km/h ${dir(c.winddirection_10m)}`;

  // Gauges
  $("humidity").textContent = `${c.relative_humidity_2m}%`;
  $("pressure").textContent = `${Math.round(c.surface_pressure)} hPa`;
  $("uv").textContent       = c.uv_index ?? "--";
  $("precip").textContent   = `${c.precipitation} mm`;

  // Hourly (next 12)
  const hTemps = data.hourly.temperature_2m;
  const hCodes = data.hourly.weathercode;
  const hTimes = data.hourly.time;
  const startIdx = hTimes.findIndex(t => new Date(t) >= new Date());
  const hrHTML = hTimes.slice(startIdx, startIdx + 12).map((t, i) => {
    const idx = startIdx + i;
    const h = new Date(t).getHours();
    const label = h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
    return `<div class="hour">
      <span class="hour-time">${label}</span>
      <span class="hour-icon">${icon(wxInfo(hCodes[idx]).icon)}</span>
      <span class="hour-temp">${fmtShort(hTemps[idx])}</span>
    </div>`;
  }).join("");
  $("hourly").innerHTML = hrHTML;

  // Daily (skip today)
  const dCodes = data.daily.weathercode;
  const dMax   = data.daily.temperature_2m_max;
  const dMin   = data.daily.temperature_2m_min;
  const dTimes = data.daily.time;
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dayHTML = dTimes.slice(1).map((t, i) => {
    const idx = i + 1;
    const dow = dayNames[new Date(t).getDay()];
    const info = wxInfo(dCodes[idx]);
    return `<div class="day">
      <span class="day-name">${dow}</span>
      <span class="day-icon">${icon(info.icon)}</span>
      <span class="day-condition">${info.label}</span>
      <span class="day-range">${fmtShort(dMax[idx])} / ${fmtShort(dMin[idx])}</span>
    </div>`;
  }).join("");
  $("daily").innerHTML = dayHTML;
}

// ─── FETCH WEATHER ────────────────────────────────────────────────────────────
async function fetchWeather(lat, lon, name) {
  setStatus("");
  panel.classList.add("is-loading");
  try {
    const url = `${WX_URL}?latitude=${lat}&longitude=${lon}&${WX_PARAMS}`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error("Weather data unavailable.");
    const data = await res.json();
    render(data, name);
  } catch (e) {
    setStatus(`⚠ ${e.message}`);
  } finally {
    panel.classList.remove("is-loading");
  }
}

// ─── GEOCODE ──────────────────────────────────────────────────────────────────
async function geocode(query) {
    if (!query || query.trim().length < 2) return;
    
    let searchQuery = query.trim();
    setStatus("");
    panel.classList.add("is-loading");

    try {
        // Step 1: Request up to 20 options globally
        let url = `${GEO_URL}?name=${encodeURIComponent(searchQuery)}&count=20&language=en&format=json`;
        let res = await fetch(url);
        let json = await res.json();
        
        // Split multi-word fallback (e.g., "West Bengal" fallback)
        if (!json.results?.length && searchQuery.includes(" ")) {
            let primaryWord = searchQuery.split(" ")[0];
            url = `${GEO_URL}?name=${encodeURIComponent(primaryWord)}&count=20&language=en&format=json`;
            res = await fetch(url);
            json = await res.json();
        }

        if (!json.results?.length) {
            throw new Error(`No results for "${query}"`);
        }

        const lowerQuery = searchQuery.toLowerCase();
        let targetLocation = null;

        // Step 2: FIRST PASS - Explicit check for State (admin1) or Country match
        for (let loc of json.results) {
            const adminName = (loc.admin1 || "").toLowerCase();
            const countryName = (loc.country || "").toLowerCase();
            const cityName = (loc.name || "").toLowerCase();

            if (adminName === lowerQuery || countryName === lowerQuery || cityName === lowerQuery) {
                targetLocation = loc;
                break;
            }
        }

        // Step 3: SECOND PASS - Fuzzy/Partial match fallback (Handles typos like "maharastra")
        if (!targetLocation) {
            for (let loc of json.results) {
                const adminName = (loc.admin1 || "").toLowerCase();
                const countryName = (loc.country || "").toLowerCase();
                const cityName = (loc.name || "").toLowerCase();

                if (
                    adminName.includes(lowerQuery) || 
                    countryName.includes(lowerQuery) || 
                    cityName.includes(lowerQuery) ||
                    lowerQuery.includes(adminName)
                ) {
                    targetLocation = loc;
                    break;
                }
            }
        }

        // Ultimate fallback to first result if loops find absolutely nothing
        if (!targetLocation) targetLocation = json.results[0];
        
        // Step 4: Fix Display Name Output Text
        let displayLocationName = targetLocation.name;
        const targetAdminLower = (targetLocation.admin1 || "").toLowerCase();
        const targetCountryLower = (targetLocation.country || "").toLowerCase();

        // If the query was meant for a state or matches the state name, use the state name for display
        if (lowerQuery.includes(targetAdminLower) || targetAdminLower.includes(lowerQuery)) {
            displayLocationName = targetLocation.admin1;
        } else if (lowerQuery.includes(targetCountryLower) || targetCountryLower.includes(lowerQuery)) {
            displayLocationName = targetLocation.country;
        }

        const { latitude, longitude, country } = targetLocation;
        
        // Final display verification string formatting
        if (displayLocationName.toLowerCase() === country.toLowerCase()) {
            await fetchWeather(latitude, longitude, `${displayLocationName}`);
        } else {
            await fetchWeather(latitude, longitude, `${displayLocationName}, ${country}`);
        }
        
    } catch (e) {
        setStatus(`⚠️ ${e.message}`);
    } finally {
        panel.classList.remove("is-loading");
    }
}// ─── GEOLOCATION ──────────────────────────────────────────────────────────────
async function locateUser() {
  if (!navigator.geolocation) { setStatus("⚠ Geolocation not supported."); return; }
  setStatus("Detecting location…");
  statusBar.hidden = false;
  navigator.geolocation.getCurrentPosition(
    async pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      // Reverse-geocode via open-meteo nominatim
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const j = await r.json();
        const name = j.address?.city || j.address?.town || j.address?.village || j.address?.county || "Your Location";
        const country = j.address?.country_code?.toUpperCase() || "";
        await fetchWeather(lat, lon, `${name}, ${country}`);
      } catch {
        await fetchWeather(lat, lon, "Your Location");
      }
      setStatus("");
    },
    err => {
      setStatus("⚠ Location permission denied. Try searching for a city.");
    }
  );
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
searchForm.addEventListener("submit", e => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) geocode(q);
});

locateBtn.addEventListener("click", locateUser);

unitToggle.addEventListener("click", () => {
  useFahrenheit = !useFahrenheit;
  unitToggle.textContent = useFahrenheit ? "°C" : "°F";
  if (lastData) render(lastData.data, lastData.name);
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
geocode("Chennai");