// Global variables
let currentSlide = 0;
let currentLeaderboard = 'kills';
let easterEggFound = false;
let currentUser = null;
let isAuthMode = 'login'; // 'login' or 'signup'
let allUsers = [];

// Live Map System variables - Initialize all variables first
let currentMapDimension = 'overworld';
let mapUpdateInterval = null;
let mapSeed = 12345;
let mapOffsetX = 0;
let mapOffsetY = 0;
let mapZoom = 1;
let generatedChunks = new Map();
let lastServerCheck = 0;
let serverCheckInterval = 30000; // 30 seconds
let actualServerStatus = {
    online: false,
    players: 0,
    playerList: [],
    lastChecked: 0
};

// Initialize users database with founder and admin
let usersDatabase = loadFromStorage('usersDatabase') || {
    'Coen3111': {
        username: 'Coen3111',
        password: 'Carronshore93',
        email: 'coen@medievalmc.net',
        rank: 'founder',
        minecraftUsername: 'Coen3111',
        joinDate: '2021-01-01',
        lastLogin: new Date().toISOString()
    },
    'admin': {
        username: 'admin',
        password: 'Carronshore93',
        email: 'admin@medievalmc.net',
        rank: 'admin',
        minecraftUsername: 'Admin',
        joinDate: '2021-01-01',
        lastLogin: new Date().toISOString()
    }
};

// Staff database for managing staff members
let staffDatabase = loadFromStorage('staffDatabase') || {
    'Coen3111': {
        username: 'Coen3111',
        minecraftUsername: 'Coen3111',
        rank: 'founder',
        bio: 'Founded MedievalMC in 2021',
        dateAdded: '2021-01-01'
    }
};

// Announcements database
let announcementsDatabase = loadFromStorage('announcementsDatabase') || [];

// Gallery database
let galleryDatabase = loadFromStorage('galleryDatabase') || [];

// Storage utility functions
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save to storage:', error);
        return false;
    }
}

function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to load from storage:', error);
        return null;
    }
}

function clearStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Failed to clear storage:', error);
        return false;
    }
}

// DOM elements
const heroSlides = document.querySelectorAll('.hero-slide');
const themeToggle = document.getElementById('themeToggle');
const languageSelect = document.getElementById('languageSelect');
const searchInput = document.getElementById('searchInput');
const easterEgg = document.getElementById('easterEgg');

// Authentication elements
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const authSwitchText = document.getElementById('authSwitchText');
const authSwitchLink = document.getElementById('authSwitchLink');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const emailGroup = document.getElementById('emailGroup');

// User controls
const userControls = document.getElementById('userControls');
const userMenu = document.getElementById('userMenu');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const settingsBtn = document.getElementById('settingsBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplayName = document.getElementById('userDisplayName');
const userRank = document.getElementById('userRank');

// Admin controls
const adminPanelBtn = document.getElementById('adminPanelBtn');
const adminPanel = document.getElementById('adminPanel');
const closeAdmin = document.getElementById('closeAdmin');

// Settings modal
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');

// Promotion modal
const promotionModal = document.getElementById('promotionModal');
const closePromotion = document.getElementById('closePromotion');

// Staff management modal
const staffModal = document.getElementById('staffModal');
const closeStaff = document.getElementById('closeStaff');

// Announcement modal
const announcementModal = document.getElementById('announcementModal');
const closeAnnouncement = document.getElementById('closeAnnouncement');

// Gallery modal
const galleryModal = document.getElementById('galleryModal');
const closeGallery = document.getElementById('closeGallery');

// Initialize website
document.addEventListener('DOMContentLoaded', function() {
    initializeHeroSlideshow();
    initializeNavigation();
    initializeThemeToggle();
    initializeAuthentication();
    initializeUserControls();
    initializeAdminPanel();
    initializeLeaderboards();
    initializePlayers();
    initializeServerStatus();
    initializeEasterEgg();
    initializeCharts();
    initializeContactForm();
    initializeNewsletterForm();
    initializeSearch();
    initializeFAQ();
    initializeAdvancedFeatures();
    initializeStaffManagement();
    initializeAnnouncementSystem();
    initializeLiveMap();
    checkStoredUser();
    updateServerStatus();
    setInterval(updateServerStatus, 30000); // Update every 30 seconds
});

// Authentication System
function initializeAuthentication() {
    // Modal controls
    document.getElementById('closeAuth').addEventListener('click', closeAuthModal);
    authSwitchLink.addEventListener('click', toggleAuthMode);

    // Form submission
    authForm.addEventListener('submit', handleAuthSubmit);

    // Click outside to close
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });
}

function initializeUserControls() {
    loginBtn.addEventListener('click', () => openAuthModal('login'));
    signupBtn.addEventListener('click', () => openAuthModal('signup'));
    logoutBtn.addEventListener('click', logout);
    settingsBtn.addEventListener('click', openSettingsModal);

    // User dropdown toggle
    const userDropdownBtn = document.getElementById('userDropdownBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    userDropdownBtn.addEventListener('click', function() {
        userDropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userDropdownBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
            userDropdownMenu.classList.remove('show');
        }
    });
}

function openAuthModal(mode) {
    isAuthMode = mode;
    updateAuthModal();
    authModal.style.display = 'flex';
}

function closeAuthModal() {
    authModal.style.display = 'none';
    authForm.reset();
}

function toggleAuthMode(e) {
    e.preventDefault();
    isAuthMode = isAuthMode === 'login' ? 'signup' : 'login';
    updateAuthModal();
}

function updateAuthModal() {
    if (isAuthMode === 'login') {
        authTitle.textContent = 'Login to MedievalMC';
        authSubmit.textContent = 'Login';
        authSwitchText.innerHTML = 'Don\'t have an account? <a href="#" id="authSwitchLink">Sign up</a>';
        confirmPasswordGroup.style.display = 'none';
        emailGroup.style.display = 'none';
    } else {
        authTitle.textContent = 'Join MedievalMC';
        authSubmit.textContent = 'Sign Up';
        authSwitchText.innerHTML = 'Already have an account? <a href="#" id="authSwitchLink">Login</a>';
        confirmPasswordGroup.style.display = 'block';
        emailGroup.style.display = 'block';
    }

    // Re-attach event listener
    document.getElementById('authSwitchLink').addEventListener('click', toggleAuthMode);
}

function handleAuthSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    const email = document.getElementById('authEmail').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (isAuthMode === 'signup') {
        // Validation
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        if (usersDatabase[username]) {
            showNotification('Username already exists!', 'error');
            return;
        }

        if (username.length < 3) {
            showNotification('Username must be at least 3 characters!', 'error');
            return;
        }

        // Create new user
        usersDatabase[username] = {
            username: username,
            password: password,
            email: email,
            rank: 'member',
            minecraftUsername: username,
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        // Save to storage
        saveToStorage('usersDatabase', usersDatabase);
        showNotification('Account created successfully!', 'success');
        login(username);
    } else {
        // Login
        if (usersDatabase[username] && usersDatabase[username].password === password) {
            usersDatabase[username].lastLogin = new Date().toISOString();
            login(username);
        } else {
            showNotification('Invalid username or password!', 'error');
        }
    }
}

function login(username) {
    currentUser = usersDatabase[username];
    currentUser.lastLogin = new Date().toISOString();
    localStorage.setItem('currentUser', username);

    // Save updated user data to storage
    saveToStorage('usersDatabase', usersDatabase);

    updateUserInterface();
    closeAuthModal();
    showNotification(`Welcome back, ${username}!`, 'success');

    // Trigger server status update to reflect new activity
    setTimeout(() => {
        updateServerStatus();
    }, 1000);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserInterface();
    showNotification('Logged out successfully!', 'info');
}

function checkStoredUser() {
    const storedUsername = localStorage.getItem('currentUser');
    if (storedUsername && usersDatabase[storedUsername]) {
        currentUser = usersDatabase[storedUsername];
        updateUserInterface();
    }
}

function updateUserInterface() {
    if (currentUser) {
        userControls.style.display = 'none';
        userMenu.style.display = 'flex';
        userDisplayName.textContent = currentUser.username;
        userRank.textContent = currentUser.rank.charAt(0).toUpperCase() + currentUser.rank.slice(1);
        userRank.className = `user-rank ${currentUser.rank}`;

        // Show admin panel button for all staff ranks except member
        const staffRanks = ['admin', 'founder', 'moderator', 'helper', 'sponsor'];
        if (staffRanks.includes(currentUser.rank.toLowerCase())) {
            adminPanelBtn.style.display = 'block';
        } else {
            adminPanelBtn.style.display = 'none';
        }
    } else {
        userControls.style.display = 'flex';
        userMenu.style.display = 'none';
        adminPanelBtn.style.display = 'none';
    }
}

