// Authentication Management
class AuthManager {
    static isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    static getUserEmail() {
        return localStorage.getItem('userEmail');
    }

    static login(email) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
    }

    static logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
    }

    static requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// Login functionality
function handleLogin() {
    const email = document.querySelector('input[type="email"]').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }
    
    // Simple authentication (in real app, this would be server-side)
    if (email === 'admin@greenhouse.com' && password === 'admin123') {
        AuthManager.login(email);
        window.location.href = 'dashboard.html';
    } else {
        showNotification('Invalid email or password. Try admin@greenhouse.com / admin123', 'error');
    }
}

// Logout functionality
function handleLogout() {
    AuthManager.logout();
    window.location.href = 'login.html';
}

// Password visibility toggle
function togglePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 fade-in ${
        type === 'error' ? 'bg-red-500 text-white' : 
        type === 'success' ? 'bg-green-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
