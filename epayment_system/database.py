"""
Database models and initialization for e-payment system
Uses SQLite with simple schema
"""
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import os

DB_PATH = 'epayment_system.db'


def get_db_connection():
    """Get SQLite database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize database schema"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            nid TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            k1 TEXT NOT NULL,
            mac_address TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            balance REAL DEFAULT 1000.0,
            is_active INTEGER DEFAULT 1,
            last_transaction_timestamp TEXT,
            daily_limit REAL DEFAULT 5000.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            timestamp TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            encrypted_payload TEXT,
            hmac_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(user_id),
            FOREIGN KEY (receiver_id) REFERENCES users(user_id)
        )
    ''')
    
    # Admin/Bank table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_users (
            admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()


class UserDatabase:
    """Database operations for users"""
    
    @staticmethod
    def create_user(username: str, nid: str, password_hash: str, k1: str, 
                   mac_address: str, password_salt: str) -> int:
        """Create new user"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO users (username, nid, password_hash, k1, mac_address, password_salt)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (username, nid, password_hash, k1, mac_address, password_salt))
            conn.commit()
            user_id = cursor.lastrowid
            return user_id
        finally:
            conn.close()
    
    @staticmethod
    def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
        """Retrieve user by username"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve user by ID"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    
    @staticmethod
    def update_user_balance(user_id: int, new_balance: float):
        """Update user balance"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('UPDATE users SET balance = ? WHERE user_id = ?', 
                      (new_balance, user_id))
        conn.commit()
        conn.close()
    
    @staticmethod
    def update_last_transaction_timestamp(user_id: int, timestamp: str):
        """Update last transaction timestamp for replay protection"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('UPDATE users SET last_transaction_timestamp = ? WHERE user_id = ?',
                      (timestamp, user_id))
        conn.commit()
        conn.close()
    
    @staticmethod
    def suspend_account(user_id: int):
        """Suspend user account (lost device scenario)"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('UPDATE users SET is_active = 0 WHERE user_id = ?', (user_id,))
        conn.commit()
        conn.close()
    
    @staticmethod
    def is_account_active(user_id: int) -> bool:
        """Check if account is active"""
        user = UserDatabase.get_user_by_id(user_id)
        return user and user['is_active'] == 1


class TransactionDatabase:
    """Database operations for transactions"""
    
    @staticmethod
    def create_transaction(sender_id: int, receiver_id: int, amount: float,
                          timestamp: str, encrypted_payload: str, hmac_value: str) -> int:
        """Create new transaction record"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO transactions (sender_id, receiver_id, amount, timestamp, 
                                        encrypted_payload, hmac_value, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (sender_id, receiver_id, amount, timestamp, encrypted_payload, hmac_value, 'completed'))
            conn.commit()
            transaction_id = cursor.lastrowid
            return transaction_id
        finally:
            conn.close()
    
    @staticmethod
    def get_transaction_history(user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """Get transaction history for a user (with sender/receiver usernames)"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT t.*, 
                   u1.username as sender_username,
                   u2.username as receiver_username
            FROM transactions t
            JOIN users u1 ON t.sender_id = u1.user_id
            JOIN users u2 ON t.receiver_id = u2.user_id
            WHERE t.sender_id = ? OR t.receiver_id = ?
            ORDER BY t.created_at DESC
            LIMIT ?
        ''', (user_id, user_id, limit))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    @staticmethod
    def update_transaction_status(transaction_id: int, status: str):
        """Update transaction status"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('UPDATE transactions SET status = ? WHERE transaction_id = ?',
                      (status, transaction_id))
        conn.commit()
        conn.close()


class AdminDatabase:
    """Database operations for admin users"""
    
    @staticmethod
    def create_admin(username: str, password_hash: str) -> int:
        """Create admin user"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO admin_users (username, password_hash)
                VALUES (?, ?)
            ''', (username, password_hash))
            conn.commit()
            return cursor.lastrowid
        finally:
            conn.close()
    
    @staticmethod
    def get_admin_by_username(username: str) -> Optional[Dict[str, Any]]:
        """Get admin by username"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM admin_users WHERE username = ?', (username,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
