// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SmartWill {
    address public owner;
    address public heir;
    uint public transferAmount;
    uint public transferFrequency;
    uint public willActivateWaitingPeriod;
    uint public lastPing;
    uint public createdAt; // ✅ Дата создания контракта

    event PingSent(address indexed owner, uint timestamp);
    event FundsTransferred(address indexed heir, uint amount, uint timestamp);

    constructor(
        address _heir,
        uint _transferAmount,
        uint _transferFrequency,
        uint _willActivateWaitingPeriod
    ) payable {
        require(msg.value >= _transferAmount, "Insufficient initial balance");
        owner = msg.sender;
        heir = _heir;
        transferAmount = _transferAmount;
        transferFrequency = _transferFrequency * 1 minutes;
        willActivateWaitingPeriod = _willActivateWaitingPeriod * 1 minutes;
        lastPing = block.timestamp;
        createdAt = block.timestamp; // ✅ Фиксируем дату деплоя
    }

    function ping() public {
        require(msg.sender == owner, "Only owner can ping");
        lastPing = block.timestamp;
        emit PingSent(owner, lastPing);
    }

    function checkAndTransfer() public {
        require(block.timestamp >= lastPing + willActivateWaitingPeriod, "Will not activated yet");
        require(address(this).balance >= transferAmount, "Insufficient balance");

        lastPing = block.timestamp;
        payable(heir).transfer(transferAmount);
        emit FundsTransferred(heir, transferAmount, block.timestamp);
    }

    receive() external payable {}
}