// Use require for Hardhat to avoid TypeScript import issues
const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");
const path = require("path");

// Import types for better TypeScript support
/** @type {import('hardhat/types').HardhatRuntimeEnvironment} */
const typedHre = hre;

async function main() {
  try {
    // Compile contracts
    console.log("Compiling contracts...");
    await typedHre.run('compile');
    console.log("Compilation complete!");

    // Get the contract factory
    console.log("Deploying Escrow contract...");
    const Escrow = await typedHre.ethers.getContractFactory("Escrow");
    
    // Deploy the contract
    const escrow = await Escrow.deploy();
    await escrow.deployed();
    
    const escrowAddress = escrow.address;
    console.log(`✅ Escrow contract deployed to: ${escrowAddress}`);

    // Get network info
    const [deployer] = await typedHre.ethers.getSigners();
    const network = await typedHre.ethers.provider.getNetwork();

    // Prepare contract address data
    const contractAddresses = {
      [Number(network.chainId)]: {
        Escrow: escrowAddress,
      },
      Escrow: escrow.address,
      network: (await ethers.provider.getNetwork()).name,
      chainId: (await ethers.provider.getNetwork()).chainId,
    };

    // Save the contract address to a file
    const contractsDir = path.join(__dirname, "..", "src", "contracts");
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }

    const addressFilePath = path.join(contractsDir, "escrow-address.json");
    fs.writeFileSync(
      addressFilePath,
      JSON.stringify(contractAddresses, null, 2)
    );
    
    console.log(`📝 Contract address saved to: ${path.relative(process.cwd(), addressFilePath)}`);
    
    return {
      escrowAddress: escrow.address,
      escrow,
    };
  } catch (error) {
    console.error("Error deploying Escrow contract:", error);
    process.exit(1);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
