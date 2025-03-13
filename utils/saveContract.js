const fs = require("fs");
const path = require("path");

const CONTRACTS_FILE = path.join(__dirname, "../database/contracts.json");

function saveDeployedContract(address, type = "SmartWill", network = "sepolia") {
    const timestamp = new Date().toISOString();
    let contracts = [];

    try {
        if (fs.existsSync(CONTRACTS_FILE)) {
            const content = fs.readFileSync(CONTRACTS_FILE, "utf8");
            contracts = JSON.parse(content);
        }
    } catch (e) {
        console.error("⚠️ Ошибка чтения файла:", e.message);
    }

    contracts.push({
        contract_id: address,
        type,
        network,
        deployed_at: timestamp
    });

    try {
        fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(contracts, null, 2));
        console.log(`📝 Контракт сохранён (${type}) в database/contracts.json`);
    } catch (e) {
        console.error("⚠️ Ошибка записи:", e.message);
    }
}

module.exports = { saveDeployedContract };