const hre = require("hardhat");

async function main() {
    const Voting = await hre.ethers.getContractFactory('Voting');

    const voting = await Voting.deploy(["Alice", "Bob", "Charlie"]);
    await voting.waitForDeployment();
    
    const contractAddress = await voting.getAddress(); // Await the address retrieval
    console.log("Contract deployed at:", contractAddress);
}

main();
