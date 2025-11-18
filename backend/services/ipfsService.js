const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config({ path: "../.env" });

class IPFSService {
	constructor() {
		this.apiUrl = process.env.IPFS_API_URL || "http://127.0.0.1:5001";
		this.gateway = process.env.IPFS_GATEWAY || "http://127.0.0.1:8080";
		console.log("✅ IPFS service initialized");
		console.log("   API URL:", this.apiUrl);
		console.log("   Gateway:", this.gateway);
	}

	// Upload JSON data
	async uploadJSON(data) {
		try {
			const jsonString = JSON.stringify(data);
			const formData = new FormData();
			formData.append("file", Buffer.from(jsonString), {
				filename: "data.json",
				contentType: "application/json",
			});

			const response = await axios.post(`${this.apiUrl}/api/v0/add`, formData, {
				headers: formData.getHeaders(),
			});

			const hash = response.data.Hash;

			return {
				hash: hash,
				size: response.data.Size,
				url: `${this.gateway}/ipfs/${hash}`,
			};
		} catch (error) {
			console.error("Error uploading JSON to IPFS:", error.message);
			throw error;
		}
	}

	// Upload file
	async uploadFile(fileBuffer) {
		try {
			const formData = new FormData();
			formData.append("file", fileBuffer, {
				filename: "file",
			});

			const response = await axios.post(`${this.apiUrl}/api/v0/add`, formData, {
				headers: formData.getHeaders(),
			});

			const hash = response.data.Hash;

			return {
				hash: hash,
				size: response.data.Size,
				url: `${this.gateway}/ipfs/${hash}`,
			};
		} catch (error) {
			console.error("Error uploading file to IPFS:", error.message);
			throw error;
		}
	}

	// Get data from IPFS
	async get(hash) {
		try {
			const response = await axios.post(`${this.apiUrl}/api/v0/cat?arg=${hash}`, null, {
				responseType: "text",
			});

			const data = response.data;

			// Try to parse as JSON
			try {
				return JSON.parse(data);
			} catch (e) {
				return data;
			}
		} catch (error) {
			console.error("Error getting data from IPFS:", error.message);
			throw error;
		}
	}

	// Pin data
	async pin(hash) {
		try {
			await axios.post(`${this.apiUrl}/api/v0/pin/add?arg=${hash}`);
			return { success: true, hash };
		} catch (error) {
			console.error("Error pinning to IPFS:", error.message);
			throw error;
		}
	}

	// Unpin data
	async unpin(hash) {
		try {
			await axios.post(`${this.apiUrl}/api/v0/pin/rm?arg=${hash}`);
			return { success: true, hash };
		} catch (error) {
			console.error("Error unpinning from IPFS:", error.message);
			throw error;
		}
	}
}

module.exports = new IPFSService();
