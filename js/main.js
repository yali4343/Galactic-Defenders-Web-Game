/**
 * Main entry point for the Galactic Defenders game
 */

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);

/**
 * Initialize the application
 */
function initialize() {
    
    // Initialize audio
    initAudio();
    
    // Populate form selectors
    populateDateSelectors();
    populateShootKeyOptions();
    
    // Initialize user management
    initUserManagement();
    
    // Initialize screen management
    initScreenManagement();
    
    // Initialize game logic
    initGameLogic();
    
    // Set up additional event listeners
    setupAdditionalEventListeners();
    
    // Log initialization
    console.log('Galactic Defenders initialized successfully');
}

/**
 * Set up additional event listeners
 */
function setupAdditionalEventListeners() {
    // Prevent spacebar from scrolling the page when used as shoot key
    window.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
        }
    });
}