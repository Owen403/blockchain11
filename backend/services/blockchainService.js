const { ethers } = require("ethers");
require("dotenv").config({ path: "../.env" });

// Contract ABI (simplified - include relevant functions)
const CONTRACT_ABI = [
	"function addCoffeeItem(string memory _batchNumber, string memory _coffeeType, uint256 _quantity, string memory _ipfsHash) external returns (uint256)",
	"function updateStage(uint256 _coffeeId, uint8 _newStage, string memory _ipfsHash, string memory _notes) external",
	"function getCoffeeDetails(uint256 _coffeeId) external view returns (tuple(uint256 id, string batchNumber, string coffeeType, uint256 quantity, uint8 currentStage, address farmer, address processor, address distributor, address retailer, address consumer, string ipfsHash, uint256 harvestDate, uint256 lastUpdated, bool isActive))",
	"function getStageHistory(uint256 _coffeeId) external view returns (tuple(uint8 stage, address actor, uint256 timestamp, string ipfsHash, string notes)[])",
	"function verifyAuthenticity(uint256 _coffeeId) external view returns (bool, string memory)",
	"function getTotalCoffeeItems() external view returns (uint256)",
	"function authorizeUser(address _user, uint8 _role) external",
	"function getUserRole(address _user) external view returns (uint8)",
	"function isUserAuthorized(address _user) external view returns (bool)",
	"event CoffeeItemAdded(uint256 indexed coffeeId, string batchNumber, address indexed farmer, uint256 timestamp)",
	"event StageUpdated(uint256 indexed coffeeId, uint8 newStage, address indexed updatedBy, uint256 timestamp)",
];

class BlockchainService {
	constructor() {
		this.provider = null;
		this.contract = null;
		this.signer = null;
		this.initialize();
	}

	initialize() {
		try {
			// Connect to blockchain
			const rpcUrl = process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545";
			this.provider = new ethers.JsonRpcProvider(rpcUrl);

			// Get contract address
			const contractAddress = process.env.CONTRACT_ADDRESS;
			if (!contractAddress) {
				console.warn("⚠️  CONTRACT_ADDRESS not set in .env file");
				return;
			}

			// Create contract instance
			this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.provider);

			console.log("✅ Blockchain service initialized");
			console.log("   Contract:", contractAddress);
			console.log("   Provider:", rpcUrl);
		} catch (error) {
			console.error("❌ Error initializing blockchain service:", error.message);
		}
	}

	// Get signer from private key
	getSigner(privateKey = null) {
		const key = privateKey || process.env.PRIVATE_KEY;
		if (!key) {
			throw new Error("Private key not provided");
		}
		return new ethers.Wallet(key, this.provider);
	}

	// Add coffee item
	async addCoffeeItem(batchNumber, coffeeType, quantity, ipfsHash, privateKey) {
		try {
			const signer = this.getSigner(privateKey);
			const contractWithSigner = this.contract.connect(signer);

			const tx = await contractWithSigner.addCoffeeItem(batchNumber, coffeeType, quantity, ipfsHash);

			const receipt = await tx.wait();

			// Parse event to get coffee ID
			const event = receipt.logs.find((log) => {
				try {
					const parsed = this.contract.interface.parseLog(log);
					return parsed.name === "CoffeeItemAdded";
				} catch (e) {
					return false;
				}
			});

			const coffeeId = event ? this.contract.interface.parseLog(event).args.coffeeId : null;

			return {
				success: true,
				coffeeId: coffeeId ? coffeeId.toString() : null,
				transactionHash: receipt.hash,
				blockNumber: receipt.blockNumber,
			};
		} catch (error) {
			console.error("Error adding coffee item:", error);
			throw error;
		}
	}

	// Update stage
	async updateStage(coffeeId, newStage, ipfsHash, notes, privateKey) {
		try {
			const signer = this.getSigner(privateKey);
			const contractWithSigner = this.contract.connect(signer);

			const tx = await contractWithSigner.updateStage(coffeeId, newStage, ipfsHash, notes);

			const receipt = await tx.wait();

			return {
				success: true,
				transactionHash: receipt.hash,
				blockNumber: receipt.blockNumber,
			};
		} catch (error) {
			console.error("Error updating stage:", error);
			throw error;
		}
	}

	// Get coffee details
	async getCoffeeDetails(coffeeId) {
		try {
			const details = await this.contract.getCoffeeDetails(coffeeId);

			return {
				id: details.id.toString(),
				batchNumber: details.batchNumber,
				coffeeType: details.coffeeType,
				quantity: details.quantity.toString(),
				currentStage: Number(details.currentStage),
				farmer: details.farmer,
				processor: details.processor,
				distributor: details.distributor,
				retailer: details.retailer,
				consumer: details.consumer,
				ipfsHash: details.ipfsHash,
				harvestDate: Number(details.harvestDate),
				lastUpdated: Number(details.lastUpdated),
				isActive: details.isActive,
			};
		} catch (error) {
			console.error("Error getting coffee details:", error);
			throw error;
		}
	}

	// Get stage history
	async getStageHistory(coffeeId) {
		try {
			const history = await this.contract.getStageHistory(coffeeId);

			return history.map((stage) => ({
				stage: Number(stage.stage),
				actor: stage.actor,
				timestamp: Number(stage.timestamp),
				ipfsHash: stage.ipfsHash,
				notes: stage.notes,
			}));
		} catch (error) {
			console.error("Error getting stage history:", error);
			throw error;
		}
	}

	// Verify authenticity
	async verifyAuthenticity(coffeeId) {
		try {
			const [isAuthentic, message] = await this.contract.verifyAuthenticity(coffeeId);

			return {
				isAuthentic,
				message,
			};
		} catch (error) {
			console.error("Error verifying authenticity:", error);
			throw error;
		}
	}

	// Get total coffee items
	async getTotalCoffeeItems() {
		try {
			const total = await this.contract.getTotalCoffeeItems();
			return total.toString();
		} catch (error) {
			console.error("Error getting total coffee items:", error);
			throw error;
		}
	}

	// Authorize user
	async authorizeUser(userAddress, role, privateKey) {
		try {
			const signer = this.getSigner(privateKey);
			const contractWithSigner = this.contract.connect(signer);

			const tx = await contractWithSigner.authorizeUser(userAddress, role);
			const receipt = await tx.wait();

			return {
				success: true,
				transactionHash: receipt.hash,
			};
		} catch (error) {
			console.error("Error authorizing user:", error);
			throw error;
		}
	}

	// Get user role
	async getUserRole(userAddress) {
		try {
			const role = await this.contract.getUserRole(userAddress);
			return Number(role);
		} catch (error) {
			console.error("Error getting user role:", error);
			throw error;
		}
	}

	// Check if user is authorized
	async isUserAuthorized(userAddress) {
		try {
			return await this.contract.isUserAuthorized(userAddress);
		} catch (error) {
			console.error("Error checking user authorization:", error);
			throw error;
		}
	}
}

module.exports = new BlockchainService();
