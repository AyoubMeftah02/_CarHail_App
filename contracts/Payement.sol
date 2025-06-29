// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Escrow is ReentrancyGuard {
    error NotPassenger();
    error NotDriver();
    error AlreadyCompleted();
    error ReleaseTimeoutPassed();
    error ReleaseTimeoutNotReached();
    error RefundTimeoutPassed();
    error ZeroDeposit();
    error RefundTimeoutNotReached();

    address public immutable passenger;
    address public immutable driver;
    uint256 public amount;
    bool public isCompleted;
    uint256 public depositTimestamp;
    uint256 public releaseTimeout;
    uint256 public refundTimeout;

    event Deposited(address indexed passenger, uint256 amount, uint256 timestamp);
    event Released(address indexed driver, uint256 amount, uint256 fee, address indexed feeRecipient, uint256 timestamp);
    event Refunded(address indexed passenger, uint256 amount, uint256 timestamp);

    modifier onlyPassenger() {
        if (msg.sender != passenger) revert NotPassenger();
        _;
    }

    modifier onlyDriver() {
        if (msg.sender != driver) revert NotDriver();
        _;
    }

    modifier notCompleted() {
        if (isCompleted) revert AlreadyCompleted();
        _;
    }

    constructor(address _driver, uint256 _releaseTimeout, uint256 _refundTimeout) {
        require(_driver != address(0), "Invalid driver address");
        require(_releaseTimeout > 0 && _refundTimeout > 0, "Invalid timeouts");
        passenger = msg.sender;
        driver = _driver;
        releaseTimeout = _releaseTimeout;
        refundTimeout = _refundTimeout;
    }

    function deposit() external payable onlyPassenger notCompleted nonReentrant {
        if (msg.value == 0) revert ZeroDeposit();
        amount += msg.value;
        depositTimestamp = block.timestamp;
        emit Deposited(msg.sender, msg.value, block.timestamp);
    }

    function approveRelease() external onlyPassenger notCompleted nonReentrant {
        if (block.timestamp >= depositTimestamp + releaseTimeout) revert ReleaseTimeoutPassed();
        isCompleted = true;
        uint256 fee = (amount * 5) / 100;
        uint256 driverAmount = amount - fee;
        (bool success, ) = driver.call{value: driverAmount}("");
        require(success, "Driver transfer failed");
        address platform = 0xcb7f49a123087aB9B6594A3b3169c2cc6d15797a;
        (success, ) = payable(platform).call{value: fee}("");
        require(success, "Fee transfer failed");
        emit Released(driver, driverAmount, fee, platform, block.timestamp);
    }

    function refund() external onlyDriver notCompleted nonReentrant {
        if (block.timestamp >= depositTimestamp + refundTimeout) revert RefundTimeoutPassed();
        isCompleted = true;
        (bool success, ) = passenger.call{value: amount}("");
        require(success, "Refund failed");
        emit Refunded(passenger, amount, block.timestamp);
    }

    function autoRelease() external onlyDriver notCompleted nonReentrant {
        if (block.timestamp < depositTimestamp + releaseTimeout) revert ReleaseTimeoutNotReached();
        isCompleted = true;
        uint256 fee = (amount * 5) / 100;
        uint256 driverAmount = amount - fee;
        (bool success, ) = driver.call{value: driverAmount}("");
        require(success, "Auto release failed");
        address platform = 0xcb7f49a123087aB9B6594A3b3169c2cc6d15797a;
        (success, ) = payable(platform).call{value: fee}("");
        require(success, "Fee transfer failed");
        emit Released(driver, driverAmount, fee, platform, block.timestamp);
    }

    function autoRefund() external onlyPassenger notCompleted nonReentrant {
        if (block.timestamp < depositTimestamp + refundTimeout) revert RefundTimeoutNotReached();
        isCompleted = true;
        (bool success, ) = passenger.call{value: amount}("");
        require(success, "Auto refund failed");
        emit Refunded(passenger, amount, block.timestamp);
    }
}