const hre = require("hardhat");

async function main() {
	console.log("Deploying CoffeeSupplyChain contract...");

	// Get the contract factory
	const CoffeeSupplyChain = await hre.ethers.getContractFactory("CoffeeSupplyChain");

	// Deploy the contract
	const coffeeSupplyChain = await CoffeeSupplyChain.deploy();

	await coffeeSupplyChain.waitForDeployment();

	const address = await coffeeSupplyChain.getAddress();

	console.log("CoffeeSupplyChain deployed to:", address);
	console.log("Save this address to your .env file as CONTRACT_ADDRESS");

	// Get deployer address
	const [deployer] = await hre.ethers.getSigners();
	console.log("Deployed by:", deployer.address);

	// Wait for a few block confirmations
	if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
		console.log("Waiting for block confirmations...");
		await coffeeSupplyChain.deploymentTransaction().wait(5);
		console.log("Contract deployed and confirmed!");

		// Verify contract on Etherscan (if on testnet/mainnet)
		console.log("\nVerifying contract on Etherscan...");
		try {
			await hre.run("verify:verify", {
				address: address,
				constructorArguments: [],
			});
			console.log("Contract verified successfully!");
		} catch (error) {
			console.log("Error verifying contract:", error.message);
		}
	}

	return address;
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
