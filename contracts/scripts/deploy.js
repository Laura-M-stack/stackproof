const hre = require("hardhat");

async function main() {
  // Obtenemos la ContractFactory
  const StackProof = await hre.ethers.getContractFactory("StackProof");
  console.log("Deploying StackProof...");

  // Deploy del contrato
  const stackProof = await StackProof.deploy();

  // Esperar a que termine de desplegarse (v6)
  await stackProof.waitForDeployment();

  // Obtener la dirección del contrato (v6)
  const address = await stackProof.getAddress();

  console.log("✅ StackProof deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