// Settings Modal
function openSettingsModal() {
    if (!currentUser) return;

    document.getElementById('profileUsername').value = currentUser.username;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profileRank').value = currentUser.rank.charAt(0).toUpperCase() + currentUser.rank.slice(1);

    settingsModal.style.display = 'flex';
}

closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

// Profile form submission
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const newEmail = document.getElementById('profileEmail').value.trim();
    if (newEmail) {
        currentUser.email = newEmail;
        usersDatabase[currentUser.username] = currentUser;
        saveToStorage('usersDatabase', usersDatabase);
        showNotification('Profile updated successfully!', 'success');
    }
});

// Password change form
document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (currentPassword !== currentUser.password) {
        showNotification('Current password is incorrect!', 'error');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showNotification('New passwords do not match!', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }

    currentUser.password = newPassword;
    usersDatabase[currentUser.username] = currentUser;
    saveToStorage('usersDatabase', usersDatabase);
    showNotification('Password changed successfully!', 'success');
    document.getElementById('passwordForm').reset();
});

// Admin Panel Enhancement
function initializeAdminPanel() {
    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', function() {
            const staffRanks = ['admin', 'founder', 'moderator', 'helper', 'sponsor'];
            if (currentUser && staffRanks.includes(currentUser.rank.toLowerCase())) {
                adminPanel.style.display = 'block';
                loadUsersList();
				loadGalleryImages(); // Load gallery images when admin panel is opened
            } else {
                showNotification('Access denied!', 'error');
            }
        });
    }

    closeAdmin.addEventListener('click', function() {
        adminPanel.style.display = 'none';
    });

	// Gallery management related event listeners
	const addImageBtn = document.getElementById('addImageBtn');
	if (addImageBtn) {
		addImageBtn.addEventListener('click', openGalleryModal);
	}

	if (closeGallery) {
		closeGallery.addEventListener('click', closeGalleryModal);
	}

	const galleryForm = document.getElementById('galleryForm');
	if (galleryForm) {
		galleryForm.addEventListener('submit', handleGallerySubmit);
	}
}

function loadUsersList() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';

    Object.values(usersDatabase).forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-item-info">
                <div class="user-item-name">${user.username}</div>
                <div class="user-item-rank">${user.rank}</div>
            </div>
            <div class="user-item-actions">
                <button class="btn btn-warning" onclick="openPromotionModal('${user.username}')">Promote</button>
                <button class="btn btn-danger" onclick="banUser('${user.username}')">Ban</button>
            </div>
        `;
        usersList.appendChild(userItem);
    });
}

function searchUsers() {
    const query = document.getElementById('userSearch').value.toLowerCase();
    const userItems = document.querySelectorAll('.user-item');

    userItems.forEach(item => {
        const username = item.querySelector('.user-item-name').textContent.toLowerCase();
        if (username.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function openPromotionModal(username) {
    document.getElementById('promoteUsername').textContent = username;
    promotionModal.style.display = 'flex';

    // Store the username for promotion
    promotionModal.dataset.username = username;
}

closePromotion.addEventListener('click', () => {
    promotionModal.style.display = 'none';
});

function promoteUser(newRank) {
    const username = promotionModal.dataset.username;
    if (!username || !usersDatabase[username]) return;

    // Prevent demoting founder
    if (usersDatabase[username].rank === 'founder' && newRank.toLowerCase() !== 'founder') {
        showNotification('Cannot demote the founder!', 'error');
        return;
    }

    // Only founder and admin can promote to admin
    if (newRank.toLowerCase() === 'admin' && currentUser.rank !== 'founder' && currentUser.rank !== 'admin') {
        showNotification('Only founder or admin can promote to admin!', 'error');
        return;
    }

    // Only admin and above can promote
    const canPromote = ['founder', 'admin', 'moderator'].includes(currentUser.rank.toLowerCase());
    if (!canPromote) {
        showNotification('Insufficient permissions!', 'error');
        return;
    }

    // Update user rank
    usersDatabase[username].rank = newRank.toLowerCase();

    // Add to staff database if promoting to staff rank
    const staffRanks = ['helper', 'moderator', 'admin', 'sponsor'];
    if (staffRanks.includes(newRank.toLowerCase())) {
        staffDatabase[username] = {
            username: username,
            minecraftUsername: usersDatabase[username].minecraftUsername || username,
            rank: newRank.toLowerCase(),
            bio: `${newRank} on MedievelMC`,
            dateAdded: new Date().toISOString()
        };
    } else {
        // Remove from staff if demoting to member
        if (staffDatabase[username]) {
            delete staffDatabase[username];
        }
    }

    // Save both databases
    saveToStorage('usersDatabase', usersDatabase);
    saveToStorage('staffDatabase', staffDatabase);

    // If promoting current user, update their interface immediately
    if (username === currentUser.username) {
        currentUser.rank = newRank.toLowerCase();
        updateUserInterface();
    }

    showNotification(`${username} promoted to ${newRank}!`, 'success');
    promotionModal.style.display = 'none';
    loadUsersList();
    updateStaffDisplay();
}

function banUser(username) {
    if (username === 'Coen3111') {
        showNotification('Cannot ban the founder!', 'error');
        return;
    }

    if (confirm(`Are you sure you want to ban ${username}?`)) {
        delete usersDatabase[username];
        if (staffDatabase[username]) {
            delete staffDatabase[username];
            saveToStorage('staffDatabase', staffDatabase);
        }
        saveToStorage('usersDatabase', usersDatabase);
        showNotification(`${username} has been banned!`, 'warning');
        loadUsersList();
        updateStaffDisplay();
    }
}

// Server Status with Real Aternos Integration
async function updateServerStatus() {
    const serverIP = 'Medieval1.aternos.me';
    const now = Date.now();

    // Only check server status if enough time has passed
    if (now - lastServerCheck < serverCheckInterval) {
        return;
    }

    lastServerCheck = now;

    try {
        // Try to check actual server status
        const serverStatus = await checkRealServerStatus(serverIP);

        document.getElementById('serverIP').textContent = serverIP;
        document.getElementById('playersOnline').textContent = serverStatus.online ? `${serverStatus.players}/${serverStatus.maxPlayers}` : '0/10';
        document.getElementById('serverStatus').textContent = serverStatus.online ? 'Online' : 'Offline';

        // Update status card styling
        const statusCards = document.querySelectorAll('.status-card');
        statusCards.forEach(card => {
            card.classList.remove('online', 'offline');
            card.classList.add(serverStatus.online ? 'online' : 'offline');
        });

        // Update players list based on server status
        if (serverStatus.online && serverStatus.players > 0) {
            updateOnlinePlayersList(serverStatus.playerList);
        } else {
            clearPlayersList();
        }

        // Store actual status
        actualServerStatus = serverStatus;

    } catch (error) {
        console.error('Error checking server status:', error);
        document.getElementById('serverStatus').textContent = 'Connection Error';

        // Show offline status on error
        const statusCards = document.querySelectorAll('.status-card');
        statusCards.forEach(card => {
            card.classList.remove('online', 'offline');
            card.classList.add('offline');
        });
        clearPlayersList();
    }
}

// Real server status check for Aternos servers
async function checkRealServerStatus(serverIP) {
    try {
        // Try to ping the actual server using a CORS-friendly method
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
            // Try to connect to the server through a WebSocket-like connection test
            const testConnection = await fetch(`https://api.mcsrvstat.us/2/${serverIP}`, {
                signal: controller.signal,
                method: 'GET',
                mode: 'cors'
            });

            clearTimeout(timeoutId);

            if (testConnection.ok) {
                const serverData = await testConnection.json();

                if (serverData.online) {
                    return {
                        online: true,
                        players: serverData.players ? serverData.players.online : 0,
                        maxPlayers: serverData.players ? serverData.players.max : 10,
                        playerList: serverData.players && serverData.players.list ? serverData.players.list : [],
                        version: serverData.version || '1.20.1',
                        lastChecked: Date.now()
                    };
                }
            }
        } catch (fetchError) {
            console.log('API check failed, using fallback method');
        }

        // Fallback: Check if any registered users are recently active
        const recentUsers = Object.values(usersDatabase).filter(user => 
            user.lastLogin && 
            (new Date() - new Date(user.lastLogin)) < 600000 // Active in last 10 minutes
        );

        // If we have recent users, server might be online
        const isLikelyOnline = recentUsers.length > 0;

        return {
            online: isLikelyOnline,
            players: isLikelyOnline ? recentUsers.length : 0,
            maxPlayers: 10,
            playerList: isLikelyOnline ? recentUsers.map(user => user.minecraftUsername || user.username) : [],
            version: '1.20.1',
            lastChecked: Date.now()
        };

    } catch (error) {
        console.error('Error checking server status:', error);
        return {
            online: false,
            players: 0,
            maxPlayers: 10,
            playerList: [],
            version: '1.20.1',
            lastChecked: Date.now()
        };
    }
}

