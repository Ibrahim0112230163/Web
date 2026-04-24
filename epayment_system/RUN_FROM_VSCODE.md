# 🚀 HOW TO RUN THE E-PAYMENT SYSTEM FROM VS CODE

## Quick Start (3 Easy Steps)

```
1. Open VS Code Terminal (Ctrl + `)
2. Run the startup script: .\run.ps1
3. Open browser: http://localhost:8000
```

---

## 📖 DETAILED STEP-BY-STEP GUIDE

### **Step 1: Open VS Code Terminal**

**Option A: Using Keyboard Shortcut**
- Press `Ctrl + ` ` (Control + Backtick)
- A terminal will open at the bottom of VS Code

**Option B: Using Menu**
- Click "Terminal" in the top menu
- Select "New Terminal"
- Terminal opens at bottom

**Current Directory Check:**
```
Your terminal should show:
PS E:\UIU COURSE\10th tri\FYDP-I Section A\Web>
```

### **Step 2: Navigate to Project Directory**

```powershell
cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system"
```

Or simply:
```powershell
cd epayment_system
```

**Verify the directory:**
```powershell
dir
```

You should see files like: `app.py`, `script.js`, `index.html`, `crypto.py`, etc.

---

## 🎯 METHOD 1: Using the Run Script (RECOMMENDED)

### **Step 1: Run the startup script**

```powershell
.\run.ps1
```

**What it does:**
- ✅ Sets up Python path
- ✅ Starts Flask backend (port 5000)
- ✅ Automatically configures environment

**Expected Output:**
```
 * Serving Flask app 'app'
 * Debug mode: off
WARNING: This is a development server. Do not use it in production deployments.
Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
```

### **Step 2: Open a second terminal for frontend**

- Press `Ctrl + Shift + ` ` (to create another terminal)
- Or click the `+` icon in the terminal tab bar

In the new terminal:
```powershell
cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system"
python -m http.server 8000
```

**Expected Output:**
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

### **Step 3: Open Browser**

Visit: **http://localhost:8000**

---

## 🎯 METHOD 2: Manual Start (If Script Doesn't Work)

### **Terminal 1: Start Flask Backend**

```powershell
# Navigate to project
cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system"

# Run Flask app
python app.py
```

**Expected:**
```
 * Running on http://127.0.0.1:5000
```

### **Terminal 2: Start Frontend Server**

```powershell
# Open new terminal (Ctrl + Shift + `)
# Navigate to project
cd "E:\UIU COURSE\10th tri\FYDP-I Section A\Web\epayment_system"

# Start HTTP server
python -m http.server 8000
```

**Expected:**
```
Serving HTTP on 0.0.0.0 port 8000
```

### **Step 3: Open http://localhost:8000**

---

## 🌐 ACCESSING THE APPLICATION

### **Backend API (for reference)**
- **URL**: http://localhost:5000
- **Endpoints**: `/api/auth/login`, `/api/auth/register`, etc.
- **Status**: Returns API information

### **Frontend Application (MAIN)**
- **URL**: http://localhost:8000
- **This is where you log in and use the app**

### **Crypto Simulator (NEW FEATURE!)**
1. Log in with test account:
   - Username: `testuser`
   - Password: `testpass`
   
   OR create a new account with:
   - Username: `alice` (or any name)
   - Password: `password123`
   - NID: `1234567890`
   - Activation Code: `ACT123456`
   - MAC Address: `00:1A:2B:3C:4D:5E`

2. In dashboard, click **"Crypto Simulator"** in the sidebar

3. Explore the tabs:
   - 🔐 **AES Encryption** - See step-by-step encryption
   - 🔑 **HMAC** - Watch HMAC generation
   - 👤 **Biometric** - See auth flow
   - ⏰ **Timestamp** - Replay prevention
   - ➡️ **Full Flow** - Complete transaction

---

## ⚙️ TERMINAL MANAGEMENT IN VS CODE

### **Creating Multiple Terminals**

**Method 1: Keyboard Shortcut**
- `Ctrl + Shift + ` ` - Creates new terminal

**Method 2: Terminal Menu**
- Terminal → New Terminal

**Method 3: Click Plus Icon**
- Click `+` in the terminal tab bar

### **Switching Between Terminals**

- Click on terminal tab at bottom
- Or use: `Ctrl + Page Down` (next), `Ctrl + Page Up` (previous)

### **Terminal Tabs**
```
You'll see tabs like:
┌─────────────────────────┐
│ powershell | + | X |   │  ← Terminal tabs
└─────────────────────────┘
```

### **Terminal Split View**

**Creating Split Terminal:**
- Right-click terminal tab → "Split Terminal"
- Or use menu: Terminal → New Terminal... (select split)

---

## 🔧 TROUBLESHOOTING

### **Problem: Python Command Not Found**

**Solution 1: Use run.ps1**
```powershell
.\run.ps1
```
This automatically sets up the PATH.

**Solution 2: Use full path**
```powershell
C:\Users\YourUsername\AppData\Local\Programs\Python\Python311\python.exe app.py
```

**Solution 3: Reinstall Python**
```powershell
winget install Python.Python.3.11
```

### **Problem: Port 5000 Already in Use**

**Find process using port 5000:**
```powershell
netstat -ano | findstr :5000
```

**Kill the process (example PID 1234):**
```powershell
taskkill /PID 1234 /F
```

### **Problem: Port 8000 Already in Use**

**Start on different port:**
```powershell
python -m http.server 8001
```
Then visit: http://localhost:8001

### **Problem: Module Not Found (crypto, flask, etc.)**

