let api;
let categories = [];
let movies = [];
let currentCategoryId = null;

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
        const cats = await api.getVodCategories();
        categories = [{ category_id: 'all', category_name: 'All Movies' }, ...cats];
        renderCategories();
        if (categories.length > 0) {
            selectCategory(categories[0].category_id, categories[0].category_name);
        }
    } catch (e) {
        console.error("Error loading categories", e);
    }
}

function renderCategories() {
    const container = document.getElementById('categories-container');
    if(!container) return;
    
    container.innerHTML = '';
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'nav-item focusable';
        btn.dataset.id = cat.category_id;
        btn.textContent = cat.category_name;
        btn.onclick = () => selectCategory(cat.category_id, cat.category_name);
        container.appendChild(btn);
    });

    if (window.dpad) window.dpad.updateFocusables();
}

async function selectCategory(id, name) {
    currentCategoryId = id;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-item[data-id="${id}"]`)?.classList.add('active');
    
    const titleEl = document.getElementById('current-category-title');
    if(titleEl && name) titleEl.textContent = name;

    const container = document.getElementById('movies-container');
    if(!container) return;
    container.innerHTML = '<div style="padding: 20px; color: white; font-size: 24px;">Loading Movies...</div>';

    try {
        if (id === 'all') {
            movies = await api.getVodStreams();
            movies = movies.slice(0, 100); // Cap for preview
        } else {
            movies = await api.getVodStreams(id);
        }
        renderMovies();
    } catch (e) {
        container.innerHTML = '<div style="padding: 20px; color: red;">Failed to load movies</div>';
    }
}

function renderMovies() {
    const container = document.getElementById('movies-container');
    container.innerHTML = '';
    
    if(!movies || movies.length === 0) {
        container.innerHTML = '<div style="padding: 20px; color: white;">No movies found.</div>';
        return;
    }

    movies.forEach(movie => {
        const btn = document.createElement('button');
        btn.className = 'poster-item focusable';
        btn.onclick = () => {
            localStorage.setItem('current_details', JSON.stringify(movie));
            localStorage.setItem('current_details_type', 'movie');
            window.location.href = './details.html';
        };
        
        const posterUrl = movie.stream_icon || 'https://via.placeholder.com/400x600?text=No+Poster';

        btn.innerHTML = `
            <div class="poster-img-container">
                <img src="${posterUrl}" class="poster-img" style="object-fit: cover;" onerror="this.src='https://via.placeholder.com/400x600?text=No+Poster'" alt="Poster" loading="lazy" />
                <div class="poster-gradient" style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%); pointer-events: none;"></div>
                <div class="star-badge">☆</div>
            </div>
            <div class="poster-info">
                <h3>${movie.name}</h3>
                <p>${movie.rating || 'N/A'}</p>
            </div>
        `;
        container.appendChild(btn);
    });
    
    if (window.dpad) window.dpad.updateFocusables();
}

function playMovie(movie) {
    const originalUrl = `${localStorage.getItem('xtream_server')}/movie/${localStorage.getItem('xtream_username')}/${localStorage.getItem('xtream_password')}/${movie.stream_id}.${movie.container_extension || 'mp4'}`;
    
    // If running locally or on TV, use direct URL to bypass Node proxy requirement
    const isTV = window.location.protocol === 'file:' || window.location.protocol === 'app:';
    const url = isTV ? originalUrl : `/api/stream?url=${encodeURIComponent(originalUrl)}`;
    
    localStorage.setItem('current_stream_url', url);
    localStorage.setItem('current_stream_name', movie.name);
    
    window.location.href = './player.html';
}
