# 🌤️ Real-Time Weather Application

A modern, responsive web application that fetches and displays live weather data for cities across the globe. This project was built to practice API integration, asynchronous JavaScript, and dynamic UI rendering.

---

## 🎯 Project Objective
The goal of this project was to learn how to connect a frontend interface to a real-world third-party API (like OpenWeatherMap). It demonstrates my ability to handle API requests, process JSON data, manage loading states, and handle user errors (such as invalid city names) gracefully.

---

## ✨ Key Features
* 🔍 **Global City Search** – Get instant weather updates for any city worldwide.
* 🌡️ **Comprehensive Weather Details** – Displays temperature, weather conditions (e.g., sunny, rainy), humidity levels, and wind speed.
* 🖼️ **Dynamic Visuals** – Automatically updates background images or weather icons depending on the current weather condition.
* 📱 **Responsive Design** – Clean, card-based interface that scales beautifully on mobile, tablet, and desktop viewports.

---

## 🛠️ Built With
* **HTML5** – For structured layouts, input fields, and semantic web elements.
* **CSS3** – Styled using modern layouts (Flexbox/Grid) with clean glassmorphism or minimalist card components.
* **JavaScript (ES6+)** – Utilizes the `Fetch API`, `async/await` syntax, and dynamic DOM updates.
* **Weather API** – Powered by [OpenWeatherMap API](https://openweathermap.org/) (or your preferred weather data provider).

---

## 📂 Project Structure
```text
├── index.html          # Main search interface and weather display card
├── css/
│   └── styles.css      # Core styles, responsive queries, and animations
└── js/
    └── weather.js      # API fetch functions, data parsing, and UI updating logic
