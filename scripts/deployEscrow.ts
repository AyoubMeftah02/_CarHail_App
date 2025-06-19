import { ethers } from "ethers";
import { run } from "hardhat";
import fs from "fs";
import path from "path";

declare const process: any;

async function main() {
  // Compile contracts
  await run('compile');

  // Deploy the contract
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();

  await escrow.deployed();

  console.log("Escrow contract deployed to:", escrow.address);

  // Save the contract address to a file
  const contractsDir = path.join(__dirname, "..", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "escrow-address.json"),
    JSON.stringify({ Escrow: escrow.address }, undefined, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
