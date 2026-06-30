// Xtream API Logic
window.XtreamAPI = class XtreamAPI {
    constructor(serverUrl, username, password) {
        this.serverUrl = serverUrl.replace(/\/$/, ""); // Remove trailing slash
        this.username = username;
        this.password = password;
    }
    
    get baseUrl() {
        return `${this.serverUrl}/player_api.php?username=${this.username}&password=${this.password}`;
    }

    async fetchApi(action = '') {
        const url = action ? `${this.baseUrl}&action=${action}` : this.baseUrl;
        
        // If running on TV (file: or app: protocol), try direct fetch
        if (window.location.protocol === 'file:' || window.location.protocol === 'app:') {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                return await response.json();
            } catch (error) {
                console.error(`XtreamAPI Direct Fetch Error (${action}):`, error);
                throw error;
            }
        }
        
        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Proxy error ${response.status}: ${errText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`XtreamAPI Error (${action}):`, error);
            // Fallback to direct fetch if proxy fails (e.g. some web servers)
            try {
                const fbResponse = await fetch(url);
                return await fbResponse.json();
            } catch (fbError) {
                throw error;
            }
        }
    }
    
    async authenticate() {
        return await this.fetchApi();
    }

    async getLiveCategories() {
        return await this.fetchApi('get_live_categories');
    }

    async getLiveStreams(categoryId = null) {
        const action = categoryId ? `get_live_streams&category_id=${categoryId}` : 'get_live_streams';
        return await this.fetchApi(action);
    }
    
    async getVodCategories() {
        return await this.fetchApi('get_vod_categories');
    }

    async getVodStreams(categoryId = null) {
        const action = categoryId ? `get_vod_streams&category_id=${categoryId}` : 'get_vod_streams';
        return await this.fetchApi(action);
    }

    async getSeriesCategories() {
        return await this.fetchApi('get_series_categories');
    }

    async getSeries(categoryId = null) {
        const action = categoryId ? `get_series&category_id=${categoryId}` : 'get_series';
        return await this.fetchApi(action);
    }
    
    async getSeriesInfo(seriesId) {
        return await this.fetchApi(`get_series_info&series_id=${seriesId}`);
    }
}

