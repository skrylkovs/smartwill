// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SmartWill.sol";

contract SmartWillFactory {
    address[] public deployedWills;

    // Отображение адреса пользователя на время его последнего пинга
    mapping(address => uint256) public lastPings;

    // Отображение владельца на массив его завещаний
    mapping(address => address[]) public ownerToWills;

    // Отображение адреса завещания на владельца
    mapping(address => address) public willToOwner;

    event WillCreated(address indexed willAddress, address indexed owner);
    event PingSent(address indexed owner, uint256 timestamp);

    function createSmartWill(
        address heir,
        string memory heirName,
        string memory heirRole,
        uint256 transferAmount,
        uint256 transferFrequency,
        uint256 willActivateWaitingPeriod,
        uint256 limit
    ) external payable {
        SmartWill newWill = new SmartWill{value: msg.value}(
            heir,
            heirName,
            heirRole,
            transferAmount,
            transferFrequency,
            willActivateWaitingPeriod,
            limit
        );

        address willAddress = address(newWill);
        deployedWills.push(willAddress);

        // Записываем связь владельца с завещанием
        ownerToWills[msg.sender].push(willAddress);
        willToOwner[willAddress] = msg.sender;

        // Инициализируем lastPing для отправителя, если это его первое завещание
        if (lastPings[msg.sender] == 0) {
            lastPings[msg.sender] = block.timestamp;
        }

        emit WillCreated(willAddress, msg.sender);
    }

    function getDeployedWills() external view returns (address[] memory) {
        return deployedWills;
    }

    // Безопасный метод для получения завещаний текущего пользователя
    function getMyWills() external view returns (address[] memory) {
        return ownerToWills[msg.sender];
    }

    // Метод для получения завещаний конкретного владельца (только для владельца)
    function getWillsOf(address owner) external view returns (address[] memory) {
        require(msg.sender == owner, "You can only view your own wills");
        return ownerToWills[owner];
    }

    // Проверка, является ли пользователь владельцем завещания
    function isWillOwner(address willAddress, address user) external view returns (bool) {
        return willToOwner[willAddress] == user;
    }

    // Получение владельца завещания (только для самого владельца или наследника)
    function getWillOwner(address willAddress) external view returns (address) {
        address owner = willToOwner[willAddress];

        // Проверяем, что запрашивающий либо владелец, либо наследник завещания
        if (msg.sender == owner) {
            return owner;
        }

        // Проверяем, является ли запрашивающий наследником
        SmartWill will = SmartWill(willAddress);
        address heir = will.heir();
        require(msg.sender == heir, "Only owner or heir can view will owner");

        return owner;
    }

    // Метод для отправки ping от пользователя
    function ping() external {
        // Обновляем время последнего пинга пользователя
        lastPings[msg.sender] = block.timestamp;
        emit PingSent(msg.sender, block.timestamp);
    }

    // Метод для получения времени последнего ping пользователя
    function getLastPing() external view returns (uint256) {
        return lastPings[msg.sender];
    }

    // Метод для получения времени последнего ping для указанного пользователя
    function getLastPingOf(address user) external view returns (uint256) {
        return lastPings[user];
    }

    // Метод для проверки и перевода средств, если необходимо
    function checkAndTransfer(address willAddress) external {
        SmartWill will = SmartWill(willAddress);
        address owner = will.owner();
        uint256 willActivateWaitingPeriod = will.willActivateWaitingPeriod();

        // Проверяем, прошло ли достаточно времени с последнего пинга владельца
        require(block.timestamp > lastPings[owner] + willActivateWaitingPeriod, "Will is still active");

        // Получаем информацию о завещании перед переводом
        address heir = will.heir();
        uint256 transferAmount = will.transferAmount();

        // Вызываем метод перевода средств наследнику
        bool success = will.transferToHeir();
        require(success, "Transfer failed");

        // Обновляем время последнего пинга, чтобы не отправлять все средства сразу
        // Это не обязательно, так как пользователь уже не может обновить пинг

        // Эмитим событие из фабрики
        emit FundsTransferred(willAddress, heir, transferAmount, block.timestamp);
    }

    // Событие для перевода средств
    event FundsTransferred(address indexed willAddress, address indexed heir, uint256 amount, uint256 timestamp);

    // Запрещаем прямые переводы ETH на контракт без вызова функций
    receive() external payable {
        revert("Direct ETH transfers not allowed. Use createSmartWill function.");
    }

    fallback() external payable {
        revert("Invalid function call. Use createSmartWill function.");
    }
}
