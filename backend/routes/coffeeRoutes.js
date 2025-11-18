const express = require("express");
const router = express.Router();
const blockchainService = require("../services/blockchainService");
const ipfsService = require("../services/ipfsService");

// Stage names mapping
const STAGE_NAMES = {
	0: "Harvested",
	1: "Processed",
	2: "Packaged",
	3: "Distributed",
	4: "Retailed",
	5: "Consumed",
};

/**
 * POST /api/coffee/add
 * Add new coffee item
 */
router.post("/add", async (req, res) => {
	try {
		const { batchNumber, coffeeType, quantity, metadata, privateKey } = req.body;

		// Validate required fields
		if (!batchNumber || !coffeeType || !quantity || !privateKey) {
			return res.status(400).json({
				error: "Missing required fields",
				required: ["batchNumber", "coffeeType", "quantity", "privateKey"],
			});
		}

		// Upload metadata to IPFS
		const ipfsResult = await ipfsService.uploadJSON({
			batchNumber,
			coffeeType,
			quantity,
			...metadata,
			timestamp: new Date().toISOString(),
		});

		// Add to blockchain
		const result = await blockchainService.addCoffeeItem(
			batchNumber,
			coffeeType,
			quantity,
			ipfsResult.hash,
			privateKey,
		);

		res.json({
			success: true,
			coffeeId: result.coffeeId,
			transactionHash: result.transactionHash,
			ipfsHash: ipfsResult.hash,
			ipfsUrl: ipfsResult.url,
		});
	} catch (error) {
		console.error("Error adding coffee:", error);
		res.status(500).json({
			error: "Failed to add coffee item",
			message: error.message,
		});
	}
});

/**
 * GET /api/coffee/:id
 * Get coffee details
 */
router.get("/:id", async (req, res) => {
	try {
		const coffeeId = req.params.id;

		// Get details from blockchain
		const details = await blockchainService.getCoffeeDetails(coffeeId);

		// Get metadata from IPFS
		let metadata = null;
		if (details.ipfsHash) {
			try {
				metadata = await ipfsService.get(details.ipfsHash);
			} catch (error) {
				console.error("Error fetching IPFS metadata:", error);
			}
		}

		res.json({
			success: true,
			coffee: {
				...details,
				stageName: STAGE_NAMES[details.currentStage],
				metadata,
			},
		});
	} catch (error) {
		console.error("Error getting coffee details:", error);
		res.status(500).json({
			error: "Failed to get coffee details",
			message: error.message,
		});
	}
});

/**
 * PUT /api/coffee/:id/stage
 * Update coffee stage
 */
router.put("/:id/stage", async (req, res) => {
	try {
		const coffeeId = req.params.id;
		const { newStage, notes, metadata, privateKey } = req.body;

		if (newStage === undefined || !privateKey) {
			return res.status(400).json({
				error: "Missing required fields",
				required: ["newStage", "privateKey"],
			});
		}

		// Upload metadata to IPFS
		const ipfsResult = await ipfsService.uploadJSON({
			stage: newStage,
			notes: notes || "",
			...metadata,
			timestamp: new Date().toISOString(),
		});

		// Update on blockchain
		const result = await blockchainService.updateStage(
			coffeeId,
			newStage,
			ipfsResult.hash,
			notes || "",
			privateKey,
		);

		res.json({
			success: true,
			transactionHash: result.transactionHash,
			newStage,
			stageName: STAGE_NAMES[newStage],
			ipfsHash: ipfsResult.hash,
		});
	} catch (error) {
		console.error("Error updating stage:", error);
		res.status(500).json({
			error: "Failed to update stage",
			message: error.message,
		});
	}
});

/**
 * GET /api/coffee/:id/history
 * Get stage history
 */
router.get("/:id/history", async (req, res) => {
	try {
		const coffeeId = req.params.id;

		const history = await blockchainService.getStageHistory(coffeeId);

		// Enrich with metadata from IPFS
		const enrichedHistory = await Promise.all(
			history.map(async (stage) => {
				let metadata = null;
				if (stage.ipfsHash) {
					try {
						metadata = await ipfsService.get(stage.ipfsHash);
					} catch (error) {
						console.error("Error fetching IPFS metadata:", error);
					}
				}

				return {
					...stage,
					stageName: STAGE_NAMES[stage.stage],
					date: new Date(stage.timestamp * 1000).toISOString(),
					metadata,
				};
			}),
		);

		res.json({
			success: true,
			history: enrichedHistory,
		});
	} catch (error) {
		console.error("Error getting history:", error);
		res.status(500).json({
			error: "Failed to get history",
			message: error.message,
		});
	}
});

/**
 * GET /api/coffee/:id/verify
 * Verify coffee authenticity
 */
router.get("/:id/verify", async (req, res) => {
	try {
		const coffeeId = req.params.id;

		const result = await blockchainService.verifyAuthenticity(coffeeId);

		res.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error("Error verifying authenticity:", error);
		res.status(500).json({
			error: "Failed to verify authenticity",
			message: error.message,
		});
	}
});

/**
 * GET /api/coffee/stats/total
 * Get total coffee items
 */
router.get("/stats/total", async (req, res) => {
	try {
		const total = await blockchainService.getTotalCoffeeItems();

		res.json({
			success: true,
			total,
		});
	} catch (error) {
		console.error("Error getting total:", error);
		res.status(500).json({
			error: "Failed to get total",
			message: error.message,
		});
	}
});

module.exports = router;
