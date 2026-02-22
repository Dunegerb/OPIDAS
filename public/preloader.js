class PreloaderManager {
    constructor(options = {}) {
        // Default settings
        this.preloaderId = options.preloaderId || 'preloader';
        this.minDuration = options.minDuration || 800; // Minimum duration in ms to ensure the video is seen
        this.autoHide = options.autoHide !== undefined ? options.autoHide : false; // Disabled by default for manual control
        this.debug = options.debug || false;

        // DOM Elements
        this.preloaderElement = null;
        this.startTime = Date.now(); // Starts the counter as soon as the class is instantiated
        this.isVisible = true; // Assumes it starts visible if it is in the HTML

        // Initialize
        this.init();
    }

    /**
     * Initializes the preloader manager
     */
    init() {
        this.preloaderElement = document.getElementById(this.preloaderId);

        if (!this.preloaderElement) {
            console.warn(`Preloader with ID "${this.preloaderId}" not found in the DOM`);
            this.isVisible = false;
            return;
        }


        this.preloaderElement.addEventListener('contextmenu', (event) => {
            event.preventDefault(); 
        });

        this.log('Preloader initialized');

        // If autoHide is enabled, hides when the page loads
        if (this.autoHide) {
            window.addEventListener('load', () => {
                this.log('Page loaded (autoHide)');
                this.hide();
            });
        }

        // Listen for navigation events to show the preloader when leaving the page
        this.setupNavigationListeners();
    }

    /**
     * Sets up listeners for navigation events
     */
    setupNavigationListeners() {
        // Intercept clicks on internal links
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && this.isInternalLink(link)) {
                // Only shows if changing the page
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && href !== window.location.pathname) {
                    this.show();
                    this.log(`Navigating to: ${link.href}`);
                }
            }
        });
    }

    /**
     * Checks if a link is internal
     */
    isInternalLink(link) {
        const href = link.getAttribute('href');

        // Ignore empty links, anchors, and external links
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            return false;
        }

        // Ignore links with data-no-preloader attribute
        if (link.hasAttribute('data-no-preloader')) {
            return false;
        }

        // Check if it is an external link
        const isExternal = link.hostname && link.hostname !== window.location.hostname;
        if (isExternal) {
            return false;
        }

        return true;
    }

    /**
     * Shows the preloader
     */
    show() {
        if (this.isVisible) return;

        if (this.preloaderElement) {
            this.preloaderElement.classList.remove('hidden');
            this.isVisible = true;
            this.startTime = Date.now();
            this.log('Preloader shown');
        }
    }

    /**
     * Hides the preloader
     */
    hide() {
        if (!this.isVisible) return;

        // Respect minimum duration to avoid "blinking"
        const elapsed = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minDuration - elapsed);

        if (remainingTime > 0) {
            this.log(`Waiting ${remainingTime}ms to hide preloader`);
            setTimeout(() => this.hide(), remainingTime);
            return;
        }

        if (this.preloaderElement) {
            this.preloaderElement.classList.add('hidden');
            this.isVisible = false;
            this.log('Preloader hidden');
        }
    }

    /**
     * Log for debugging
     */
    log(message) {
        if (this.debug) {
            console.log(`[Preloader] ${message}`);
        }
    }
}

/**
 * ========================================
 * GLOBAL INITIALIZATION
 * ======================================== 
 */

// Create a global instance of the preloader
window.preloaderInstance = new PreloaderManager({
    preloaderId: 'preloader',
    minDuration: 1500, // Increased to ensure the animation is smooth
    autoHide: false,   // Manual control via hidePreloader()
    debug: false
});

/**
 * ========================================
 * GLOBAL HELPER FUNCTIONS
 * ======================================== 
 */

function showPreloader() {
    if (window.preloaderInstance) window.preloaderInstance.show();
}

function hidePreloader() {
    if (window.preloaderInstance) window.preloaderInstance.hide();
}
