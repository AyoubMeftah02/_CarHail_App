const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;

describe("Escrow Contract", function () {
  let escrow;
  let passenger;
  let driver;
  let passengerAddress;
  let driverAddress;

  beforeEach(async function () {
    [passenger, driver] = await ethers.getSigners();
    passengerAddress = await passenger.getAddress();
    driverAddress = await driver.getAddress();
    
    const EscrowFactory = await ethers.getContractFactory("Escrow", passenger);
    escrow = await EscrowFactory.deploy(driverAddress);
    await escrow.waitForDeployment();
  });

  it("should set passenger and driver correctly", async function () {
    expect(await escrow.passenger()).to.equal(passengerAddress);
    expect(await escrow.driver()).to.equal(driverAddress);
  });
});
