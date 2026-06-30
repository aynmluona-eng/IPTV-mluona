// Main application logic
const App = {
  init() {
    console.log("mluona IPTV initialized");
    
    // Auto-login for convenience if previously logged in
    const storedServer = localStorage.getItem('xtream_server');
    const storedUser = localStorage.getItem('xtream_username');
    const storedPass = localStorage.getItem('xtream_password');
    const rememberMe = localStorage.getItem('xtream_remember');
    
    if (storedServer && storedUser && storedPass && rememberMe !== 'false') {
        window.location.href = './pages/Dashboard.html';
        return;
    }
    
    // Auto-fill for convenience if previously logged in
    if (storedServer && storedUser) {
        const serverInput = document.getElementById('serverUrl');
        const userInput = document.getElementById('username');
        if(serverInput) serverInput.value = storedServer;
        if(userInput) userInput.value = storedUser;
    }
  }
};

window.handleLogin = async function() {
    const serverUrl = document.getElementById('serverUrl').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!serverUrl || !username || !password) {
        alert("Please enter Server URL, Username, and Password");
        return;
    }

    const loginBtn = document.querySelector('.btn');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'CONNECTING...';

    const api = new window.XtreamAPI(serverUrl, username, password);
    try {
        const response = await api.authenticate();
        if (response.user_info && response.user_info.auth === 1) {
            const rememberMe = localStorage.getItem('xtream_remember');
            
            // Save to localStorage
            localStorage.setItem('xtream_server', serverUrl);
            localStorage.setItem('xtream_username', username);
            
            if (rememberMe !== 'false') {
                localStorage.setItem('xtream_password', password);
            } else {
                localStorage.removeItem('xtream_password');
            }
            
            localStorage.setItem('xtream_user_info', JSON.stringify(response.user_info));
            localStorage.setItem('xtream_server_info', JSON.stringify(response.server_info));
            
            window.location.href = './pages/Dashboard.html';
        } else {
            alert("Login Failed: Invalid credentials");
            loginBtn.textContent = originalText;
        }
    } catch (error) {
        alert("Login Error: Could not connect to server. Check URL or CORS if running in browser.");
        console.error(error);
        loginBtn.textContent = originalText;
    }
}

window.addEventListener('DOMContentLoaded', () => {
  App.init();
});

