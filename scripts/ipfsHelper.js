const { create } = require("ipfs-http-client");
const fs = require("fs");
require("dotenv").config();

// Kết nối IPFS
const ipfs = create({
	url: process.env.IPFS_API_URL || "http://127.0.0.1:5001",
});

/**
 * Upload file lên IPFS
 */
async function uploadFile(filePath) {
	try {
		const file = fs.readFileSync(filePath);
		const result = await ipfs.add(file);

		console.log("File uploaded to IPFS");
		console.log("Hash:", result.path);
		console.log("URL:", `${process.env.IPFS_GATEWAY}/ipfs/${result.path}`);

		return result.path;
	} catch (error) {
		console.error("Error uploading file:", error);
		throw error;
	}
}

/**
 * Upload JSON data lên IPFS
 */
async function uploadJSON(data) {
	try {
		const jsonString = JSON.stringify(data);
		const result = await ipfs.add(jsonString);

		console.log("JSON uploaded to IPFS");
		console.log("Hash:", result.path);
		console.log("URL:", `${process.env.IPFS_GATEWAY}/ipfs/${result.path}`);

		return result.path;
	} catch (error) {
		console.error("Error uploading JSON:", error);
		throw error;
	}
}

/**
 * Lấy dữ liệu từ IPFS
 */
async function getFromIPFS(hash) {
	try {
		const chunks = [];

		for await (const chunk of ipfs.cat(hash)) {
			chunks.push(chunk);
		}

		const data = Buffer.concat(chunks).toString();
		console.log("Retrieved from IPFS:", data);

		return data;
	} catch (error) {
		console.error("Error getting from IPFS:", error);
		throw error;
	}
}

/**
 * Upload thông tin coffee lên IPFS
 */
async function uploadCoffeeData(coffeeData) {
	try {
		const metadata = {
			batchNumber: coffeeData.batchNumber,
			coffeeType: coffeeData.coffeeType,
			quantity: coffeeData.quantity,
			origin: coffeeData.origin,
			farmLocation: coffeeData.farmLocation,
			harvestDate: coffeeData.harvestDate,
			altitude: coffeeData.altitude,
			variety: coffeeData.variety,
			processingMethod: coffeeData.processingMethod,
			certifications: coffeeData.certifications || [],
			images: coffeeData.images || [],
			notes: coffeeData.notes || "",
			timestamp: new Date().toISOString(),
		};

		const hash = await uploadJSON(metadata);
		return hash;
	} catch (error) {
		console.error("Error uploading coffee data:", error);
		throw error;
	}
}

// Export functions
module.exports = {
	uploadFile,
	uploadJSON,
	getFromIPFS,
	uploadCoffeeData,
};

// CLI usage
if (require.main === module) {
	const args = process.argv.slice(2);

	if (args[0] === "upload-file" && args[1]) {
		uploadFile(args[1]);
	} else if (args[0] === "upload-json" && args[1]) {
		const data = JSON.parse(args[1]);
		uploadJSON(data);
	} else if (args[0] === "get" && args[1]) {
		getFromIPFS(args[1]);
	} else {
		console.log("Usage:");
		console.log("  node ipfsHelper.js upload-file <filepath>");
		console.log('  node ipfsHelper.js upload-json \'{"key":"value"}\'');
		console.log("  node ipfsHelper.js get <hash>");
	}
}
