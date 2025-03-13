// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SmartWill {
    address public owner;
    address public heir;
    uint256 public transferAmount;
    uint256 public transferFrequency;
    uint256 public willActivateWaitingPeriod;
    uint256 public lastPing;
    uint256 public createdAt;

    event PingSent(address indexed owner, uint256 timestamp);
    event FundsTransferred(address indexed heir, uint256 amount, uint256 timestamp);

    constructor(
        address _heir,
        uint256 _transferAmount,
        uint256 _transferFrequency,
        uint256 _willActivateWaitingPeriod
    ) payable {
        require(msg.value >= _transferAmount, "Not enough ETH to fund the will");

        owner = msg.sender;
        heir = _heir;
        transferAmount = _transferAmount;
        transferFrequency = _transferFrequency;
        willActivateWaitingPeriod = _willActivateWaitingPeriod;
        lastPing = block.timestamp;
        createdAt = block.timestamp;
    }

    function ping() external {
        require(msg.sender == owner, "Only the owner can send a ping");
        lastPing = block.timestamp;
        emit PingSent(owner, block.timestamp);
    }

    function checkAndTransfer() external {
        require(block.timestamp > lastPing + willActivateWaitingPeriod, "Will is still active");
        require(address(this).balance >= transferAmount, "Not enough balance");

        payable(heir).transfer(transferAmount);
        lastPing = block.timestamp; // Reset to avoid sending everything at once
        emit FundsTransferred(heir, transferAmount, block.timestamp);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}