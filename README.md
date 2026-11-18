# StackProof

Web3 portfolio project: sign a message with your wallet, get a portable JSON proof, and verify it locally. No gas, no server.

**Live demo:** https://laura-m-stack.github.io/stackproof/

## What is in this repo

```
stackproof/
├── frontend/   # The live app (React + Vite + TypeScript + viem)
└── contracts/  # Solidity contract + Hardhat tests (not used by the live app)
```

**`frontend/`** is the demo that is deployed. It uses EIP-191 message signing (`personal_sign`) and verifies with viem. It never sends a transaction and does not call any contract.

**`contracts/`** holds `StackProof.sol`, a minimal on-chain version of the idea (one proof per address, emitted as an event), with Hardhat tests. It is a separate experiment: the frontend is not wired to it.

## Run it

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173/stackproof/
npm test           # proof generation / verification tests
npm run typecheck
```

```bash
cd contracts
npm install
npx hardhat test
```

## Built by

Laura Moyano.
