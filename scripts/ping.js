const { ethers } = require("hardhat");

// Константа - адрес SmartWillFactory
const FACTORY_ADDRESS = "0xecd3348A4889021364B91528241FB676119d8A6A";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Отправка PING от: ${deployer.address}`);

    // Подключаемся к фабрике
    console.log(`🔄 Подключаемся к SmartWillFactory по адресу: ${FACTORY_ADDRESS}`);
    const Factory = await ethers.getContractFactory("SmartWillFactory");
    const factory = Factory.attach(FACTORY_ADDRESS);

    console.log("📤 Отправка PING...");
    const tx = await factory.ping();
    console.log("⏳ Ожидаем подтверждения транзакции...");
    await tx.wait();
    console.log("✅ PING отправлен успешно!");
    
    // Получаем последний ping
    const lastPing = await factory.getLastPing();
    const timestamp = new Date(Number(lastPing) * 1000);
    console.log(`📅 Последний PING: ${timestamp.toLocaleString()}`);
}

main().catch((error) => {
    console.error("❌ Ошибка отправки PING:", error);
    process.exit(1);
});