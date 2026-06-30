// Prewarm logic to cache assets and speed up navigation
window.addEventListener('DOMContentLoaded', () => {
    console.log("Prewarming assets...");
    const assetsToPreload = [
        '../assets/base.css',
        '../assets/home.css',
        '../assets/livetv.css'
    ];
    
    assetsToPreload.forEach(asset => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = asset;
        link.as = 'style';
        document.head.appendChild(link);
    });
});
