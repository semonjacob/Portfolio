// New Intersection Observer for additional animations
document.addEventListener("DOMContentLoaded", () => {
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('fade-slide-in') ||
                    entry.target.classList.contains('zoom-in') ||
                    entry.target.classList.contains('rotate-in')) {
                    entry.target.classList.add('visible');
                    animationObserver.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.fade-slide-in, .zoom-in, .rotate-in').forEach(element => {
        animationObserver.observe(element);
    });

    // Loading Screen Logic
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        window.addEventListener('load', () => {
            loadingScreen.style.display = 'none';
        });
    }
});
