let api;
let categories = [];
let channels = [];
let currentCategoryId = null;
let currentChannel = null;

window.addEventListener('DOMContentLoaded', async () => {
    const serverUrl = localStorage.getItem('xtream_server');
    const username = localStorage.getItem('xtream_username');
    const password = localStorage.getItem('xtream_password');

    if (!serverUrl || !username || !password) {
        window.location.href = '../index.html';
        return;
    }

    api = new window.XtreamAPI(serverUrl, username, password);
    
    await loadCategories();
});

async function loadCategories() {
    try {
        const cats = await api.getLiveCategories();
        categories = [{ category_id: 'all', category_name: 'All Channels' }, ...cats];
        
        const catTotal = document.getElementById('cat-total');
        if(catTotal) catTotal.textContent = cats.length;

        renderCategories();
        if (categories.length > 0) {
            selectCategory(categories[0].category_id);
        }
    } catch (e) {
        console.error("Error loading categories", e);
        document.getElementById('categories-container').innerHTML = '<div style="padding: 20px; color: red;">Error loading categories</div>';
    }
}

function renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-item focusable';
        btn.dataset.id = cat.category_id;
        btn.innerHTML = `<span>${cat.category_name}</span>`;
        btn.onclick = () => selectCategory(cat.category_id);
        container.appendChild(btn);
    });
    if (window.dpad) window.dpad.updateFocusables();
}

async function selectCategory(id) {
    currentCategoryId = id;
    // Update active class
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.category-item[data-id="${id}"]`)?.classList.add('active');

    // Load channels
    const container = document.getElementById('channels-container');
    container.innerHTML = '<div style="padding: 20px; color: white;">Loading channels...</div>';

    try {
        if (id === 'all') {
            channels = await api.getLiveStreams();
            // Don't slice so we have all channels
        } else {
            channels = await api.getLiveStreams(id);
        }
        
        // Ensure channels have a num property if missing
        channels.forEach((c, idx) => {
            if(!c.num) c.num = idx + 1;
        });
        
        // Sort channels by number
        channels.sort((a, b) => {
            const numA = parseInt(a.num || 0);
            const numB = parseInt(b.num || 0);
            if (numA !== numB && !isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            // Fallback to name sort
            return (a.name || '').localeCompare(b.name || '');
        });
        
        // Save to local storage for player
        try {
            localStorage.setItem('live_channels_list', JSON.stringify(channels));
        } catch(e) {
            console.log("Could not save channels to localStorage, too large");
        }
        
        renderChannels();
    } catch (e) {
        container.innerHTML = '<div style="padding: 20px; color: red;">Failed to load channels</div>';
    }
}

function renderChannels() {
    const container = document.getElementById('channels-container');
    container.innerHTML = '';
    
    if(!channels || channels.length === 0) {
        container.innerHTML = '<div style="padding: 20px; color: white;">No channels found.</div>';
        return;
    }

    const renderLimit = 300;
    const channelsToRender = channels.slice(0, renderLimit);
    
    channelsToRender.forEach((chan, index) => {
        const btn = document.createElement('button');
        btn.className = 'channel-item focusable';
        btn.dataset.id = chan.stream_id;
        btn.onclick = () => selectChannel(chan, btn);
        
        let logo = chan.stream_icon ? `<img src="${chan.stream_icon}" onerror="this.style.display='none'" style="max-width:100%; max-height:100%; object-fit:contain;" loading="lazy">` : chan.name.substring(0,3);

        const displayNum = chan.num ? chan.num : (index + 1);

        btn.innerHTML = `
            <div class="chan-num">${displayNum} <span>☆</span></div>
            <div class="chan-logo" style="background: white; color: black; border-radius: 8px;">${logo}</div>
            <div class="chan-info">
                <h3>${chan.name}</h3>
                <p>Live Stream</p>
            </div>
            <div class="chan-signal">
                <div class="bar"></div><div class="bar"></div><div class="bar"></div>
            </div>
        `;
        container.appendChild(btn);
    });
    
    if (window.dpad) window.dpad.updateFocusables();
}

function selectChannel(chan, element) {
    if (currentChannel && currentChannel.stream_id === chan.stream_id) {
        // Double click / Enter pressed twice -> Play immediately
        window.playCurrentChannel();
        return;
    }
    
    currentChannel = chan;
    
    document.querySelectorAll('.channel-item').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');

    document.getElementById('details-title').textContent = chan.name;
    document.getElementById('preview-badge').textContent = chan.name.substring(0, 15);
}

window.playCurrentChannel = function() {
    if (!currentChannel) return;
    
    const originalUrl = `${localStorage.getItem('xtream_server')}/live/${localStorage.getItem('xtream_username')}/${localStorage.getItem('xtream_password')}/${currentChannel.stream_id}.m3u8`;
    
    // If running locally or on TV, use direct URL to bypass Node proxy requirement
    const isTV = window.location.protocol === 'file:' || window.location.protocol === 'app:';
    const url = isTV ? originalUrl : `/api/stream?url=${encodeURIComponent(originalUrl)}`;
    
    localStorage.setItem('current_stream_url', url);
    localStorage.setItem('current_stream_name', currentChannel.name);
    
    window.location.href = './player.html';
}
