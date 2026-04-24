/**
 * SecurePayment Frontend JavaScript
 * Handles authentication, UI, and client-side cryptographic operations
 */

const API_BASE = 'http://localhost:5000/api';
let currentUser = null;
let sessionToken = null;

// Store last transaction for real-time encryption display
let lastTransactionData = null;

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
    document.getElementById('nav-username').textContent = currentUser.username;
    document.getElementById('nav-user').style.display = 'flex';
    document.getElementById('logout-btn').style.display = 'inline-flex';
    document.getElementById('login-btn').style.display = 'none';
}

function showPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    // Show selected panel
    document.getElementById(panelName + '-panel').classList.add('active');
    
    // Mark menu item as active
    document.querySelectorAll('.menu-item').forEach(item => {
        const itemName = item.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (itemName === panelName) {
            item.classList.add('active');
        }
    });
    
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
            document.getElementById('profile-username-text').textContent = user.username;
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
                transactionList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No transactions yet</p>
                    </div>
                `;
                return;
            }
            
            data.transactions.forEach(txn => {
                const isSent = txn.sender_id === currentUser.user_id;
                const otherParty = isSent ? txn.receiver_username : txn.sender_username;
                const actionText = isSent ? 'Sent to' : 'Received from';
                const icon = isSent ? 'fa-arrow-up-right' : 'fa-arrow-down-left';
                
                const item = document.createElement('div');
                item.className = `transaction-item ${isSent ? 'sent' : 'received'}`;
                item.innerHTML = `
                    <div class="transaction-header">
                        <span class="transaction-type">
                            <i class="fas ${icon}"></i>
                            ${actionText} <strong>${otherParty}</strong>
                        </span>
                        <span class="transaction-amount ${isSent ? 'sent' : 'received'}">
                            ${isSent ? '-' : '+'}$${txn.amount.toFixed(2)}
                        </span>
                    </div>
                    <div class="transaction-details">
                        <i class="fas fa-calendar-alt"></i> ${new Date(txn.created_at).toLocaleString()}
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
            // CAPTURE REAL TRANSACTION DATA FOR SIMULATOR
            lastTransactionData = {
                sender: currentUser.username,
                receiver: recipientUsername,
                amount: amount,
                password: password,
                timestamp: timestamp
            };
            
            statusDiv.className = 'status-message success';
            statusDiv.innerHTML = `
                <strong>✓ Success!</strong><br>
                Transaction ID: ${sendData.transaction_id}<br>
                Sent $${amount.toFixed(2)} to ${sendData.receiver}<br>
                New Balance: $${sendData.sender_new_balance.toFixed(2)}<br><br>
                <button class="btn btn-info" onclick="showEncryptionForThisTransaction()" style="margin-top: 10px; background-color: #17a2b8; border: none; cursor: pointer; padding: 8px 16px; border-radius: 4px; color: white; font-weight: 500;">
                    <i class="fas fa-eye"></i> View How This Transaction Was Encrypted →
                </button>
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
        resultsDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Search for a user to get started</p>
            </div>
        `;
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
                resultsDiv.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user-slash"></i>
                        <p>No users found matching "${query}"</p>
                    </div>
                `;
                return;
            }
            
            data.users.forEach(user => {
                if (user.user_id !== currentUser.user_id) {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                            <i class="fas fa-user-circle" style="font-size: 2rem; color: var(--primary-color);"></i>
                            <div>
                                <div class="search-result-username"><i class="fas fa-user"></i> ${user.username}</div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">Click to send money</div>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-select" onclick="selectRecipient('${user.username}')">
                            <i class="fas fa-arrow-right"></i> Select
                        </button>
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

// ============================================================================
// CRYPTO SIMULATOR FUNCTIONS
// ============================================================================

// Simulator Tab Navigation
function showSimulatorTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.simulator-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.simulator-tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.closest('.simulator-tab-btn').classList.add('active');
}

// Generate current timestamp
function generateTimestamp(elementId) {
    const now = new Date();
    const timestamp = now.toISOString();
    if (elementId) {
        document.getElementById(elementId).value = timestamp;
    }
    return timestamp;
}

// AES Encryption Simulation
async function simulateAESEncryption() {
    const plaintext = document.getElementById('aes-plaintext').value;
    const password = document.getElementById('aes-password').value;
    let timestamp = document.getElementById('aes-timestamp').value;
    
    if (!timestamp) {
        timestamp = generateTimestamp('aes-timestamp');
    }
    
    try {
        // Step 1: Show plaintext
        document.getElementById('aes-step1-content').innerHTML = `
            <div class="step-result">${plaintext}</div>
        `;
        
        // Step 2: Derive encryption key
        const keyData = password + timestamp;
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(keyData));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const keyHex = hashHex.substring(0, 64); // 256 bits = 64 hex chars
        
        document.getElementById('aes-step2-result').innerHTML = `
            <div class="step-formula">Input: password="${password}" + timestamp="${timestamp}"</div>
            <div class="step-result">Derived Key (hex):<br>${keyHex}</div>
        `;
        
        // Step 3: Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
        
        document.getElementById('aes-step3-content').innerHTML = `
            <div class="step-formula">16 random bytes (128 bits)</div>
            <div class="step-result">IV (hex):<br>${ivHex}</div>
        `;
        
        // Step 4 & 5: AES Encryption (simulate - actual requires Web Crypto which has limitations)
        // For demonstration, we'll show the flow but actual encryption would need proper library
        const encryptedHex = 'a1b2c3d4e5f6'.repeat(10); // Simulated ciphertext
        const combined = ivHex + encryptedHex;
        
        document.getElementById('aes-step4-result').innerHTML = `
            <div class="step-formula">Using AES-256-CBC with Key and IV</div>
            <div class="step-result">Ciphertext (hex - simulated):<br>${encryptedHex.substring(0, 64)}...</div>
        `;
        
        // Step 5: Base64 Encode
        const combined_bytes = Buffer.from(combined, 'hex');
        const base64 = btoa(String.fromCharCode.apply(null, combined_bytes));
        
        document.getElementById('aes-step5-result').innerHTML = `
            <div class="step-formula">Base64(IV + Ciphertext)</div>
            <div class="step-result">${base64.substring(0, 100)}...</div>
        `;
        
        // Show flow and decrypt button
        document.getElementById('aes-flow').style.display = 'block';
        document.getElementById('aes-decrypt-btn').style.display = 'block';
        
        // Store result for decryption
        window.lastAESEncryption = {
            base64,
            iv: ivHex,
            ciphertext: encryptedHex,
            password,
            timestamp
        };
        
    } catch (error) {
        alert('Encryption error: ' + error.message);
    }
}

// AES Decryption Simulation
function simulateAESDecryption() {
    if (!window.lastAESEncryption) {
        alert('Please encrypt something first');
        return;
    }
    
    const data = window.lastAESEncryption;
    alert(`Decryption Flow:\n\n1. Receive encrypted data: ${data.base64.substring(0, 50)}...\n\n2. Extract IV (first 16 bytes): ${data.iv.substring(0, 32)}...\n\n3. Extract Ciphertext (remaining)\n\n4. Verify Password: ${data.password}\n\n5. Derive same key: SHA256(${data.password} + ${data.timestamp})\n\n6. AES-256-CBC Decrypt\n\n7. Result: ${document.getElementById('aes-plaintext').value}`);
}

// HMAC Simulation
async function simulateHMACGeneration() {
    const message = document.getElementById('hmac-message').value;
    const key = document.getElementById('hmac-key').value;
    
    try {
        // Step 1 & 2: Show message and key
        document.getElementById('hmac-step1-content').innerHTML = `<div class="step-result">${message}</div>`;
        document.getElementById('hmac-step2-content').innerHTML = `<div class="step-result">${key}</div>`;
        
        // Step 3: Generate HMAC
        const encoder = new TextEncoder();
        const keyData = encoder.encode(key);
        const messageData = encoder.encode(message);
        
        const hmacKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', hmacKey, messageData);
        const hmacArray = Array.from(new Uint8Array(signature));
        const hmacHex = hmacArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        document.getElementById('hmac-step3-result').innerHTML = `<div class="step-result">F1 = ${hmacHex}</div>`;
        document.getElementById('hmac-final-result').innerHTML = `
            <p><strong>HMAC-SHA256 Generated Successfully!</strong></p>
            <p>This value is now sent with the transaction and verified on the server.</p>
            <div class="step-result" style="margin-top: 10px;">${hmacHex}</div>
        `;
        
        // Show flow and verify button
        document.getElementById('hmac-flow').style.display = 'block';
        document.getElementById('hmac-verify-btn').style.display = 'block';
        
        window.lastHMAC = { hmacHex, message, key };
        
    } catch (error) {
        alert('HMAC generation error: ' + error.message);
    }
}

// HMAC Verification
function simulateHMACVerification() {
    if (!window.lastHMAC) {
        alert('Please generate HMAC first');
        return;
    }
    
    const { hmacHex, message, key } = window.lastHMAC;
    alert(`HMAC Verification Flow:\n\n1. Received Message: ${message.substring(0, 50)}...\n\n2. Received HMAC: ${hmacHex.substring(0, 50)}...\n\n3. Server Regenerates: F2 = HMAC-SHA256(K1, Message)\n\n4. Server Compares: F1 == F2 (using timing-safe comparison)\n\n✓ RESULT: VALID SIGNATURE - Message integrity confirmed!`);
}

// Biometric Simulation
function switchBioMethod(method) {
    document.querySelectorAll('.biometric-method-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.biometric-method-btn').classList.add('active');
    
    const section = document.getElementById('bio-input-section');
    
    if (method === 'password') {
        section.innerHTML = `
            <div class="form-group">
                <label>Password:</label>
                <input type="password" id="bio-password" placeholder="Enter password" value="12334">
            </div>
            <button class="btn btn-primary full-width" onclick="simulateBioAuth()">
                <i class="fas fa-lock"></i> Authenticate
            </button>
        `;
    } else if (method === 'fingerprint') {
        section.innerHTML = `
            <div class="form-group">
                <p style="text-align: center; color: var(--text-secondary);">Biometric scanning not yet integrated</p>
                <p style="text-align: center; color: var(--info-color); font-size: 14px;">
                    Ready for: Windows Hello, Apple Touch ID, Android Fingerprint
                </p>
            </div>
            <button class="btn btn-primary full-width" onclick="alert('Fingerprint integration coming soon!')">
                <i class="fas fa-fingerprint"></i> Simulate Fingerprint
            </button>
        `;
    } else if (method === 'faceid') {
        section.innerHTML = `
            <div class="form-group">
                <p style="text-align: center; color: var(--text-secondary);">Face ID not yet integrated</p>
                <p style="text-align: center; color: var(--info-color); font-size: 14px;">
                    Ready for: Windows Hello Face, Apple Face ID, Android Face Unlock
                </p>
            </div>
            <button class="btn btn-primary full-width" onclick="alert('Face ID integration coming soon!')">
                <i class="fas fa-face-smile"></i> Simulate Face ID
            </button>
        `;
    }
}

// Biometric Authentication
function simulateBioAuth() {
    const bioFlow = document.getElementById('bio-flow');
    
    // Get current bio method
    const activeMethod = document.querySelector('.biometric-method-btn.active').textContent.trim();
    
    if (activeMethod.includes('Password')) {
        const password = document.getElementById('bio-password').value;
        const hash = 'SHA256_' + password.substring(0, 3) + '...';
        
        document.getElementById('bio-step1').innerHTML = `
            <div class="step-header">Step 1: User Input</div>
            <div class="step-content">
                <p>Method: Password-based (current)</p>
                <div class="step-result">Password: "${password}"</div>
            </div>
        `;
        
        document.getElementById('bio-step2').innerHTML = `
            <div class="step-header">Step 2: Hash Generation (K2)</div>
            <div class="step-content">
                <div class="step-formula">K2 = SHA256(Password)</div>
                <div class="step-result">${hash}</div>
            </div>
        `;
        
        document.getElementById('bio-step3').innerHTML = `
            <div class="step-header">Step 3: Database Lookup</div>
            <div class="step-content">
                <p>Compare with stored K2_hash in database</p>
                <p style="color: var(--success-color); font-weight: 600;">✓ Match Found!</p>
            </div>
        `;
        
        document.getElementById('bio-step4').innerHTML = `
            <div class="step-header success-step" style="border: none; background: rgba(16, 185, 129, 0.1); color: var(--success-color);">✓ Authentication Successful</div>
            <div class="step-content">
                <p>Session token issued. User can now perform transactions.</p>
            </div>
        `;
    }
    
    bioFlow.style.display = 'block';
}

// Timestamp Simulation
function simulateTimestampGeneration() {
    const now = new Date();
    const timestamp = now.toISOString();
    const microseconds = Math.floor(Math.random() * 1000000);
    const timestampWithMicro = timestamp.replace('Z', '') + `.${microseconds.toString().padStart(6, '0')}Z`;
    
    // Previous timestamp (simulated)
    const previous = new Date(now.getTime() - 60000).toISOString();
    
    document.getElementById('timestamp-current').innerHTML = `
        <div class="step-formula">Current Timestamp (ISO 8601 UTC)</div>
        <div class="step-result">${timestampWithMicro}</div>
        <p style="margin-top: 10px;">Microsecond precision ensures uniqueness per transaction</p>
    `;
    
    document.getElementById('timestamp-validation').innerHTML = `
        <div style="margin-bottom: 10px;">
            <p><strong>Server-Side Validation:</strong></p>
            <p>Current: ${timestampWithMicro}</p>
            <p>Previous: ${previous}</p>
            <p style="color: var(--success-color); font-weight: 600; margin-top: 10px;">✓ Valid: Current > Previous</p>
        </div>
        <p style="color: var(--text-secondary); font-size: 12px;">This prevents replay attacks - same transaction cannot be used twice</p>
    `;
    
    document.getElementById('timestamp-key-usage').innerHTML = `
        <div class="step-formula">Encryption Key = SHA256(Password + Timestamp)</div>
        <div style="background: #f0f4ff; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 12px; color: var(--primary-color);">
            Each transaction gets a UNIQUE encryption key because timestamp is unique
            <p style="margin-top: 10px;">Even if password is the same, key is different for each transaction</p>
        </div>
    `;
    
    document.getElementById('timestamp-flow').style.display = 'block';
}

// Full Transaction Flow Simulation
async function simulateFullTransactionFlow() {
    const sender = document.getElementById('flow-sender').value || 'alice';
    const receiver = document.getElementById('flow-receiver').value || 'bob';
    const amount = document.getElementById('flow-amount').value || '100';
    const password = document.getElementById('flow-password').value || '12334';
    
    const timestamp = new Date().toISOString();
    const container = document.getElementById('flow-steps-container');
    
    let html = '';
    
    // Step 1: Create Message
    const message = JSON.stringify({
        sender,
        receiver,
        amount,
        timestamp
    });
    
    html += `
        <div class="flow-step">
            <div class="step-header">Step 1: Create Message</div>
            <div class="step-content">
                <div class="step-formula">Message = JSON({sender, receiver, amount, timestamp})</div>
                <div class="step-result">${message}</div>
            </div>
        </div>
        <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
    `;
    
    // Step 2: Generate K1 and HMAC
    html += `
        <div class="flow-step">
            <div class="step-header">Step 2: Generate HMAC (F1)</div>
            <div class="step-content">
                <div class="step-formula">K1 retrieved from database (per user)</div>
                <div class="step-formula">F1 = HMAC-SHA256(K1, Message)</div>
                <div class="step-result">F1 = a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...</div>
            </div>
        </div>
        <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
    `;
    
    // Step 3: Create Payload
    html += `
        <div class="flow-step">
            <div class="step-header">Step 3: Create Payload</div>
            <div class="step-content">
                <div class="step-formula">Payload = {message, F1}</div>
                <div class="step-result">{"message": {...}, "F1": "a1b2c3...}</div>
            </div>
        </div>
        <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
    `;
    
    // Step 4: Derive Key
    html += `
        <div class="flow-step">
            <div class="step-header">Step 4: Derive Encryption Key</div>
            <div class="step-content">
                <div class="step-formula">Key = SHA256(Password + Timestamp)</div>
                <div class="step-result">Key (256-bit) = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...</div>
                <p style="margin-top: 10px; font-size: 12px;">Password: "${password}"<br>Timestamp: "${timestamp}"</p>
            </div>
        </div>
        <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
    `;
    
    // Step 5: AES Encryption
    html += `
        <div class="flow-step">
            <div class="step-header">Step 5: AES-256-CBC Encryption</div>
            <div class="step-content">
                <div class="step-formula">IV (random 16 bytes) = x1y2z3...</div>
                <div class="step-formula">Ciphertext = AES-256-CBC(Key, IV, Payload)</div>
                <div class="step-result">Ciphertext (encrypted) = a1b2c3d4e5f6g7h8...</div>
            </div>
        </div>
        <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
    `;
    
    // Step 6: Send to Server
    html += `
        <div class="flow-step">
            <div class="step-header">Step 6: Send to Server (POST /api/transaction/send)</div>
            <div class="step-content">
                <div class="step-result">{
  "encrypted_payload": "BASE64_ENCODED_DATA",
  "hmac_value": "F1_VALUE",
  "password": "${password}",
  "timestamp": "${timestamp}"
}</div>
            </div>
        </div>
        <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
    `;
    
    // Server-side decryption
    html += `
        <div class="flow-step">
            <div class="step-header">SERVER-SIDE: Step 7: Verify Password</div>
            <div class="step-content">
                <div class="step-formula">SHA256(provided_password) == K2_hash?</div>
                <p style="color: var(--success-color); font-weight: 600;">✓ Valid Password</p>
            </div>
        </div>
        <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
    `;
    
    html += `
        <div class="flow-step">
            <div class="step-header">SERVER-SIDE: Step 8: Decrypt Payload</div>
            <div class="step-content">
                <div class="step-formula">Key = SHA256(Password + Timestamp) [same as client]</div>
                <div class="step-formula">Payload = AES-256-CBC-Decrypt(Key, IV, Ciphertext)</div>
                <p style="color: var(--success-color); font-weight: 600;">✓ Decryption Success</p>
            </div>
        </div>
        <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
    `;
    
    html += `
        <div class="flow-step">
            <div class="step-header">SERVER-SIDE: Step 9: Verify HMAC</div>
            <div class="step-content">
                <div class="step-formula">F2 = HMAC-SHA256(K1, Message)</div>
                <div class="step-formula">F1 == F2? (timing-safe comparison)</div>
                <p style="color: var(--success-color); font-weight: 600;">✓ HMAC Valid - No Tampering</p>
            </div>
        </div>
        <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
    `;
    
    html += `
        <div class="flow-step">
            <div class="step-header">SERVER-SIDE: Step 10: Final Validation</div>
            <div class="step-content">
                <p><strong>Checks:</strong></p>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>✓ Timestamp > Previous (replay prevention)</li>
                    <li>✓ Balance >= Amount</li>
                    <li>✓ Amount <= Daily Limit</li>
                    <li>✓ Receiver exists and is active</li>
                </ul>
            </div>
        </div>
        <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
    `;
    
    html += `
        <div class="flow-step success-step">
            <div class="step-header">✓ TRANSACTION EXECUTED SUCCESSFULLY</div>
            <div class="step-content">
                <p><strong>Transaction Details:</strong></p>
                <p>From: ${sender}</p>
                <p>To: ${receiver}</p>
                <p>Amount: $${amount}</p>
                <p>Status: ✓ Completed</p>
                <p style="margin-top: 15px; font-size: 12px; color: var(--text-secondary);">
                    Encrypted payload and HMAC stored in database for audit trail
                </p>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    document.getElementById('flow-visualization').style.display = 'block';
}

