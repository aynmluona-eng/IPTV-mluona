let api;
let categories = [];
let seriesList = [];
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
        const cats = await api.getSeriesCategories();
        categories = [{ category_id: 'all', category_name: 'All Series' }, ...cats];
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

    const container = document.getElementById('series-container');
    if(!container) return;
    container.innerHTML = '<div style="padding: 20px; color: white; font-size: 24px;">Loading Series...</div>';

    try {
        if (id === 'all') {
            seriesList = await api.getSeries();
            seriesList = seriesList.slice(0, 100);
        } else {
            seriesList = await api.getSeries(id);
        }
        renderSeries();
    } catch (e) {
        container.innerHTML = '<div style="padding: 20px; color: red;">Failed to load series</div>';
    }
}

function renderSeries() {
    const container = document.getElementById('series-container');
    container.innerHTML = '';
    
    if(!seriesList || seriesList.length === 0) {
        container.innerHTML = '<div style="padding: 20px; color: white;">No series found.</div>';
        return;
    }

    seriesList.forEach(series => {
        const btn = document.createElement('button');
        btn.className = 'poster-item focusable';
        btn.onclick = () => {
            localStorage.setItem('current_details', JSON.stringify(series));
            localStorage.setItem('current_details_type', 'series');
            window.location.href = './details.html';
        };
        
        const posterUrl = series.cover || 'https://via.placeholder.com/400x600?text=No+Cover';

        btn.innerHTML = `
            <div class="poster-img-container">
                <img src="${posterUrl}" class="poster-img" style="object-fit: cover;" onerror="this.src='https://via.placeholder.com/400x600?text=No+Cover'" alt="Poster" loading="lazy" />
                <div class="poster-gradient" style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%); pointer-events: none;"></div>
                <div class="ep-badge">${series.rating || 'N/A'}</div>
            </div>
            <div class="poster-info">
                <h3>${series.name}</h3>
                <p>Series</p>
            </div>
        `;
        container.appendChild(btn);
    });
    
    if (window.dpad) window.dpad.updateFocusables();
}
