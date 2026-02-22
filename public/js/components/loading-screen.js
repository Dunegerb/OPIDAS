// Loading Screen Component - OPIDAS
// Manages the loading screen between pages

class LoadingScreen {
    constructor() {
        this.loadingElement = null;
        this.videoElement = null;
        this.minDisplayTime = 2000; // Minimum display time (2 seconds)
        this.startTime = null;
    }

    /**
     * Creates and displays the loading screen
     */
    show() {
        // Remove existing loading screen if any
        this.hide();

        // Create the loading screen element
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'loading-screen';
        
        // Create the video element
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;
        this.videoElement.loop = false;
        
        const source = document.createElement('source');
        source.src = '/assets/motiondesigns/teladecarregamento/loadingscreen.webm';
        source.type = 'video/webm';
        
        this.videoElement.appendChild(source);
        
        // Create a fallback in case the video doesn't load
        const fallback = document.createElement('div');
        fallback.className = 'loading-fallback';
        fallback.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading...</div>
        `;
        
        this.loadingElement.appendChild(this.videoElement);
        this.loadingElement.appendChild(fallback);
        
        // Add to the body
        document.body.appendChild(this.loadingElement);
        
        // Mark the start time
        this.startTime = Date.now();
        
        // Try to play the video
        this.videoElement.play().catch(err => {
            console.warn('Could not play the loading video:', err);
        });
    }

    /**
     * Removes the loading screen with a fade out
     */
    async hide() {
        if (!this.loadingElement) return;

        // Calculate the elapsed time
        const elapsed = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minDisplayTime - elapsed);

        // Wait for the minimum time if necessary
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        // Apply fade out
        this.loadingElement.classList.add('fade-out');

        // Remove from the DOM after the transition
        setTimeout(() => {
            if (this.loadingElement && this.loadingElement.parentNode) {
                this.loadingElement.parentNode.removeChild(this.loadingElement);
            }
            this.loadingElement = null;
            this.videoElement = null;
        }, 500); // CSS transition time
    }

    /**
     * Navigates to another page with a loading screen
     * @param {string} url - Destination URL
     */
    static navigateWithLoading(url) {
        const loader = new LoadingScreen();
        loader.show();
        
        // Wait for a frame to ensure the loading screen is rendered
        requestAnimationFrame(() => {
            window.location.href = url;
        });
    }
}

// Export for global use
window.LoadingScreen = LoadingScreen;

// Add listeners for links that should have a loading screen
document.addEventListener('DOMContentLoaded', () => {
    // Intercept clicks on specific links
    document.querySelectorAll('a[href*="campo.html"], a[href*="doutrina.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Ignore external links and anchors
            if (!href || href.startsWith('#') || href.startsWith('http')) {
                return;
            }

            e.preventDefault();
            LoadingScreen.navigateWithLoading(href);
        });
    });
});
