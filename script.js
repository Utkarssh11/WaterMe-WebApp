const STORAGE_KEY = 'waterme-plants';

function savePlants() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
}

function loadPlants() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const arr = JSON.parse(data);
    return arr.map(p => ({
      name: p.name,
      interval: p.interval,
      location: p.location,
      state: p.state || 'healthy',
      lastWatered: p.lastWatered || null,
    }));
  } catch {
    return [];
  }
}

class PlantAnimator {
  constructor(canvas, state = 'healthy') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.width = canvas.width = 120;
    this.height = canvas.height = 160;
    this.t = 0;
    this.animating = true;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }
  setState(state) {
    this.state = state;
    if (state === 'watering') {
      setTimeout(() => {
        this.state = 'healthy';
      }, 2000);
    }
  }
  drawPlant() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    let sway = 0;
    if (this.state === 'healthy') {
      sway = Math.sin(this.t / 20) * 8;
    } else if (this.state === 'thirsty') {
      sway = Math.sin(this.t / 30) * 2;
    }
    ctx.translate(this.width / 2, this.height - 20);
    ctx.rotate((sway * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -70);
    ctx.lineWidth = 8;
    ctx.strokeStyle = this.state === 'thirsty' ? '#a3b18a' : '#4caf93';
    ctx.globalAlpha = this.state === 'thirsty' ? 0.5 : 1;
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.state === 'thirsty' ? '#b7cbb2' : '#43a47e';
    ctx.save();
    ctx.translate(-10, -40);
    ctx.rotate(-0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(10, -50);
    ctx.rotate(0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(0, -70);
    ctx.rotate(this.state === 'thirsty' ? 0.7 : 0.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (this.state === 'healthy') {
      ctx.save();
      ctx.translate(0, -80);
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe066';
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    if (this.state === 'watering') {
      this.drawWatering();
    }
  }
  drawWatering() {
    const ctx = this.ctx;
    const dropCount = 3;
    for (let i = 0; i < dropCount; i++) {
      const phase = (this.t + i * 20) % 60;
      const y = -70 + phase * 1.5;
      if (y > 0 && y < this.height - 20) {
        ctx.save();
        ctx.translate(this.width / 2, this.height - 20);
        ctx.beginPath();
        ctx.arc(0, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#4fc3f7';
        ctx.globalAlpha = 0.7;
        ctx.shadowColor = '#4fc3f7';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }
    }
  }
  animate() {
    if (!this.animating) return;
    this.t++;
    this.drawPlant();
    requestAnimationFrame(this.animate);
  }
}

let plants = loadPlants();

function formatLatLon(lat, lon) {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

function createPlantCard(plant, idx) {
  const card = document.createElement('div');
  card.className = 'plant-card';
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 160;
  card.appendChild(canvas);
  const name = document.createElement('div');
  name.textContent = plant.name;
  name.style.marginTop = '0.7rem';
  name.style.fontWeight = 'bold';
  card.appendChild(name);
  const loc = document.createElement('div');
  loc.style.fontSize = '0.95em';
  loc.style.marginTop = '0.2rem';
  loc.style.color = '#888';
  if (plant.location && plant.location.lat && plant.location.lon) {
    loc.textContent = `📍 ${formatLatLon(plant.location.lat, plant.location.lon)}`;
  } else {
    loc.textContent = '📍 Location unavailable';
  }
  card.appendChild(loc);
  const lastWatered = document.createElement('div');
  lastWatered.style.fontSize = '0.9em';
  lastWatered.style.marginTop = '0.2rem';
  lastWatered.style.color = '#aaa';
  if (plant.lastWatered) {
    const date = new Date(plant.lastWatered);
    lastWatered.textContent = `Last watered: ${date.toLocaleString()}`;
  } else {
    lastWatered.textContent = 'Never watered';
  }
  card.appendChild(lastWatered);
  const animator = new PlantAnimator(canvas, plant.state);
  const waterBtn = document.createElement('button');
  waterBtn.textContent = '💧 Water';
  waterBtn.style.marginTop = '0.5rem';
  waterBtn.onclick = () => {
    plant.lastWatered = Date.now();
    plant.state = 'watering';
    animator.setState('watering');
    renderPlants();
  };
  card.appendChild(waterBtn);
  if (plant.state === 'thirsty') {
    card.style.boxShadow = '0 0 0 4px var(--color-glow)';
    card.style.borderColor = 'var(--color-accent)';
  }
  return card;
}

function renderPlants() {
  const plantList = document.getElementById('plant-list');
  plantList.innerHTML = '';
  plants.forEach((plant, idx) => {
    const card = createPlantCard(plant, idx);
    plantList.appendChild(card);
  });
  savePlants();
}

function addPlantWithLocation(name, interval) {
  if (!navigator.geolocation) {
    plants.push({
      name,
      interval,
      location: null,
      state: 'healthy',
      lastWatered: null,
    });
    renderPlants();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      plants.push({
        name,
        interval,
        location: {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        },
        state: 'healthy',
        lastWatered: null,
      });
      renderPlants();
    },
    err => {
      plants.push({
        name,
        interval,
        location: null,
        state: 'healthy',
        lastWatered: null,
      });
      renderPlants();
    },
    { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
  );
}

const plantForm = document.getElementById('plant-form');
plantForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = plantForm['plant-name'].value.trim();
  const interval = parseInt(plantForm['watering-interval'].value, 10);
  if (!name || isNaN(interval)) return;
  addPlantWithLocation(name, interval);
  plantForm.reset();
});

function checkPlantsNeedWater(deadline) {
  const now = Date.now();
  let i = 0;
  let changed = false;
  while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && i < plants.length) {
    const plant = plants[i];
    let prevState = plant.state;
    if (plant.lastWatered) {
      const nextWater = plant.lastWatered + plant.interval * 24 * 60 * 60 * 1000;
      if (now > nextWater) {
        plant.state = 'thirsty';
      } else {
        plant.state = 'healthy';
      }
    } else {
      plant.state = 'thirsty';
    }
    if (plant.state !== prevState) changed = true;
    i++;
  }
  renderPlants();
  if (changed) savePlants();
  setTimeout(() => {
    requestIdleCallback(checkPlantsNeedWater, { timeout: 2000 });
  }, 30000);
}
requestIdleCallback(checkPlantsNeedWater, { timeout: 2000 });