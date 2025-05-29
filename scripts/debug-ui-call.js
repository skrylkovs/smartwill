const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Отладка вызова из UI...");
    
    const [signer] = await ethers.getSigners();
    console.log("📝 Тестер:", signer.address);
    
    const factoryAddress = "0x5C8798C418B8613F71C7e35450307F08a9008558";
    
    // Подключаемся к фабрике
    const SmartWillFactory = await ethers.getContractFactory("SmartWillFactory");
    const factory = SmartWillFactory.attach(factoryAddress);
    
    console.log("📋 Фабрика подключена по адресу:", factoryAddress);
    
    // Имитируем точные параметры из UI
    const form = {
        heir: "0x742d35cC6634c0532925A3b8d4C9DB96590C6c87", // из UI
        heirName: "Test Heir", // из UI
        heirRole: "Son", // из UI
        transferAmount: "0.0001", // строка из UI
        frequency: "300", // строка из UI
        waitingPeriod: "600", // строка из UI
        limit: "0.001" // строка из UI
    };
    
    console.log("🔄 Конвертируем параметры как в UI...");
    
    // Конвертируем как в UI
    const transferAmountWei = ethers.parseEther(form.transferAmount);
    const frequency = Math.max(Number(form.frequency), 300); // minFrequency = 300
    const waitingPeriod = Math.max(Number(form.waitingPeriod), 600); // minWaitingPeriod = 600
    const limitWei = ethers.parseEther(form.limit);
    
    console.log("📊 Параметры для вызова:");
    console.log("- Наследник:", form.heir);
    console.log("- Имя:", form.heirName);
    console.log("- Роль:", form.heirRole);
    console.log("- transferAmount:", ethers.formatEther(transferAmountWei), "ETH");
    console.log("- frequency:", frequency, "секунд");
    console.log("- waitingPeriod:", waitingPeriod, "секунд");
    console.log("- limit:", ethers.formatEther(limitWei), "ETH");
    console.log("- value:", ethers.formatEther(limitWei), "ETH");
    
    // Проверяем соотношения
    console.log("\n🔍 Проверки:");
    console.log("- limitWei >= transferAmountWei:", limitWei >= transferAmountWei);
    console.log("- msg.value >= limit:", limitWei >= limitWei, "(всегда true)");
    
    try {
        console.log("\n🚀 Вызов createSmartWill...");
        
        // Проверяем баланс
        const balance = await ethers.provider.getBalance(signer.address);
        console.log("💰 Баланс тестера:", ethers.formatEther(balance), "ETH");
        
        if (balance < limitWei) {
            throw new Error("Недостаточно средств для тестирования");
        }
        
        const tx = await factory.createSmartWill(
            form.heir,
            form.heirName,
            form.heirRole,
            transferAmountWei,
            frequency,
            waitingPeriod,
            limitWei,
            { 
                value: limitWei,
                gasLimit: 1000000
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