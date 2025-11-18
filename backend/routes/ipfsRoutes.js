const express = require("express");
const router = express.Router();
const multer = require("multer");
const ipfsService = require("../services/ipfsService");

// Configure multer for file uploads
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});

/**
 * POST /api/ipfs/upload/json
 * Upload JSON data to IPFS
 */
router.post("/upload/json", async (req, res) => {
	try {
		const data = req.body;

		if (!data || Object.keys(data).length === 0) {
			return res.status(400).json({
				error: "No data provided",
			});
		}

		const result = await ipfsService.uploadJSON(data);

		res.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error("Error uploading JSON:", error);
		res.status(500).json({
			error: "Failed to upload JSON",
			message: error.message,
		});
	}
});

/**
 * POST /api/ipfs/upload/file
 * Upload file to IPFS
 */
router.post("/upload/file", upload.single("file"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				error: "No file provided",
			});
		}

		const result = await ipfsService.uploadFile(req.file.buffer);

		res.json({
			success: true,
			filename: req.file.originalname,
			mimetype: req.file.mimetype,
			...result,
		});
	} catch (error) {
		console.error("Error uploading file:", error);
		res.status(500).json({
			error: "Failed to upload file",
			message: error.message,
		});
	}
});

/**
 * GET /api/ipfs/:hash
 * Get data from IPFS
 */
router.get("/:hash", async (req, res) => {
	try {
		const hash = req.params.hash;

		const data = await ipfsService.get(hash);

		res.json({
			success: true,
			hash,
			data,
		});
	} catch (error) {
		console.error("Error getting from IPFS:", error);
		res.status(500).json({
			error: "Failed to get data from IPFS",
			message: error.message,
		});
	}
});

/**
 * POST /api/ipfs/pin/:hash
 * Pin content to IPFS
 */
router.post("/pin/:hash", async (req, res) => {
	try {
		const hash = req.params.hash;

		const result = await ipfsService.pin(hash);

		res.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error("Error pinning to IPFS:", error);
		res.status(500).json({
			error: "Failed to pin to IPFS",
			message: error.message,
		});
	}
});

/**
 * DELETE /api/ipfs/pin/:hash
 * Unpin content from IPFS
 */
router.delete("/pin/:hash", async (req, res) => {
	try {
		const hash = req.params.hash;

		const result = await ipfsService.unpin(hash);

		res.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error("Error unpinning from IPFS:", error);
		res.status(500).json({
			error: "Failed to unpin from IPFS",
			message: error.message,
		});
	}
});

module.exports = router;
