import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Coffee endpoints
export const coffeeAPI = {
	add: async (data) => {
		const response = await api.post("/coffee/add", data);
		return response.data;
	},

	getDetails: async (id) => {
		const response = await api.get(`/coffee/${id}`);
		return response.data;
	},

	updateStage: async (id, data) => {
		const response = await api.put(`/coffee/${id}/stage`, data);
		return response.data;
	},

	getHistory: async (id) => {
		const response = await api.get(`/coffee/${id}/history`);
		return response.data;
	},

	verify: async (id) => {
		const response = await api.get(`/coffee/${id}/verify`);
		return response.data;
	},

	getTotal: async () => {
		const response = await api.get("/coffee/stats/total");
		return response.data;
	},
};

// IPFS endpoints
export const ipfsAPI = {
	uploadJSON: async (data) => {
		const response = await api.post("/ipfs/upload/json", data);
		return response.data;
	},

	uploadFile: async (file) => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await api.post("/ipfs/upload/file", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	get: async (hash) => {
		const response = await api.get(`/ipfs/${hash}`);
		return response.data;
	},

	pin: async (hash) => {
		const response = await api.post(`/ipfs/pin/${hash}`);
		return response.data;
	},
};

// User endpoints
export const userAPI = {
	authorize: async (data) => {
		const response = await api.post("/users/authorize", data);
		return response.data;
	},

	getRole: async (address) => {
		const response = await api.get(`/users/${address}/role`);
		return response.data;
	},

	isAuthorized: async (address) => {
		const response = await api.get(`/users/${address}/authorized`);
		return response.data;
	},

	getRoles: async () => {
		const response = await api.get("/users/roles");
		return response.data;
	},
};

export default api;