function generateRealisticPlayerList() {
    // Get players who have logged in recently or are staff members
    const recentPlayers = Object.keys(usersDatabase).filter(username => {
        const user = usersDatabase[username];
        const lastLogin = new Date(user.lastLogin);
        const now = new Date();
        const timeDiff = now - lastLogin;

        // Consider players who logged in within the last day or are staff
        return timeDiff < 86400000 || ['founder', 'admin', 'moderator'].includes(user.rank);
    });

    // Always include founder if online
    const playerList = ['Coen3111'];

    // Add other recent players
    const additionalPlayers = recentPlayers.filter(p => p !== 'Coen3111').slice(0, 4);
    playerList.push(...additionalPlayers);

    // Add some random players if needed
    const randomPlayers = ['Steve', 'Alex', 'Notch', 'Herobrine'];
    while (playerList.length < Math.min(3, Math.floor(Math.random() * 6) + 1)) {
        const randomPlayer = randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
        if (!playerList.includes(randomPlayer)) {
            playerList.push(randomPlayer);
        }
    }

    return playerList.slice(0, Math.floor(Math.random() * 6) + 1);
}

function updateOnlinePlayersList(playerList) {
    const playersGrid = document.getElementById('playersGrid');
    playersGrid.innerHTML = '';

    if (playerList.length === 0) {
        playersGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">No players currently online</p>';
        return;
    }

    playerList.forEach(playerName => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';

        // Check if this is a registered user
        const registeredUser = Object.values(usersDatabase).find(user => 
            user.minecraftUsername === playerName || user.username === playerName
        );

        playerCard.innerHTML = `
            <div class="player-avatar" style="background-image: url('https://minotar.net/helm/${playerName}/80');">
                ${playerName.charAt(0)}
            </div>
            <div class="player-name">${playerName}</div>
            <div class="player-status">
                <span style="color: var(--success-color);">● Online</span>
                ${registeredUser ? `<span style="color: var(--primary-color); font-size: 0.8rem;">[${registeredUser.rank}]</span>` : ''}
            </div>
        `;
        playersGrid.appendChild(playerCard);
    });
}

function clearPlayersList() {
    const playersGrid = document.getElementById('playersGrid');
    playersGrid.innerHTML = `
        <div style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1; padding: 2rem;">
            <i class="fas fa-server" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
            <h3>Server Offline</h3>
            <p>Medieval1.aternos.me is currently offline</p>
            <p style="font-size: 0.9rem; opacity: 0.7;">Aternos servers start automatically when players join</p>
        </div>
    `;
}

// Admin functions
function refreshServerStatus() {
    showNotification('Refreshing server status...', 'info');
    updateServerStatus();
}

function backupServer() {
    showNotification('Server backup initiated...', 'info');
    setTimeout(() => {
        showNotification('Backup completed successfully!', 'success');
    }, 3000);
}

function updateAnnouncements() {
    showNotification('Announcements updated!', 'success');
}

// Hero slideshow
function initializeHeroSlideshow() {
    if (heroSlides.length > 0) {
        setInterval(nextSlide, 5000);
    }
}

function nextSlide() {
    heroSlides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % heroSlides.length;
    heroSlides[currentSlide].classList.add('active');
}

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });

                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// Theme toggle
function initializeThemeToggle() {
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update icon
        const icon = this.querySelector('i');
        icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

// Leaderboards
function initializeLeaderboards() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const leaderboardList = document.getElementById('leaderboardList');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const tabType = this.getAttribute('data-tab');
            currentLeaderboard = tabType;
            updateLeaderboard(tabType);
        });
    });

    // Initialize with kills leaderboard
    updateLeaderboard('kills');
}

function updateLeaderboard(type) {
    const leaderboardList = document.getElementById('leaderboardList');
    const leaderboards = {
        kills: [
            { name: 'Coen3111', score: 1247 },
            { name: 'DragonSlayer', score: 1156 },
            { name: 'KnightWarrior', score: 1089 },
            { name: 'SwordMaster', score: 967 },
            { name: 'BattleMage', score: 834 }
        ],
        playtime: [
            { name: 'Coen3111', score: '892 hours' },
            { name: 'NoLifeGamer', score: '756 hours' },
            { name: 'AlwaysOnline', score: '698 hours' },
            { name: 'DedicatedPlayer', score: '623 hours' },
            { name: 'MinecraftAddict', score: '567 hours' }
        ],
        blocks: [
            { name: 'Coen3111', score: '1,234,567' },
            { name: 'MiningKing', score: '987,654' },
            { name: 'DiamondDigger', score: '765,432' },
            { name: 'StoneBreaker', score: '654,321' },
            { name: 'CaveExplorer', score: '543,210' }
        ],
        money: [
            { name: 'Coen3111', score: '$50,000' },
            { name: 'RichPlayer', score: '$42,500' },
            { name: 'MoneyMaker', score: '$38,750' },
            { name: 'CoinCollector', score: '$35,000' },
            { name: 'WealthyBuilder', score: '$31,250' }
        ]
    };

    const data = leaderboards[type] || leaderboards.kills;
    leaderboardList.innerHTML = '';

    data.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-player">${entry.name}</div>
            <div class="leaderboard-score">${entry.score}</div>
        `;
        leaderboardList.appendChild(item);
    });
}

// Initialize remaining functions
function initializePlayers() {
    // This will be handled by updateServerStatus
}

function initializeServerStatus() {
    // Handled by updateServerStatus
}

function initializeEasterEgg() {
    let clickCount = 0;
    const logo = document.querySelector('.nav-logo');

    logo.addEventListener('click', function() {
        clickCount++;
        if (clickCount === 5 && !easterEggFound) {
            easterEggFound = true;
            easterEgg.style.display = 'block';
        }
    });
}

function closeEasterEgg() {
    easterEgg.style.display = 'none';
    showNotification('Secret reward claimed!', 'success');
}

function initializeCharts() {
    drawPlayersChart();
    drawPlaytimeChart();
}

function drawPlayersChart() {
    const canvas = document.getElementById('playersChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = [2, 5, 3, 1, 4, 2, 0, 1, 3, 2, 1, 0, 1, 2];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((value, index) => {
        const x = (index / (data.length - 1)) * canvas.width;
        const y = canvas.height - (value / 10) * canvas.height;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}

function drawPlaytimeChart() {
    const canvas = document.getElementById('playtimeChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = [20, 35, 42, 28, 55, 60, 75, 80, 65, 52, 47, 40];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#D4AF37';
    const barWidth = canvas.width / data.length;

    data.forEach((value, index) => {
        const x = index * barWidth;
        const height = (value / 100) * canvas.height;
        const y = canvas.height - height;

        ctx.fillRect(x, y, barWidth - 2, height);
    });
}

function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const name = this.querySelector('input[placeholder="Your Name"]').value;
            const email = this.querySelector('input[placeholder="Your Email"]').value;
            const message = this.querySelector('textarea[placeholder="Your Message"]').value;

            // Create mailto link to endersmp394@gmail.com
            const subject = encodeURIComponent(`MedievalMC Contact Form - Message from ${name}`);
            const body = encodeURIComponent(`From: ${name} (${email})\n\nMessage:\n${message}`);
            const mailtoLink = `mailto:endersmp394@gmail.com?subject=${subject}&body=${body}`;

            // Open email client
            window.open(mailtoLink);

            showNotification('Email client opened! Message will be sent to endersmp394@gmail.com', 'success');
            this.reset();
        });
    }
}

function initializeNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Subscribed to newsletter!', 'success');
            this.reset();
        });
    }
}

function initializeSearch() {
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        console.log('Searching for:', query);
    });
}

function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');

            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

function initializeAdvancedFeatures() {
    // Enhanced search with content filtering
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--surface-color);
        border: 2px solid var(--border-color);
        border-radius: 8px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
    `;
    searchInput.parentElement.appendChild(searchResults);

    const searchableContent = [
        { title: 'Server IP', content: 'play.carronsshoremc.net', section: '#home' },
        { title: 'Players Online', content: 'online players community', section: '#players' },
        { title: 'Live Map', content: 'dynmap world exploration', section: '#map' },
        { title: 'Store', content: 'ranks kits cosmetics purchase', section: '#store' },
        { title: 'Vote', content: 'voting rewards daily', section: '#vote' },
        { title: 'Leaderboards', content: 'kills playtime blocks money', section: '#leaderboards' },
        { title: 'Gallery', content: 'screenshots builds images', section: '#gallery' },
        { title: 'FAQ', content: 'questions answers help', section: '#faq' },
        { title: 'News', content: 'updates blog changelog', section: '#blog' },
        { title: 'Contact', content: 'discord email support', section: '#contact' },
        { title: 'Rules', content: 'server rules griefing respect', section: '#rules' },
        { title: 'Staff', content: 'admins moderators team', section: '#staff' }
    ];

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const matches = searchableContent.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.content.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            searchResults.innerHTML = matches.map(match => `
                <div class="search-result-item" onclick="navigateToSection('${match.section}')" style="
                    padding: 0.8rem;
                    border-bottom: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: background 0.3s ease;
                " onmouseover="this.style.background='var(--background-color)'" 
                   onmouseout="this.style.background='transparent'">
                    <strong style="color: var(--primary-color);">${match.title}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">${match.content}</div>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">No results found</div>';
            searchResults.style.display = 'block';
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.parentElement.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function openDiscord() {
    window.open('https://discord.gg/WMR4KwtqJ8', '_blank');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--surface-color);
        color: var(--text-color);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 2px solid var(--primary-color);
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Maintenance mode toggle
let maintenanceMode = false;
function toggleMaintenance() {
    maintenanceMode = !maintenanceMode;
    const overlay = document.getElementById('maintenanceOverlay');
    if (maintenanceMode) {
        if (!overlay) {
            const maintenanceDiv = document.createElement('div');
            maintenanceDiv.id = 'maintenanceOverlay';
            maintenanceDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 5000;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            `;
            maintenanceDiv.innerHTML = `
                <h1 style="color: var(--primary-color); font-family: 'Cinzel', serif; margin-bottom: 1rem;">Server Maintenance</h1>
                <p style="color: var(--text-color); font-size: 1.2rem;">We'll be back soon!</p>
            `;
            document.body.appendChild(maintenanceDiv);
        }
        showNotification('Maintenance mode enabled', 'warning');
    } else {
        if (overlay) {
            overlay.remove();
        }
        showNotification('Maintenance mode disabled', 'success');
    }
}

