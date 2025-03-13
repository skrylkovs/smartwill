const { ethers } = require("hardhat");
const { getContractAddress } = require("./utils");

async function main() {

    const contractAddress = getContractAddress();
    console.log(`🔹 Contract address: ${contractAddress}`);

    const SmartWill = await ethers.getContractFactory("SmartWill");
    const contract = SmartWill.attach(contractAddress);

    console.log("Sending PING...");
    const tx = await contract.ping();
    await tx.wait();
    console.log("PING sent successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});