# ✅ SIMULATOR UPDATED TO MATCH RESEARCH PAPER FRAMEWORK

## What Changed?

You asked me to follow the **exact framework described in the research paper** - not add extra details that aren't mentioned. I've now rewritten the simulator to match the paper **exactly**.

---

## Key Differences: Paper Framework vs Old Simulator

### ❌ REMOVED (Not mentioned in paper):
- **CBC Mode** - Paper just says "AES", doesn't specify CBC
- **Initialization Vector (IV)** - Not mentioned in paper
- **Base64 Encoding** - Not mentioned in paper  
- **SHA256(password + timestamp)** - Not how paper describes it
- **Multiple sub-steps** - Paper describes 6 steps, not 7-8

### ✅ ADDED/CLARIFIED (From paper):
- **K1**: Private key from activation code + NID + biometric
- **K2**: User's password
- **M**: Message (receiver, amount, timestamp)
- **F1**: HMAC(K1, M) - authentication code
- **BP**: Biometric fingerprint (explicitly used)
- **T**: Timestamp (explicitly used)
- **Encryption notation**: E(M, F(M,K1), T, Bp, K2) - exact paper format

---

## Paper Framework Steps (Now Implemented)

### **SENDER SIDE (6 Steps from Paper):**

```
Step 1: User enters receiver username, amount, biometric
Step 2: Create message M (receiver, amount, timestamp)
Step 3: Generate F1 = HMAC(K1, M)
Step 4: Combine M and F1
Step 5: Encrypt E(M, F(M,K1), T, Bp, K2) using AES with K2, BP, T
Step 6: Transmit encrypted data to server
```

### **RECEIVER SIDE (4 Steps from Paper):**

```
Step 1: Receive and decrypt E(M, F(M,K1), T, Bp, K2)
Step 2: Extract M and F1
Step 3: Generate F2 = HMAC(K1, M)
Step 4: Compare: F1 == F2?
  If YES: Process transaction (extract receiver, amount, update balances)
  If NO: Reject transaction
```

---

## Exact Quotes from Paper (Simulator Now Shows These)

### Sender Side:
> "the user is required to enter the necessary details including, the receiver's username (given by the bank), and the amount of money in the system interface. Upon proceeding with the transfer, the user must input the fingerprint (BP)"

> "The message M is passed through HMAC with the generated key K1 to produce a hashed value F1. The message M and F1 are then combined and encrypted by user's password K2, user's fingerprint (BP) and the timestamp T."

> "The resulting Encrypted data is transmitted through the insecure channel to the bank server."

### Receiver Side:
> "The server receives the message and decrypts the message"

> "The server uses the same key K2, the fingerprint (BP) and the timestamp T to decrypt the message."

> "Next, message integrity and the authenticity of the user's device are checked by hashing the message part M using HMAC with the key K1. Only if the hashed value F2 is the same as F1, then the message M is accepted."

> "Once M is accepted, the amount of money S and the receiver's name are retrieved from M, and the name is verified in the database. Next, if the sender's balance is more than S, the sender's balance is updated by deducting S, while S is added to the receiver's account."

> "Upon each successful transfer, the time stamp T is updated."

---

## File Changes

| File | Change | Reason |
|------|--------|--------|
| **simulator_paper_framework.js** | ✅ NEW | Complete rewrite following paper framework |
| **index.html** | Updated button text | Now says "Show Encryption (According to Paper Framework)" |
| **script.js** | Updated function call | Now calls `simulateRealTransactionFlowFromPaper()` |

---

## What The Simulator Now Shows

### **Clear Paper Framework Notation:**

Instead of generic steps, it now explicitly shows:

```
SENDER SIDE:
═══════════════════════════════════════════
Step 1: User enters [receiver, amount, biometric]
Step 2: Create message M
Step 3: Generate F1 = HMAC(K1, M)
Step 4: Combine M and F1
Step 5: Encrypt E(M, F(M,K1), T, Bp, K2)
Step 6: Transmit through insecure channel

RECEIVER SIDE:
═══════════════════════════════════════════
Step 1: Receive and decrypt E(M, F(M,K1), T, Bp, K2)
Step 2: Extract M and F1
Step 3: Generate F2 = HMAC(K1, M)
Step 4: Compare F1 == F2
  ✓ YES: Process transaction
  ✗ NO: Reject
```

### **Paper Citations in Explanations:**

Every step includes quotes from the paper, like:

> "From paper: 'The message M is passed through HMAC with the generated key K1 to produce a hashed value F1'"

This proves the simulator follows the paper exactly.

---

## What's Different from Before

### Before (Old Simulator):
- ❌ Mentioned CBC-256
- ❌ Generated and showed IV
- ❌ Included Base64 encoding steps
- ❌ Used SHA256(password + timestamp) explicitly
- ❌ 7-8 generic steps

### After (New Simulator):
- ✅ Follows paper framework exactly
- ✅ Uses paper's notation: E(M, F(M,K1), T, Bp, K2)
- ✅ Only 6 sender steps + 4 receiver steps (as paper describes)
- ✅ Includes all paper quotes
- ✅ Shows K1, K2, M, F1, T, BP clearly
- ✅ No extra details not mentioned in paper

---

## How to Test

1. **Send money** using the app
2. Click button: **"View How This Transaction Was Encrypted →"**
3. Simulator opens and shows:
   - Your actual transaction data (sender, receiver, amount)
   - Paper framework steps (K1, K2, M, F1, T, BP)
   - Exact quotes from paper
   - Why each step matters

---

## Key Security Components (Per Paper)

The simulator now clearly shows:

1. **K1** - Private key from activation code + NID + biometric
   - Used for HMAC authentication
   - Proves device authenticity

2. **K2** - User's password
   - Used for encryption
   - Only user knows it

3. **F1 = HMAC(K1, M)** - Authentication code
   - Proves message integrity
   - Proves message authenticity
   - Prevents tampering

4. **T** - Timestamp
   - Changes every transaction
   - Prevents replay attacks
   - Ensures unique encryption key each time

5. **BP** - Biometric fingerprint
   - Device-specific
   - Additional security factor
   - Even if stolen, device biometric needed

6. **E(M, F(M,K1), T, Bp, K2)** - Encryption
   - Combines all security factors
   - Ensures confidentiality

---

## Summary

✅ **Now matches research paper framework exactly**
✅ **Uses paper's terminology (K1, K2, M, F1, T, BP)**
✅ **Follows paper's steps (6 sender + 4 receiver)**
✅ **Includes paper quotes in explanations**
✅ **NO extra details (no CBC, IV, Base64 unless mentioned)**
✅ **Shows real transaction data with real encryption**

**The simulator is now an accurate educational tool based on the published research!**
