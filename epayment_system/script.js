/**
 * SecurePayment Frontend JavaScript
 * Handles authentication, UI, and client-side cryptographic operations
 */

const API_BASE = 'http://localhost:5000/api';
let currentUser = null;
let sessionToken = null;

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

function switchPanel(panel) {
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(panel + '-panel').classList.add('active');
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            sessionToken = data.session_token;
            currentUser = data.user;
            localStorage.setItem('sessionToken', sessionToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showDashboard();
            loadProfile();
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
    
    // Clear form
    document.getElementById('login-form').reset();
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const nid = document.getElementById('register-nid').value.trim();
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const macAddress = document.getElementById('register-mac').value.trim();
    
    // Validation
    if (password !== passwordConfirm) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                nid,
                password,
                mac_address: macAddress
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Registration successful!\n\nActivation Code: ${data.activation_code}\n\nSave this code safely! You'll need it if you lose your device.`);
            switchPanel('login');
        } else {
            alert('Registration failed: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
    
    // Clear form
    document.getElementById('register-form').reset();
});

document.getElementById('login-btn').addEventListener('click', () => {
    // Clear form and status when returning to login
    document.getElementById('send-money-form').reset();
    document.getElementById('transaction-status').className = 'status-message';
    document.getElementById('transaction-status').textContent = '';
    
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('dashboard-section').style.display = 'none';
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionToken}` }
    });
    
    sessionToken = null;
    currentUser = null;
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('currentUser');
    
    // Clear all forms and messages
    document.getElementById('send-money-form').reset();
    document.getElementById('transaction-status').className = 'status-message';
    document.getElementById('transaction-status').textContent = '';
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('dashboard-section').style.display = 'none';
    switchPanel('login');
});

// ============================================================================
// DASHBOARD FUNCTIONS
// ============================================================================

function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'flex';
    
    // Update navbar
    document.getElementById('nav-user').textContent = `Hello, ${currentUser.username}!`;
    document.getElementById('nav-user').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('login-btn').style.display = 'none';
}

function showPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    // Show selected panel
    document.getElementById(panelName + '-panel').classList.add('active');
    event.target.classList.add('active');
    
    // Load panel-specific data
    if (panelName === 'history') {
        loadTransactionHistory();
    } else if (panelName === 'overview') {
        loadProfile();
    }
}

async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE}/user/profile`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const user = data;
            document.getElementById('profile-username').textContent = user.username;
            document.getElementById('profile-balance').textContent = user.balance.toFixed(2);
            document.getElementById('profile-daily-limit').textContent = user.daily_limit.toFixed(2);
            document.getElementById('profile-status').textContent = user.is_active ? 'Active' : 'Suspended';
            document.getElementById('profile-created').textContent = new Date(user.created_at).toLocaleDateString();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadTransactionHistory() {
    try {
        const response = await fetch(`${API_BASE}/transactions/history?limit=50`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const transactionList = document.getElementById('transaction-list');
            transactionList.innerHTML = '';
            
            if (data.transactions.length === 0) {
                transactionList.innerHTML = '<p>No transactions yet</p>';
                return;
            }
            
            data.transactions.forEach(txn => {
                const isSent = txn.sender_id === currentUser.user_id;
                const otherParty = isSent ? txn.receiver_username : txn.sender_username;
                const actionText = isSent ? 'Sent to' : 'Received from';
                
                const item = document.createElement('div');
                item.className = `transaction-item ${isSent ? 'sent' : 'received'}`;
                item.innerHTML = `
                    <div class="transaction-header">
                        <span class="transaction-type">${actionText} <strong>${otherParty}</strong></span>
                        <span class="transaction-amount ${isSent ? 'sent' : 'received'}">
                            ${isSent ? '-' : '+'}$${txn.amount.toFixed(2)}
                        </span>
                    </div>
                    <div class="transaction-details">
                        ${new Date(txn.created_at).toLocaleString()}
                    </div>
                `;
                transactionList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// ============================================================================
// CRYPTOGRAPHIC FUNCTIONS
// ============================================================================

// Helper: Create canonical JSON with sorted keys (matches Python backend)
function canonicalJSON(obj) {
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
        sorted[key] = obj[key];
    });
    return JSON.stringify(sorted, null, 0).replace(/\s/g, '');
}

// Simple HMAC-SHA256 implementation (for client-side)
async function generateHmacSHA256(key, message) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    // Use canonical JSON matching Python's: json.dumps(message, sort_keys=True, separators=(',', ':'))
    const messageJson = canonicalJSON(message);
    const messageData = encoder.encode(messageJson);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

// Simple AES-CBC encryption (for client-side)
// Uses password + timestamp per paper specification
async function encryptAES(plaintext, password, timestamp) {
    // Derive key from password + timestamp (K2 + T)
    const keyMaterial = `${password}${timestamp}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyMaterial);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-CBC' },
        false,
        ['encrypt']
    );
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    // Encrypt
    const plaintextData = encoder.encode(plaintext);
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv },
        cryptoKey,
        plaintextData
    );
    
    // Combine IV + encrypted data and encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    const base64 = btoa(String.fromCharCode(...combined));
    return base64;
}

// ============================================================================
// TRANSACTION FUNCTIONS
// ============================================================================

document.getElementById('send-money-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const statusDiv = document.getElementById('transaction-status');
    statusDiv.className = 'status-message';
    statusDiv.textContent = 'Processing...';
    
    const recipientUsername = document.getElementById('recipient-username').value.trim();
    const amount = parseFloat(document.getElementById('send-amount').value);
    const password = document.getElementById('send-password').value;
    
    try {
        // Step 1: Prepare transaction
        const prepareResponse = await fetch(`${API_BASE}/transaction/prepare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                receiver_username: recipientUsername,
                amount: amount
            })
        });
        
        if (!prepareResponse.ok) {
            const error = await prepareResponse.json();
            throw new Error(error.error);
        }
        
        const prepareData = await prepareResponse.json();
        const message = prepareData.message;
        const k1 = prepareData.k1;
        const timestamp = prepareData.timestamp;
        
        // Step 2: Generate HMAC (F1)
        statusDiv.textContent = 'Generating HMAC...';
        const hmac = await generateHmacSHA256(k1, message);
        
        // Step 3: Create payload (Message || HMAC)
        const payload = {
            message: message,
            hmac: hmac
        };
        
        // Step 4: Encrypt payload
        statusDiv.textContent = 'Encrypting transaction...';
        const payloadJson = JSON.stringify(payload);
        const encryptedPayload = await encryptAES(payloadJson, password, timestamp);
        
        // Step 5: Send transaction to server
        statusDiv.textContent = 'Sending to server...';
        const sendResponse = await fetch(`${API_BASE}/transaction/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                receiver_username: recipientUsername,
                amount: amount,
                password: password,
                timestamp: timestamp,
                encrypted_payload: encryptedPayload,
                hmac_value: hmac
            })
        });
        
        const sendData = await sendResponse.json();
        
        if (sendResponse.ok) {
            statusDiv.className = 'status-message success';
            statusDiv.innerHTML = `
                <strong>Success!</strong><br>
                Transaction ID: ${sendData.transaction_id}<br>
                Sent $${amount.toFixed(2)} to ${sendData.receiver}<br>
                New Balance: $${sendData.sender_new_balance.toFixed(2)}
            `;
            
            // Update profile
            setTimeout(() => {
                loadProfile();
            }, 1000);
            
            // Clear form
            document.getElementById('send-money-form').reset();
            
            // Clear success message after 5 seconds
            setTimeout(() => {
                statusDiv.className = 'status-message';
                statusDiv.textContent = '';
            }, 5000);
        } else {
            statusDiv.className = 'status-message error';
            statusDiv.textContent = 'Error: ' + sendData.error;
            
            // Clear error message after 5 seconds
            setTimeout(() => {
                statusDiv.className = 'status-message';
                statusDiv.textContent = '';
            }, 5000);
        }
    } catch (error) {
        statusDiv.className = 'status-message error';
        statusDiv.textContent = 'Error: ' + error.message;
        
        // Clear error message after 5 seconds
        setTimeout(() => {
            statusDiv.className = 'status-message';
            statusDiv.textContent = '';
        }, 5000);
    }
});

// ============================================================================
// USER SEARCH
// ============================================================================

document.getElementById('search-query').addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    const resultsDiv = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            resultsDiv.innerHTML = '';
            
            if (data.users.length === 0) {
                resultsDiv.innerHTML = '<p>No users found</p>';
                return;
            }
            
            data.users.forEach(user => {
                if (user.user_id !== currentUser.user_id) {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `
                        <span class="search-result-username">${user.username}</span>
                        <button class="btn btn-primary btn-select" onclick="selectRecipient('${user.username}')">Select</button>
                    `;
                    resultsDiv.appendChild(item);
                }
            });
        }
    } catch (error) {
        console.error('Error searching users:', error);
    }
});

function selectRecipient(username) {
    document.getElementById('recipient-username').value = username;
    showPanel('send-money');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('load', () => {
    // ALWAYS start from login (clear any saved session)
    // This ensures users must log in each time they load the page
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('currentUser');
    sessionToken = null;
    currentUser = null;
    
    // Show login page
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('dashboard-section').style.display = 'none';
    switchPanel('login');
});
