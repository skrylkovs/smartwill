const fs = require("fs");
const path = require("path");

const DATABASE_DIR = path.join(__dirname, "../database"); // ✅ Путь к папке
const CONTRACTS_FILE = path.join(DATABASE_DIR, "contracts.json"); // ✅ Файл контрактов

// Функция проверки и создания `database/contracts.json`, если его нет
function ensureContractsFileExists() {
    try {
        if (!fs.existsSync(DATABASE_DIR)) {
            fs.mkdirSync(DATABASE_DIR, { recursive: true }); // ✅ Создаём директорию, если её нет
            console.log("📁 Директория database создана.");
        }

        if (!fs.existsSync(CONTRACTS_FILE)) {
            fs.writeFileSync(CONTRACTS_FILE, JSON.stringify([])); // ✅ Создаём пустой JSON, если файла нет
            console.log("📄 Файл contracts.json создан.");
        }
    } catch (error) {
        console.error("❌ Ошибка при создании database/contracts.json:", error.message);
        process.exit(1);
    }
}

// Функция получения последнего контракт-адреса
function getLastContractAddress() {
    ensureContractsFileExists(); // ✅ Проверяем наличие файла перед чтением

    try {
        const contractData = JSON.parse(fs.readFileSync(CONTRACTS_FILE, "utf8"));
        if (!Array.isArray(contractData) || contractData.length === 0) {
            throw new Error("❌ Ошибка: contracts.json пуст или имеет неверный формат.");
        }

        return contractData[contractData.length - 1].contract_id; // ✅ Берем последний контракт
    } catch (error) {
        console.error("❌ Ошибка чтения contracts.json:", error.message);
        process.exit(1);
    }
}

// Функция получения текущего адреса контракта
function getContractAddress() {
    return getLastContractAddress();
}

// Функция сохранения нового контракта в contracts.json
function saveContractAddress(contractAddress) {
    ensureContractsFileExists(); // ✅ Проверяем, что файл существует

    let contracts = [];

    try {
        const data = fs.readFileSync(CONTRACTS_FILE, "utf8");
        contracts = JSON.parse(data);
    } catch (error) {
        console.error("⚠ Ошибка чтения contracts.json:", error.message);
    }

    contracts.push({ contract_id: contractAddress });

    try {
        fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(contracts, null, 2));
        console.log("✅ Контракт сохранён в database/contracts.json");
    } catch (error) {
        console.error("⚠ Ошибка записи в contracts.json:", error.message);
    }
}

module.exports = { getLastContractAddress, getContractAddress, saveContractAddress };