# WaterMe – WebApp  
**TAP Invest Hiring Assignment**

A simple, modern plant watering reminder app using **HTML**, **CSS**, and **vanilla JavaScript** 
---

## 🌱 Features

- Add plants with name & watering interval (in days)
- Save user’s location with plant (if permission granted)
- Visual plant states: healthy, thirsty, watering (with animation)
- Click to water and reset schedule
- Background checks to notify if a plant needs water
- Saves plant data in browser using localStorage
- Fully responsive on all screen sizes

---

## Tech Stack

- **HTML5**
- **CSS3**
- **JavaScript**
- **Web APIs:**
  - Canvas API
  - Geolocation API
  - Background Tasks API (`requestIdleCallback`)
  - localStorage

---

## API Usage Summary

### Canvas API
- Animates each plant: swaying when healthy, faded when thirsty, water drops when watering.

### Geolocation API
- Captures your location when adding a plant and displays it on the card.

### Background Tasks API (`requestIdleCallback`)
- Runs in the background (every 30s) to check which plants need watering.

### localStorage
- Automatically saves all plants and their state.
- Restores everything on page reload.
---
✅ Built with love for the TAP Invest assignment.


