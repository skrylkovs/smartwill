const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Тестирование фабрики SmartWill...");
    
    const [signer] = await ethers.getSigners();
    console.log("📝 Тестер:", signer.address);
    
    const factoryAddress = "0x5C8798C418B8613F71C7e35450307F08a9008558";
    
    // Подключаемся к фабрике
    const SmartWillFactory = await ethers.getContractFactory("SmartWillFactory");
    const factory = SmartWillFactory.attach(factoryAddress);
    
    console.log("📋 Фабрика подключена по адресу:", factoryAddress);
    
    // Тестовые параметры
    const testParams = {
        heir: ethers.getAddress("0x742d35cc6634c0532925a3b8d4c9db96590c6c87"), // Правильный checksum
        heirName: "Test Heir",
        heirRole: "Son",
        transferAmount: ethers.parseEther("0.0001"), // 0.0001 ETH
        transferFrequency: 300, // 5 минут
        willActivateWaitingPeriod: 600, // 10 минут
        limit: ethers.parseEther("0.001") // 0.001 ETH
    };
    
    console.log("📊 Тестовые параметры:");
    console.log("- Наследник:", testParams.heir);
    console.log("- Имя:", testParams.heirName);
    console.log("- Роль:", testParams.heirRole);
    console.log("- Сумма перевода:", ethers.formatEther(testParams.transferAmount), "ETH");
    console.log("- Частота:", testParams.transferFrequency, "секунд");
    console.log("- Период ожидания:", testParams.willActivateWaitingPeriod, "секунд");
    console.log("- Лимит:", ethers.formatEther(testParams.limit), "ETH");
    
    try {
        console.log("\n🚀 Создание завещания...");
        
        // Проверяем баланс
        const balance = await ethers.provider.getBalance(signer.address);
        console.log("💰 Баланс тестера:", ethers.formatEther(balance), "ETH");
        
        if (balance < testParams.limit) {
            throw new Error("Недостаточно средств для тестирования");
        }
        
        const tx = await factory.createSmartWill(
            testParams.heir,
            testParams.heirName,
            testParams.heirRole,
            testParams.transferAmount,
            testParams.transferFrequency,
            testParams.willActivateWaitingPeriod,
            testParams.limit,
            { 
                value: testParams.limit,
                gasLimit: 1000000 // Увеличенный лимит газа для диагностики
            }
        );
        
        console.log("📤 Транзакция отправлена:", tx.hash);
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            console.log("✅ Завещание успешно создано!");
            console.log("⛽ Использовано газа:", receipt.gasUsed.toString());
            
            // Ищем событие создания завещания
            const event = receipt.logs.find(log => {
                try {
                    const parsed = factory.interface.parseLog(log);
                    return parsed.name === "WillCreated";
                } catch {
                    return false;
                }
            });
            
            if (event) {
                const parsed = factory.interface.parseLog(event);
                console.log("🏠 Адрес нового завещания:", parsed.args.willAddress);
                console.log("👤 Владелец:", parsed.args.owner);
            }
        } else {
            console.log("❌ Транзакция провалилась");
        }
        
    } catch (error) {
        console.error("❌ Ошибка при создании завещания:");
        console.error(error.message);
        
        if (error.reason) {
            console.error("Причина:", error.reason);
        }
        
        if (error.transaction) {
            console.error("Детали транзакции:", error.transaction);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 