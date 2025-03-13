// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SmartWill.sol";

contract SmartWillFactory {
    address[] public deployedWills;

    event WillCreated(address indexed willAddress, address indexed owner);

    function createSmartWill(
        address heir,
        uint256 transferAmount,
        uint256 transferFrequency,
        uint256 willActivateWaitingPeriod
    ) external payable {
        SmartWill newWill = new SmartWill{value: msg.value}(
            heir,
            transferAmount,
            transferFrequency,
            willActivateWaitingPeriod
        );

        deployedWills.push(address(newWill));
        emit WillCreated(address(newWill), msg.sender);
    }

    function getDeployedWills() external view returns (address[] memory) {
        return deployedWills;
    }
}