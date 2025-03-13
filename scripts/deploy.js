const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const CONTRACTS_FILE = path.join(__dirname, "../database/contracts.json");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const SmartWill = await hre.ethers.getContractFactory("SmartWill");
    const contract = await SmartWill.deploy(
        "0x0Db16194f9906d62f7C3953A3E46C5AB47bcF1e5", // Наследник (поменяй при деплое!)
        hre.ethers.parseEther("0.01"), // Сумма выплат
        30 * 24 * 60 * 60, // Частота переводов (30 дней)
        60 * 24 * 60 * 60, // Период ожидания (60 дней)
        { value: hre.ethers.parseEther("0.01") } // Начальный депозит
    );

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log("✅ SmartWill deployed at:", contractAddress);

    saveContractAddress(contractAddress);
}

function saveContractAddress(contractAddress) {
    let contracts = [];
    if (fs.existsSync(CONTRACTS_FILE)) {
        contracts = JSON.parse(fs.readFileSync(CONTRACTS_FILE, "utf8"));
    }
    contracts.push({ contract_id: contractAddress });

    fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(contracts, null, 2));
    console.log("✅ Контракт сохранён в database/contracts.json");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});