const { ethers } = require("hardhat");
require("dotenv").config();
const { saveDeployedContract } = require("../utils/saveContract");

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log("👤 Деплой от:", deployer.address);
    console.log("💸 Баланс:", ethers.formatEther(balance), "ETH");

    const factoryAddress = '0x4Acc5767812147106a51E5b8292151A136eC81ba';
    
    // Получаем ABI фабрики
    const SmartWillFactory = await ethers.getContractFactory("SmartWillFactory");
    const factory = SmartWillFactory.attach(factoryAddress);
    
    console.log("🏭 Адрес фабрики:", factoryAddress);

    // Параметры для создания SmartWill
    const heir = "0x0Db16194f9906d62f7C3953A3E46C5AB47bcF1e5"; // 🔁 Замените на настоящий адрес наследника
    const transferAmount = ethers.parseEther("0.0001"); // Сумма для перевода наследнику
    const transferFrequency = 60 * 3; // 3 минуты
    const waitingPeriod = 60 * 5; // 5 минут
    const deposit = ethers.parseEther("0.005"); // Начальный депозит

    console.log("📝 Параметры завещания:");
    console.log("- Наследник:", heir);
    console.log("- Сумма перевода:", ethers.formatEther(transferAmount), "ETH");
    console.log("- Частота переводов:", transferFrequency, "секунд");
    console.log("- Период ожидания:", waitingPeriod, "секунд");
    console.log("- Начальный депозит:", ethers.formatEther(deposit), "ETH");

    try {
        console.log("📤 Отправка транзакции на создание SmartWill...");
        const tx = await factory.createSmartWill(
            heir,
            transferAmount,
            transferFrequency,
            waitingPeriod,
            { value: deposit }
        );

        console.log("⏳ Ожидание подтверждения транзакции...");
        const receipt = await tx.wait();
        
        const event = receipt.logs.find(log => {
            try {
                return factory.interface.parseLog(log)?.name === "WillCreated";
            } catch {
                return false;
            }
        });

        if (event) {
            const parsedLog = factory.interface.parseLog(event);
            const willAddress = parsedLog.args.willAddress;
            console.log("✅ Новый SmartWill создан по адресу:", willAddress);
            await saveDeployedContract(willAddress, "SmartWill");
        } else {
            console.error("⚠️ Не удалось получить адрес контракта из события");
        }
    } catch (error) {
        console.error("❌ Ошибка при создании завещания:");
        console.error(error.message || error);
        if (error.data) {
            console.error("Дополнительная информация:", error.data);
        }
    }
}

main().catch((error) => {
    console.error("❌ Ошибка выполнения скрипта:", error);
    process.exit(1);
});