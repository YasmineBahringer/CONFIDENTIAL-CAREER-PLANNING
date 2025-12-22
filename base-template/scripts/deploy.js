const { ethers } = require("hardhat");

/**
 * Deploy FHECounter contract
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network sepolia
 */
async function main() {
  console.log("\n🚀 Starting deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);

  // Get deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy FHECounter
  console.log("📦 Deploying FHECounter...");
  const FHECounter = await ethers.getContractFactory("FHECounter");
  const counter = await FHECounter.deploy();

  await counter.waitForDeployment();
  const counterAddress = await counter.getAddress();

  console.log("✅ FHECounter deployed to:", counterAddress);

  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await counter.deploymentTransaction().wait(3);

  console.log("\n✨ Deployment completed successfully!");
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract: FHECounter");
  console.log("Address:", counterAddress);
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    contract: "FHECounter",
    address: counterAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment.json\n");

  // Verification instructions
  if (network.name === "sepolia") {
    console.log("📝 To verify on Etherscan, run:");
    console.log(`npx hardhat verify --network sepolia ${counterAddress}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
