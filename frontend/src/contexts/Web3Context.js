import React, { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";

const Web3Context = createContext();

export const useWeb3 = () => {
	const context = useContext(Web3Context);
	if (!context) {
		throw new Error("useWeb3 must be used within Web3Provider");
	}
	return context;
};

export const Web3Provider = ({ children }) => {
	const [account, setAccount] = useState("");
	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);
	const [contract, setContract] = useState(null);
	const [contractAddress, setContractAddress] = useState("");
	const [loading, setLoading] = useState(true);

	// Load contract address from deployment artifact
	useEffect(() => {
		loadContractAddress();
	}, []);

	const loadContractAddress = async () => {
		try {
			// Try to load from backend API
			const response = await fetch("http://localhost:3001/api/contract/address");
			if (response.ok) {
				const data = await response.json();
				setContractAddress(data.address);
			} else {
				// Fallback to env variable
				const envAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
				if (envAddress) {
					setContractAddress(envAddress);
				}
			}
		} catch (error) {
			console.error("Error loading contract address:", error);
			// Fallback to env variable
			const envAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
			if (envAddress) {
				setContractAddress(envAddress);
			}
		} finally {
			setLoading(false);
		}
	};

	// Check wallet connection on mount
	useEffect(() => {
		checkWalletConnection();
	}, []);

	// Update contract when address or signer changes
	useEffect(() => {
		if (contractAddress && signer) {
			initializeContract();
		}
	}, [contractAddress, signer]);

	const checkWalletConnection = async () => {
		if (typeof window.ethereum !== "undefined") {
			try {
				const accounts = await window.ethereum.request({
					method: "eth_accounts",
				});

				if (accounts.length > 0) {
					await connectWallet();
				}
			} catch (error) {
				console.error("Error checking wallet connection:", error);
			}
		}
	};

	const connectWallet = async () => {
		if (typeof window.ethereum === "undefined") {
			alert("Vui lòng cài đặt MetaMask để sử dụng ứng dụng!");
			return;
		}

		try {
			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			setAccount(accounts[0]);
			setProvider(provider);
			setSigner(signer);

			// Listen for account changes
			window.ethereum.on("accountsChanged", (accounts) => {
				if (accounts.length > 0) {
					setAccount(accounts[0]);
					// Re-initialize contract with new signer
					provider.getSigner().then((newSigner) => {
						setSigner(newSigner);
					});
				} else {
					disconnectWallet();
				}
			});

			// Listen for chain changes
			window.ethereum.on("chainChanged", () => {
				window.location.reload();
			});
		} catch (error) {
			console.error("Error connecting wallet:", error);
			alert("Không thể kết nối ví");
		}
	};

	const disconnectWallet = () => {
		setAccount("");
		setProvider(null);
		setSigner(null);
		setContract(null);
	};

	const initializeContract = async () => {
		try {
			const CONTRACT_ABI = [
				"function addCoffeeItem(string memory _batchNumber, string memory _coffeeType, uint256 _quantity, string memory _ipfsHash) external returns (uint256)",
				"function updateStage(uint256 _coffeeId, uint8 _newStage, string memory _ipfsHash, string memory _notes) external",
				"function getCoffeeDetails(uint256 _coffeeId) external view returns (tuple(uint256 id, string batchNumber, string coffeeType, uint256 quantity, uint8 currentStage, address farmer, address processor, address distributor, address retailer, address consumer, string ipfsHash, uint256 harvestDate, uint256 lastUpdated))",
				"event CoffeeItemAdded(uint256 indexed coffeeId, string batchNumber, address indexed farmer, uint256 timestamp)",
				"event StageUpdated(uint256 indexed coffeeId, uint8 newStage, address indexed updatedBy, uint256 timestamp)",
			];

			const contractInstance = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
			setContract(contractInstance);
		} catch (error) {
			console.error("Error initializing contract:", error);
		}
	};

	const formatAddress = (address) => {
		if (!address) return "";
		return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
	};

	const value = {
		account,
		provider,
		signer,
		contract,
		contractAddress,
		loading,
		connectWallet,
		disconnectWallet,
		formatAddress,
	};

	return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
