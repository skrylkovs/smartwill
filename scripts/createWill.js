const { ethers } = require("hardhat");
require("dotenv").config();
const { saveDeployedContract } = require("../utils/saveContract");

// Константа - адрес SmartWillFactory
const FACTORY_ADDRESS = "0xecd3348A4889021364B91528241FB676119d8A6A";

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log("👤 Создание завещания от:", deployer.address);
    console.log("💸 Баланс:", ethers.formatEther(balance), "ETH");

    // Подключаемся к фабрике
    console.log("🔄 Подключаемся к SmartWillFactory по адресу:", FACTORY_ADDRESS);
    const Factory = await ethers.getContractFactory("SmartWillFactory");
    const factory = Factory.attach(FACTORY_ADDRESS);

    // Параметры для создания SmartWill
    const heir = "0x0Db16194f9906d62f7C3953A3E46C5AB47bcF1e5"; // 🔁 Замените на настоящий адрес наследника
    const heirName = "Иванов Иван Иванович"; // 🔁 Замените на ФИО наследника
    const heirRole = "Сын"; // 🔁 Замените на роль наследника
    const transferAmount = ethers.parseEther("0.0001");
    const transferFrequency = 60 * 3; // 3 минуты
    const waitingPeriod = 60 * 5; // 5 минут
    const limit = ethers.parseEther("0.005");

    console.log("📤 Отправка транзакции на создание SmartWill...");
    const tx = await factory.createSmartWill(
        heir,
        heirName,
        heirRole,
        transferAmount,
        transferFrequency,
        waitingPeriod,
        limit,
        { value: limit }
    );

    console.log("⏳ Ожидаем подтверждения транзакции...");
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "WillCreated");

    if (event) {
        const willAddress = event.args.willAddress;
        console.log("✅ Новый SmartWill создан по адресу:", willAddress);
        saveDeployedContract(willAddress, "SmartWill");
    } else {
        console.error("⚠️ Не удалось получить адрес контракта из события");
    }
}

main().catch((error) => {
    console.error("❌ Ошибка создания завещания:", error);
    process.exit(1);
}); 