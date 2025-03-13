const hre = require("hardhat");
const { ethers } = hre;
const { formatEther } = ethers;
const { getContractAddress } = require("./utils");

async function main() {
    const contractAddress = getContractAddress();
    console.log(`🔹 Читаем данные контракта: ${contractAddress}`);

    const SmartWill = await ethers.getContractFactory("SmartWill");
    const contract = SmartWill.attach(contractAddress);

    // Читаем переменные контракта
    const heir = await contract.heir();
    const transferAmount = await contract.transferAmount();
    const transferFrequency = Number(await contract.transferFrequency());
    const willActivateWaitingPeriod = Number(await contract.willActivateWaitingPeriod());
    const lastPing = Number(await contract.lastPing());
    const createdAt = Number(await contract.createdAt()); // ✅ Получаем дату создания

    // Читаем баланс контракта
    const balance = await ethers.provider.getBalance(contractAddress);

    console.log("🔹 Данные контракта:");
    console.log(`🕰 Дата создания контракта: ${new Date(createdAt * 1000).toLocaleString()}`); // ✅ Выводим дату создания
    console.log(`👤 Наследник: ${heir}`);
    console.log(`💰 Сумма выплат: ${formatEther(transferAmount)} ETH`);
    console.log(`⏳  Частота выплат: ${transferFrequency / 60} минут`);
    console.log(`📅 Период ожидания: ${willActivateWaitingPeriod / 60} минут`);
    console.log(`📍 Последний PING: ${new Date(lastPing * 1000).toLocaleString()}`);
    console.log(`🏦 Баланс контракта: ${formatEther(balance)} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});