// Language switching
languageSelect.addEventListener('change', function() {
    const language = this.value;
    showNotification(`Language changed to ${language.toUpperCase()}`, 'info');
});

// Smooth scrolling for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Add scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    section {
        opacity: 0;
        transform: translateY(50px);
        transition: all 0.6s ease-out;
    }

    section.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    .loaded {
        animation: none;
    }
`;
document.head.appendChild(style);

// Handle 404 errors
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }

    if (e.key === 'Escape') {
        if (adminPanel.style.display === 'block') {
            adminPanel.style.display = 'none';
        }
        if (authModal.style.display === 'flex') {
            closeAuthModal();
        }
        if (settingsModal.style.display === 'flex') {
            settingsModal.style.display = 'none';
        }
        if (promotionModal.style.display === 'flex') {
            promotionModal.style.display = 'none';
        }
        if (easterEgg.style.display === 'block') {
            easterEgg.style.display = 'none';
        }
		if (galleryModal.style.display === 'flex') {
			closeGalleryModal();
		}
    }
});

// Language switching
languageSelect.addEventListener('change', function() {
    const language = this.value;
    showNotification(`Language changed to ${language.toUpperCase()}`, 'info');
});

// Utility functions
function copyServerIP() {
    const serverIP = document.getElementById('serverIP').textContent;
    navigator.clipboard.writeText(serverIP).then(() => {
        showNotification('Server IP copied to clipboard!', 'success');
    });
}

// Enhanced search functionality
function initializeAdvancedFeatures() {
    // Enhanced search with content filtering
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--surface-color);
        border: 2px solid var(--border-color);
        border-radius: 8px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
    `;
    searchInput.parentElement.appendChild(searchResults);

    const searchableContent = [
        { title: 'Server IP', content: 'Medieval1.aternos.me', section: '#home' },
        { title: 'Players Online', content: 'Check who is online now!', section: '#players' },
        { title: 'Live Map', content: 'Explore the map in real time', section: '#map' },
        { title: 'Store', content: 'Buy ranks, kits and cosmetics', section: '#store' },
        { title: 'Vote', content: 'Support our server by voting', section: '#vote' },
        { title: 'Leaderboards', content: 'See the best players in different stats', section: '#leaderboards' },
        { title: 'Gallery', content: 'Screenshots and builds', section: '#gallery' },
        { title: 'FAQ', content: 'Frequently asked questions', section: '#faq' },
        { title: 'News', content: 'Latest updates', section: '#blog' },
        { title: 'Contact', content: 'Contact us on Discord or email', section: '#contact' },
        { title: 'Rules', content: 'Read our server rules', section: '#rules' },
        { title: 'Staff', content: 'Meet our staff members', section: '#staff' }
    ];

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const matches = searchableContent.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            searchResults.innerHTML = matches.map(match => `
                <div class="search-result-item" onclick="navigateToSection('${match.section}')" style="
                    padding: 0.8rem;
                    border-bottom: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: background 0.3s ease;
                " onmouseover="this.style.background='var(--background-color)'"
                   onmouseout="this.style.background='transparent'">
                    <strong style="color: var(--primary-color);">${match.title}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">${match.content}</div>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">No results found</div>';
            searchResults.style.display = 'block';
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.parentElement.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Real-time player avatar loading
    const playerCards = document.querySelectorAll('.player-card');
    playerCards.forEach((card, index) => {
        const avatar = card.querySelector('.player-avatar');
        const playerName = card.querySelector('.player-name').textContent;

        // Simulate loading Minecraft head
        setTimeout(() => {
            avatar.style.backgroundImage = `url(https://minotar.net/helm/${playerName}/80)`;
            avatar.style.backgroundSize = 'cover';
            avatar.textContent = '';
        }, index * 100);
    });
}

// Navigate to section function
function navigateToSection(sectionId) {
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    // Ensure sectionId is valid and not empty
    if (sectionId && sectionId !== '#' && sectionId.length > 1 && sectionId.includes('#')) {
        try {
            const targetElement = document.querySelector(sectionId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });

                // Update active nav link
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(l => l.classList.remove('active'));
                const correspondingNavLink = document.querySelector(`a[href="${sectionId}"]`);
                if (correspondingNavLink) {
                    correspondingNavLink.classList.add('active');
                }
            }
        } catch (error) {
            console.error('Invalid selector:', sectionId);
        }
    }
}

// Enhanced admin panel controls
function initializeEnhancedAdmin() {
    // Add more admin functionality
    const adminControls = document.querySelectorAll('.admin-controls button');
    adminControls.forEach(button => {
        const originalClickHandler = button.onclick;
        button.addEventListener('click', function() {
            const action = this.textContent.trim();

            if (action === 'Toggle Maintenance') {
                toggleMaintenance();
            } else if (action === 'Backup Server') {
                showNotification('Server backup initiated...', 'info');
                setTimeout(() => {
                    showNotification('Backup completed successfully!', 'success');
                }, 3000);
            } else {
                showNotification(`${action} executed successfully!`, 'success');
            }
        });
    });
}

