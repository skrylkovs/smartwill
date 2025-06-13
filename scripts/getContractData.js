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
    const heirName = await contract.heirName();
    const heirRole = await contract.heirRole();
    const transferAmount = await contract.transferAmount();
    const transferFrequency = Number(await contract.transferFrequency());
    const willActivateWaitingPeriod = Number(await contract.willActivateWaitingPeriod());
    const createdAt = Number(await contract.createdAt());
    const limit = await contract.limit();

    // Читаем баланс контракта
    const balance = await ethers.provider.getBalance(contractAddress);

    console.log("🔹 Данные контракта:");
    console.log(`🕰 Дата создания контракта: ${new Date(createdAt * 1000).toLocaleString()}`);
    console.log(`👤 Кошелек наследника: ${heir}`);
    console.log(`📋 ФИО наследника: ${heirName}`);
    console.log(`🏷️ Роль наследника: ${heirRole}`);
    console.log(`💰 Сумма регулярного перевода: ${formatEther(transferAmount)} ETH`);
    console.log(`⏳ Частота выплат: ${transferFrequency / 60} минут`);
    console.log(`📅 Период ожидания: ${willActivateWaitingPeriod / 60} минут`);
    console.log(`💎 Лимит: ${formatEther(limit)} ETH`);
    console.log(`🏦 Баланс контракта: ${formatEther(balance)} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});