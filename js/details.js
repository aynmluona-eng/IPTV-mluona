let api;
let itemData = null;
let itemType = 'movie'; // 'movie' or 'series'

window.addEventListener('DOMContentLoaded', async () => {
    const serverUrl = localStorage.getItem('xtream_server');
    const username = localStorage.getItem('xtream_username');
    const password = localStorage.getItem('xtream_password');

    if (!serverUrl || !username || !password) {
        window.location.href = '../index.html';
        return;
    }

    api = new window.XtreamAPI(serverUrl, username, password);
    
    // Read from localStorage to know what item was selected
    const detailsRaw = localStorage.getItem('current_details');
    if (!detailsRaw) {
        window.history.back();
        return;
    }
    
    itemData = JSON.parse(detailsRaw);
    itemType = localStorage.getItem('current_details_type') || 'movie';
    
    // We can fetch extended info using Xtream API
    if (itemType === 'movie') {
        fetchMovieDetails();
    } else {
        fetchSeriesDetails();
    }
});

async function fetchMovieDetails() {
    try {
        const info = await api.getVodInfo(itemData.stream_id);
        const data = info.info || itemData;
        renderDetails(data, 'movie');
        
        const playBtn = document.getElementById('play-btn');
        playBtn.style.display = 'flex';
        playBtn.onclick = () => {
            const originalUrl = `${localStorage.getItem('xtream_server')}/movie/${localStorage.getItem('xtream_username')}/${localStorage.getItem('xtream_password')}/${itemData.stream_id}.${itemData.container_extension || 'mp4'}`;
            const isTV = window.location.protocol === 'file:' || window.location.protocol === 'app:';
            const url = isTV ? originalUrl : `/api/stream?url=${encodeURIComponent(originalUrl)}`;
            
            localStorage.setItem('current_stream_url', url);
            localStorage.setItem('current_stream_name', data.name || data.title);
            window.location.href = './player.html';
        };
        
        if (data.youtube_trailer) {
            const trailerBtn = document.getElementById('trailer-btn');
            trailerBtn.style.display = 'flex';
            // Not implementing trailer player for now
        }
        
        if (window.dpad) window.dpad.updateFocusables();
    } catch (e) {
        console.error("Error loading movie info", e);
        // Fallback to basic data
        renderDetails(itemData, 'movie');
        if (window.dpad) window.dpad.updateFocusables();
    }
}

async function fetchSeriesDetails() {
    try {
        const info = await api.getSeriesInfo(itemData.series_id);
        const data = info.info || itemData;
        renderDetails(data, 'series');
        
        // Render Episodes
        const episodesSection = document.getElementById('episodes-section');
        const episodesList = document.getElementById('episodes-list');
        episodesSection.classList.add('visible');
        
        const episodes = info.episodes || {};
        const seasons = Object.keys(episodes);
        
        if (seasons.length > 0) {
            // Pick first season for now
            const eps = episodes[seasons[0]];
            eps.forEach((ep, index) => {
                const btn = document.createElement('button');
                btn.className = 'episode-item focusable';
                btn.innerHTML = `
                    <div class="ep-title">${index + 1}. ${ep.title}</div>
                    <div class="ep-duration">▶</div>
                `;
                btn.onclick = () => {
                    const originalUrl = `${localStorage.getItem('xtream_server')}/series/${localStorage.getItem('xtream_username')}/${localStorage.getItem('xtream_password')}/${ep.id}.${ep.container_extension || 'mp4'}`;
                    const isTV = window.location.protocol === 'file:' || window.location.protocol === 'app:';
                    const url = isTV ? originalUrl : `/api/stream?url=${encodeURIComponent(originalUrl)}`;
                    
                    localStorage.setItem('current_stream_url', url);
                    localStorage.setItem('current_stream_name', `${data.name} - ${ep.title}`);
                    window.location.href = './player.html';
                };
                episodesList.appendChild(btn);
            });
        }
        
        if (window.dpad) window.dpad.updateFocusables();
    } catch (e) {
        console.error("Error loading series info", e);
        renderDetails(itemData, 'series');
    }
}

document.addEventListener('tvBackButton', () => {
    window.history.back();
});

function renderDetails(data, type) {
    document.getElementById('title').textContent = data.name || data.title || 'Unknown Title';
    
    const posterUrl = data.cover || data.poster_data || (type === 'movie' ? itemData.stream_icon : itemData.cover);
    if (posterUrl) {
        document.getElementById('poster').style.backgroundImage = `url('${posterUrl}')`;
        document.getElementById('backdrop').style.backgroundImage = `url('${data.backdrop_path ? data.backdrop_path[0] : posterUrl}')`;
    }
    
    document.getElementById('rating').textContent = data.rating || data.rating_5based || 'N/A';
    
    if (data.releasedate || data.year) {
        document.getElementById('year').textContent = data.releasedate || data.year;
    } else {
        document.getElementById('year').style.display = 'none';
    }
    
    if (data.genre) {
        document.getElementById('genre').textContent = data.genre;
    } else {
        document.getElementById('genre').style.display = 'none';
    }
    
    document.getElementById('plot').textContent = data.plot || data.description || 'No plot available.';
    
    if (data.cast) {
        document.getElementById('cast-container').style.display = 'block';
        document.getElementById('cast').textContent = data.cast;
    }
}
