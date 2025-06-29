const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
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
    
    const EscrowFactory = await ethers.getContractFactory("Escrow");
    escrow = await EscrowFactory.deploy(driverAddress, 3600, 7200); // driver, releaseTimeout, refundTimeout
    await escrow.waitForDeployment();
  });

  it("should set passenger and driver correctly", async function () {
    expect(await escrow.passenger()).to.equal(passengerAddress);
    expect(await escrow.driver()).to.equal(driverAddress);
  });

  it("should allow passenger to deposit funds", async function () {
    const depositAmount = ethers.parseEther("1");
    await expect(
      escrow.connect(passenger).deposit({ value: depositAmount })
    )
      .to.emit(escrow, "Deposited")
      .withArgs(passengerAddress, depositAmount, anyValue);

    expect(await escrow.amount()).to.equal(depositAmount);
  });

  it("should release funds to driver with correct fee split", async function () {
    const depositAmount = ethers.parseEther("1");
    const fee = (depositAmount * 5n) / 100n; // 5%
    const driverAmount = depositAmount - fee;

    // Deposit first
    await escrow.connect(passenger).deposit({ value: depositAmount });

    // Approve release (called by passenger before timeout)
    await expect(
      escrow.connect(passenger).approveRelease()
    )
      .to.emit(escrow, "Released")
      .withArgs(driverAddress, driverAmount, fee, anyValue, anyValue);

    // Contract should be completed and amount reset
    expect(await escrow.isCompleted()).to.equal(true);
    expect(await escrow.amount()).to.equal(depositAmount); // amount variable remains but contract balance is 0
  });

  it("should refund passenger when driver calls refund before timeout", async function () {
    const depositAmount = ethers.parseEther("0.5");

    // Deposit first
    await escrow.connect(passenger).deposit({ value: depositAmount });

    // Driver refunds passenger
    await expect(
      escrow.connect(driver).refund()
    )
      .to.emit(escrow, "Refunded")
      .withArgs(passengerAddress, depositAmount, anyValue);

    expect(await escrow.isCompleted()).to.equal(true);
  });
});
