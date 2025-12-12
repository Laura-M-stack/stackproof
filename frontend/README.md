# StackProof DApp

A small Web3 demo that lets a user **connect a wallet**, **sign a message**, and generate a **shareable “proof” card** (signature + address + timestamp). 

This application provides a clean and minimal interface to interact with the StackProof smart contract deployed on a local or test blockchain network.

## ✨ Features

- Wallet connection via MetaMask
- Read data from the smart contract
- Send transactions to the blockchain
- Responsive and minimal UI
- Clear separation between UI and Web3 logic

## 🧱 Tech Stack

- React
- Vite
- Ethers.js
- Web3 Wallet Integration (MetaMask)

## 📦 Project Structure

```
src/
  assets/
  components/
    Button.tsx
    Button.css
    Card.tsx
    Card.css
    Field.tsx
    Field.css
  lib/
    wallet.ts
    proof.ts
  styles/
    index.css
    app.css
  App.tsx
  main.tsx
  global.d.ts
```

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```

The app will be available at:
```
http://localhost:5173
```

## 🔗 Smart Contract Connection

The frontend interacts with the smart contract defined in:

```
src/contracts/
```

Make sure the contract is deployed and the correct:
- ABI
- Contract address
- Network

are configured before running the app.

## 🧪 Local Blockchain

For local development, this project is designed to work with:
- Hardhat local network
- MetaMask connected to `localhost:8545`

## 🎯 Purpose

This DApp was built as a **portfolio project** to demonstrate:
- Full-stack Web3 development
- Frontend ↔ smart contract interaction
- Clean React architecture
- Practical Ethereum tooling usage

---

Built by **Laura Moyano**.
