# ⚡ QUICK START - COPY & PASTE COMMANDS

## 🎯 RUN IN 30 SECONDS

### **Terminal 1: Backend (Port 5000)**
```powershell
cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system"
python app.py
```

### **Terminal 2: Frontend (Port 8000)**
```powershell
cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system"
python -m http.server 8000
```

### **Browser**
```
http://localhost:8000
```

---

## 📋 COMPLETE COMMANDS

### **ONE-LINER (Fastest)**
```powershell
cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system" ; python app.py
```

### **USING RUN SCRIPT**
```powershell
cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system"
.\run.ps1
```

### **MANUAL BACKEND**
```powershell
cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system"
python app.py
```

### **MANUAL FRONTEND**
```powershell
python -m http.server 8000
```

---

## 🧪 ACCESS CRYPTO SIMULATOR

### **After Login:**
1. Sidebar → Click "Crypto Simulator"
2. See 5 tabs:
   - 🔐 AES Encryption
   - 🔑 HMAC-SHA256
   - 👤 Biometric Auth
   - ⏰ Timestamp Flow
   - ➡️ Complete Transaction

### **Try This:**
```
1. Open AES tab
2. Keep default message: "Send $100 to Alice"
3. Keep password: "12334"
4. Click "Encrypt"
5. Watch 5-step visualization!
```

---

## 🌐 URLS

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:8000 | 8000 |
| Backend | http://localhost:5000 | 5000 |
| Simulator | http://localhost:8000 (after login) | 8000 |

---

## 📖 DOCUMENTATION FILES

```
📖 README_SIMULATOR.md         ← START HERE (you are here)
📖 RUN_FROM_VSCODE.md          ← How to run
📖 CRYPTO_SIMULATOR_GUIDE.md   ← Simulator details
📖 FINAL_SUMMARY.md            ← Complete overview
📖 ENCRYPTION_FRAMEWORK.md     ← Technical details
📖 ENCRYPTION_QUICK_REFERENCE.md ← Code examples
```

---

## 🔧 TROUBLESHOOTING QUICK FIX

### **Python Not Found?**
```powershell
winget install Python.Python.3.11
```

### **Port Already in Use?**
```powershell
# Port 8000 in use? Try:
python -m http.server 8001

# Port 5000 in use? 
# Edit app.py or kill the process:
netstat -ano | findstr :5000
taskkill /PID <number> /F
```

### **Dependencies Missing?**
```powershell
pip install -r requirements.txt
```

### **Simulator Not Showing?**
- Make sure you're **logged in**
- Refresh page: **F5**
- Check Console: **F12**
- Clear cache: **Ctrl+Shift+Delete**

---

## ✅ VERIFICATION

Both servers running?
```
✓ Backend shows: "Running on http://127.0.0.1:5000"
✓ Frontend shows: "Serving HTTP on 0.0.0.0 port 8000"
```

Browser working?
```
✓ http://localhost:8000 shows login page
✓ Can log in successfully
✓ Dashboard loads with sidebar
```

Simulator loaded?
```
✓ "Crypto Simulator" in sidebar menu
✓ Can click it
✓ 5 tabs visible (AES, HMAC, Biometric, Timestamp, Flow)
✓ Forms are interactive
```

---

## 🎬 QUICK DEMOS

### **Demo 1: AES Encryption (2 minutes)**
```
1. Login
2. Click Crypto Simulator
3. Click AES tab
4. Click Encrypt button
5. See step-by-step visualization
```

### **Demo 2: HMAC Generation (2 minutes)**
```
1. Click HMAC tab
2. Click Generate HMAC
3. See signature generated
4. Click Verify HMAC
5. See verification process
```

### **Demo 3: Complete Transaction (3 minutes)**
```
1. Click Full Flow tab
2. Keep default values
3. Click Simulate Transaction
4. Watch all 10 steps
5. See complete encryption/decryption
```

---

## 🎯 WHAT THE SIMULATOR SHOWS

```
🔐 AES TAB:
   Message → Encrypt → Encrypted Data
   5 steps shown with key, IV, ciphertext

🔑 HMAC TAB:
   Message + Key → HMAC → Signature
   3 steps shown with F1 verification

👤 BIOMETRIC TAB:
   Input → Hash → Verify → Success
   4 steps shown with auth flow

⏰ TIMESTAMP TAB:
   Current Time → Validate → Key Derivation
   Replay attack prevention explained

➡️ FULL FLOW TAB:
   Transaction Details → 10-Step Process
   Complete client-to-server encryption shown
```

