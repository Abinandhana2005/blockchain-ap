async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const ResumeSwarm = await ethers.getContractFactory("ResumeSwarmLearning");
    const contract = await ResumeSwarm.deploy();
    
    await contract.deployed();
    
    console.log("\n✓ Contract deployed to:", contract.address);
    console.log("\n=== SAVE THIS ADDRESS ===");
    console.log("Contract Address:", contract.address);
    console.log("======================\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });