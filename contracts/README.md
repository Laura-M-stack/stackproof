# StackProof contracts

`contracts/StackProof.sol`: each address can submit one proof string, stored as a flag and emitted as a `ProofSubmitted` event. Tests live in `test/StackProof.js`.

This is a standalone experiment. The deployed frontend does not use it.

```bash
npm install
npx hardhat test
npx hardhat node                                      # local chain
npx hardhat run scripts/deploy.js --network localhost  # deploy to it
```
