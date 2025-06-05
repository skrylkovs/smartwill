const hre = require("hardhat");
const { ethers } = hre;
const { formatEther } = ethers;
const { getContractAddress } = require("./utils");

async function main() {
    const contractAddress = getContractAddress();
    console.log(`🔹 Reading contract events: ${contractAddress}`);

    const SmartWill = await ethers.getContractFactory("SmartWill");
    const contract = SmartWill.attach(contractAddress);

    // Get and display PING events
    await printEventLogs(contract, "PingSent", "📜 PING History", event =>
        `🟢 Owner: ${event.args.owner} | Date: ${formatTimestamp(event.args.timestamp)}`
    );

    // Get and display fund transfer events
    await printEventLogs(contract, "FundsTransferred", "💸 Transfer History", event =>
        `💰 Heir: ${event.args.heir} | Amount: ${formatEther(event.args.amount)} ETH | Date: ${formatTimestamp(event.args.timestamp)}`
    );
}

// Function to format date from BigInt to string
function formatTimestamp(timestamp) {
    return new Date(Number(timestamp) * 1000).toLocaleString();
}

// Universal function to get and display event logs
async function printEventLogs(contract, eventName, title, formatFn) {
    const filter = contract.filters[eventName]();
    const events = await contract.queryFilter(filter);

    console.log(`\n${title}:`);
    if (events.length === 0) {
        console.log("🚫 No events.");
        return;
    }

    events.forEach(event => console.log(formatFn(event)));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});