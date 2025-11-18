const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoffeeSupplyChain", function () {
	let coffeeSupplyChain;
	let owner;
	let farmer;
	let processor;
	let distributor;
	let retailer;
	let consumer;

	beforeEach(async function () {
		[owner, farmer, processor, distributor, retailer, consumer] = await ethers.getSigners();

		const CoffeeSupplyChain = await ethers.getContractFactory("CoffeeSupplyChain");
		coffeeSupplyChain = await CoffeeSupplyChain.deploy();
		await coffeeSupplyChain.waitForDeployment();
	});

	describe("Deployment", function () {
		it("Should set the right owner", async function () {
			expect(await coffeeSupplyChain.owner()).to.equal(owner.address);
		});

		it("Should authorize owner by default", async function () {
			expect(await coffeeSupplyChain.isUserAuthorized(owner.address)).to.be.true;
		});
	});

	describe("User Authorization", function () {
		it("Should authorize users with roles", async function () {
			await coffeeSupplyChain.authorizeUser(farmer.address, 0); // Farmer
			expect(await coffeeSupplyChain.isUserAuthorized(farmer.address)).to.be.true;
			expect(await coffeeSupplyChain.getUserRole(farmer.address)).to.equal(0);
		});

		it("Should revoke user authorization", async function () {
			await coffeeSupplyChain.authorizeUser(farmer.address, 0);
			await coffeeSupplyChain.revokeUser(farmer.address);
			expect(await coffeeSupplyChain.isUserAuthorized(farmer.address)).to.be.false;
		});

		it("Should only allow owner to authorize users", async function () {
			await expect(
				coffeeSupplyChain.connect(farmer).authorizeUser(processor.address, 1),
			).to.be.revertedWithCustomError(coffeeSupplyChain, "OwnableUnauthorizedAccount");
		});
	});

	describe("Coffee Item Management", function () {
		beforeEach(async function () {
			await coffeeSupplyChain.authorizeUser(farmer.address, 0);
			await coffeeSupplyChain.authorizeUser(processor.address, 1);
			await coffeeSupplyChain.authorizeUser(distributor.address, 2);
			await coffeeSupplyChain.authorizeUser(retailer.address, 3);
			await coffeeSupplyChain.authorizeUser(consumer.address, 4);
		});

		it("Should add a coffee item", async function () {
			const tx = await coffeeSupplyChain
				.connect(farmer)
				.addCoffeeItem("VN-2024-001", "Arabica", 1000, "QmTestHash123");

			await expect(tx)
				.to.emit(coffeeSupplyChain, "CoffeeItemAdded")
				.withArgs(
					1,
					"VN-2024-001",
					farmer.address,
					await ethers.provider.getBlock("latest").then((b) => b.timestamp),
				);

			const coffee = await coffeeSupplyChain.getCoffeeDetails(1);
			expect(coffee.batchNumber).to.equal("VN-2024-001");
			expect(coffee.coffeeType).to.equal("Arabica");
			expect(coffee.quantity).to.equal(1000);
			expect(coffee.currentStage).to.equal(0); // Harvested
		});

		it("Should only allow farmers to add coffee", async function () {
			await expect(
				coffeeSupplyChain.connect(processor).addCoffeeItem("VN-2024-001", "Arabica", 1000, "QmTestHash123"),
			).to.be.revertedWith("Only farmers can add coffee");
		});

		it("Should update coffee stage", async function () {
			await coffeeSupplyChain.connect(farmer).addCoffeeItem("VN-2024-001", "Arabica", 1000, "QmTestHash123");

			await coffeeSupplyChain.connect(processor).updateStage(
				1,
				1, // Processed
				"QmTestHash456",
				"Coffee processed",
			);

			const coffee = await coffeeSupplyChain.getCoffeeDetails(1);
			expect(coffee.currentStage).to.equal(1); // Processed
			expect(coffee.processor).to.equal(processor.address);
		});

		it("Should track stage history", async function () {
			await coffeeSupplyChain.connect(farmer).addCoffeeItem("VN-2024-001", "Arabica", 1000, "QmTestHash123");

			await coffeeSupplyChain.connect(processor).updateStage(1, 1, "QmTestHash456", "Coffee processed");

			const history = await coffeeSupplyChain.getStageHistory(1);
			expect(history.length).to.equal(2);
			expect(history[0].stage).to.equal(0); // Harvested
			expect(history[1].stage).to.equal(1); // Processed
		});

		it("Should verify coffee authenticity", async function () {
			await coffeeSupplyChain.connect(farmer).addCoffeeItem("VN-2024-001", "Arabica", 1000, "QmTestHash123");

			const [isAuthentic, message] = await coffeeSupplyChain.verifyAuthenticity(1);
			expect(isAuthentic).to.be.true;
			expect(message).to.equal("Coffee is authentic");
		});

		it("Should get total coffee items", async function () {
			await coffeeSupplyChain.connect(farmer).addCoffeeItem("VN-2024-001", "Arabica", 1000, "QmTestHash123");

			await coffeeSupplyChain.connect(farmer).addCoffeeItem("VN-2024-002", "Robusta", 500, "QmTestHash456");

			const total = await coffeeSupplyChain.getTotalCoffeeItems();
			expect(total).to.equal(2);
		});
	});

	describe("Stage Validation", function () {
		beforeEach(async function () {
			await coffeeSupplyChain.authorizeUser(farmer.address, 0);
			await coffeeSupplyChain.authorizeUser(processor.address, 1);
			await coffeeSupplyChain.authorizeUser(distributor.address, 2);

			await coffeeSupplyChain.connect(farmer).addCoffeeItem("VN-2024-001", "Arabica", 1000, "QmTestHash123");
		});

		it("Should not allow skipping stages", async function () {
			await expect(
				coffeeSupplyChain.connect(distributor).updateStage(
					1,
					3, // Distributed (skipping Processed and Packaged)
					"QmTestHash456",
					"Invalid",
				),
			).to.be.revertedWith("Invalid stage transition");
		});

		it("Should enforce role-based stage updates", async function () {
			await expect(
				coffeeSupplyChain.connect(distributor).updateStage(
					1,
					1, // Processed (should be done by processor)
					"QmTestHash456",
					"Invalid",
				),
			).to.be.revertedWith("Only processor can process");
		});
	});
});
