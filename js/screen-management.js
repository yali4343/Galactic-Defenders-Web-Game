/**
 * Screen management for the Galactic Defenders game
 */

// DOM Elements - Screens
const screens = {
    welcome: document.getElementById('welcome-screen'),
    register: document.getElementById('register-screen'),
    login: document.getElementById('login-screen'),
    config: document.getElementById('config-screen'),
    game: document.getElementById('game-screen'),
    gameOver: document.getElementById('game-over-screen')
};

// DOM Elements - Modal
const aboutModal = document.getElementById('about-modal');

/**
 * Initialize screen management
 */
function initScreenManagement() {
    // Set up event listeners for navigation
    setupScreenNavigation();
    
    // Set up modal events
    setupModalEvents();

    // Set up background preview
    setupBackgroundPreview();    
}

/**
 * Set up event listeners for screen navigation
 */
function setupScreenNavigation() {
    // Navigation links
    document.getElementById('nav-welcome').addEventListener('click', handleHomeClick);
    document.getElementById('nav-about').addEventListener('click', showAboutModal);
    
    // Welcome screen buttons
    document.getElementById('btn-register').addEventListener('click', () => showScreen('register'));
    document.getElementById('btn-login').addEventListener('click', () => showScreen('login'));
    
    // Register/Login navigation
    document.getElementById('btn-to-login').addEventListener('click', () => showScreen('login'));
    document.getElementById('btn-to-register').addEventListener('click', () => showScreen('register'));
    
    // Config screen buttons
    document.getElementById('btn-start-game').addEventListener('click', startGame);
    
    // Game screen buttons
    document.getElementById('btn-new-game').addEventListener('click', handleNewGameClick);
    
    // Game over screen buttons
    document.getElementById('btn-play-again').addEventListener('click', () => showScreen('config'));
    document.getElementById('btn-back-to-welcome').addEventListener('click', logout);
}

/**
 * Set up event listeners for modal
 */
function setupModalEvents() {
    // Close button
    document.querySelector('.close-modal').addEventListener('click', hideAboutModal);
    
    // Click outside modal
    window.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            hideAboutModal();
        }
    });
    
    // ESC key to close modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAboutModal();
        }
    });
}

/**
 * Show a specific screen
 * @param {string} screenName - Name of the screen to show
 */
function showScreen(screenName) {
    // Hide all screens
    for (const key in screens) {
        screens[key].classList.remove('active');
    }
    
    // Show the requested screen
    screens[screenName].classList.add('active');
    
    // Special actions for certain screens
    if (screenName === 'game') {
        if (!gameStarted || gamePaused) {
            initGame();
        }
    } else if (screenName === 'gameOver') {
        displayFinalScore();
        displayScoreHistory();
    } else if (screenName === 'config') {
        // Reset game state when returning to config
        gameStarted = false;
        gameEnded = false;
        gamePaused = false;
    }
}

/**
 * Show about modal
 */
function showAboutModal() {
    // If the game is active, pause it
    if (gameStarted && !gameEnded && !gamePaused) {
        pauseGame();
    }

    aboutModal.style.display = 'block';
}

/**
 * Hide about modal
 */
function hideAboutModal() {
    aboutModal.style.display = 'none';

    // If the game was paused by opening the modal, resume it
    if (gameStarted && !gameEnded && gamePaused) {
        resumeGame();
    }
}

/**
 * Populate shoot key options in configuration screen
 */
function populateShootKeyOptions() {
    const shootKeySelect = document.getElementById('shoot-key');
    
    const spaceOption = shootKeySelect.querySelector('option[value="Space"]');
    shootKeySelect.innerHTML = '';
    shootKeySelect.appendChild(spaceOption);

    // Add alphabet keys
    for (let i = 65; i <= 90; i++) {
        const key = String.fromCharCode(i);
        const option = document.createElement('option');
        option.value = 'Key' + key;
        option.textContent = key;
        shootKeySelect.appendChild(option);
    }
}

/**
 * Start the game from configuration screen
 */
function startGame() {
    // Get game configuration
    gameConfig.shootKey = document.getElementById('shoot-key').value;
    gameConfig.gameTime = parseInt(document.getElementById('game-time').value) / 60;

    gameConfig.background = document.getElementById('background-select').value;
    
    // Set initial game time in seconds
    gameTimeLeft = parseInt(document.getElementById('game-time').value); 
    
    // Show game screen
    showScreen('game');
}


/**
 * Handle Home button click during gameplay
 */
function handleHomeClick() {
    // Only show confirmation if in active game
    if (gameStarted && !gameEnded) {
        // Pause the game
        pauseGame();
        
        // Show confirmation modal
        document.getElementById('confirmation-modal').style.display = 'block';
        
        // Set up event listeners for the modal buttons
        document.getElementById('confirm-yes').onclick = function() {
            document.getElementById('confirmation-modal').style.display = 'none';
            // Reset game state without saving score
            gameStarted = false;
            gameEnded = false;
            gamePaused = false;
            // Stop game loops
            if (gameLoop) clearInterval(gameLoop);
            if (gameTimeInterval) clearInterval(gameTimeInterval);
            // Stop music
            stopGameMusic();
            // Go to welcome screen
            showScreen('welcome');
        };
        
        document.getElementById('confirm-no').onclick = function() {
            document.getElementById('confirmation-modal').style.display = 'none';
            resumeGame();
        };
        
        // Close button acts as "No"
        document.querySelector('#confirmation-modal .close-modal').onclick = function() {
            document.getElementById('confirmation-modal').style.display = 'none';
            resumeGame();
        };
        
        // Click outside acts as "No"
        window.onclick = function(event) {
            if (event.target == document.getElementById('confirmation-modal')) {
                document.getElementById('confirmation-modal').style.display = 'none';
                resumeGame();
            }
        };
    } else {
        // If not in active game, just go to welcome screen
        showScreen('welcome');
    }
}


function setupBackgroundPreview() {
    const backgroundSelect = document.getElementById('background-select');
    
    // Update preview when selection changes
    backgroundSelect.addEventListener('change', updateBackgroundPreview);
    
    // Show initial preview
    updateBackgroundPreview();
  }

  function updateBackgroundPreview() {
    const backgroundSelect = document.getElementById('background-select');
    const preview = document.getElementById('background-preview');
    
    if (preview) {
      const selectedBackground = backgroundSelect.value;
      const bgPath = `assets/images/backgrounds/${selectedBackground}.jpg`;
      preview.style.backgroundImage = `url('${bgPath}')`;
    }
  }