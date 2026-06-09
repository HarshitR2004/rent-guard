# 🛡️ RentGuard
> **Trustless Rental Escrow & Damage Settlement Powered by Monad and Gemini Vision.**

[![Built on Monad](https://img.shields.io/badge/Blockchain-Monad_Testnet-8B75FF?style=for-the-badge&logo=ethereum)](https://testnet.monadscan.com)
[![Gemini Vision](https://img.shields.io/badge/AI-Gemini_Vision_2.5_Flash-2EE57E?style=for-the-badge&logo=google)](https://ai.google.dev)
[![Interface](https://img.shields.io/badge/UI-Neo_Brutalist-FFDE59?style=for-the-badge)](https://github.com)

---

## 📌 The Problem
In the rental housing market, **security deposit disputes are a major friction point**. Landlords hold absolute veto power over the deposit. Upon move-out, tenants are often hit with unfair deductions for "damages" (which are frequently normal wear-and-tear or pre-existing issues). There is no unbiased, third-party source of truth.

## 💡 The Solution
**RentGuard** is an AI-powered rental escrow registry that protects both parties by creating a cryptographically secure, auditable property lifecycle.

1. **Move-In**: The tenant uploads proof-of-condition photos. The security deposit registration is logged on the **Monad blockchain** under a unique Booking ID.
2. **Move-Out**: The tenant uploads checkout photos and optionally submits a statement. 
3. **Gemini Vision** compares the move-in and move-out photos to detect new damages and estimate repair costs.
4. **On-Chain Settlement**: The final report hash, repair cost, and damage status are committed to the Monad contract, recommending a trustless refund calculation.

---

## 🏗️ Architecture & Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Tenant as Tenant / Landlord
    participant Web as React Frontend
    participant API as Express API
    participant Monad as Monad Testnet Contract
    participant Gemini as Gemini Vision API

    Note over Tenant, Monad: PHASE 1 — MOVE IN
    Tenant->>Web: Starts Move-In & Uploads Photos
    Tenant->>Web: Enters Booking ID & Deposit
    Web->>API: POST /api/move-in
    API->>Monad: registerDeposit(bookingId, depositAmount)
    Monad-->>API: Transaction Hash
    API-->>Web: Success & Tx Hash (Saved in Local Storage)

    Note over Tenant, Gemini: PHASE 2 — MOVE OUT
    Tenant->>Web: Starts Move-Out & Uploads Current Photos
    Tenant->>Web: Submits Statement ("The fan was broken")
    Web->>API: POST /api/analyze (Move-In + Move-Out Photos)
    API->>Gemini: Compare photos (Vision analysis)
    Gemini-->>API: JSON: { damageFound: true, repairCost: 150 }
    Note right of Web: Refund = Deposit - RepairCost
    Web->>API: POST /api/record-inspection
    API->>Monad: recordInspection(bookingId, reportHash, repairCost, damageFound)
    Monad-->>API: Transaction Hash
    API-->>Web: Final Verdict & Refund Displayed
```

---

## 🛠️ Tech Stack

*   **Blockchain**: **Monad Testnet** (for high throughput, sub-second finality, and low transaction costs).
*   **Smart Contracts**: **Solidity** compiled and deployed using **Remix IDE**.
*   **Vision AI**: **Gemini 1.5/2.5 Flash** (performing property condition comparisons with rigid JSON schema outputs).
*   **Frontend**: **React 19**, and **Tailwind CSS v4** (styled using custom Pop-art / Neo-Brutalist themes).
*   **Image Compression**: Client-side **HTML5 Canvas Compression** (resizes and optimizes photos to base64, keeping localStorage under limits).

---

## 📦 Smart Contract Details
Deployed on **Monad Testnet** at address:
👉 **[`0xd9145CCE52D386f254917e481eB44e9943F39138`](https://testnet.monadscan.com/address/0xd9145CCE52D386f254917e481eB44e9943F39138)**

### ABI Signature Functions
```solidity
function registerDeposit(string calldata bookingId, uint256 depositAmount) external;
function recordInspection(string calldata bookingId, bytes32 reportHash, uint256 repairCost, bool damageFound) external;
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed.

### 2. Configure Environment Variables
Create a `.env.local` file inside the `backend/` directory:
```env
# Monad Configuration
MONAD_PRIVATE_KEY=your_private_key
REGISTRY_CONTRACT_ADDRESS=0xd9145CCE52D386f254917e481eB44e9943F39138

# Gemini API Key
GEMINI_API_KEY=your_gemini_key
```

### 3. Installation
Install backend and frontend dependencies:
```bash
# In backend/
cd backend
npm install

# In frontend/
cd frontend
npm install
```

### 4. Running Locally
Start the Express server and Vite development server:
```bash
# In backend/
npm run dev

# In frontend/
npm run dev
```

---