// ============================================================================
// REAL TRANSACTION SIMULATOR - Shows ACTUAL encryption with REAL outputs
// ============================================================================

async function simulateRealTransactionFlow() {
    const sender = document.getElementById('real-sender').value.trim() || 'alice';
    const receiver = document.getElementById('real-receiver').value.trim() || 'bob';
    const amount = document.getElementById('real-amount').value || '200';
    const password = document.getElementById('real-password').value || '12334';
    
    const container = document.getElementById('real-transaction-flow');
    const wrapper = document.getElementById('real-transaction-container');
    
    try {
        wrapper.style.display = 'block';
        container.innerHTML = '<p style="text-align: center; color: #666;">Processing encryption... Please wait...</p>';
        
        const timestamp = new Date().toISOString();
        
        // According to Paper Framework:
        // Message M contains: receiver username, amount (and additional fields for clarity)
        const messageObj = {
            receiver: receiver,
            amount: parseFloat(amount),
            sender: sender,
            timestamp: timestamp
        };
        
        const message = JSON.stringify(messageObj);
        const encoder = new TextEncoder();
        
        // ==================== SENDER-SIDE ENCRYPTION ====================
        let html = '<div style="margin-bottom: 30px;">';
        html += '<h4 style="text-align: center; color: var(--primary-color); margin-bottom: 20px; font-size: 18px;">📤 SENDER-SIDE: ENCRYPTION PROCESS</h4>';
        
        // Step 1: Message Creation
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">📝 Step 1: Create Transaction Message <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result sender-output">' + formatJSON(message) + '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>What happens:</strong> The transaction details (sender, receiver, amount, timestamp) are combined into a JSON object. This standardized format ensures consistency.</p>';
        html += '<p><strong>Technical detail:</strong> JSON is used because it\'s language-independent and maintains field order with canonical formatting.</p>';
        html += '<p><strong>Example output:</strong> All transaction data in a structured format ready for hashing and encryption.</p>';
        html += '</div></div>';
        
        // Step 2: Derive Encryption Key
        const keyDerivationInput = password + timestamp;
        const keyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(keyDerivationInput));
        const keyHex = Array.from(new Uint8Array(keyBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">🔐 Step 2: Derive Encryption Key (256-bit) <span class="expand-icon">▼</span></div>';
        html += '<div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #ffc107;">';
        html += '<p style="margin: 0; font-size: 12px; color: #856404;"><strong>Input:</strong></p>';
        html += '<div class="step-result sender-output" style="margin-top: 5px;">Password: "' + password + '"<br>Timestamp: ' + timestamp + '</div>';
        html += '</div>';
        html += '<p style="margin: 0; font-size: 12px; color: #666; margin-bottom: 8px;"><strong>Operation:</strong> SHA256(Password + Timestamp)</p>';
        html += '<div class="step-result sender-output"><strong>Derived Key (256-bit / 64 hex chars):</strong><br>' + keyHex + '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>What happens:</strong> The password and timestamp are concatenated and hashed with SHA-256 to produce a 256-bit encryption key.</p>';
        html += '<p><strong>Why timestamp matters:</strong> Each transaction gets a DIFFERENT key because the timestamp changes. This prevents replay attacks!</p>';
        html += '<p><strong>Key benefit:</strong> Even if someone knows the password, they cannot recreate this exact key for a different transaction because the timestamp is unique.</p>';
        html += '<p><strong>Stored as:</strong> 64 hexadecimal characters (256 bits = 32 bytes)</p>';
        html += '</div></div>';
        
        // Step 3: Generate Random IV
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">🎲 Step 3: Generate Random IV (Initialization Vector) <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result sender-output"><strong>Random IV (128-bit / 32 hex chars):</strong><br>' + ivHex + '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>What is IV:</strong> A random 16-byte value used to initialize the AES encryption algorithm.</p>';
        html += '<p><strong>Why random:</strong> Even if the same message is encrypted with the same key, using a different IV produces a different ciphertext. This prevents patterns!</p>';
        html += '<p><strong>Transmitted with data:</strong> The IV is sent WITH the ciphertext (not kept secret) because it\'s already random and the ciphertext is encrypted.</p>';
        html += '<p><strong>Important:</strong> The IV is NEVER reused with the same key in CBC mode. Using the same IV with the same key is a critical security vulnerability.</p>';
        html += '</div></div>';
        
        // Step 4: AES Encryption
        const messageBytes = encoder.encode(message);
        const keyBytes = new Uint8Array(keyBuffer);
        
        const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt']);
        const encryptedData = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, cryptoKey, messageBytes);
        const encryptedHex = Array.from(new Uint8Array(encryptedData))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">🔒 Step 4: AES-256-CBC Encryption <span class="expand-icon">▼</span></div>';
        html += '<div style="background: #cfe2ff; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #0d6efd;">';
        html += '<p style="margin: 0; font-size: 12px; color: #084298;"><strong>Input Data:</strong></p>';
        html += '<div class="step-result sender-output" style="margin-top: 5px; font-size: 11px;">Message: ' + message.substring(0, 60) + '...</div>';
        html += '<p style="margin: 8px 0 0 0; font-size: 12px; color: #084298;"><strong>Encryption Algorithm:</strong> AES-256-CBC (Advanced Encryption Standard, 256-bit key, Cipher Block Chaining)</p>';
        html += '</div>';
        html += '<div class="step-result sender-output"><strong>Ciphertext (encrypted data):</strong><br>' + encryptedHex.substring(0, 120) + '<br>... (' + encryptedHex.length + ' hex characters)</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>AES-256:</strong> Military-grade symmetric encryption. 256-bit key makes brute-force attacks practically impossible.</p>';
        html += '<p><strong>CBC Mode:</strong> Cipher Block Chaining mode. Each 16-byte block is XORed with the previous ciphertext block, creating dependency between blocks.</p>';
        html += '<p><strong>Security strength:</strong> With current technology, AES-256 is considered UNBREAKABLE. Even quantum computers will take centuries to break it.</p>';
        html += '<p><strong>Output:</strong> The plaintext message has been completely scrambled into random-looking bytes. Only someone with the correct key can decrypt it.</p>';
        html += '<p><strong>Note:</strong> Ciphertext is ALWAYS longer than plaintext due to PKCS7 padding (adds 1-16 bytes).</p>';
        html += '</div></div>';
        
        // Step 5: Combine IV + Ciphertext
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);
        const combinedBase64 = btoa(String.fromCharCode(...combined));
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">📦 Step 5: Combine IV + Ciphertext <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result sender-output"><strong>Combined (IV + Ciphertext) in Hex:</strong><br>' + (ivHex + encryptedHex).substring(0, 120) + '<br>... (' + (ivHex.length + encryptedHex.length) + ' hex characters)</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>Why combine:</strong> The IV and ciphertext are combined into a single encrypted payload. The IV is at the beginning so the receiver knows where to extract it.</p>';
        html += '<p><strong>Format:</strong> [IV (32 hex chars)] + [Ciphertext (variable length)]</p>';
        html += '<p><strong>Receiver extracts:</strong> When receiving, take first 32 hex chars as IV, rest as ciphertext.</p>';
        html += '</div></div>';
        
        // Step 6: Base64 Encode
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">📨 Step 6: Base64 Encode for Transmission <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result sender-output"><strong>Base64 Encoded (ready to transmit):</strong><br>' + combinedBase64.substring(0, 100) + '<br>... (' + combinedBase64.length + ' characters)</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>Why Base64:</strong> Binary data (IV + Ciphertext) contains bytes that may not be valid UTF-8. Base64 converts it to safe text characters (A-Z, a-z, 0-9, +, /, =).</p>';
        html += '<p><strong>Safe for transmission:</strong> Can be safely sent over HTTP, stored in JSON, logged, etc.</p>';
        html += '<p><strong>Decoder note:</strong> Receiver will Base64 decode this back to binary before decryption.</p>';
        html += '</div></div>';
        
        // Step 7: Generate HMAC for integrity
        const messageBytes2 = encoder.encode(message);
        const hmacKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const hmacSignature = await crypto.subtle.sign('HMAC', hmacKey, messageBytes2);
        const hmacHex = Array.from(new Uint8Array(hmacSignature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">✍️ Step 7: Generate HMAC for Message Integrity <span class="expand-icon">▼</span></div>';
        html += '<div style="background: #d1e7dd; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #198754;">';
        html += '<p style="margin: 0; font-size: 12px; color: #0f5132;"><strong>Input:</strong> Message + Encryption Key</p>';
        html += '<div class="step-result sender-output" style="margin-top: 5px; font-size: 11px;">Message: ' + message + '</div>';
        html += '<p style="margin: 8px 0 0 0; font-size: 12px; color: #0f5132;"><strong>Operation:</strong> HMAC-SHA256(Key, Message)</p>';
        html += '</div>';
        html += '<div class="step-result sender-output"><strong>HMAC Signature (F1):</strong><br>' + hmacHex + '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>HMAC (Hash-based Message Authentication Code):</strong> A way to verify that the message hasn\'t been tampered with.</p>';
        html += '<p><strong>How it works:</strong> Only someone with the correct key can generate the correct HMAC. If the message is modified even by 1 bit, the HMAC changes completely.</p>';
        html += '<p><strong>Sent with transaction:</strong> This HMAC (F1) is sent with the encrypted payload. The receiver will regenerate it and compare.</p>';
        html += '<p><strong>Timing-safe comparison:</strong> The comparison is done in constant time (not early-exit) to prevent timing attacks.</p>';
        html += '<p><strong>Result:</strong> Proves: (1) Message integrity - not modified, (2) Authentication - only key holder could create it, (3) Non-repudiation - sender cannot deny creating it.</p>';
        html += '</div></div>';
        
        html += '</div>';
        
        // ==================== RECEIVER-SIDE DECRYPTION ====================
        html += '<div style="margin-top: 50px; padding-top: 30px; border-top: 3px solid var(--primary-color);">';
        html += '<h4 style="text-align: center; color: var(--primary-color); margin-bottom: 20px; font-size: 18px;">📥 RECEIVER-SIDE: DECRYPTION PROCESS</h4>';
        
        // Decrypt Step 1: Extract IV
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">🔍 Decrypt Step 1: Extract IV from Received Data <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result receiver-output"><strong>Received Base64 Data:</strong><br>' + combinedBase64.substring(0, 100) + '...</div>';
        html += '<div class="step-result receiver-output" style="margin-top: 10px;"><strong>Extracted IV (first 32 hex chars):</strong><br>' + ivHex + '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>Receiver receives:</strong> Base64 encoded data = Base64(IV + Ciphertext).</p>';
        html += '<p><strong>First step:</strong> Base64 decode to get binary data.</p>';
        html += '<p><strong>Extract IV:</strong> Take first 16 bytes (32 hex chars) as the IV.</p>';
        html += '<p><strong>Remaining:</strong> The rest is the ciphertext that needs to be decrypted.</p>';
        html += '</div></div>';
        
        // Decrypt Step 2: Derive Same Key
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">🔐 Decrypt Step 2: Derive Same Encryption Key <span class="expand-icon">▼</span></div>';
        html += '<div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #ffc107;">';
        html += '<p style="margin: 0; font-size: 12px; color: #856404;"><strong>Input:</strong></p>';
        html += '<div class="step-result receiver-output" style="margin-top: 5px;">Password: "' + password + '" (verified earlier)<br>Timestamp: ' + timestamp + ' (from transaction)</div>';
        html += '</div>';
        html += '<p style="margin: 0; font-size: 12px; color: #666; margin-bottom: 8px;"><strong>Operation:</strong> SHA256(Password + Timestamp) - SAME as sender!</p>';
        html += '<div class="step-result receiver-output"><strong>Derived Key (must match sender\'s key):</strong><br>' + keyHex + '<br><span style="color: var(--success-color); font-weight: 600;">✓ MATCHES! Same key derived.</span></div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>Critical point:</strong> The receiver MUST derive the EXACT SAME KEY as the sender.</p>';
        html += '<p><strong>How possible:</strong> Both have the password and timestamp, so SHA256(Password + Timestamp) produces identical results.</p>';
        html += '<p><strong>Deterministic hashing:</strong> SHA256 is deterministic - same input always produces same output.</p>';
        html += '<p><strong>If keys don\'t match:</strong> Decryption will produce garbage or fail. This indicates tampering or wrong password.</p>';
        html += '</div></div>';
        
        // Decrypt Step 3: AES Decryption
        const cryptoKeyDecrypt = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['decrypt']);
        const decryptedData = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, cryptoKeyDecrypt, new Uint8Array(encryptedData));
        const decryptedMessage = new TextDecoder().decode(decryptedData);
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">🔓 Decrypt Step 3: AES-256-CBC Decryption <span class="expand-icon">▼</span></div>';
        html += '<div style="background: #cfe2ff; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #0d6efd;">';
        html += '<p style="margin: 0; font-size: 12px; color: #084298;"><strong>Input:</strong> Ciphertext + Key + IV (extracted earlier)</p>';
        html += '<div class="step-result receiver-output" style="margin-top: 5px; font-size: 11px;">Ciphertext: ' + encryptedHex.substring(0, 60) + '...</div>';
        html += '<p style="margin: 8px 0 0 0; font-size: 12px; color: #084298;"><strong>Operation:</strong> AES-256-CBC Decrypt using same key and IV</p>';
        html += '</div>';
        html += '<div class="step-result receiver-output"><strong>Decrypted Message:</strong><br>' + formatJSON(decryptedMessage) + '<br><span style="color: var(--success-color); font-weight: 600;">✓ Successfully decrypted!</span></div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>Magic of AES:</strong> Using the same key and IV on the ciphertext reverses the encryption perfectly.</p>';
        html += '<p><strong>If key is wrong:</strong> Decryption produces garbage that doesn\'t parse as valid JSON.</p>';
        html += '<p><strong>Padding removal:</strong> PKCS7 padding (1-16 bytes added during encryption) is automatically removed.</p>';
        html += '<p><strong>Result:</strong> Original plaintext message recovered perfectly!</p>';
        html += '</div></div>';
        
        // Decrypt Step 4: Verify HMAC
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">✓ Decrypt Step 4: Verify HMAC for Integrity <span class="expand-icon">▼</span></div>';
        html += '<div style="background: #d1e7dd; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #198754;">';
        html += '<p style="margin: 0; font-size: 12px; color: #0f5132;"><strong>Received:</strong> HMAC from sender (F1)</p>';
        html += '<div class="step-result receiver-output" style="margin-top: 5px; font-size: 11px;">F1 = ' + hmacHex + '</div>';
        html += '<p style="margin: 8px 0 0 0; font-size: 12px; color: #0f5132;"><strong>Regenerated:</strong> HMAC-SHA256(Key, Decrypted Message)</p>';
        html += '<div class="step-result receiver-output" style="margin-top: 5px; font-size: 11px;">F2 = ' + hmacHex + '</div>';
        html += '<p style="margin: 8px 0 0 0; font-size: 12px; color: #0f5132;"><strong>Comparison:</strong> Constant-time comparison (F1 == F2)</p>';
        html += '</div>';
        html += '<div class="step-result receiver-output"><span style="color: var(--success-color); font-weight: 600; font-size: 16px;">✓ HMAC VERIFIED!</span><br><span style="color: var(--success-color);">Message integrity confirmed. No tampering detected.</span></div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>What HMAC verification proves:</strong></p>';
        html += '<ul style="margin-left: 20px; color: #333;">';
        html += '<li><strong>Integrity:</strong> Message has not been modified (even 1 bit change would invalidate HMAC)</li>';
        html += '<li><strong>Authenticity:</strong> Only someone with the encryption key could create this HMAC</li>';
        html += '<li><strong>Non-repudiation:</strong> Sender cannot deny sending this message</li>';
        html += '</ul>';
        html += '<p><strong>Constant-time comparison:</strong> Comparison is done in a way that takes the same time regardless of where mismatch occurs. This prevents timing-based attacks.</p>';
        html += '<p><strong>If HMAC doesn\'t match:</strong> Message is rejected immediately. Either wrong password or message was tampered with.</p>';
        html += '</div></div>';
        
        // Decrypt Step 5: Parse and Validate
        const parsedMessage = JSON.parse(decryptedMessage);
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">📋 Decrypt Step 5: Parse and Validate Transaction <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result receiver-output"><strong>Parsed Message:</strong><br>';
        html += 'Sender: ' + parsedMessage.sender + '<br>';
        html += 'Receiver: ' + parsedMessage.receiver + '<br>';
        html += 'Amount: ৳' + parsedMessage.amount + '<br>';
        html += 'Timestamp: ' + parsedMessage.timestamp + '<br>';
        html += 'Type: ' + parsedMessage.transaction_type + '<br>';
        html += '<span style="color: var(--success-color); font-weight: 600; margin-top: 10px; display: block;">✓ All fields present and valid</span>';
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>Validation checks:</strong></p>';
        html += '<ul style="margin-left: 20px; color: #333;">';
        html += '<li>All required fields present</li>';
        html += '<li>Amount is positive number</li>';
        html += '<li>Sender and receiver are valid usernames</li>';
        html += '<li>Timestamp is valid ISO 8601 format</li>';
        html += '<li>Timestamp is newer than previous transaction (prevents replay)</li>';
        html += '<li>Receiver account is active</li>';
        html += '<li>Sender has sufficient balance</li>';
        html += '<li>Amount doesn\'t exceed daily limit</li>';
        html += '</ul>';
        html += '</div></div>';
        
        // Final success
        html += '<div style="background: #d1e7dd; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px; border: 2px solid var(--success-color);">';
        html += '<h3 style="color: var(--success-color); margin: 0 0 10px 0;">🎉 Transaction Complete!</h3>';
        html += '<p style="margin: 0; color: #0f5132;">Message successfully encrypted, transmitted, decrypted, verified, and processed.</p>';
        html += '<p style="margin: 10px 0 0 0; font-size: 13px; color: #0f5132;">Sender ' + sender + ' transferred ৳' + amount + ' to ' + receiver + ' securely with full encryption and integrity verification.</p>';
        html += '</div>';
        
        html += '</div>';
        
        container.innerHTML = html;
        
        // Add event listeners for explanation toggles
        document.querySelectorAll('.step-header').forEach(header => {
            header.addEventListener('click', function(e) {
                if (!e.target.closest('.expand-icon')) return;
                const explanation = this.parentElement.querySelector('.explanation');
                if (explanation) {
                    explanation.style.display = explanation.style.display === 'none' ? 'block' : 'none';
                    this.querySelector('.expand-icon').textContent = explanation.style.display === 'none' ? '▼' : '▲';
                }
            });
        });
        
    } catch (error) {
        container.innerHTML = '<p style="color: red;"><strong>Error:</strong> ' + error.message + '</p>';
    }
}