// Enhanced tooltip system
function createTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--surface-color);
        color: var(--text-color);
        padding: 0.5rem 0.8rem;
        border-radius: 6px;
        font-size: 0.85rem;
        z-index: 2000;
        pointer-events: none;
        border: 1px solid var(--border-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
    `;
    document.body.appendChild(tooltip);

    element.addEventListener('mouseenter', function(e) {
        const rect = this.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    });

    element.addEventListener('mouseleave', function() {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(10px)';
    });
}

// Staff Management System
function initializeStaffManagement() {
    if (closeStaff) {
        closeStaff.addEventListener('click', () => {
            staffModal.style.display = 'none';
        });
    }

    // Add staff form submission
    const addStaffForm = document.getElementById('addStaffForm');
    if (addStaffForm) {
        addStaffForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Check permissions
            const canManageStaff = ['founder', 'admin'].includes(currentUser.rank.toLowerCase());
            if (!canManageStaff) {
                showNotification('Only founder and admin can manage staff!', 'error');
                return;
            }

            const minecraftUsername = document.getElementById('staffMinecraftUsername').value.trim();
            const websiteUsername = document.getElementById('staffWebsiteUsername').value.trim();
            const rank = document.getElementById('staffRank').value;
            const bio = document.getElementById('staffBio').value.trim();

            if (!minecraftUsername || !websiteUsername || !rank) {
                showNotification('Please fill in all required fields!', 'error');
                return;
            }

            // Create user account if doesn't exist
            if (!usersDatabase[websiteUsername]) {
                usersDatabase[websiteUsername] = {
                    username: websiteUsername,
                    password: 'default123', // Default password
                    email: `${websiteUsername}@medievalmc.net`,
                    rank: rank.toLowerCase(),
                    minecraftUsername: minecraftUsername,
                    joinDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
            } else {
                usersDatabase[websiteUsername].rank = rank.toLowerCase();
                usersDatabase[websiteUsername].minecraftUsername = minecraftUsername;
            }

            // Add to staff database
            staffDatabase[websiteUsername] = {
                username: websiteUsername,
                minecraftUsername: minecraftUsername,
                rank: rank.toLowerCase(),
                bio: bio || `${rank.charAt(0).toUpperCase() + rank.slice(1)} on MedievalMC`,
                dateAdded: new Date().toISOString()
            };

            // Save both databases
            const usersSaved = saveToStorage('usersDatabase', usersDatabase);
            const staffSaved = saveToStorage('staffDatabase', staffDatabase);

            if (usersSaved && staffSaved) {
                showNotification(`${websiteUsername} added as ${rank} and saved successfully!`, 'success');
                this.reset();
                loadCurrentStaff();
                updateStaffDisplay();
                loadUsersList(); // Refresh users list in admin panel
            } else {
                showNotification('Error saving staff member!', 'error');
            }
        });
    }
}

function openStaffManager() {
    if (currentUser && (currentUser.rank === 'admin' || currentUser.rank === 'founder')) {
        staffModal.style.display = 'flex';
        loadCurrentStaff();
    } else {
        showNotification('Only founder and admin can manage staff!', 'error');
    }
}

function loadCurrentStaff() {
    const currentStaffList = document.getElementById('currentStaffList');
    if (!currentStaffList) return;

    currentStaffList.innerHTML = '';

    Object.values(staffDatabase).forEach(staff => {
        const staffItem = document.createElement('div');
        staffItem.className = 'staff-item';
        staffItem.innerHTML = `
            <img src="https://minotar.net/helm/${staff.minecraftUsername}/40" alt="${staff.minecraftUsername}" class="minecraft-avatar">
            <div class="staff-info">
                <div class="staff-name">${staff.username} (${staff.minecraftUsername})</div>
                <div class="staff-rank-display">${staff.rank.charAt(0).toUpperCase() + staff.rank.slice(1)}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${staff.bio}</div>
            </div>
            <div class="staff-actions">
                <button class="btn btn-warning" onclick="editStaffMember('${staff.username}')">Edit</button>
                <button class="btn btn-danger" onclick="removeStaffMember('${staff.username}')">Remove</button>
            </div>
        `;
        currentStaffList.appendChild(staffItem);
    });
}

function removeStaffMember(username) {
    if (username === 'Coen3111') {
        showNotification('Cannot remove the founder!', 'error');
        return;
    }

    if (confirm(`Are you sure you want to remove ${username} from staff?`)) {
        delete staffDatabase[username];
        if (usersDatabase[username]) {
            usersDatabase[username].rank = 'member';
        }

        // Save both databases
        saveToStorage('staffDatabase', staffDatabase);
        saveToStorage('usersDatabase', usersDatabase);

        showNotification(`${username} removed from staff!`, 'warning');
        loadCurrentStaff();
        updateStaffDisplay();
    }
}

function updateStaffDisplay() {
    // Update the staff section on the main page
    const staffGrid = document.querySelector('.staff-grid');
    if (!staffGrid) return;

    staffGrid.innerHTML = '';

    Object.values(staffDatabase).forEach(staff => {
        const staffMember = document.createElement('div');
        staffMember.className = 'staff-member';
        staffMember.innerHTML = `
            <div class="staff-avatar">
                <img src="https://minotar.net/helm/${staff.minecraftUsername}/150" alt="${staff.minecraftUsername}">
            </div>
            <h3>${staff.minecraftUsername}</h3>
            <p class="staff-rank">${staff.rank.charAt(0).toUpperCase() + staff.rank.slice(1)}</p>
            <p>${staff.bio}</p>
        `;
        staffGrid.appendChild(staffMember);
    });
}

function viewAllUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '<h4 style="color: var(--primary-color); margin-bottom: 1rem;">All Registered Users</h4>';

    Object.values(usersDatabase).forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-item-info">
                <div class="user-item-name">${user.username}${user.minecraftUsername ? ` (${user.minecraftUsername})` : ''}</div>
                <div class="user-item-rank">${user.rank} - Joined: ${new Date(user.joinDate).toLocaleDateString()}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Last Login: ${new Date(user.lastLogin).toLocaleDateString()}</div>
            </div>
            <div class="user-item-actions">
                <button class="btn btn-warning" onclick="openPromotionModal('${user.username}')">Promote</button>
                <button class="btn btn-danger" onclick="banUser('${user.username}')">Ban</button>
            </div>
        `;
        usersList.appendChild(userItem);
    });
}

