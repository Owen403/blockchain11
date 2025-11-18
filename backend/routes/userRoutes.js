const express = require("express");
const router = express.Router();
const blockchainService = require("../services/blockchainService");

// Role names mapping
const ROLE_NAMES = {
	0: "Farmer",
	1: "Processor",
	2: "Distributor",
	3: "Retailer",
	4: "Consumer",
};

/**
 * POST /api/users/authorize
 * Authorize a user with a role
 */
router.post("/authorize", async (req, res) => {
	try {
		const { userAddress, role, privateKey } = req.body;

		if (!userAddress || role === undefined || !privateKey) {
			return res.status(400).json({
				error: "Missing required fields",
				required: ["userAddress", "role", "privateKey"],
			});
		}

		// Validate role
		if (role < 0 || role > 4) {
			return res.status(400).json({
				error: "Invalid role",
				validRoles: ROLE_NAMES,
			});
		}

		const result = await blockchainService.authorizeUser(userAddress, role, privateKey);

		res.json({
			success: true,
			userAddress,
			role,
			roleName: ROLE_NAMES[role],
			transactionHash: result.transactionHash,
		});
	} catch (error) {
		console.error("Error authorizing user:", error);
		res.status(500).json({
			error: "Failed to authorize user",
			message: error.message,
		});
	}
});

/**
 * GET /api/users/:address/role
 * Get user role
 */
router.get("/:address/role", async (req, res) => {
	try {
		const userAddress = req.params.address;

		const role = await blockchainService.getUserRole(userAddress);

		res.json({
			success: true,
			userAddress,
			role,
			roleName: ROLE_NAMES[role],
		});
	} catch (error) {
		console.error("Error getting user role:", error);
		res.status(500).json({
			error: "Failed to get user role",
			message: error.message,
		});
	}
});

/**
 * GET /api/users/:address/authorized
 * Check if user is authorized
 */
router.get("/:address/authorized", async (req, res) => {
	try {
		const userAddress = req.params.address;

		const isAuthorized = await blockchainService.isUserAuthorized(userAddress);

		res.json({
			success: true,
			userAddress,
			isAuthorized,
		});
	} catch (error) {
		console.error("Error checking authorization:", error);
		res.status(500).json({
			error: "Failed to check authorization",
			message: error.message,
		});
	}
});

/**
 * GET /api/users/roles
 * Get all available roles
 */
router.get("/roles", (req, res) => {
	res.json({
		success: true,
		roles: ROLE_NAMES,
	});
});

module.exports = router;
