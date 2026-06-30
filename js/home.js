function updateTime() {
    const now = new Date();
    
    // Update Time
    const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.textContent = timeStr;
    
    // Update Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', dateOptions);
    const dateEl = document.getElementById('date');
    if(dateEl) dateEl.textContent = dateStr;
}

window.addEventListener('DOMContentLoaded', () => {
    setInterval(updateTime, 1000);
    updateTime();

    // Check auth
    const userInfoStr = localStorage.getItem('xtream_user_info');
    if (!userInfoStr) {
        window.location.href = '../index.html';
        return;
    }
    const userInfo = JSON.parse(userInfoStr);
    
    // Update footer info
    document.getElementById('playlist-name').textContent = userInfo.username || 'Unknown';
    
    if (userInfo.exp_date) {
        const expDate = new Date(userInfo.exp_date * 1000).toLocaleDateString();
        document.getElementById('playlist-exp').textContent = expDate;
    } else {
        document.getElementById('playlist-exp').textContent = 'Unlimited';
    }
    
    // Profile Button
    document.getElementById('btn-profile').addEventListener('click', () => {
        document.getElementById('profile-overlay').style.display = 'flex';
        document.getElementById('profile-name').textContent = userInfo.username || 'Unknown';
        document.getElementById('profile-status').textContent = userInfo.status || 'Active';
        document.getElementById('profile-created').textContent = userInfo.created_at ? new Date(userInfo.created_at * 1000).toLocaleDateString() : 'N/A';
        document.getElementById('profile-expires').textContent = userInfo.exp_date ? new Date(userInfo.exp_date * 1000).toLocaleDateString() : 'Unlimited';
        if(window.dpad) window.dpad.updateFocusables();
    });
    
    document.getElementById('close-profile-btn').addEventListener('click', () => {
        document.getElementById('profile-overlay').style.display = 'none';
        if(window.dpad) window.dpad.updateFocusables();
    });
    
    // Refresh Button
    document.getElementById('btn-refresh').addEventListener('click', () => {
        const btn = document.getElementById('btn-refresh');
        const icon = btn.querySelector('svg');
        if(icon) {
            icon.style.transition = "transform 1s";
            icon.style.transform = "rotate(360deg)";
            setTimeout(() => {
                icon.style.transition = "none";
                icon.style.transform = "rotate(0deg)";
            }, 1000);
        }
        // Could clear cache and re-fetch if we had a background worker, for now just reload
        location.reload();
    });
    
    // Settings Button
    document.getElementById('btn-settings').addEventListener('click', () => {
        window.location.href = './settings.html';
    });
});