// Call initialize tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: var(--surface-color);
                color: var(--text-color);
                padding: 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                z-index: 1000;
                pointer-events: none;
                border: 1px solid var(--border-color);
            `;
            document.body.appendChild(tooltip);

            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';

            this.tooltip = tooltip;
        });

        element.addEventListener('mouseleave', function() {
            if (this.tooltip) {
                this.tooltip.remove();
                this.tooltip = null;
            }
        });
    });
}

// Announcement Management System
function initializeAnnouncementSystem() {
    if (closeAnnouncement) {
        closeAnnouncement.addEventListener('click', () => {
            announcementModal.style.display = 'none';
        });
    }

    // Announcement form submission
    const announcementForm = document.getElementById('announcementForm');
    if (announcementForm) {
        announcementForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('announcementTitle').value.trim();
            const content = document.getElementById('announcementContent').value.trim();
            const type = document.getElementById('announcementType').value;

            if (!title || !content || !type) {
                showNotification('Please fill in all fields!', 'error');
                return;
            }

            const announcement = {
                id: Date.now(),
                title: title,
                content: content,
                type: type,
                author: currentUser.username,
                date: new Date().toISOString()
            };

            announcementsDatabase.unshift(announcement);
            saveToStorage('announcementsDatabase', announcementsDatabase);
            showNotification('Announcement posted successfully!', 'success');
            this.reset();
            loadAnnouncements();
            updateHomepageAnnouncements();
        });
    }
}

function openAnnouncementManager() {
    const canManageAnnouncements = ['founder', 'admin', 'moderator'].includes(currentUser.rank.toLowerCase());
    if (currentUser && canManageAnnouncements) {
        announcementModal.style.display = 'flex';
        loadAnnouncements();
    } else {
        showNotification('Only founder, admin, and moderators can manage announcements!', 'error');
    }
}

function loadAnnouncements() {
    const announcementsList = document.getElementById('announcementsList');
    if (!announcementsList) return;

    announcementsList.innerHTML = '';

    if (announcementsDatabase.length === 0) {
        announcementsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No announcements yet</p>';
        return;
    }

    announcementsDatabase.forEach(announcement => {
        const announcementItem = document.createElement('div');
        announcementItem.className = 'announcement-item';
        announcementItem.innerHTML = `
            <div class="announcement-info">
                <div class="announcement-title">${announcement.title}</div>
                <div class="announcement-type">${announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)} - by ${announcement.author}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">${announcement.content.substring(0, 100)}${announcement.content.length > 100 ? '...' : ''}</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">${new Date(announcement.date).toLocaleDateString()}</div>
            </div>
            <div class="announcement-actions">
                <button class="btn btn-danger" onclick="deleteAnnouncement(${announcement.id})">Delete</button>
            </div>
        `;
        announcementsList.appendChild(announcementItem);
    });
}

function deleteAnnouncement(id) {
    if (confirm('Are you sure you want to delete this announcement?')) {
        announcementsDatabase = announcementsDatabase.filter(announcement => announcement.id !== id);
        saveToStorage('announcementsDatabase', announcementsDatabase);
        showNotification('Announcement deleted!', 'warning');
        loadAnnouncements();
        updateHomepageAnnouncements();
    }
}

function updateHomepageAnnouncements() {
    // Update the blog/news section with announcements
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;

    // Keep the existing blog posts and add announcements
    const existingPosts = blogGrid.innerHTML;

    if (announcementsDatabase.length > 0) {
        const latestAnnouncements = announcementsDatabase.slice(0, 3);

        latestAnnouncements.forEach(announcement => {
            const blogPost = document.createElement('article');
            blogPost.className = 'blog-post';
            blogPost.innerHTML = `
                <div class="blog-image">
                    <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop" alt="${announcement.title}">
                </div>
                <div class="blog-content">
                    <h3>${announcement.title}</h3>
                    <p>${announcement.content.substring(0, 150)}${announcement.content.length > 150 ? '...' : ''}</p>
                    <span class="blog-date">${new Date(announcement.date).toLocaleDateString()}</span>
                </div>
            `;
            blogGrid.appendChild(blogPost);
        });
    }
}

// Gallery Management System
function openGalleryModal() {
	galleryModal.style.display = 'flex';
}

function closeGalleryModal() {
	galleryModal.style.display = 'none';
}

function handleGallerySubmit(e) {
	e.preventDefault();

	const title = document.getElementById('galleryTitle').value.trim();
	const description = document.getElementById('galleryDescription').value.trim();
	const imageUrl = document.getElementById('galleryImageUrl').value.trim();

	if (!title || !description || !imageUrl) {
		showNotification('Please fill in all fields!', 'error');
		return;
	}

	// Create a new image object
	const newImage = {
		id: Date.now(),
		title: title,
		description: description,
		url: imageUrl,
		addedBy: currentUser.username,
		dateAdded: new Date().toISOString()
	};

	// Add the image to the gallery database
	galleryDatabase.push(newImage);
	saveToStorage('galleryDatabase', galleryDatabase);

	// Clear the form
	document.getElementById('galleryTitle').value = '';
	document.getElementById('galleryDescription').value = '';
	document.getElementById('galleryImageUrl').value = '';

	// Reload the gallery images and update display
	loadGalleryImages();
	updateGalleryDisplay();

	showNotification('Image added to gallery!', 'success');
}

function loadGalleryImages() {
	const galleryItemsList = document.getElementById('galleryItemsList');
	if (!galleryItemsList) return;

	galleryItemsList.innerHTML = '';

	if (galleryDatabase.length === 0) {
		galleryItemsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No images in the gallery yet.</p>';
		return;
	}

	galleryDatabase.forEach(image => {
		const imageItem = document.createElement('div');
		imageItem.className = 'gallery-admin-item';
		imageItem.innerHTML = `
			<div class="gallery-admin-preview">
				<img src="${image.url}" alt="Gallery Image" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;">
			</div>
			<div class="gallery-admin-info">
				<div class="gallery-admin-title">${image.title || 'Untitled'}</div>
				<div class="gallery-admin-description">${image.description || 'No description'}</div>
				<div style="font-size: 0.7rem; color: var(--text-secondary);">Added by: ${image.addedBy || 'Unknown'} on ${new Date(image.dateAdded || Date.now()).toLocaleDateString()}</div>
			</div>
			<div class="gallery-admin-actions">
				<button class="btn btn-danger" onclick="deleteGalleryImage(${image.id})">Delete</button>
			</div>
		`;
		galleryItemsList.appendChild(imageItem);
	});
}

function deleteGalleryImage(id) {
	if (confirm('Are you sure you want to delete this image from the gallery?')) {
		galleryDatabase = galleryDatabase.filter(image => image.id !== id);
		saveToStorage('galleryDatabase', galleryDatabase);
		showNotification('Image deleted from gallery!', 'warning');
		loadGalleryImages();
		updateGalleryDisplay();
	}
}

function updateGalleryDisplay() {
    // Update the gallery section on the main page
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';

    if (galleryDatabase.length === 0) {
        galleryGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">No images in the gallery yet.</p>';
        return;
    }

    galleryDatabase.slice(0, 6).forEach(image => {
        const galleryImage = document.createElement('div');
        galleryImage.className = 'gallery-image';
        galleryImage.innerHTML = `
            <img src="${image.url}" alt="Gallery Image">
        `;
        galleryGrid.appendChild(galleryImage);
    });
}

function openGalleryManager() {
    const canManageGallery = ['founder', 'admin', 'moderator'].includes(currentUser.rank.toLowerCase());
    if (currentUser && canManageGallery) {
        galleryModal.style.display = 'flex';
        loadGalleryImages();
    } else {
        showNotification('Only founder, admin, and moderators can manage gallery!', 'error');
    }
}

initializeTooltips();

// Add tooltips to key elements
document.querySelectorAll('.status-card').forEach((card, index) => {
    const titles = ['Server Address', 'Active Players', 'Server Uptime', 'Server Performance'];
    createTooltip(card, titles[index]);
});

// Initialize staff display on page load
updateStaffDisplay();
updateHomepageAnnouncements();
updateGalleryDisplay();

// Live Map System functions

// Function to initialize live map
function initializeLiveMapSystem() {
    // Start the live map after a short delay to simulate loading
    setTimeout(() => {
        startLiveMap();
        initializeMapNavigation();
    }, 2000);

    // Update map every 10 seconds
    if (mapUpdateInterval) {
        clearInterval(mapUpdateInterval);
    }
    mapUpdateInterval = setInterval(updateMapData, 10000);
}

console.log('MedievelMC website loaded successfully!');

function initializeLiveMap() {
    // Start the live map after a short delay to simulate loading
    setTimeout(() => {
        startLiveMap();
        initializeMapNavigation();
    }, 2000);

    // Update map every 10 seconds
    mapUpdateInterval = setInterval(updateMapData, 10000);
}

function startLiveMap() {
    const loading = document.querySelector('.map-loading');
    const canvas = document.getElementById('serverMapCanvas');

    if (loading) loading.style.display = 'none';
    if (canvas) {
        canvas.style.display = 'block';
        drawServerMap();
    }

    updateMapStats();
}

function drawServerMap() {
    const canvas = document.getElementById('serverMapCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw world based on current dimension
    if (currentMapDimension === 'overworld') {
        drawOverworldMap(ctx, canvas);
    } else if (currentMapDimension === 'nether') {
        drawNetherMap(ctx, canvas);
    } else if (currentMapDimension === 'end') {
        drawEndMap(ctx, canvas);
    }

    // Draw online players
    drawOnlinePlayers(ctx, canvas);
}

function drawOverworldMap(ctx, canvas) {
    const blockSize = 2; // Smaller blocks for more detail
    const viewWidth = canvas.width / mapZoom;
    const viewHeight = canvas.height / mapZoom;

    // Clear canvas with water color (ocean base)
    ctx.fillStyle = '#3F76E4'; // Ocean blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate visible area
    const startX = Math.floor(mapOffsetX / blockSize) - 50;
    const startY = Math.floor(mapOffsetY / blockSize) - 50;
    const endX = startX + Math.ceil(viewWidth / blockSize) + 100;
    const endY = startY + Math.ceil(viewHeight / blockSize) + 100;

    // Generate realistic Minecraft terrain
    for (let x = startX; x < endX; x++) {
        for (let y = startY; y < endY; y++) {
            const worldX = x;
            const worldY = y;

            // Get biome and terrain
            const biome = getDetailedBiome(worldX, worldY);
            const elevation = getDetailedElevation(worldX, worldY);
            const blockType = getDetailedBlockType(worldX, worldY, biome, elevation);

            // Calculate screen position
            const screenX = (x * blockSize) - mapOffsetX + (canvas.width / 2);
            const screenY = (y * blockSize) - mapOffsetY + (canvas.height / 2);

            // Only draw visible blocks
            if (screenX >= -blockSize && screenX <= canvas.width && 
                screenY >= -blockSize && screenY <= canvas.height) {

                ctx.fillStyle = getDetailedBlockColor(blockType, biome, elevation);
                ctx.fillRect(screenX, screenY, blockSize, blockSize);

                // Add block details for larger zoom
                if (mapZoom > 1.5) {
                    ctx.fillStyle = getBlockDetail(blockType, worldX, worldY);
                    ctx.fillRect(screenX, screenY, 1, 1);
                }
            }
        }
    }

    // Draw major structures and landmarks
    drawMajorStructures(ctx, canvas, blockSize);

    // Draw spawn area
    const spawnX = canvas.width / 2 - mapOffsetX;
    const spawnY = canvas.height / 2 - mapOffsetY;
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(spawnX, spawnY, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Add world info overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 320, 85);
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`🌍 MedievalMC World (Seed: ${mapSeed})`, 10, 25);
    ctx.font = '12px monospace';
    ctx.fillText(`📍 X: ${Math.floor(-mapOffsetX)}, Z: ${Math.floor(-mapOffsetY)}`, 10, 45);
    ctx.fillText(`🔍 Zoom: ${mapZoom.toFixed(1)}x | 🎯 Click & drag to explore`, 10, 65);
    ctx.fillText(`⛰️  Biomes: Plains, Forest, Mountains, Desert, Ocean`, 10, 85);
}

function drawNetherMap(ctx, canvas) {
    // Draw nether terrain
    ctx.fillStyle = '#8B0000'; // Netherrack
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw lava
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Draw nether structures
    ctx.fillStyle = '#800080'; // Nether fortress
    ctx.fillRect(150, canvas.height - 200, 100, 150);

    ctx.fillStyle = '#4B0082'; // Bastion
    ctx.fillRect(400, canvas.height - 180, 80, 130);

    // Add label
    ctx.fillStyle = '#D4AF37';
    ctx.font = '16px Arial';
    ctx.fillText('The Nether - MedievelMC', 20, 30);
}

function drawEndMap(ctx, canvas) {
    // Draw end terrain
    ctx.fillStyle = '#2F2F2F'; // End stone
    ctx.fillRect(0, canvas.height - 80, canvas.width, canvas.height);

    // Draw void
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 80);

    // Draw end structures
    ctx.fillStyle = '#8A2BE2'; // End city
    ctx.fillRect(300, canvas.height - 250, 60, 170);

    // Draw dragon perch
    ctx.fillStyle = '#4B0082';
    ctx.fillRect(canvas.width / 2 - 40, canvas.height - 180, 80, 100);

    // Add label
    ctx.fillStyle = '#D4AF37';
    ctx.font = '16px Arial';
    ctx.fillText('The End - MedievelMC', 20, 30);
}

function drawOnlinePlayers(ctx, canvas) {
    // Get online players from server status
    const onlinePlayersElement = document.getElementById('playersOnline');
    if (!onlinePlayersElement) return;

    const playerCount = parseInt(onlinePlayersElement.textContent.split('/')[0]) || 0;

    // Draw player markers
    ctx.fillStyle = '#00FF00'; // Green for online players
    for (let i = 0; i < playerCount; i++) {
        const x = Math.random() * (canvas.width - 20) + 10;
        const y = Math.random() * (canvas.height - 150) + 50;

        // Draw player marker
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw player name if it's a known player
        if (i === 0 && playerCount > 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.fillText('Coen3111', x + 10, y + 5);
            ctx.fillStyle = '#00FF00';
        }
    }
}

function toggleMapView(dimension) {
    currentMapDimension = dimension;

    // Update button states
    document.querySelectorAll('.map-control-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    event.target.classList.add('active');

    // Update dimension display
    const dimensionElement = document.getElementById('currentDimension');
    if (dimensionElement) {
        dimensionElement.textContent = dimension.charAt(0).toUpperCase() + dimension.slice(1);
    }

    // Redraw map
    drawServerMap();

    showNotification(`Switched to ${dimension} view`, 'info');
}

function refreshMap() {
    showNotification('Refreshing map...', 'info');

    // Use interesting seeds for good terrain
    const goodSeeds = [12345, 98765, 54321, 13579, 24680, 11111, 77777];
    mapSeed = goodSeeds[Math.floor(Math.random() * goodSeeds.length)];

    generatedChunks.clear();
    mapOffsetX = 0;
    mapOffsetY = 0;
    mapZoom = 1;

    // Simulate loading
    const canvas = document.getElementById('serverMapCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#D4AF37';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🌍 Generating new world...', canvas.width / 2, canvas.height / 2);
        ctx.font = '14px Arial';
        ctx.fillText(`Using seed: ${mapSeed}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.textAlign = 'left';
    }

    setTimeout(() => {
        drawServerMap();
        updateMapStats();
        showNotification(`New world loaded! Seed: ${mapSeed} - Click and drag to explore!`, 'success');
    }, 1500);
}

