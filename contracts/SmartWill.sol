// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SmartWill {
    address public owner;
    address public heir;
    string public heirName;
    string public heirRole;
    uint256 public transferAmount;
    uint256 public transferFrequency;
    uint256 public willActivateWaitingPeriod;
    uint256 public createdAt;
    uint256 public limit;
    uint256 public lastTransferTime;
    uint256 public lastActivity;

    event FundsTransferred(address indexed heir, uint256 amount, uint256 timestamp);
    event ActivityConfirmed(address indexed owner, uint256 timestamp);

    constructor(
        address _heir,
        string memory _heirName,
        string memory _heirRole,
        uint256 _transferAmount,
        uint256 _transferFrequency,
        uint256 _willActivateWaitingPeriod,
        uint256 _limit
    ) payable {
        require(msg.value >= _limit, "Not enough ETH to fund the will");
        require(_limit >= _transferAmount, "Limit must be greater than or equal to transfer amount");

        owner = tx.origin;
        heir = _heir;
        heirName = _heirName;
        heirRole = _heirRole;
        transferAmount = _transferAmount;
        transferFrequency = _transferFrequency;
        willActivateWaitingPeriod = _willActivateWaitingPeriod;
        limit = _limit;
        createdAt = block.timestamp;
        lastTransferTime = 0;
        lastActivity = block.timestamp;
    }

    function confirmActivity() external {
        require(msg.sender == owner, "Only owner can confirm activity");
        lastActivity = block.timestamp;
        emit ActivityConfirmed(owner, block.timestamp);
    }

    function transferToHeir() external returns (bool) {
        require(address(this).balance >= transferAmount, "Not enough balance");
        
        require(
            block.timestamp >= lastActivity + willActivateWaitingPeriod,
            "Owner is still active. Cannot transfer yet."
        );
        
        if (lastTransferTime > 0) {
            require(
                block.timestamp >= lastTransferTime + transferFrequency, 
                "Transfer frequency limit not reached yet"
            );
        }
        
        payable(heir).transfer(transferAmount);
        
        lastTransferTime = block.timestamp;
        
        emit FundsTransferred(heir, transferAmount, block.timestamp);
        return true;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getNextTransferTime() external view returns (uint256) {
        if (lastTransferTime == 0) {
            return 0;
        }
        return lastTransferTime + transferFrequency;
    }
    
    function canTransferNow() external view returns (bool) {
        bool ownerInactive = block.timestamp >= lastActivity + willActivateWaitingPeriod;
        bool frequencyPassed = (lastTransferTime == 0) || (block.timestamp >= lastTransferTime + transferFrequency);
        
        return ownerInactive && frequencyPassed;
    }
    
    function isOwnerActive() external view returns (bool) {
        return block.timestamp < lastActivity + willActivateWaitingPeriod;
    }
    
    function getNextPossibleTransferTime() external view returns (uint256) {
        uint256 activityExpiry = lastActivity + willActivateWaitingPeriod;
        uint256 nextTransferTime = (lastTransferTime == 0) ? 0 : lastTransferTime + transferFrequency;
        
        return (activityExpiry > nextTransferTime) ? activityExpiry : nextTransferTime;
    }
}