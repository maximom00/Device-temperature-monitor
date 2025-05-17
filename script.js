const app = {
    isCelsius: true,
    currentTemp: null,
    tempHistory: [],
    maxTemp: null,
    minTemp: null,
    chart: null,
    MAX_HISTORY: 20,
    notificationInstance: null,

    init: function() {
        this.initChart();
        this.updateAll();
        setInterval(() => this.updateAll(), 3000);
        Notification.requestPermission();
    },

    initChart: function() {
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        this.chart = new Chart(ctx, {
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
    },

    updateChart: function(temp) {
        const label = new Date().toLocaleTimeString();
        
        if (this.tempHistory.length >= this.MAX_HISTORY) {
            this.tempHistory.shift();
            this.chart.data.labels.shift();
            this.chart.data.datasets[0].data.shift();
        }
        
        this.tempHistory.push(temp);
        this.chart.data.labels.push(label);
        this.chart.data.datasets[0].data.push(temp);
        this.chart.update();
    },

    showSystemNotification: function() {
        if (!("Notification" in window)) return;

        const stats = {
            current: this.currentTemp.toFixed(1),
            max: this.maxTemp.toFixed(1),
            min: this.minTemp.toFixed(1),
            avg: (this.tempHistory.reduce((a, b) => a + b, 0) / this.tempHistory.length || 0).toFixed(1)
        };

        const options = {
            body: `\nالحد الأقصى: ${stats.max}°C\nالحد الأدنى: ${stats.min}°C\nالمتوسط: ${stats.avg}°C`,
            icon: 'icon-192.png',
            badge: 'icon-192.png'
        };

        if (this.notificationInstance) this.notificationInstance.close();
        this.notificationInstance = new Notification(`🌡 ${stats.current}°C`, options);
    },

    checkAlerts: function(temp) {
        const maxThreshold = parseFloat(document.getElementById('maxThreshold').value);
        const minThreshold = parseFloat(document.getElementById('minThreshold').value);
        const notification = document.getElementById('notification');

        if (temp > maxThreshold) {
            this.showNotification(`!تحذير: تجاوز الحد الأعلى (${maxThreshold}°C)`, '#e74c3c');
        } else if (temp < minThreshold) {
            this.showNotification(`!تحذير: تجاوز الحد الأدنى (${minThreshold}°C)`, '#3498db');
        } else {
            this.hideNotification();
        }
    },

    showNotification: function(message, color) {
        const notification = document.getElementById('notification');
        notification.style.display = 'block';
        notification.style.backgroundColor = color;
        notification.textContent = message;
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
    },

    hideNotification: function() {
        const notification = document.getElementById('notification');
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.style.display = 'none', 500);
    },

    updateAll: function() {
        const simulatedTemp = 25 + Math.random() * 20;
        this.currentTemp = simulatedTemp;

        this.maxTemp = this.maxTemp === null ? this.currentTemp : Math.max(this.maxTemp, this.currentTemp);
        this.minTemp = this.minTemp === null ? this.currentTemp : Math.min(this.minTemp, this.currentTemp);
        const avgTemp = this.tempHistory.length > 0 
            ? this.tempHistory.reduce((a, b) => a + b, 0) / this.tempHistory.length 
            : 0;

        document.getElementById('temperature').textContent = 
            `${this.currentTemp.toFixed(1)}°${this.isCelsius ? 'C' : 'F'}`;
        
        document.getElementById('maxTemp').textContent = 
            `${this.maxTemp.toFixed(1)}°${this.isCelsius ? 'C' : 'F'}`;
        
        document.getElementById('minTemp').textContent = 
            `${this.minTemp.toFixed(1)}°${this.isCelsius ? 'C' : 'F'}`;
        
        document.getElementById('avgTemp').textContent = 
            `${avgTemp.toFixed(1)}°${this.isCelsius ? 'C' : 'F'}`;

        const tempElement = document.getElementById('temperature');
        tempElement.classList.add('temperature-animation');
        setTimeout(() => tempElement.classList.remove('temperature-animation'), 500);

        this.updateChart(this.currentTemp);
        this.checkAlerts(this.currentTemp);
        
        if (Notification.permission === "granted") {
            this.showSystemNotification();
        }
    },

    toggleUnit: function() {
        this.isCelsius = !this.isCelsius;
        this.tempHistory = this.tempHistory.map(temp => 
            this.isCelsius ? (temp - 32) * 5/9 : temp * 9/5 + 32
        );
        this.updateAll();
    },

    toggleTheme: function() {
        const body = document.body;
        const isDark = body.getAttribute('data-theme') === 'dark';
        body.setAttribute('data-theme', isDark ? '' : 'dark');
        
        if(this.chart) {
            this.chart.options.scales.y.grid.color = isDark ? '#444' : '#eee';
            this.chart.update();
        }
    }
};
