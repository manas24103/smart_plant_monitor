// Dashboard Controller
class DashboardController {
    constructor() {
        this.pumpState = false;
        this.fanSpeed = 0;
        this.init();
    }

    init() {
        if (!AuthManager.requireAuth()) return;
        
        // Display user email
        const userEmail = AuthManager.getUserEmail();
        if (userEmail) {
            document.getElementById('userEmail').textContent = userEmail;
        }
        
        // Start data fetching
        this.fetchData();
        setInterval(() => this.fetchData(), 2000);
    }

    // Intelligent status functions
    getTempStatus(temp) {
        if (temp > 35) return { text: "🔥 TOO HIGH", color: "status-danger" };
        if (temp < 20) return { text: "❄️ TOO LOW", color: "status-info" };
        return { text: "✅ NORMAL", color: "status-good" };
    }

    getHumidityStatus(h) {
        if (h < 40) return { text: "💨 LOW", color: "status-warning" };
        if (h > 80) return { text: "💧 HIGH", color: "status-info" };
        return { text: "✅ OPTIMAL", color: "status-good" };
    }

    getSoilStatus(s) {
        if (s < 30) return { text: "🏜️ LOW LEVEL", color: "status-danger" };
        return { text: "✅ GOOD", color: "status-good" };
    }

    getLightStatus(l) {
        if (l < 5000) return { text: "🌙 LOW", color: "status-info" };
        if (l > 12000) return { text: "☀️ HIGH", color: "status-warning" };
        return { text: "✅ GOOD", color: "status-good" };
    }

    // Update circular progress
    updateProgress(elementId, value, maxValue) {
        const circle = document.getElementById(elementId);
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (value / maxValue) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    async fetchData() {
        try {
            const response = await fetch('http://localhost:5000/api/sensor');
            const data = await response.json();

            if (!data) return;

            // Update temperature
            document.getElementById("tempValue").innerText = (data.temperature || '--') + "°C";
            document.getElementById("tempText").innerText = data.temperature || '--';
            const tempStatus = this.getTempStatus(data.temperature);
            document.getElementById("tempStatus").innerText = tempStatus.text;
            document.getElementById("tempStatus").className = `text-sm mt-1 font-medium ${tempStatus.color}`;
            this.updateProgress("tempProgress", data.temperature || 0, 50);

            // Update humidity
            document.getElementById("humValue").innerText = (data.humidity || '--') + "%";
            document.getElementById("humText").innerText = data.humidity || '--';
            const humStatus = this.getHumidityStatus(data.humidity);
            document.getElementById("humStatus").innerText = humStatus.text;
            document.getElementById("humStatus").className = `text-sm mt-1 font-medium ${humStatus.color}`;
            this.updateProgress("humProgress", data.humidity || 0, 100);

            // Update soil
            document.getElementById("soilValue").innerText = (data.soil || '--') + "%";
            document.getElementById("soilText").innerText = data.soil || '--';
            const soilStatus = this.getSoilStatus(data.soil);
            document.getElementById("soilStatus").innerText = soilStatus.text;
            document.getElementById("soilStatus").className = `text-sm mt-1 font-medium ${soilStatus.color}`;
            this.updateProgress("soilProgress", data.soil || 0, 100);

            // Update light
            document.getElementById("lightValue").innerText = (data.light || '--') + " lux";
            document.getElementById("lightText").innerText = Math.round((data.light || 0) / 100);
            const lightStatus = this.getLightStatus(data.light);
            document.getElementById("lightStatus").innerText = lightStatus.text;
            document.getElementById("lightStatus").className = `text-sm mt-1 font-medium ${lightStatus.color}`;
            this.updateProgress("lightProgress", (data.light || 0) / 200, 100);

            // Update automation status
            this.updateAutomationStatus(data);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    updateAutomationStatus(data) {
        // Auto watering status
        const autoWater = document.getElementById("autoWater");
        if (data.soil < 30) {
            autoWater.innerText = "WATERING";
            autoWater.className = "font-medium text-blue-600";
        } else {
            autoWater.innerText = "ACTIVE";
            autoWater.className = "font-medium text-green-600";
        }

        // Auto cooling status
        const autoCool = document.getElementById("autoCool");
        if (data.temperature > 35) {
            autoCool.innerText = "COOLING";
            autoCool.className = "font-medium text-blue-600";
        } else {
            autoCool.innerText = "STANDBY";
            autoCool.className = "font-medium text-gray-600";
        }
    }

    async togglePump() {
        try {
            this.pumpState = !this.pumpState;
            
            await fetch('http://localhost:5000/api/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pump: this.pumpState })
            });
            
            // Update button appearance
            const pumpBtn = document.getElementById('pumpBtn');
            if (this.pumpState) {
                pumpBtn.className = 'bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600 transition-colors';
                pumpBtn.innerText = 'ON';
            } else {
                pumpBtn.className = 'bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mt-2 hover:bg-gray-400 transition-colors';
                pumpBtn.innerText = 'OFF';
            }
        } catch (error) {
            console.error('Error toggling pump:', error);
        }
    }

    async updateFan(value) {
        try {
            this.fanSpeed = value;
            document.getElementById('fanValue').innerText = value + '%';
            
            await fetch('http://localhost:5000/api/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fan: parseInt(value) })
            });
        } catch (error) {
            console.error('Error updating fan:', error);
        }
    }
}

// Global functions for button onclick handlers
let dashboard;

function togglePump() {
    dashboard.togglePump();
}

function updateFan(value) {
    dashboard.updateFan(value);
}

// Initialize dashboard when page loads
window.onload = function() {
    dashboard = new DashboardController();
};
