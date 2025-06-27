// Use require for Hardhat to avoid TypeScript import issues
import hre from 'hardhat';
const { ethers } = hre;
import fs from 'fs';
import path from 'path';

// Import types for better TypeScript support
/** @type {import('hardhat/types').HardhatRuntimeEnvironment} */
const typedHre = hre;

async function main() {
  try {
    // Compile contracts
    console.log('Compiling contracts...');
    await typedHre.run('compile');
    console.log('Compilation complete!');

    // Get signers
    const [deployer, driver] = await ethers.getSigners();
    console.log('Deployer address:', deployer.address);
    console.log('Driver address:', driver.address);

    // Get the contract factory
    console.log('Deploying Escrow contract...');
    const Escrow = await ethers.getContractFactory('Escrow');

    // Deploy the contract with constructor parameters
    // releaseTimeout: 1 hour (3600 seconds)
    // refundTimeout: 2 hours (7200 seconds)
    const releaseTimeout = 3600; // 1 hour
    const refundTimeout = 7200; // 2 hours

    const escrow = await Escrow.deploy(
      driver.address,
      releaseTimeout,
      refundTimeout,
    );
    await escrow.waitForDeployment();

    const escrowAddress = await escrow.getAddress();
    console.log(`✅ Escrow contract deployed to: ${escrowAddress}`);

    // Get network info
    const network = await ethers.provider.getNetwork();

    // Prepare contract address data
    const contractAddresses = {
      [Number(network.chainId)]: {
        Escrow: escrowAddress,
      },
      Escrow: escrowAddress,
      network: network.name,
      chainId: Number(network.chainId),
      deployer: deployer.address,
      driver: driver.address,
      releaseTimeout,
      refundTimeout,
    };

    // Save the contract address to a file
    const contractsDir = path.join(__dirname, '..', 'src', 'contracts');
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }

    const addressFilePath = path.join(contractsDir, 'escrow-address.json');
    fs.writeFileSync(
      addressFilePath,
      JSON.stringify(contractAddresses, null, 2),
    );

    console.log(
      `📝 Contract address saved to: ${path.relative(process.cwd(), addressFilePath)}`,
    );

    return {
      escrowAddress,
      escrow,
      deployer: deployer.address,
      driver: driver.address,
    };
  } catch (error) {
    console.error('Error deploying Escrow contract:', error);
    process.exit(1);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