---

## 📊 FILES YOU HAVE

```
Core:
  ✅ app.py              Flask backend
  ✅ crypto.py           Encryption engine
  ✅ database.py         Database schema
  ✅ script.js           Frontend + simulator
  ✅ index.html          UI + simulator
  ✅ style.css           Styling + simulator

Tools:
  ✅ run.ps1             Startup script
  ✅ requirements.txt    Dependencies

Docs:
  ✅ README_SIMULATOR.md      This guide
  ✅ RUN_FROM_VSCODE.md       Running guide
  ✅ CRYPTO_SIMULATOR_GUIDE.md Simulator guide
  ✅ FINAL_SUMMARY.md         Complete overview
  ✅ ENCRYPTION_FRAMEWORK.md  Technical guide
  ✅ Plus 4 more documentation files
```

---

## 🚀 3-STEP STARTUP

```
STEP 1: Open Terminal
        Ctrl + `

STEP 2: Run Backend
        cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system"
        python app.py

STEP 3: Open Browser
        http://localhost:8000
```

Then:
```
STEP 4: New Terminal
        Ctrl + Shift + `

STEP 5: Run Frontend
        python -m http.server 8000

STEP 6: Login & Explore Simulator!
```

---

## 💡 KEY FEATURES

### **Encryption Visualization:**
- ✅ Shows message transformation
- ✅ Displays key derivation
- ✅ Shows IV generation
- ✅ Visualizes ciphertext
- ✅ Base64 encoding shown

### **HMAC Visualization:**
- ✅ Message signing process
- ✅ Signature generation
- ✅ Verification process
- ✅ Tampering detection

### **Transaction Flow:**
- ✅ 10-step process
- ✅ Client & server steps
- ✅ Encryption/decryption
- ✅ Verification checks
- ✅ Final execution

### **Interactive:**
- ✅ Enter your own data
- ✅ Real-time visualization
- ✅ Step-by-step breakdown
- ✅ Learn at your pace

---

## 🎓 WHAT YOU'LL LEARN

After using the simulator:

```
✅ How AES-256-CBC encryption works
✅ How HMAC-SHA256 protects messages
✅ How key derivation prevents replay attacks
✅ How biometric authentication flows
✅ How complete transactions are secured
✅ End-to-end encryption concepts
✅ Real-world cryptography in action
```

---

## 🌍 SYSTEM OVERVIEW

```
Your Computer:
┌─────────────────────────────────┐
│ VS Code Terminal                │
│ ├─ Terminal 1: python app.py    │
│ │  Running on :5000 ✓           │
│ └─ Terminal 2: http.server 8000 │
│    Running on :8000 ✓           │
└─────────────────────────────────┘

Browser:
┌─────────────────────────────────┐
│ http://localhost:8000           │
│ ├─ Login Page                   │
│ ├─ Dashboard                    │
│ └─ Crypto Simulator (NEW!) ✨   │
│    ├─ AES Encryption            │
│    ├─ HMAC                       │
│    ├─ Biometric                  │
│    ├─ Timestamp                  │
│    └─ Full Flow                  │
└─────────────────────────────────┘
```

---

## ⚡ COMMANDS AT A GLANCE

```powershell
# Navigate
cd epayment_system

# Start backend
python app.py

# Start frontend (new terminal)
python -m http.server 8000

# Or use script
.\run.ps1

# Stop (Ctrl+C)
# View docs
cat README_SIMULATOR.md
```

---

## 🏆 YOU NOW HAVE

```
✅ Professional e-Payment System
✅ Military-Grade Encryption
✅ Interactive Crypto Simulator
✅ 5 Visualization Tabs
✅ Step-by-Step Demos
✅ Educational Learning Tool
✅ Production-Ready Code
✅ Comprehensive Documentation
```

---

## 🎉 READY TO START?

**Copy this command:**
```powershell
cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system" ; python app.py
```

**Paste in VS Code terminal and press Enter!**

**Then open second terminal and run:**
```powershell
python -m http.server 8000
```

**Then open browser:**
```
http://localhost:8000
```

**Then login and click Crypto Simulator to see encryption in action! 🎬**

---

**Status:** ✅ READY TO RUN
**Simulator:** ✅ READY TO VISUALIZE
**Documentation:** ✅ READY TO READ

**Go ahead and explore! 🚀**
