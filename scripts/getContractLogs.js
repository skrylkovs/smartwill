const hre = require("hardhat");
const { ethers } = hre;
const { formatEther } = ethers;
const { getContractAddress } = require("./utils");

async function main() {
    const contractAddress = getContractAddress();
    console.log(`🔹 Читаем события контракта: ${contractAddress}`);

    const SmartWill = await ethers.getContractFactory("SmartWill");
    const contract = SmartWill.attach(contractAddress);

    // Получаем и выводим события PING
    await printEventLogs(contract, "PingSent", "📜 История PING", event =>
        `🟢 Владелец: ${event.args.owner} | Дата: ${formatTimestamp(event.args.timestamp)}`
    );

    // Получаем и выводим события перевода средств
    await printEventLogs(contract, "FundsTransferred", "💸 История переводов", event =>
        `💰 Наследник: ${event.args.heir} | Сумма: ${formatEther(event.args.amount)} ETH | Дата: ${formatTimestamp(event.args.timestamp)}`
    );
}

// Функция для форматирования даты из BigInt в строку
function formatTimestamp(timestamp) {
    return new Date(Number(timestamp) * 1000).toLocaleString();
}

// Универсальная функция для получения и вывода логов событий
async function printEventLogs(contract, eventName, title, formatFn) {
    const filter = contract.filters[eventName]();
    const events = await contract.queryFilter(filter);

    console.log(`\n${title}:`);
    if (events.length === 0) {
        console.log("🚫 Нет событий.");
        return;
    }

    events.forEach(event => console.log(formatFn(event)));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});