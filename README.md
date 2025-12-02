# ⚡ Solana Jito DEX Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat\u0026logo=typescript\u0026logoColor=white)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?style=flat\u0026logo=solana\u0026logoColor=white)](https://solana.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat\u0026logo=react\u0026logoColor=61DAFB)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Fast and secure token swap platform on Solana blockchain with Jito MEV protection and Raydium DEX integration.

[🇷🇺 Русская версия](README_RU.md) | [🇬🇧 English](README.md)

---

## 🎯 Overview

Solana Jito DEX Platform is a high-performance decentralized exchange interface built on Solana blockchain. The platform leverages Jito bundles for MEV (Maximal Extractable Value) protection and integrates with Raydium DEX for optimal token swaps.

### ✨ Key Features

- ⚡ **Lightning-fast swaps** via Raydium DEX pools
- 🛡️ **MEV protection** using Jito bundles
- 🎯 **Limit order support** for price-targeted trading
- 💰 **Real-time balance tracking** for SOL and SPL tokens
- 📊 **Live price feeds** from Raydium pools
- 🔄 **Automatic transaction confirmation** checking
- 🎨 **Modern React UI** with TailwindCSS

---

## 🏗️ Architecture

```
Solana-Jito-DEX-Platform/
├── backend/              # TypeScript Express server
│   ├── engine/           # Swap execution engine
│   ├── jito/             # Jito bundle builder
│   ├── swap/             # Raydium integration
│   └── src/              # API endpoints
├── frontend/             # React web interface
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Helper functions
│   └── config.ts         # Blockchain configuration
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Solana wallet with SOL
- RPC endpoint (Helius, QuickNode, or public)
- (Optional) Jito authentication keys for MEV protection

### Installation

1. **Clone repository**

```bash
git clone https://github.com/yourusername/Solana-Jito-DEX-Platform.git
cd Solana-Jito-DEX-Platform
```

2. **Setup Backend**

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your private keys
```

3. **Setup Frontend**

```bash
cd ../frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your RPC URL
```

4. **Run Development Servers**

Backend:

```bash
cd backend
npm run dev
# Server starts on http://localhost:5553
```

Frontend:

```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Swap wallet private key (base58 encoded)
SWAP_WALLET_PRIVATE_KEY=your_wallet_private_key_here

# Optional: User database (temporary - replace with proper DB)
# REACT_APP_USERS={"user_id": {"wallet": "private_key"}}
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
# Jito authentication (optional, for MEV protection)
JITO_AUTH_PRIVATE_KEY=your_jito_auth_key_here
JITO_FEE_WALLET_PRIVATE_KEY=your_jito_fee_wallet_key_here

# Solana RPC URL
REACT_APP_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## 📡 API Endpoints

### POST /swap

Execute token swap with Jito bundle

**Request:**

```json
{
  "buy_token": "token_mint_address",
  "sell_token": "So11111111111111111111111111111111111111112",
  "amount": 0.1,
  "slippage": 100,
  "jito_fees": 0.0001,
  "rpc_https_url": "https://api.mainnet-beta.solana.com",
  "id_user": "user_identifier"
}
```

**Response:**

```json
{
  "error": null,
  "bundle": "bundle_hash",
  "transactions": ["tx_signature"],
  "confirmed": true
}
```

### POST /balance

Get token balance for wallet

### POST /price

Fetch current pool price

### POST /confirm

Check transaction confirmation status

### POST /pricepotok

Start price monitoring worker for limit orders

### POST /terminate

Stop active price monitoring worker

---

## 🔧 Tech Stack

**Backend:**

- TypeScript + Express.js
- Solana Web3.js
- Raydium SDK
- Jito TypeScript SDK
- Worker threads for async operations

**Frontend:**

- React 18 + TypeScript
- TailwindCSS
- Axios for API calls
- React Router
- js-cookie for session management

**Blockchain:**

- Solana mainnet-beta
- Raydium AMM pools
- Jito block engine
- SPL Token program

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This software is provided "as is" for educational purposes. Use at your own risk. Always verify transactions and never share private keys.

- **Not financial advice** - Do your own research
- **Testnet first** - Test thoroughly before mainnet
- **Risk awareness** - DeFi involves financial risk

---

**Built with ❤️ for the Solana ecosystem**
