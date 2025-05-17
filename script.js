let isCelsius = true;
let currentTemp = null;
let tempHistory = [];
let maxTemp = null;
let minTemp = null;
let chart = null;
const MAX_HISTORY = 20;

function initChart() {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'درجة الحرارة',
                data: [],
                borderColor: '#3498db',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    grid: { color: () => getComputedStyle(document.body).getPropertyValue('--chart-grid') },
                    title: { display: true, text: 'درجة الحرارة (°C)' }
                }
            }
        }
    });
}

function updateChart(temp) {
    const label = new Date().toLocaleTimeString();
    
    if (tempHistory.length >= MAX_HISTORY) {
        tempHistory.shift();
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    
    tempHistory.push(temp);
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(temp);
    chart.update();
}

function checkAlerts(temp) {
    const maxThreshold = parseFloat(document.getElementById('maxThreshold').value);
    const minThreshold = parseFloat(document.getElementById('minThreshold').value);
    const notification = document.getElementById('notification');

    if (temp > maxThreshold) {
        showNotification(`!تحذير: تجاوز الحد الأعلى (${maxThreshold}°C)`, '#e74c3c');
    } else if (temp < minThreshold) {
        showNotification(`!تحذير: تجاوز الحد الأدنى (${minThreshold}°C)`, '#3498db');
    } else {
        hideNotification();
    }
}

function showNotification(message, color) {
    const notification = document.getElementById('notification');
    notification.style.display = 'block';
    notification.style.backgroundColor = color;
    notification.textContent = message;
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.style.display = 'none', 500);
}

function updateAll() {
    const simulatedTemp = 25 + Math.random() * 20;
    currentTemp = simulatedTemp;

    maxTemp = maxTemp === null ? currentTemp : Math.max(maxTemp, currentTemp);
    minTemp = minTemp === null ? currentTemp : Math.min(minTemp, currentTemp);
    const avgTemp = tempHistory.length > 0 
        ? tempHistory.reduce((a, b) => a + b, 0) / tempHistory.length 
        : 0;

    document.getElementById('temperature').textContent = 
        `${currentTemp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
    
    document.getElementById('maxTemp').textContent = 
        `${maxTemp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
    
    document.getElementById('minTemp').textContent = 
        `${minTemp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
    
    document.getElementById('avgTemp').textContent = 
        `${avgTemp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;

    const tempElement = document.getElementById('temperature');
    tempElement.classList.add('temperature-animation');
    setTimeout(() => tempElement.classList.remove('temperature-animation'), 500);

    updateChart(currentTemp);
    checkAlerts(currentTemp);
}

function toggleUnit() {
    isCelsius = !isCelsius;
    tempHistory = tempHistory.map(temp => 
        isCelsius ? (temp - 32) * 5/9 : temp * 9/5 + 32
    );
    updateAll();
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? '' : 'dark');
    
    if(chart) {
        chart.options.scales.y.grid.color = isDark ? '#444' : '#eee';
        chart.update();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    setInterval(updateAll, 3000);
    Notification.requestPermission();
    updateAll();
});
