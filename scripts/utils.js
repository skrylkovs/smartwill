const fs = require("fs");
const path = require("path");

const CONTRACTS_FILE = path.join(__dirname, "../database/contracts.json");

// Функция получения последнего адреса контракта
function getContractAddress() {
    try {
        if (!fs.existsSync(CONTRACTS_FILE)) {
            throw new Error("❌ Ошибка: contracts.json не найден.");
        }

        const contractData = JSON.parse(fs.readFileSync(CONTRACTS_FILE, "utf8"));
        if (!Array.isArray(contractData) || contractData.length === 0) {
            throw new Error("❌ Ошибка: contracts.json пуст или имеет неверный формат.");
        }

        return contractData[contractData.length - 1].contract_id;
    } catch (error) {
        console.error("❌ Ошибка чтения contracts.json:", error.message);
        process.exit(1);
    }
}

module.exports = { getContractAddress };