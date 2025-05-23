const { ethers } = require("hardhat");
require("dotenv").config();
const { saveDeployedContract } = require("../utils/saveContract");

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log("👤 Деплой от:", deployer.address);
    console.log("💸 Баланс:", ethers.formatEther(balance), "ETH");

    // Шаг 1: Деплой фабрики
    console.log("🚀 Деплоим SmartWillFactory...");
    const Factory = await ethers.getContractFactory("SmartWillFactory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✅ Фабрика развернута по адресу:", factoryAddress);
    saveDeployedContract(factoryAddress, "SmartWillFactory");

    // Шаг 2: Создание SmartWill через фабрику
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
    console.error("❌ Ошибка деплоя:", error);
    process.exit(1);
});