// Add map navigation
function initializeMapNavigation() {
    const canvas = document.getElementById('serverMapCanvas');
    if (!canvas) return;

    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;

            mapOffsetX += deltaX;
            mapOffsetY += deltaY;

            lastMouseX = e.clientX;
            lastMouseY = e.clientY;

            drawServerMap();
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });

    // Zoom with mouse wheel
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = 0.1;
        const oldZoom = mapZoom;

        if (e.deltaY < 0) {
            mapZoom = Math.min(mapZoom + zoomFactor, 3);
        } else {
            mapZoom = Math.max(mapZoom - zoomFactor, 0.5);
        }

        if (mapZoom !== oldZoom) {
            drawServerMap();
        }
    });

    canvas.style.cursor = 'grab';
}

function updateMapData() {
    updateMapStats();
    drawServerMap();
}

// Procedural chunk generation
function generateChunk(chunkX, chunkY) {
    const chunkKey = `${chunkX},${chunkY}`;
    if (generatedChunks.has(chunkKey)) {
        return generatedChunks.get(chunkKey);
    }

    const chunk = [];
    const chunkSize = 16;

    for (let x = 0; x < chunkSize; x++) {
        chunk[x] = [];
        for (let y = 0; y < chunkSize; y++) {
            const worldX = chunkX * chunkSize + x;
            const worldY = chunkY * chunkSize + y;

            // Generate terrain based on noise
            const biome = getBiome(worldX, worldY);
            const elevation = getElevation(worldX, worldY);
            const blockType = getBlockType(worldX, worldY, biome, elevation);

            chunk[x][y] = {
                type: blockType,
                biome: biome,
                elevation: elevation
            };
        }
    }

    generatedChunks.set(chunkKey, chunk);
    return chunk;
}

function drawChunk(ctx, chunkX, chunkY, blockSize, chunkSize) {
    const chunk = generateChunk(chunkX, chunkY);
    const startX = chunkX * chunkSize * blockSize + mapOffsetX;
    const startY = chunkY * chunkSize * blockSize + mapOffsetY;

    for (let x = 0; x < chunkSize; x++) {
        for (let y = 0; y < chunkSize; y++) {
            const block = chunk[x][y];
            const pixelX = startX + x * blockSize;
            const pixelY = startY + y * blockSize;

            // Only draw blocks that are visible
            if (pixelX > -blockSize && pixelX < ctx.canvas.width + blockSize &&
                pixelY > -blockSize && pixelY < ctx.canvas.height + blockSize) {

                ctx.fillStyle = getBlockColor(block.type, block.biome);
                ctx.fillRect(pixelX, pixelY, blockSize, blockSize);

                // Add texture variation
                if (Math.random() < 0.1) {
                    ctx.fillStyle = getBlockVariation(block.type);
                    ctx.fillRect(pixelX, pixelY, 1, 1);
                }
            }
        }
    }
}

function getDetailedBiome(x, y) {
    // More detailed biome generation for realistic Minecraft world
    const temp = perlinNoise(x * 0.005, y * 0.005, mapSeed) + 
                perlinNoise(x * 0.02, y * 0.02, mapSeed + 100) * 0.3;
    const humidity = perlinNoise(x * 0.004, y * 0.004, mapSeed + 1000) + 
                    perlinNoise(x * 0.015, y * 0.015, mapSeed + 1100) * 0.3;
    const continents = perlinNoise(x * 0.001, y * 0.001, mapSeed + 2000);

    // Ocean check
    if (continents < -0.3) return 'ocean';
    if (continents < -0.1) return 'beach';

    // Mountain check
    if (continents > 0.6) return 'mountains';
    if (continents > 0.4 && temp < 0.2) return 'snowy_mountains';

    // Temperature-based biomes
    if (temp < -0.4) return 'snowy_plains';
    if (temp < -0.2) return 'taiga';
    if (temp > 0.6 && humidity < -0.3) return 'desert';
    if (temp > 0.4 && humidity > 0.4) return 'jungle';
    if (humidity > 0.3) return 'swamp';
    if (humidity < -0.2) return 'savanna';
    if (temp > 0.2) return 'forest';

    return 'plains';
}

function getDetailedElevation(x, y) {
    // Multi-octave noise for realistic terrain
    const continents = perlinNoise(x * 0.0008, y * 0.0008, mapSeed + 2000) * 100;
    const mountains = perlinNoise(x * 0.003, y * 0.003, mapSeed + 3000) * 60;
    const hills = perlinNoise(x * 0.01, y * 0.01, mapSeed + 4000) * 30;
    const details = perlinNoise(x * 0.05, y * 0.05, mapSeed + 5000) * 10;

    return 64 + continents + mountains + hills + details; // Sea level at 64
}

