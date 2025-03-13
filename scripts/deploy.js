const hre = require("hardhat");
const { parseEther } = hre.ethers;
const { saveContractAddress } = require("./utils");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    let balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance before:", hre.ethers.formatEther(balance), "ETH");

    const SmartWill = await hre.ethers.getContractFactory("SmartWill");
    const contract = await SmartWill.deploy(
        "0x0Db16194f9906d62f7C3953A3E46C5AB47bcF1e5", // Адрес наследника
        parseEther("0.000001"),
        1, // Частота выплат (1 минута)
        3, // Период ожидания (3 минуты)
        { value: parseEther("0.000005") } // Депозит (переводится от создателя контракта на адрес контракта)
    );

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log("✅ SmartWill deployed at:", contractAddress);

    // Обновляем баланс после деплоя
    balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after:", hre.ethers.formatEther(balance), "ETH");

    // ✅ Сохраняем контракт в database/contracts.json через utils.js
    saveContractAddress(contractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});