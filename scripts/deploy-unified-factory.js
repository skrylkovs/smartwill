const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Деплоим единую фабрику SmartWillFactory для всех пользователей...");
    
    // Получаем деплоера
    const [deployer] = await ethers.getSigners();
    console.log("📝 Деплоер:", deployer.address);
    console.log("💰 Баланс деплоера:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    
    // Деплоим фабрику
    const SmartWillFactory = await ethers.getContractFactory("SmartWillFactory");
    console.log("⏳ Деплойим контракт...");
    
    const factory = await SmartWillFactory.deploy();
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("✅ SmartWillFactory задеплоена по адресу:", factoryAddress);
    
    // Выводим информацию для обновления конфигурации
    console.log("\n📋 ВАЖНО: Обновите конфигурацию приложения:");
    console.log("=========================================");
    console.log("В файле smart-will-ui/src/App.tsx замените:");
    console.log(`FACTORY_ADDRESS: "${factoryAddress}"`);
    console.log("=========================================\n");
    
    // Проверяем, что контракт корректно задеплоен
    try {
        const deployedWills = await factory.getDeployedWills();
        console.log("✅ Контракт корректно задеплоен. Начальное количество завещаний:", deployedWills.length);
    } catch (error) {
        console.error("❌ Ошибка при проверке контракта:", error.message);
    }
    
    // Выводим ссылки для Arbiscan
    const network = await deployer.provider.getNetwork();
    if (network.chainId === 421614n) { // Arbitrum Sepolia
        console.log("🔗 Ссылка на Arbiscan Sepolia:");
        console.log(`https://sepolia.arbiscan.io/address/${factoryAddress}`);
    } else if (network.chainId === 42161n) { // Arbitrum Mainnet  
        console.log("🔗 Ссылка на Arbiscan:");
        console.log(`https://arbiscan.io/address/${factoryAddress}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Ошибка деплоя:", error);
        process.exit(1);
    }); 