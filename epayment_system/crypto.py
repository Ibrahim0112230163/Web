"""
Cryptographic utilities for secure e-payment system
Implements HMAC for integrity, AES for encryption, and key derivation
"""
import hmac
import hashlib
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad
import json
import base64
from datetime import datetime


class CryptoEngine:
    """Handles all cryptographic operations for the e-payment system"""
    
    @staticmethod
    def generate_k1(nid: str, activation_code: str, mac_address: str, password: str) -> str:
        """
        Generate K1 (HMAC key) from user identity components
        K1 = HMAC(NID + ActivationCode + MAC + Password)
        
        Args:
            nid: National ID or Business Registration Certificate
            activation_code: Bank-issued activation code
            mac_address: Device MAC address
            password: User password (replaces biometric)
        
        Returns:
            Hex-encoded K1
        """
        message = f"{nid}{activation_code}{mac_address}{password}".encode('utf-8')
        k1 = hmac.new(
            key=b"epayment_master_key",
            msg=message,
            digestmod=hashlib.sha256
        ).hexdigest()
        return k1
    
    @staticmethod
    def generate_hmac(k1: str, message: dict) -> str:
        """
        Generate HMAC for message integrity verification
        F1 = HMAC(K1, M) where M = {sender, receiver, amount, timestamp}
        
        Args:
            k1: HMAC key
            message: Transaction message dictionary
        
        Returns:
            Hex-encoded HMAC
        """
        # Serialize message in consistent format
        msg_str = json.dumps(message, sort_keys=True, separators=(',', ':'))
        msg_bytes = msg_str.encode('utf-8')
        
        # Generate HMAC using K1 as key
        f1 = hmac.new(
            key=k1.encode('utf-8'),
            msg=msg_bytes,
            digestmod=hashlib.sha256
        ).hexdigest()
        return f1
    
    @staticmethod
    def verify_hmac(k1: str, message: dict, received_hmac: str) -> bool:
        """
        Verify message integrity using HMAC
        Check if F1 == F2
        
        Args:
            k1: HMAC key
            message: Transaction message
            received_hmac: Received HMAC to verify against
        
        Returns:
            True if HMAC is valid, False otherwise
        """
        computed_hmac = CryptoEngine.generate_hmac(k1, message)
        # Use timing-safe comparison to prevent timing attacks
        return hmac.compare_digest(computed_hmac, received_hmac)
    
    @staticmethod
    def derive_encryption_key(k2_password: str, timestamp: str) -> bytes:
        """
        Derive AES encryption key from password and timestamp (per paper specification)
        Key = SHA256(K2 + Timestamp) where K2 is user's password
        
        Args:
            k2_password: User password (K2)
            timestamp: Current timestamp
        
        Returns:
            32-byte key for AES-256
        """
        key_material = f"{k2_password}{timestamp}".encode('utf-8')
        key = hashlib.sha256(key_material).digest()
        return key
    
    @staticmethod
    def encrypt_payload(payload: dict, k2_password: str, timestamp: str) -> str:
        """
        Encrypt transaction payload using AES-256-CBC
        Ciphertext = AES_Encrypt(K2 + Timestamp, Payload)
        
        Args:
            payload: Message || HMAC (transaction data with HMAC)
            k2_password: User password (K2)
            timestamp: Transaction timestamp
        
        Returns:
            Base64-encoded ciphertext with IV prepended
        """
        # Derive encryption key using password and timestamp
        key = CryptoEngine.derive_encryption_key(k2_password, timestamp)
        
        # Serialize payload
        payload_json = json.dumps(payload, separators=(',', ':')).encode('utf-8')
        
        # Generate random IV
        iv = get_random_bytes(16)
        
        # Encrypt using AES-256-CBC
        cipher = AES.new(key, AES.MODE_CBC, iv)
        padded_payload = pad(payload_json, AES.block_size)
        ciphertext = cipher.encrypt(padded_payload)
        
        # Combine IV + Ciphertext and encode as base64
        encrypted_data = iv + ciphertext
        encoded = base64.b64encode(encrypted_data).decode('utf-8')
        
        return encoded
    
    @staticmethod
    def decrypt_payload(encrypted_data: str, k2_password: str, timestamp: str) -> dict:
        """
        Decrypt transaction payload using AES-256-CBC
        Payload = AES_Decrypt(K2 + Timestamp, Ciphertext)
        
        Args:
            encrypted_data: Base64-encoded IV + ciphertext
            k2_password: User password (K2)
            timestamp: Transaction timestamp
        
        Returns:
            Decrypted payload dictionary
        
        Raises:
            ValueError: If decryption fails
        """
        try:
            # Decode base64
            encrypted_bytes = base64.b64decode(encrypted_data)
            
            # Extract IV and ciphertext
            iv = encrypted_bytes[:16]
            ciphertext = encrypted_bytes[16:]
            
            # Derive encryption key using password and timestamp
            key = CryptoEngine.derive_encryption_key(k2_password, timestamp)
            
            # Decrypt using AES-256-CBC
            cipher = AES.new(key, AES.MODE_CBC, iv)
            padded_payload = cipher.decrypt(ciphertext)
            payload_json = unpad(padded_payload, AES.block_size)
            
            # Deserialize and return
            payload = json.loads(payload_json.decode('utf-8'))
            return payload
        
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using SHA-256 for storage"""
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    @staticmethod
    def generate_activation_code() -> str:
        """Generate a random activation code"""
        import secrets
        return secrets.token_hex(6).upper()
