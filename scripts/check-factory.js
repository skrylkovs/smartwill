const { ethers } = require("hardhat");

async function main() {
    // Адрес текущей фабрики
    const FACTORY_ADDRESS = "0xA2089BB69C5263c6B8476f509Ec4C6B00878A155";
    
    // Подключаемся к фабрике
    const factoryAbi = [
        "function getDeployedWills() external view returns (address[] memory)",
        "function getMyWills() external view returns (address[] memory)",
        "function ownerToWills(address owner) external view returns (address[] memory)",
        "function willToOwner(address will) external view returns (address)",
        "function isWillOwner(address willAddress, address user) external view returns (bool)"
    ];
    
    const [signer] = await ethers.getSigners();
    const factory = new ethers.Contract(FACTORY_ADDRESS, factoryAbi, signer);
    
    console.log("🔍 === ДИАГНОСТИКА ФАБРИКИ ЗАВЕЩАНИЙ ===");
    console.log("🏭 Адрес фабрики:", FACTORY_ADDRESS);
    console.log("👤 Адрес аккаунта:", await signer.getAddress());
    console.log("");
    
    try {
        // Проверяем общее количество завещаний
        const allWills = await factory.getDeployedWills();
        console.log("📊 Всего завещаний в фабрике:", allWills.length);
        console.log("🔗 Адреса завещаний:", allWills);
        console.log("");
        
        // Проверяем завещания текущего пользователя
        try {
            const myWills = await factory.getMyWills();
            console.log("✅ Мои завещания:", myWills.length);
            console.log("📄 Адреса моих завещаний:", myWills);
        } catch (error) {
            console.error("❌ Ошибка при получении моих завещаний:", error.message);
        }
        console.log("");
        
        // Проверяем владельцев всех завещаний
        if (allWills.length > 0) {
            console.log("👥 === ВЛАДЕЛЬЦЫ ЗАВЕЩАНИЙ ===");
            for (let i = 0; i < allWills.length; i++) {
                try {
                    const owner = await factory.willToOwner(allWills[i]);
                    console.log(`📋 Завещание ${i + 1}:`);
                    console.log(`   Адрес: ${allWills[i]}`);
                    console.log(`   Владелец: ${owner}`);
                    console.log(`   Это мое: ${owner.toLowerCase() === (await signer.getAddress()).toLowerCase()}`);
                } catch (error) {
                    console.log(`❌ Ошибка при получении владельца завещания ${allWills[i]}:`, error.message);
                }
            }
        }
        
    } catch (error) {
        console.error("💥 Общая ошибка:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Фатальная ошибка:", error);
        process.exit(1);
    }); 