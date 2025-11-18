const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Get contract address from deployment artifact
router.get("/address", async (req, res) => {
	try {
		const artifactPath = path.join(
			__dirname,
			"../../artifacts/contracts/CoffeeSupplyChain.sol/CoffeeSupplyChain.json",
		);

		// Check if artifact exists
		if (!fs.existsSync(artifactPath)) {
			return res.status(404).json({
				success: false,
				message: "Contract artifact not found. Please deploy the contract first.",
			});
		}

		// Read deployment info from environment
		const contractAddress = process.env.CONTRACT_ADDRESS;

		if (!contractAddress) {
			return res.status(404).json({
				success: false,
				message: "Contract address not found in environment variables.",
			});
		}

		res.json({
			success: true,
			address: contractAddress,
		});
	} catch (error) {
		console.error("Error getting contract address:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get contract address",
			error: error.message,
		});
	}
});

// Get contract ABI
router.get("/abi", async (req, res) => {
	try {
		const artifactPath = path.join(
			__dirname,
			"../../artifacts/contracts/CoffeeSupplyChain.sol/CoffeeSupplyChain.json",
		);

		if (!fs.existsSync(artifactPath)) {
			return res.status(404).json({
				success: false,
				message: "Contract artifact not found.",
			});
		}

		const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

		res.json({
			success: true,
			abi: artifact.abi,
		});
	} catch (error) {
		console.error("Error getting contract ABI:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get contract ABI",
			error: error.message,
		});
	}
});

module.exports = router;