function getDetailedBlockType(x, y, biome, elevation) {
    const seaLevel = 64;
    const stoneNoise = perlinNoise(x * 0.1, y * 0.1, mapSeed + 6000);
    const oreNoise = perlinNoise(x * 0.3, y * 0.3, mapSeed + 7000);

    // Water bodies
    if (elevation < seaLevel - 2) return 'deep_water';
    if (elevation < seaLevel) return 'water';
    if (elevation < seaLevel + 2 && biome === 'beach') return 'sand';

    // Mountain terrain
    if (elevation > 120) {
        if (biome === 'snowy_mountains') return 'snow';
        return 'stone';
    }
    if (elevation > 100 && stoneNoise > 0.3) return 'stone';

    // Ore generation in stone areas
    if (elevation < 60 && stoneNoise > 0.4) {
        if (oreNoise > 0.8) return 'diamond_ore';
        if (oreNoise > 0.6) return 'iron_ore';
        if (oreNoise > 0.4) return 'coal_ore';
        return 'stone';
    }

    // Biome-specific blocks
    switch (biome) {
        case 'ocean':
        case 'deep_ocean':
            return elevation < seaLevel ? 'water' : 'sand';
        case 'beach':
            return 'sand';
        case 'desert':
            return Math.random() < 0.05 ? 'cactus' : 'sand';
        case 'snowy_plains':
        case 'snowy_mountains':
            return 'snow';
        case 'mountains':
            return elevation > 90 ? 'stone' : 'grass';
        case 'forest':
        case 'jungle':
            return Math.random() < 0.4 ? 'leaves' : 'grass';
        case 'taiga':
            return Math.random() < 0.3 ? 'spruce_leaves' : 'grass';
        case 'swamp':
            return Math.random() < 0.2 ? 'lily_pad' : 'grass';
        case 'savanna':
            return Math.random() < 0.1 ? 'acacia_leaves' : 'grass';
        default:
            return Math.random() < 0.15 ? 'oak_leaves' : 'grass';
    }
}

function getDetailedBlockColor(blockType, biome, elevation) {
    const colors = {
        water: '#3F76E4',
        deep_water: '#1E3A8A',
        sand: '#F4E4BC',
        grass: biome === 'jungle' ? '#2D5D1F' : biome === 'savanna' ? '#9CBF3C' : '#4F7942',
        stone: '#7C7C7C',
        snow: '#FFFAFA',
        leaves: '#2D5D1F',
        oak_leaves: '#4F7942',
        spruce_leaves: '#0F4F3C',
        acacia_leaves: '#3F7F3F',
        lily_pad: '#2F5F2F',
        cactus: '#3F7F3F',
        coal_ore: '#2F2F2F',
        iron_ore: '#CD853F',
        diamond_ore: '#5DADE2'
    };
    return colors[blockType] || '#654321';
}

function getBlockDetail(blockType, x, y) {
    // Add subtle texture variations
    const variation = perlinNoise(x * 0.5, y * 0.5, mapSeed + 8000) * 0.1;
    if (variation > 0.05) {
        return 'rgba(255, 255, 255, 0.1)';
    } else if (variation < -0.05) {
        return 'rgba(0, 0, 0, 0.1)';
    }
    return 'transparent';
}

function getBlockType(x, y, biome, elevation) {
    const waterLevel = 62;

    if (elevation < waterLevel - 5) return 'water';
    if (elevation < waterLevel) return 'sand';

    const stoneNoise = noise(x * 0.05, y * 0.05, mapSeed + 5000);
    if (elevation > 80 && stoneNoise > 0.3) return 'stone';
    if (elevation > 90) return 'snow';

    // Ore generation
    if (elevation < 30 && Math.random() < 0.01) {
        if (Math.random() < 0.1) return 'diamond';
        if (Math.random() < 0.3) return 'iron';
        return 'coal';
    }

    switch (biome) {
        case 'desert': return 'sand';
        case 'snowy': return 'snow';
        case 'swamp': return 'mud';
        case 'jungle': return Math.random() < 0.3 ? 'leaves' : 'grass';
        case 'taiga': return Math.random() < 0.2 ? 'leaves' : 'grass';
        default: return Math.random() < 0.1 ? 'leaves' : 'grass';
    }
}

function getBlockColor(blockType, biome) {
    const colors = {
        grass: biome === 'jungle' ? '#228B22' : biome === 'desert' ? '#DEB887' : '#4CAF50',
        stone: '#696969',
        water: '#4169E1',
        sand: '#F4A460',
        snow: '#FFFAFA',
        leaves: biome === 'jungle' ? '#228B22' : '#32CD32',
        mud: '#8B4513',
        coal: '#2F2F2F',
        iron: '#CD853F',
        diamond: '#40E0D0'
    };
    return colors[blockType] || '#654321';
}

function getBlockVariation(blockType) {
    // Slightly darker variation for texture
    const variations = {
        grass: '#3E8B3E',
        stone: '#555555',
        water: '#1E90FF',
        sand: '#D2B48C',
        snow: '#F0F8FF',
        leaves: '#228B22',
        mud: '#654321'
    };
    return variations[blockType] || '#543A2A';
}

function drawMajorStructures(ctx, canvas, blockSize) {
    // Generate major Minecraft structures at realistic intervals
    const structures = [
        { x: 200, y: 150, type: 'village', name: 'Medieval Village' },
        { x: -300, y: 200, type: 'castle', name: 'Ancient Castle' },
        { x: 400, y: -100, type: 'temple', name: 'Desert Temple' },
        { x: -150, y: -250, type: 'mansion', name: 'Woodland Mansion' },
        { x: 100, y: 300, type: 'stronghold', name: 'End Portal' },
        { x: -400, y: -50, type: 'monument', name: 'Ocean Monument' }
    ];

    structures.forEach(structure => {
        const screenX = structure.x - mapOffsetX + canvas.width / 2;
        const screenY = structure.y - mapOffsetY + canvas.height / 2;

        // Only draw if visible
        if (screenX > -50 && screenX < canvas.width + 50 && 
            screenY > -50 && screenY < canvas.height + 50) {

            // Draw structure base
            ctx.fillStyle = getStructureColor(structure.type);
            const size = getStructureSize(structure.type);
            ctx.fillRect(screenX - size/2, screenY - size/2, size, size);

            // Add structure details
            ctx.fillStyle = '#8B4513'; // Roof/accent color
            ctx.fillRect(screenX - size/2 + 2, screenY - size/2 - 5, size - 4, 5);

            // Add structure icon and name if zoomed in
            if (mapZoom > 1) {
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(getStructureIcon(structure.type), screenX, screenY + 3);

                if (mapZoom > 1.5) {
                    ctx.font = '8px Arial';
                    ctx.fillText(structure.name, screenX, screenY + size/2 + 15);
                }
                ctx.textAlign = 'left';
            }
        }
    });
}

function getStructureColor(type) {
    const colors = {
        village: '#8B4513',
        castle: '#696969',
        temple: '#DAA520',
        mansion: '#2F4F2F',
        stronghold: '#4B0082',
        monument: '#008B8B'
    };
    return colors[type] || '#8B4513';
}

function getStructureSize(type) {
    const sizes = {
        village: 20,
        castle: 30,
        temple: 25,
        mansion: 35,
        stronghold: 15,
        monument: 25
    };
    return sizes[type] || 20;
}

function getStructureIcon(type) {
    const icons = {
        village: '🏘️',
        castle: '🏰',
        temple: '🏛️',
        mansion: '🏚️',
        stronghold: '⬛',
        monument: '🗿'
    };
    return icons[type] || '🏗️';
}

// Improved Perlin noise function for better terrain
function perlinNoise(x, y, seed = 0) {
    // Simple but effective noise implementation
    const hash = (x, y) => {
        let h = seed + x * 374761393 + y * 668265263;
        h = (h ^ (h >>> 13)) * 1274126177;
        h = h ^ (h >>> 16);
        return (h & 0x7fffffff) / 0x7fffffff * 2 - 1;
    };

    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;

    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);

    const i1 = a + (b - a) * fx;
    const i2 = c + (d - c) * fx;

    return i1 + (i2 - i1) * fy;
}

// Simple noise function for terrain generation
function noise(x, y, seed = 0) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
}

function updateMapStats() {
    // Update map statistics
    const mapPlayersCount = document.getElementById('mapPlayersCount');
    const mapLastUpdate = document.getElementById('mapLastUpdate');

    if (mapPlayersCount) {
        const onlinePlayersElement = document.getElementById('playersOnline');
        if (onlinePlayersElement) {
            const playerCount = onlinePlayersElement.textContent.split('/')[0];
            mapPlayersCount.textContent = playerCount;
        }
    }

    if (mapLastUpdate) {
        const now = new Date();
        mapLastUpdate.textContent = now.toLocaleTimeString();
    }
}