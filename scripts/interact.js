const hre = require("hardhat");
const { uploadCoffeeData } = require("./ipfsHelper");
require("dotenv").config();

async function main() {
	console.log("Interacting with CoffeeSupplyChain contract...");

	const contractAddress = process.env.CONTRACT_ADDRESS;

	if (!contractAddress) {
		throw new Error("Please set CONTRACT_ADDRESS in .env file");
	}

	// Get contract instance
	const CoffeeSupplyChain = await hre.ethers.getContractFactory("CoffeeSupplyChain");
	const contract = CoffeeSupplyChain.attach(contractAddress);

	const [owner, farmer, processor, distributor, retailer, consumer] = await hre.ethers.getSigners();

	console.log("\n1. Authorizing users...");

	// Authorize users with roles
	await contract.connect(owner).authorizeUser(farmer.address, 0); // Farmer
	console.log("Farmer authorized:", farmer.address);

	await contract.connect(owner).authorizeUser(processor.address, 1); // Processor
	console.log("Processor authorized:", processor.address);

	await contract.connect(owner).authorizeUser(distributor.address, 2); // Distributor
	console.log("Distributor authorized:", distributor.address);

	await contract.connect(owner).authorizeUser(retailer.address, 3); // Retailer
	console.log("Retailer authorized:", retailer.address);

	await contract.connect(owner).authorizeUser(consumer.address, 4); // Consumer
	console.log("Consumer authorized:", consumer.address);

	console.log("\n2. Adding coffee item...");

	// Prepare coffee data
	const coffeeData = {
		batchNumber: "VN-2024-001",
		coffeeType: "Arabica",
		quantity: 1000,
		origin: "Da Lat, Vietnam",
		farmLocation: "Lam Dong Province",
		harvestDate: new Date().toISOString(),
		altitude: "1500m",
		variety: "Catimor",
		processingMethod: "Washed",
		certifications: ["Organic", "Fair Trade"],
		notes: "Premium quality Vietnamese coffee",
	};

	// Upload to IPFS
	console.log("Uploading metadata to IPFS...");
	const ipfsHash = await uploadCoffeeData(coffeeData);
	console.log("IPFS Hash:", ipfsHash);

	// Add coffee to blockchain
	const tx = await contract
		.connect(farmer)
		.addCoffeeItem(coffeeData.batchNumber, coffeeData.coffeeType, coffeeData.quantity, ipfsHash);

	const receipt = await tx.wait();
	console.log("Coffee added! Transaction:", receipt.hash);

	// Get coffee ID from event
	const event = receipt.logs.find((log) => {
		try {
			return contract.interface.parseLog(log).name === "CoffeeItemAdded";
		} catch (e) {
			return false;
		}
	});

	const coffeeId = event ? contract.interface.parseLog(event).args.coffeeId : 1n;
	console.log("Coffee ID:", coffeeId.toString());

	console.log("\n3. Updating stages...");

	// Stage 1: Processed
	console.log("\nProcessing coffee...");
	await contract.connect(processor).updateStage(
		coffeeId,
		1, // Processed
		ipfsHash,
		"Coffee processed and ready for packaging",
	);
	console.log("Stage updated to: Processed");

	// Stage 2: Packaged
	console.log("\nPackaging coffee...");
	await contract.connect(processor).updateStage(
		coffeeId,
		2, // Packaged
		ipfsHash,
		"Coffee packaged in 1kg bags",
	);
	console.log("Stage updated to: Packaged");

	// Stage 3: Distributed
	console.log("\nDistributing coffee...");
	await contract.connect(distributor).updateStage(
		coffeeId,
		3, // Distributed
		ipfsHash,
		"Coffee distributed to retailers",
	);
	console.log("Stage updated to: Distributed");

	// Stage 4: Retailed
	console.log("\nRetailing coffee...");
	await contract.connect(retailer).updateStage(
		coffeeId,
		4, // Retailed
		ipfsHash,
		"Coffee available for sale",
	);
	console.log("Stage updated to: Retailed");

	console.log("\n4. Getting coffee details...");
	const details = await contract.getCoffeeDetails(coffeeId);
	console.log("Coffee Details:");
	console.log("  Batch:", details.batchNumber);
	console.log("  Type:", details.coffeeType);
	console.log("  Quantity:", details.quantity.toString(), "kg");
	console.log("  Stage:", details.currentStage);
	console.log("  Farmer:", details.farmer);
	console.log("  Processor:", details.processor);
	console.log("  Distributor:", details.distributor);
	console.log("  Retailer:", details.retailer);
	console.log("  IPFS Hash:", details.ipfsHash);

	console.log("\n5. Getting stage history...");
	const history = await contract.getStageHistory(coffeeId);
	console.log("Stage History:");
	history.forEach((stage, index) => {
		console.log(`  ${index + 1}. Stage ${stage.stage} - ${stage.notes}`);
		console.log(`     Actor: ${stage.actor}`);
		console.log(`     Time: ${new Date(Number(stage.timestamp) * 1000).toLocaleString()}`);
	});

	console.log("\n6. Verifying authenticity...");
	const [isAuthentic, message] = await contract.verifyAuthenticity(coffeeId);
	console.log("Is Authentic:", isAuthentic);
	console.log("Message:", message);

	console.log("\n✅ Demo completed successfully!");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
