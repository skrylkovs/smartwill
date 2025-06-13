const { ethers } = require("hardhat");

// Константа - адрес SmartWillFactory
const FACTORY_ADDRESS = "0xecd3348a4889021364b91528241fb676119d8a6a";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("👤 Выполнение checkAndTransfer от:", signer.address);
    console.log(`🔹 Адрес SmartWillFactory: ${FACTORY_ADDRESS}`);

    // Подключаемся к фабрике SmartWillFactory
    const Factory = await ethers.getContractFactory("SmartWillFactory");
    const factory = Factory.attach(FACTORY_ADDRESS);

    try {
        // Получаем все завещания, созданные через фабрику
        console.log("📋 Получаем список всех завещаний из фабрики...");
        const deployedWills = await factory.getDeployedWills();
        console.log(`📊 Найдено завещаний: ${deployedWills.length}`);

        if (deployedWills.length === 0) {
            console.log("ℹ️ Завещания не найдены в фабрике");
            return;
        }

        // Проверяем каждое завещание
        for (let i = 0; i < deployedWills.length; i++) {
            const willAddress = deployedWills[i];
            console.log(`\n🔍 Проверяем завещание ${i + 1}/${deployedWills.length}: ${willAddress}`);
            
            await checkAndTransferForWill(factory, willAddress);
        }

        console.log("\n🎉 Проверка всех завещаний завершена!");

    } catch (error) {
        console.error("❌ Ошибка при получении списка завещаний:", error.message);
        throw error;
    }
}

async function checkAndTransferForWill(factory, willAddress) {
    try {
        // Подключаемся к конкретному контракту SmartWill для получения информации
        const SmartWill = await ethers.getContractFactory("SmartWill");
        const willContract = SmartWill.attach(willAddress);

        // Получаем информацию о завещании
        const owner = await willContract.owner();
        const heir = await willContract.heir();
        const heirName = await willContract.heirName();
        const transferAmount = await willContract.transferAmount();
        const balance = await ethers.provider.getBalance(willAddress);

        console.log(`   👤 Владелец: ${owner}`);
        console.log(`   🎯 Наследник: ${heirName} (${heir})`);
        console.log(`   💰 Баланс контракта: ${ethers.formatEther(balance)} ETH`);
        console.log(`   💸 Сумма перевода: ${ethers.formatEther(transferAmount)} ETH`);

        // Проверяем, достаточно ли средств для перевода
        if (balance < transferAmount) {
            console.log(`   ⚠️ Недостаточно средств для перевода`);
            return;
        }

        // Получаем время последнего пинга владельца
        const lastPing = await factory.getLastPingOf(owner);
        const willActivateWaitingPeriod = await willContract.willActivateWaitingPeriod();
        const currentTime = Math.floor(Date.now() / 1000);
        const timeSinceLastPing = currentTime - Number(lastPing);
        const timeToActivation = Number(willActivateWaitingPeriod) - timeSinceLastPing;

        console.log(`   ⏰ Последний пинг: ${new Date(Number(lastPing) * 1000).toLocaleString()}`);
        console.log(`   ⌛ Период ожидания: ${Number(willActivateWaitingPeriod) / 60} минут`);

        if (timeToActivation > 0) {
            console.log(`   ℹ️ До активации завещания: ${Math.ceil(timeToActivation / 60)} минут`);
            return;
        }

        console.log(`   ⏳ Выполняем checkAndTransfer...`);
        
        // Вызываем checkAndTransfer из фабрики
        const tx = await factory.checkAndTransfer(willAddress);
        
        console.log(`   📤 Транзакция отправлена. Хэш: ${tx.hash}`);
        console.log(`   ⏳ Ожидаем подтверждения...`);
        
        const receipt = await tx.wait();
        console.log(`   ✅ Перевод выполнен! Gas: ${receipt.gasUsed.toString()}`);
        
        // Проверяем новый баланс
        const newBalance = await ethers.provider.getBalance(willAddress);
        console.log(`   💰 Новый баланс: ${ethers.formatEther(newBalance)} ETH`);
        
    } catch (error) {
        if (error.message.includes("Will is still active")) {
            console.log(`   ℹ️ Завещание еще активно - период ожидания не истек`);
        } else if (error.message.includes("Not enough balance")) {
            console.log(`   ⚠️ Недостаточно средств на контракте для перевода`);
        } else if (error.message.includes("Transfer failed")) {
            console.log(`   ⚠️ Не удалось выполнить перевод средств`);
        } else {
            console.error(`   ❌ Ошибка при обработке завещания ${willAddress}:`, error.message);
        }
    }
}

main().catch((error) => {
    console.error("❌ Критическая ошибка:", error);
    process.exit(1);
});