/**
 * User management for the Galactic Defenders game
 */

// Global users array
let users = [
    { username: 'p', password: 'testuser', firstName: 'Test', lastName: 'User', email: 'test@example.com', birthDate: '1990-01-01' },
];

// Current user
let currentUser = null;

// Score history for current user
let scoreHistory = [];

/**
 * Initialize user management
 */
function initUserManagement() {
    // Load users from local storage
    loadUsers();
    
    // Add event listeners for forms
    document.getElementById('register-form').addEventListener('submit', registerUser);
    document.getElementById('login-form').addEventListener('submit', loginUser);
}

/**
 * Load users from local storage
 */
function loadUsers() {
    const storedUsers = localStorage.getItem('spaceShipsInvaders');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    }
}

/**
 * Save users to local storage
 */
function saveUsers() {
    localStorage.setItem('spaceShipsInvaders', JSON.stringify(users));
}

/**
 * Register a new user
 * @param {Event} e - Form submit event
 */
function registerUser(e) {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const birthDay = document.getElementById('birth-day').value;
    const birthMonth = document.getElementById('birth-month').value;
    const birthYear = document.getElementById('birth-year').value;
    
    // Validate form
    if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !birthDay || !birthMonth || !birthYear) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Check password requirements (at least 8 characters with letters and numbers)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        alert('Password must be at least 8 characters and include both letters and numbers.');
        return;
    }
    
    // Check that passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    
    // Check that names don't contain numbers
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        alert('First name and last name should not contain numbers.');
        return;
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Check if username already exists
    if (users.some(user => user.username === username)) {
        alert('Username already exists. Please choose another one.');
        return;
    }
    
    // Create new user
    const newUser = {
        username,
        password,
        firstName,
        lastName,
        email,
        birthDate: `${birthYear}-${birthMonth}-${birthDay}`
    };
    
    // Add user to users array
    users.push(newUser);
    
    // Save users to local storage
    saveUsers();
    
    // Log in the new user
    currentUser = newUser;
    
    // Reset score history for new user
    scoreHistory = [];
    
    // Go to configuration screen
    alert('Registration successful! You can now configure your game.');
    showScreen('config');
}

/**
 * Login a user
 * @param {Event} e - Form submit event
 */
function loginUser(e) {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    // Find user
    const user = users.find(user => user.username === username && user.password === password);
    
    if (user) {
        // Set current user
        currentUser = user;
        
        // Get score history for user
        loadScoreHistory(username);
        
        // Go to configuration screen
        showScreen('config');
    } else {
        alert('Invalid username or password.');
    }
}

/**
 * Load score history for a user
 * @param {string} username - Username
 */
function loadScoreHistory(username) {
    const storedHistory = localStorage.getItem(`scoreHistory_${username}`);
    if (storedHistory) {
        scoreHistory = JSON.parse(storedHistory);
    } else {
        scoreHistory = [];
    }
}

/**
 * Save score to history
 */
function saveScore() {
    if (!currentUser) return;
    
    // Create score object
    const scoreObj = {
        score,
        date: new Date().toISOString(),
        gameTime: gameConfig.gameTime
    };
    
    // Add score to history
    scoreHistory.push(scoreObj);
    
    // Sort by score (descending)
    scoreHistory.sort((a, b) => b.score - a.score);
    
    // Save to local storage
    localStorage.setItem(`scoreHistory_${currentUser.username}`, JSON.stringify(scoreHistory));
}

/**
 * Display score history
 */
function displayScoreHistory() {
    const historyContainer = document.getElementById('score-history');
    if (!historyContainer) {
        console.error("Element 'score-history' not found");
        return;
    }    
    historyContainer.innerHTML = '';
    
    if (scoreHistory.length === 0) {
        const emptyRow = document.createElement('div');
        emptyRow.className = 'scoreboard-row';
        emptyRow.textContent = 'No previous scores';
        historyContainer.appendChild(emptyRow);
        return;
    }
    
    // Find index of current score
    const currentScoreIndex = scoreHistory.findIndex(item => 
        item.score === score && 
        item.gameTime === gameConfig.gameTime &&
        new Date(item.date).toDateString() === new Date().toDateString()
    );
    
    // Display top 10 scores
    const displayCount = Math.min(10, scoreHistory.length);
    for (let i = 0; i < displayCount; i++) {
        const scoreObj = scoreHistory[i];
        const date = new Date(scoreObj.date);
        
        const row = document.createElement('div');
        row.className = 'scoreboard-row';
        if (i === currentScoreIndex) {
            row.classList.add('highlight');
        }
        
        row.innerHTML = `
            <div>#${i + 1}</div>
            <div>${scoreObj.score} points</div>
            <div>${date.toLocaleDateString()}</div>
        `;
        
        historyContainer.appendChild(row);
    }
}

/**
 * Display final score
 */
function displayFinalScore() {
    const finalScoreElement = document.getElementById('final-score');
    if (finalScoreElement) {
        finalScoreElement.textContent = score;
    } else {
        // Fallback to updating the whole message if span is not found
        const messageElement = document.getElementById('game-result-message');
        if (messageElement) {
            messageElement.textContent = `You scored ${score} points!`;
        }
    }
}
/**
 * Populate date selectors in the registration form
 */
function populateDateSelectors() {
    const daySelect = document.getElementById('birth-day');
    const monthSelect = document.getElementById('birth-month');
    const yearSelect = document.getElementById('birth-year');
    
    // Add days
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Add months
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    
    // Add years (100 years back from current year)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

/**
 * Logout the current user
 */
function logout() {
    currentUser = null;
    scoreHistory = [];
    showScreen('welcome');
}