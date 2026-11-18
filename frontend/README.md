# StackProof DApp

Connect a wallet, sign a message, and get a JSON proof that anyone can verify, even without a wallet.

## How it works

1. The app builds a readable message (address, chain ID, timestamp, random nonce) and asks the wallet to sign it with `personal_sign` (EIP-191).
2. The result is a JSON with `payload`, `message` and `signature`.
3. Verification checks that the message matches the payload fields exactly (so they cannot be edited) and that the signature belongs to `payload.address` (viem `verifyMessage`).

Everything runs in the browser. Nothing is sent on-chain or to a server. The last proof is kept in `localStorage`.

Limits worth knowing: verification covers wallets that sign as an EOA. Smart-contract wallets (ERC-1271) would need an on-chain check.

## Tech

React 18, Vite, TypeScript (strict), viem, Vitest.

## Structure

```
src/
  components/   Button, Card, Field
  lib/
    wallet.ts   injected provider, connection, error messages
    proof.ts    message building, signing, parsing, verification (+ proof.test.ts)
  styles/       index.css, app.css
  App.tsx
```

## Scripts

```bash
npm install
npm run dev         # local server
npm test            # unit tests
npm run typecheck
npm run build
npm run deploy      # publishes dist/ to GitHub Pages
```

Built by Laura Moyano.
