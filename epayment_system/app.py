"""
Flask backend API for secure e-payment system
Implements user registration, login, transactions
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import secrets
import json

from crypto import CryptoEngine
from database import (
    init_database, UserDatabase, TransactionDatabase, get_db_connection
)

app = Flask(__name__)
CORS(app)

# Session storage for users
user_sessions = {}

# Initialize database
init_database()


@app.route('/')
def root():
    """Root endpoint - redirects to frontend"""
    return jsonify({
        'message': 'E-Payment System Backend API',
        'status': 'running',
        'frontend': 'http://localhost:8000',
        'api_base': 'http://localhost:5000/api'
    }), 200


def require_login(f):
    """Decorator to require user login"""
    def decorated_function(*args, **kwargs):
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token or session_token not in user_sessions:
            return jsonify({'error': 'Unauthorized'}), 401
        request.user_id = user_sessions[session_token]['user_id']
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function


# ============================================================================
# USER REGISTRATION & AUTHENTICATION
# ============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    User registration endpoint
    Requires: username, nid, password, mac_address
    Bank admin generates activation code
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['username', 'nid', 'password', 'mac_address']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        username = data['username'].strip()
        nid = data['nid'].strip()
        password = data['password']
        mac_address = data['mac_address'].strip()
        
        # Validation
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
        if len(password) < 4:
            return jsonify({'error': 'Password must be at least 4 characters'}), 400
        
        # Check if user already exists
        if UserDatabase.get_user_by_username(username):
            return jsonify({'error': 'Username already exists'}), 400
        
        # Generate activation code (in production, bank admin would issue this)
        activation_code = CryptoEngine.generate_activation_code()
        
        # Generate password salt
        password_salt = secrets.token_hex(8)
        
        # Generate K1 (HMAC key)
        k1 = CryptoEngine.generate_k1(nid, activation_code, mac_address, password)
        
        # Hash password for storage (K2)
        password_hash = CryptoEngine.hash_password(password)
        
        # Create user in database
        user_id = UserDatabase.create_user(
            username=username,
            nid=nid,
            password_hash=password_hash,
            k1=k1,
            mac_address=mac_address,
            password_salt=password_salt
        )
        
        return jsonify({
            'status': 'success',
            'message': 'User registered successfully',
            'user_id': user_id,
            'activation_code': activation_code,
            'note': 'Activation code should be stored securely by the user'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    User login endpoint
    Requires: username, password
    Returns: session token
    """
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password required'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        # Get user from database
        user = UserDatabase.get_user_by_username(username)
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        password_hash = CryptoEngine.hash_password(password)
        if password_hash != user['password_hash']:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check if account is active
        if not UserDatabase.is_account_active(user['user_id']):
            return jsonify({'error': 'Account is suspended'}), 403
        
        # Generate session token
        session_token = secrets.token_urlsafe(32)
        user_sessions[session_token] = {
            'user_id': user['user_id'],
            'username': user['username'],
            'login_time': datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'session_token': session_token,
            'user': {
                'user_id': user['user_id'],
                'username': user['username'],
                'balance': user['balance']
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/logout', methods=['POST'])
@require_login
def logout():
    """Logout user"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if session_token in user_sessions:
            del user_sessions[session_token]
        
        return jsonify({'status': 'success', 'message': 'Logged out'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# USER OPERATIONS
# ============================================================================

@app.route('/api/user/balance', methods=['GET'])
@require_login
def get_balance():
    """Get user balance"""
    try:
        user = UserDatabase.get_user_by_id(request.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'balance': user['balance'],
            'username': user['username']
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/profile', methods=['GET'])
@require_login
def get_profile():
    """Get user profile"""
    try:
        user = UserDatabase.get_user_by_id(request.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user_id': user['user_id'],
            'username': user['username'],
            'balance': user['balance'],
            'daily_limit': user['daily_limit'],
            'is_active': user['is_active'],
            'created_at': user['created_at']
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/transactions/history', methods=['GET'])
@require_login
def get_transaction_history():
    """Get user transaction history"""
    try:
        limit = request.args.get('limit', 50, type=int)
        transactions = TransactionDatabase.get_transaction_history(request.user_id, limit)
        
        return jsonify({
            'transactions': transactions,
            'count': len(transactions)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# TRANSACTION PROCESSING
# ============================================================================

@app.route('/api/transaction/send', methods=['POST'])
@require_login
def send_transaction():
    """
    Send money to another user (per ICECTE 2022 framework)
    Implements full cryptographic workflow:
    1. Create message M = {sender, receiver, amount, timestamp}
    2. Generate F1 = HMAC(K1, M)
    3. Encrypt payload with K2 + Timestamp
    4. Server verifies HMAC, password, and timestamp
    5. Execute transaction
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data.get('receiver_username') or not data.get('amount'):
            return jsonify({'error': 'Receiver username and amount required'}), 400
        
        # PASSWORD REQUIRED FOR TRANSACTION (per paper specification)
        if not data.get('password'):
            return jsonify({'error': 'Password required to complete transaction'}), 400
        
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
        
        # Get sender
        sender = UserDatabase.get_user_by_id(request.user_id)
        if not sender:
            return jsonify({'error': 'Sender not found'}), 404
        
        # VERIFY PASSWORD
        transaction_password = data['password']
        password_hash = CryptoEngine.hash_password(transaction_password)
        if password_hash != sender['password_hash']:
            return jsonify({'error': 'Invalid password - transaction denied'}), 401
        
        # Get receiver
        receiver = UserDatabase.get_user_by_username(data['receiver_username'])
        if not receiver:
            return jsonify({'error': 'Receiver not found'}), 404
        
        # Check sender balance
        if sender['balance'] < amount:
            return jsonify({'error': 'Insufficient balance'}), 400
        
        # Check daily limit
        if amount > sender['daily_limit']:
            return jsonify({'error': f"Exceeds daily limit of {sender['daily_limit']}"}), 400
        
        # Get encrypted payload from client
        if not data.get('encrypted_payload') or not data.get('hmac_value'):
            return jsonify({'error': 'Encrypted payload and HMAC required'}), 400
        
        encrypted_payload = data['encrypted_payload']
        received_hmac = data['hmac_value']
        timestamp = data.get('timestamp')
        
        if not timestamp:
            return jsonify({'error': 'Timestamp required'}), 400
        
        # STEP 3: Decrypt payload on server using password + timestamp (per paper)
        try:
            payload = CryptoEngine.decrypt_payload(
                encrypted_payload,
                transaction_password,  # Use the password provided in transaction
                timestamp
            )
        except ValueError as e:
            return jsonify({'error': f'Decryption failed: {str(e)}'}), 400
        
        # Extract message and verify structure
        message = payload.get('message')
        if not message:
            return jsonify({'error': 'Invalid payload structure'}), 400
        
        # STEP 4: Recompute HMAC for verification
        computed_hmac = CryptoEngine.generate_hmac(sender['k1'], message)
        
        # STEP 5: Verify HMAC
        if not CryptoEngine.verify_hmac(sender['k1'], message, received_hmac):
            return jsonify({'error': 'HMAC verification failed - message integrity compromised'}), 401
        
        # STEP 6: Replay attack prevention via timestamp
        if sender['last_transaction_timestamp']:
            last_time = datetime.fromisoformat(sender['last_transaction_timestamp'])
            current_time = datetime.fromisoformat(timestamp)
            if current_time <= last_time:
                return jsonify({'error': 'Replay attack detected - timestamp must be newer'}), 401
        
        # STEP 7: Execute transaction
        new_sender_balance = sender['balance'] - amount
        new_receiver_balance = receiver['balance'] + amount
        
        UserDatabase.update_user_balance(sender['user_id'], new_sender_balance)
        UserDatabase.update_user_balance(receiver['user_id'], new_receiver_balance)
        UserDatabase.update_last_transaction_timestamp(sender['user_id'], timestamp)
        
        # Record transaction
        transaction_id = TransactionDatabase.create_transaction(
            sender_id=sender['user_id'],
            receiver_id=receiver['user_id'],
            amount=amount,
            timestamp=timestamp,
            encrypted_payload=encrypted_payload,
            hmac_value=received_hmac
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Transaction completed',
            'transaction_id': transaction_id,
            'sender_new_balance': new_sender_balance,
            'receiver': receiver['username'],
            'amount': amount,
            'timestamp': timestamp
        }), 200
    
    except ValueError as e:
        return jsonify({'error': f'Invalid amount: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/transaction/prepare', methods=['POST'])
@require_login
def prepare_transaction():
    """
    Prepare transaction data for client-side encryption
    Client will use this info to create encrypted payload
    """
    try:
        data = request.get_json()
        
        if not data.get('receiver_username') or not data.get('amount'):
            return jsonify({'error': 'Receiver username and amount required'}), 400
        
        # Get sender
        sender = UserDatabase.get_user_by_id(request.user_id)
        if not sender:
            return jsonify({'error': 'Sender not found'}), 404
        
        # Get receiver
        receiver = UserDatabase.get_user_by_username(data['receiver_username'])
        if not receiver:
            return jsonify({'error': 'Receiver not found'}), 404
        
        amount = float(data['amount'])
        timestamp = datetime.utcnow().isoformat()
        
        # Send K1 and other needed info for client to prepare encryption
        return jsonify({
            'status': 'success',
            'sender_username': sender['username'],
            'receiver_username': receiver['username'],
            'amount': amount,
            'timestamp': timestamp,
            'k1': sender['k1'],
            'message': {
                'sender': sender['username'],
                'receiver': receiver['username'],
                'amount': amount,
                'timestamp': timestamp
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'timestamp': datetime.utcnow().isoformat()}), 200


@app.route('/api/users/search', methods=['GET'])
@require_login
def search_users():
    """Search for users by username"""
    try:
        query = request.args.get('q', '').strip()
        
        if len(query) < 2:
            return jsonify({'error': 'Search query must be at least 2 characters'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT user_id, username FROM users WHERE username LIKE ? LIMIT 10',
            (f'%{query}%',)
        )
        users = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify({'users': users}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
