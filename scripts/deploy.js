/* eslint-disable no-console */
const hre = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment...");
    
    // Check if PRIVATE_KEY is set
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is not set in .env file");
    }

    // Get signers
    const [deployer] = await hre.ethers.getSigners();
    if (!deployer || !deployer.address) {
      throw new Error("Failed to get deployer address. Check your PRIVATE_KEY in .env");
    }
    console.log("Deployer address:", deployer.address);

    // Get driver address
    const driver = process.env.DRIVER || process.env.DRIVER_ADDRESS;
    if (!driver) {
      throw new Error("Please set DRIVER environment variable with the driver's address");
    }
    console.log("Driver address:", driver);

    // Configurable timeouts (in seconds)
    const releaseTimeout = process.env.RELEASE_TIMEOUT || 3600; // 1 hour
    const refundTimeout = process.env.REFUND_TIMEOUT || 7200;  // 2 hours
    console.log("Using timeouts - Release:", releaseTimeout, "seconds, Refund:", refundTimeout, "seconds");

    console.log("Deploying Escrow contract...");
    const Escrow = await hre.ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(driver, releaseTimeout, refundTimeout);
    
    console.log("Waiting for deployment confirmation...");
    await escrow.waitForDeployment();
    
    const contractAddress = await escrow.getAddress();
    console.log("\n✅ Escrow deployed to:", contractAddress);
    console.log("Network:", hre.network.name);
    console.log("\nYou can verify the contract with:");
    console.log(`npx hardhat verify --network sepolia ${contractAddress} "${driver}" ${releaseTimeout} ${refundTimeout}`);
    
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run the deployment
main();
