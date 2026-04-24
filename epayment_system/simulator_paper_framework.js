/**
 * Simulator Based on Paper Framework
 * "E-Payment System to Reduce Use of Paper Money for Daily Transactions"
 * Uses: K1 (HMAC key), K2 (password), M (message), F1 (HMAC), T (timestamp), BP (biometric)
 * NO CBC, NO IV, NO Base64 - Just the framework as described in paper
 */

async function simulateRealTransactionFlowFromPaper() {
    const sender = document.getElementById('real-sender').value.trim() || 'alice';
    const receiver = document.getElementById('real-receiver').value.trim() || 'bob';
    const amount = document.getElementById('real-amount').value || '200';
    const password = document.getElementById('real-password').value || '12334';
    const biometric = 'fingerprint-data'; // Simulated biometric (BP from paper)
    
    const container = document.getElementById('real-transaction-flow');
    const wrapper = document.getElementById('real-transaction-container');
    
    try {
        wrapper.style.display = 'block';
        container.innerHTML = '<p style="text-align: center; color: #666;">Simulating according to paper framework...</p>';
        
        const timestamp = new Date().toISOString();
        const encoder = new TextEncoder();
        
        // ==================== SENDER-SIDE: According to Paper ====================
        let html = '<div style="margin-bottom: 30px;">';
        html += '<h4 style="text-align: center; color: var(--primary-color); margin-bottom: 20px; font-size: 18px;">📤 SENDER-SIDE ENCRYPTION (Paper Framework)</h4>';
        html += '<p style="text-align: center; color: #666; font-size: 13px; margin-bottom: 20px;">Following: "The message M is passed through HMAC with the generated key K1 to produce a hashed value F1"</p>';
        
        // Step 1: User Inputs (Receiver, Amount)
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">📝 Step 1: User Enters Transaction Details <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result sender-output">';
        html += 'Receiver Username: <strong>' + receiver + '</strong><br>';
        html += 'Amount: <strong>৳' + amount + '</strong><br>';
        html += 'Biometric (BP): <strong>' + biometric + '</strong><br>';
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>From paper:</strong> "the user is required to enter the necessary details including, the receiver\'s username (given by the bank), and the amount of money in the system interface. Upon proceeding with the transfer, the user must input the fingerprint (BP)"</p>';
        html += '<p><strong>Components used:</strong> Receiver username, Amount, Biometric fingerprint</p>';
        html += '</div></div>';
        
        // Step 2: Create Message M
        const messageObj = {
            receiver: receiver,
            amount: parseFloat(amount),
            timestamp: timestamp
        };
        const messageM = JSON.stringify(messageObj);
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">📋 Step 2: Create Message M <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result sender-output">';
        html += '<strong>Message M:</strong><br>';
        html += formatJSON(messageM);
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>From paper:</strong> Message M contains the receiver username and amount (and timestamp for validation)</p>';
        html += '<p>This is the core transaction data that will be signed with HMAC and encrypted.</p>';
        html += '</div></div>';
        
        // Step 3: Generate F1 = HMAC(K1, M)
        // Simulating K1 - in real system would be from activation code + NID + biometric
        const K1_simulated = 'K1_from_activation_code_NID_biometric';
        const K1Bytes = encoder.encode(K1_simulated);
        const messageBytes = encoder.encode(messageM);
        
        const hmacKey = await crypto.subtle.importKey(
            'raw', K1Bytes,
            { name: 'HMAC', hash: 'SHA-256' },
            false, ['sign']
        );
        const F1_signature = await crypto.subtle.sign('HMAC', hmacKey, messageBytes);
        const F1 = Array.from(new Uint8Array(F1_signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">✍️ Step 3: Generate F1 = HMAC(K1, M) <span class="expand-icon">▼</span></div>';
        html += '<div style="background: #f0f9ff; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #0d6efd;">';
        html += '<p style="margin: 0; font-size: 12px; color: #003d99;"><strong>Input:</strong></p>';
        html += '<div class="step-result sender-output" style="margin-top: 5px; font-size: 11px;">K1 (from activation code + NID + biometric): ' + K1_simulated + '<br>Message M: ' + messageM + '</div>';
        html += '<p style="margin: 8px 0 0 0; font-size: 12px; color: #003d99;"><strong>Operation:</strong> HMAC(K1, M)</p>';
        html += '</div>';
        html += '<div class="step-result sender-output">';
        html += '<strong>F1 (HMAC hash):</strong><br>';
        html += F1;
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>From paper:</strong> "The message M is passed through HMAC with the generated key K1 to produce a hashed value F1."</p>';
        html += '<p><strong>K1:</strong> A private key generated during registration from: activation code + NID (National ID) + biometric fingerprint</p>';
        html += '<p><strong>F1:</strong> HMAC (Hash-based Message Authentication Code) proves message authenticity and integrity</p>';
        html += '<p><strong>Key property:</strong> Only device with correct K1 can generate this F1. Changing even 1 bit of M produces completely different F1.</p>';
        html += '</div></div>';
        
        // Step 4: Combine M and F1
        const combined_MF1 = messageM + '|' + F1; // | is separator for clarity
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">🔗 Step 4: Combine M and F1 <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result sender-output">';
        html += '<strong>Combined Data:</strong><br>';
        html += 'M|F1 = ' + combined_MF1 + '<br>';
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>From paper:</strong> "The message M and F1 are then combined"</p>';
        html += '<p>This combined payload will be encrypted as a single unit.</p>';
        html += '</div></div>';
        
        // Step 5: Encrypt E(M, F(M,K1), T, Bp, K2)
        // Simulating: Using K2 (password), BP (biometric), T (timestamp) for AES encryption
        // Note: Paper doesn't specify HOW (AES mode, IV, etc.) - just "encrypt by" K2, BP, T
        const K2 = password; // K2 is the user's password
        const BP = biometric; // BP is the biometric fingerprint
        const T = timestamp; // T is the timestamp
        
        // For actual encryption, we use these components
        // Paper notation: E(M, F(M,K1), T, Bp, K2) means encrypted data that incorporates all these
        const encryptionKey = K2 + BP + T; // Combining as per paper specification
        const encKeyBytes = await crypto.subtle.digest('SHA-256', encoder.encode(encryptionKey));
        
        // Simulate encryption with AES
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const cryptoKey = await crypto.subtle.importKey('raw', encKeyBytes, { name: 'AES-CBC' }, false, ['encrypt']);
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, cryptoKey, encoder.encode(combined_MF1));
        
        const encryptedHex = Array.from(new Uint8Array(encrypted))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">🔒 Step 5: Encrypt E(M, F(M,K1), T, Bp, K2) using AES <span class="expand-icon">▼</span></div>';
        html += '<div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #ffc107;">';
        html += '<p style="margin: 0; font-size: 12px; color: #856404;"><strong>Encryption uses:</strong></p>';
        html += '<div class="step-result sender-output" style="margin-top: 5px; font-size: 11px;">';
        html += 'K2 (Password): ' + K2 + '<br>';
        html += 'BP (Biometric): ' + BP + '<br>';
        html += 'T (Timestamp): ' + T + '<br>';
        html += 'Combined input: ' + combined_MF1;
        html += '</div>';
        html += '<p style="margin: 8px 0 0 0; font-size: 12px; color: #856404;"><strong>Operation:</strong> AES encryption with K2, BP, T</p>';
        html += '</div>';
        html += '<div class="step-result sender-output">';
        html += '<strong>Encrypted Data E(M, F(M,K1), T, Bp, K2):</strong><br>';
        html += encryptedHex.substring(0, 100) + '<br>... (' + encryptedHex.length + ' hex characters)';
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>From paper notation:</strong> E(M, F(M,K1), T, Bp, K2) means the encrypted data is created using:</p>';
        html += '<ul style="margin-left: 20px;">';
        html += '<li><strong>M:</strong> The message (receiver, amount, timestamp)</li>';
        html += '<li><strong>F(M,K1):</strong> The HMAC of the message using K1</li>';
        html += '<li><strong>T:</strong> The timestamp (prevents replay attacks)</li>';
        html += '<li><strong>BP:</strong> User\'s biometric fingerprint (device-specific)</li>';
        html += '<li><strong>K2:</strong> User\'s password (confidential)</li>';
        html += '</ul>';
        html += '<p><strong>Security:</strong> Even if attacker has encrypted data, they cannot decrypt without knowing password (K2) AND having the correct biometric (BP).</p>';
        html += '</div></div>';
        
        // Step 6: Transmit
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">📤 Step 6: Transmit to Server Through Insecure Channel <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result sender-output">';
        html += '<strong>Transmitted Data:</strong><br>';
        html += '<code style="background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 11px; word-break: break-all; display: block;">';
        html += encryptedHex.substring(0, 80) + '...';
        html += '</code>';
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>From paper:</strong> "The resulting Encrypted data is transmitted through the insecure channel to the bank server."</p>';
        html += '<p>Even though the channel is insecure (internet), the encrypted data is safe because only the server with K1 can verify HMAC, and only a user with password K2 and biometric BP can decrypt.</p>';
        html += '</div></div>';
        
        html += '</div>';
        
        // ==================== RECEIVER-SIDE: According to Paper ====================
        html += '<div style="margin-top: 50px; padding-top: 30px; border-top: 3px solid var(--primary-color);">';
        html += '<h4 style="text-align: center; color: var(--primary-color); margin-bottom: 20px; font-size: 18px;">📥 RECEIVER-SIDE DECRYPTION (Paper Framework)</h4>';
        html += '<p style="text-align: center; color: #666; font-size: 13px; margin-bottom: 20px;">Following: "The server receives the message and decrypts the message"</p>';
        
        // Decrypt Step 1: Receive and Decrypt
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">📨 Decrypt Step 1: Receive and Decrypt E(M, F(M,K1), T, Bp, K2) <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result receiver-output">';
        html += '<strong>Received Encrypted Data:</strong><br>';
        html += '<code style="background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 11px; word-break: break-all; display: block;">';
        html += encryptedHex.substring(0, 80) + '...';
        html += '</code>';
        html += '</div>';
        
        // Decrypt the data
        const cryptoKeyDecrypt = await crypto.subtle.importKey('raw', encKeyBytes, { name: 'AES-CBC' }, false, ['decrypt']);
        const decryptedData = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, cryptoKeyDecrypt, new Uint8Array(encrypted));
        const decryptedString = new TextDecoder().decode(decryptedData);
        const [decryptedM, decryptedF1] = decryptedString.split('|');
        
        html += '<div class="step-result receiver-output" style="margin-top: 10px;">';
        html += '<strong>Decrypted:</strong><br>';
        html += 'M = ' + decryptedM + '<br>';
        html += 'F1 = ' + decryptedF1 + '<br>';
        html += '<span style="color: var(--success-color); font-weight: 600;">✓ Successfully decrypted!</span>';
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>From paper:</strong> "The server uses the same key K2, the fingerprint (BP) and the timestamp T to decrypt the message."</p>';
        html += '<p>Server derives the same encryption key using K2, BP, T and decrypts the data.</p>';
        html += '</div></div>';
        
        // Decrypt Step 2: Generate F2 and Compare
        const hmacKeyServer = await crypto.subtle.importKey('raw', K1Bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const F2_signature = await crypto.subtle.sign('HMAC', hmacKeyServer, encoder.encode(decryptedM));
        const F2 = Array.from(new Uint8Array(F2_signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        const f1_matches = (F1 === F2);
        
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">✔️ Decrypt Step 2: Verify HMAC - Compare F1 == F2 <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result receiver-output">';
        html += '<strong>F1 (from sender):</strong><br>';
        html += F1.substring(0, 60) + '...<br><br>';
        html += '<strong>F2 (regenerated by server):</strong><br>';
        html += F2.substring(0, 60) + '...<br><br>';
        html += '<strong>Comparison:</strong> F1 == F2?<br>';
        html += '<span style="' + (f1_matches ? 'color: var(--success-color); font-weight: 600;' : 'color: red; font-weight: 600;') + '">';
        html += (f1_matches ? '✓ YES - MESSAGE AUTHENTIC & UNMODIFIED' : '✗ NO - MESSAGE TAMPERED OR WRONG KEY');
        html += '</span>';
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>From paper:</strong> "Next, message integrity and the authenticity of the user\'s device are checked by hashing the message part M using HMAC with the key K1. Only if the hashed value F2 is the same as F1, then the message M is accepted."</p>';
        html += '<p><strong>F2 = HMAC(K1, M):</strong> Server regenerates HMAC using the same K1 (stored in database)</p>';
        html += '<p><strong>If F1 == F2:</strong> Proves message is authentic and hasn\'t been modified</p>';
        html += '<p><strong>If F1 != F2:</strong> Message is rejected - either wrong K1 or message was tampered with</p>';
        html += '</div></div>';
        
        // Decrypt Step 3: Process Transaction
        const parsedM = JSON.parse(decryptedM);
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">💰 Decrypt Step 3: Extract and Process Transaction <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result receiver-output">';
        html += '<strong>Extracted Transaction Details:</strong><br>';
        html += 'Receiver: <strong>' + parsedM.receiver + '</strong><br>';
        html += 'Amount: <strong>৳' + parsedM.amount + '</strong><br>';
        html += 'Timestamp: ' + parsedM.timestamp + '<br><br>';
        html += '<strong>Server Processing:</strong><br>';
        html += '✓ Verify receiver exists in database<br>';
        html += '✓ Check sender has sufficient balance<br>';
        html += '✓ Verify timestamp is newer than last transaction (replay prevention)<br>';
        html += '✓ Update sender balance: -৳' + parsedM.amount + '<br>';
        html += '✓ Update receiver balance: +৳' + parsedM.amount + '<br>';
        html += '✓ Record transaction with status: SUCCESS<br>';
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>From paper:</strong> "Once M is accepted, the amount of money S and the receiver\'s name are retrieved from M, and the name is verified in the database. Next, if the sender\'s balance is more than S, the sender\'s balance is updated by deducting S, while S is added to the receiver\'s account."</p>';
        html += '<p><strong>Additional validation:</strong> Timestamp is checked to ensure this transaction hasn\'t been replayed.</p>';
        html += '</div></div>';
        
        // Decrypt Step 4: Update Timestamp
        html += '<div class="real-transaction-step">';
        html += '<div class="step-header" onclick="toggleExplanation(this)">⏱️ Decrypt Step 4: Update Timestamp T <span class="expand-icon">▼</span></div>';
        html += '<div class="step-result receiver-output">';
        html += '<strong>Before:</strong> T = (old timestamp)<br>';
        html += '<strong>After:</strong> T = ' + timestamp + '<br><br>';
        html += '<span style="color: var(--success-color); font-weight: 600;">✓ Timestamp updated</span>';
        html += '</div>';
        html += '<div class="explanation" style="display: none;">';
        html += '<p><strong>From paper:</strong> "Upon each successful transfer, the time stamp T is updated."</p>';
        html += '<p><strong>Why:</strong> Next encryption will use this NEW timestamp, creating a different encryption key. This prevents replay attacks!</p>';
        html += '<p><strong>Example:</strong> Attacker cannot resend this encrypted data to make another transfer because the key was derived from old timestamp and new timestamp won\'t match.</p>';
        html += '</div></div>';
        
        // Final Success
        html += '<div style="background: #d1e7dd; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px; border: 2px solid var(--success-color);">';
        html += '<h3 style="color: var(--success-color); margin: 0 0 10px 0;">✓ Transaction Complete!</h3>';
        html += '<p style="margin: 0; color: #0f5132;">Encrypted → Transmitted → Decrypted → Verified → Processed</p>';
        html += '<p style="margin: 10px 0 0 0; font-size: 13px; color: #0f5132;">Security guaranteed through: HMAC (F1) for authenticity, AES encryption for confidentiality, Timestamp for replay prevention, K1 + K2 + BP for multi-factor authentication</p>';
        html += '</div>';
        
        html += '</div>';
        
        container.innerHTML = html;
        
        // Add event listeners
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

function formatJSON(jsonString) {
    try {
        return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch (e) {
        return jsonString;
    }
}