**Install dependencies:**
```powershell
pip install -r requirements.txt
```

Or manually:
```powershell
pip install Flask Flask-CORS pycryptodome
```

### **Problem: CORS Error When Accessing API**

- Make sure Flask backend is running on port 5000
- Make sure frontend is running on port 8000
- They're already configured to work together

---

## 📊 EXPECTED LAYOUT

```
VS Code Screen:
┌─────────────────────────────────────────────┐
│ File Explorer | Code Editor                 │
│ ├─ epayment_system/                         │
│ │  ├─ app.py                                │
│ │  ├─ crypto.py                             │
│ │  ├─ index.html                            │
│ │  └─ script.js                             │
│ │                                            │
│ Code area showing your files                │
├─────────────────────────────────────────────┤
│ Terminal #1: powershell                  │ │
│ PS> python app.py                           │
│  * Running on http://127.0.0.1:5000 ✓     │
├─ Terminal #2: powershell (split) ─────────┤
│ PS> python -m http.server 8000              │
│ Serving HTTP on 0.0.0.0 port 8000 ✓       │
└─────────────────────────────────────────────┘
```

---

## 🌍 BROWSER SETUP

### **Browser Window 1: Application (MAIN)**
```
URL: http://localhost:8000
Displays: Login page → Dashboard → Crypto Simulator
```

### **Browser Window 2: API (Optional - for reference)**
```
URL: http://localhost:5000
Displays: API status page
```

---

## 🎓 CRYPTO SIMULATOR WALKTHROUGH

Once you're logged in, go to **Crypto Simulator** tab to see:

### **1. AES Encryption Tab**
- Enter message to encrypt
- Enter password
- Click "Encrypt"
- See step-by-step encryption process:
  - Step 1: Original plaintext
  - Step 2: Key derivation
  - Step 3: Random IV generation
  - Step 4: AES encryption
  - Step 5: Base64 encoding

### **2. HMAC Tab**
- Enter message
- Enter K1 key
- Click "Generate HMAC"
- See HMAC generation process
- Click "Verify HMAC" to see verification

### **3. Biometric Tab**
- Switch between Password, Fingerprint, Face ID
- See authentication flow for each method
- Password flow is interactive, biometric is for future

### **4. Timestamp Tab**
- Click to generate current timestamp
- See how timestamp prevents replay attacks
- Shows how each transaction has unique key

### **5. Full Flow Tab**
- Enter transaction details
- See complete 10-step transaction flow
- From client to server encryption/decryption

---

## 🛠️ USEFUL COMMANDS

### **Python Environment**

**Check Python version:**
```powershell
python --version
```

**Check installed packages:**
```powershell
pip list
```

**Install requirements:**
```powershell
pip install -r requirements.txt -q
```

**Run specific file:**
```powershell
python crypto.py
```

### **Flask Specific**

**Debug mode (not recommended for production):**
```powershell
$env:FLASK_ENV = 'development'
python app.py
```

**Specify different port:**
Edit `app.py` and change the port line

### **HTTP Server**

**Run on different port:**
```powershell
python -m http.server 9000
```

**Run with logging:**
```powershell
python -m http.server 8000 -v
```

---

## 🚨 STOP THE SERVERS

### **To stop Flask backend (Terminal 1):**
- Press `Ctrl + C`
- Wait 1-2 seconds

**Output:**
```
^C
```

### **To stop HTTP server (Terminal 2):**
- Press `Ctrl + C`
- Wait 1-2 seconds

### **To stop everything:**
- Close VS Code terminal window
- Or press `Ctrl + C` in each terminal tab
- Or close VS Code entirely

---

## 📝 QUICK REFERENCE CARD

```
╔════════════════════════════════════════════════╗
║       E-PAYMENT SYSTEM - QUICK START          ║
╠════════════════════════════════════════════════╣
║ 1. Open VS Code Terminal: Ctrl + `            ║
║ 2. Navigate: cd epayment_system               ║
║ 3. Run backend: python app.py                 ║
║    (or: .\run.ps1)                            ║
║ 4. New terminal: Ctrl + Shift + `             ║
║ 5. Run frontend: python -m http.server 8000   ║
║ 6. Open: http://localhost:8000                ║
║ 7. Login & explore Crypto Simulator           ║
╠════════════════════════════════════════════════╣
║ Backend:   http://localhost:5000              ║
║ Frontend:  http://localhost:8000              ║
║ Simulator: Dashboard → Crypto Simulator       ║
╚════════════════════════════════════════════════╝
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] VS Code is open
- [ ] Terminal is open (Ctrl + `)
- [ ] Navigated to epayment_system folder
- [ ] Flask backend running on localhost:5000
- [ ] HTTP server running on localhost:8000
- [ ] Browser opened to http://localhost:8000
- [ ] Logged in successfully
- [ ] Crypto Simulator visible in sidebar
- [ ] Can interact with simulator tabs
- [ ] Can see encryption/decryption flows

---

## 🎉 YOU'RE ALL SET!

The e-payment system with interactive crypto simulator is now running!

**Next Steps:**
1. Log in to the application
2. Navigate to "Crypto Simulator" in the sidebar
3. Explore each visualization tab
4. Watch how encryption, HMAC, biometric, and timestamp work in real-time
5. Try the "Full Flow" tab to see complete transaction process

**Need Help?**
- Check terminal for error messages
- Look at this guide's troubleshooting section
- Check ENCRYPTION_FRAMEWORK.md for technical details

---

**Last Updated:** April 25, 2026
**Status:** ✅ Ready to Run
