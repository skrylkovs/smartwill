// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SmartWill {
    address public owner;
    address public heir;
    uint256 public transferAmount;
    uint256 public transferFrequency;
    uint256 public willActivateWaitingPeriod;
    uint256 public createdAt;

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
        createdAt = block.timestamp;
    }

    // Функция для перевода средств наследнику
    // Теперь вызывается только из фабрики через checkAndTransfer
    function transferToHeir() external returns (bool) {
        require(address(this).balance >= transferAmount, "Not enough balance");
        
        // Переводим средства наследнику
        payable(heir).transfer(transferAmount);
        emit FundsTransferred(heir, transferAmount, block.timestamp);
        return true;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}