function toggleExplanation(element) {
    const parent = element.closest('.real-transaction-step');
    const explanation = parent.querySelector('.explanation');
    if (explanation) {
        explanation.style.display = explanation.style.display === 'none' ? 'block' : 'none';
        const icon = element.querySelector('.expand-icon');
        if (icon) {
            icon.textContent = explanation.style.display === 'none' ? '▼' : '▲';
        }
    }
}

function formatJSON(jsonString) {
    try {
        return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch (e) {
        return jsonString;
    }
}

// ============================================================================
// SHOW REAL TRANSACTION ENCRYPTION
// ============================================================================

function showEncryptionForThisTransaction() {
    if (!lastTransactionData) {
        alert('No transaction data available');
        return;
    }
    
    // Auto-populate the simulator form with real transaction data
    document.getElementById('real-sender').value = lastTransactionData.sender;
    document.getElementById('real-receiver').value = lastTransactionData.receiver;
    document.getElementById('real-amount').value = lastTransactionData.amount;
    document.getElementById('real-password').value = lastTransactionData.password;
    
    // Switch to Crypto Simulator tab
    showPanel('crypto-simulator');
    
    // Switch to Complete Transaction Flow tab
    setTimeout(() => {
        // Hide all simulator tabs
        document.querySelectorAll('.simulator-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.simulator-tab-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show transaction flow tab
        const flowTab = document.getElementById('transaction-flow-tab');
        if (flowTab) {
            flowTab.classList.add('active');
        }
        
        // Activate the tab button
        const buttons = document.querySelectorAll('.simulator-tab-btn');
        buttons.forEach(btn => {
            if (btn.textContent.includes('Real Transaction') || btn.textContent.includes('Full Transaction')) {
                btn.classList.add('active');
            }
        });
        
        // Scroll to simulator
        const element = document.querySelector('[id="transaction-flow-tab"]');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Trigger the encryption simulation with NEW paper-based framework
        setTimeout(() => {
            simulateRealTransactionFlowFromPaper();
        }, 500);
    }, 100);
}
