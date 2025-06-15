
# 🚖 Decentralized Rideshare MVP – Project Summary

## 🎯 Goal
Develop a **high-performance, decentralized car-hailing MVP** within **1.5 months**, focusing on **mobile UX**, **on-chain payments**, and **real-time features** — without the overhead of learning or managing MongoDB/Firebase.

---

## 🧱 Finalized Tech Stack

### 📱 Frontend
- **React Native** (via **Expo**)
- **EAS CLI** for Android builds (Windows environment)
- `react-navigation` with `DrawerNavigator` (for sidebar layout)
- **WalletConnect** + **Ethers.js** for wallet auth and contract interaction
- **Map SDK**: Mapbox or Google Maps
- **Push Notifications**: Expo Notifications or OneSignal

### ⛓️ Blockchain
- **Solidity** smart contracts on **Polygon Mumbai testnet**
- **Hardhat** for contract dev/testing
- **RPC Provider**: Alchemy or Infura

### 🛠️ Backend (No DB)
- **Node.js + Express**
- **Socket.io** for real-time updates
- **In-memory JS objects** as temporary data store (no MongoDB or Firebase)
- **Hosted on**: Render or Railway

---

## 🗓️ Development Timeline (6 Weeks)

| Week | Focus                          | Key Deliverables                          |
|------|---------------------------------|-------------------------------------------|
| 1    | Setup & Architecture            | Project scaffolding, navigation, contract interface |
| 2    | Smart Contracts + Backend       | Core contract functions, API routes       |
| 3    | Frontend Integration            | Wallet login, screens, contract & API calls |
| 4    | Ride Logic + Real-Time          | End-to-end ride flow with sockets         |
| 5    | UX Polish + Testing             | Edge cases, animations, notifications     |
| 6    | Deployment + Demo               | Build APK, deploy backend, finalize demo  |

---

## 🧠 Strategy Notes
- **Performance prioritized** over decentralization purity
- **No traditional DB** — replaced with in-memory backend logic
- Real-time updates via Socket.io, and on-chain data for ride verification and payments
- Future enhancements may include DB for analytics/history, but omitted for MVP simplicity
