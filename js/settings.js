// Settings page logic
window.addEventListener('DOMContentLoaded', () => {
    console.log("Settings Logic Initialized");
    
    // Toggle logic for setting items
    const settingItems = document.querySelectorAll('.setting-item');
    settingItems.forEach(item => {
        item.addEventListener('click', () => {
            handleAction(item);
        });
        
        item.addEventListener('keydown', (e) => {
            const key = e.key || e.keyCode;
            if (['Enter', 13].includes(key)) {
                handleAction(item);
            }
        });
    });
    
    function handleAction(item) {
        const toggle = item.querySelector('.toggle');
        if (toggle) {
            toggle.classList.toggle('active');
        }
        const btn = item.querySelector('.setting-btn');
        if (btn && btn.textContent === 'Clear') {
            btn.textContent = 'Cleared!';
            setTimeout(() => { btn.textContent = 'Clear'; }, 2000);
            // Example real action: Clear localstorage except xtream info
            const xtreamUrl = localStorage.getItem('xtream_url');
            const user = localStorage.getItem('xtream_username');
            const pass = localStorage.getItem('xtream_password');
            const info = localStorage.getItem('xtream_user_info');
            localStorage.clear();
            if(xtreamUrl) localStorage.setItem('xtream_url', xtreamUrl);
            if(user) localStorage.setItem('xtream_username', user);
            if(pass) localStorage.setItem('xtream_password', pass);
            if(info) localStorage.setItem('xtream_user_info', info);
        }
    }
    
    // Sidebar tabs logic
    document.querySelectorAll('.setting-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.setting-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const panelTitle = document.querySelector('.settings-panel h2');
            if(panelTitle) panelTitle.textContent = tab.textContent + ' Settings';
        });
    });
    
    document.addEventListener('tvBackButton', () => {
        window.location.href = './Dashboard.html';
    });
});
