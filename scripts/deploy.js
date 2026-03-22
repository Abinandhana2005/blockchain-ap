async function main() {
  console.log("Deploying ResumeSwarmLearning contract...");

  const ResumeSwarmLearning = await ethers.getContractFactory("ResumeSwarmLearning");

  console.log("Deploying to localhost...");
  const contract = await ResumeSwarmLearning.deploy();

  await contract.deployed();

  console.log("\n✓ Contract deployed successfully!");
  console.log("Contract Address:", contract.address);
  console.log("\n=== SAVE THIS ADDRESS ===");
  console.log("Contract Address: " + contract.address);
  console.log("======================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
