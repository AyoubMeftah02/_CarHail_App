// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;


contract Escrow {
    address public passenger;
    address public driver;
    uint256 public amount;
    bool public isCompleted;
    uint256 public depositTimestamp;
    uint256 public releaseTimeout;
    uint256 public refundTimeout;

    event Deposited(address indexed passenger, uint256 amount);
    event Released(address indexed driver, uint256 amount);
    event Refunded(address indexed passenger, uint256 amount);

    error NotPassenger();
    error NotDriver();
    error AlreadyCompleted();
    error TimeoutNotReached();

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

    /**
     * @dev Constructor sets the driver and initializes timeouts.
     * @param _driver Address of the driver.
     * @param _releaseTimeout Timeout in seconds after which driver can auto-claim.
     * @param _refundTimeout Timeout in seconds after which passenger can auto-refund.
     */
    constructor(address _driver, uint256 _releaseTimeout, uint256 _refundTimeout) {
        passenger = msg.sender;
        driver = _driver;
        releaseTimeout = _releaseTimeout;
        refundTimeout = _refundTimeout;
    }

    /**
     * @dev Deposit ETH into escrow by passenger.
     * Records deposit timestamp.
     */
    function deposit() external payable onlyPassenger notCompleted {
        amount += msg.value;
        depositTimestamp = block.timestamp;
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @dev Passenger approves release of funds to driver before timeout.
     */
    function approveRelease() external onlyPassenger notCompleted {
        require(block.timestamp < depositTimestamp + releaseTimeout, "Release timeout passed");
        isCompleted = true;
        (bool success, ) = driver.call{value: amount}("");
        require(success, "Transfer failed");
        emit Released(driver, amount);
    }

    /**
     * @dev Driver refunds passenger before refund timeout.
     */
    function refund() external onlyDriver notCompleted {
        require(block.timestamp < depositTimestamp + refundTimeout, "Refund timeout passed");
        isCompleted = true;
        (bool success, ) = passenger.call{value: amount}("");
        require(success, "Refund failed");
        emit Refunded(passenger, amount);
    }

    /**
     * @dev Driver can auto-release funds after releaseTimeout.
     */
    function autoRelease() external onlyDriver notCompleted {
        require(block.timestamp >= depositTimestamp + releaseTimeout, "Release timeout not reached");
        isCompleted = true;
        (bool success, ) = driver.call{value: amount}("");
        require(success, "Auto release failed");
        emit Released(driver, amount);
    }

    /**
     * @dev Passenger can auto-refund funds after refundTimeout.
     */
    function autoRefund() external onlyPassenger notCompleted {
        require(block.timestamp >= depositTimestamp + refundTimeout, "Refund timeout not reached");
        isCompleted = true;
        (bool success, ) = passenger.call{value: amount}("");
        require(success, "Auto refund failed");
        emit Refunded(passenger, amount);
    }
}