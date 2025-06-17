// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * @title Escrow
 * @dev A simple escrow contract for a car-hailing DApp
 */
contract Escrow {
    address public passenger;
    address public driver;
    uint256 public amount;
    bool public isCompleted;

    event Deposited(address indexed passenger, uint256 amount);
    event Released(address indexed driver, uint256 amount);
    event Refunded(address indexed passenger, uint256 amount);

    error NotPassenger();
    error NotDriver();
    error AlreadyCompleted();

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

    constructor(address _driver) {
        passenger = msg.sender;
        driver = _driver;
    }

    /**
     * @dev Deposit ETH into escrow
     */
    function deposit() external payable onlyPassenger notCompleted {
        amount += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @dev Approve release of funds to the driver
     */
    function approveRelease() external onlyPassenger notCompleted {
        isCompleted = true;
        (bool success, ) = driver.call{value: amount}("");
        require(success, "Transfer failed");
        emit Released(driver, amount);
    }

    /**
     * @dev Refund the passenger
     */
    function refund() external onlyDriver notCompleted {
        isCompleted = true;
        (bool success, ) = passenger.call{value: amount}("");
        require(success, "Refund failed");
        emit Refunded(passenger, amount);
    }
}