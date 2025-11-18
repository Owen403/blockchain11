const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config({ path: "../.env" });

const coffeeRoutes = require("./routes/coffeeRoutes");
const ipfsRoutes = require("./routes/ipfsRoutes");
const userRoutes = require("./routes/userRoutes");
const contractRoutes = require("./routes/contract");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

// Routes
app.use("/api/coffee", coffeeRoutes);
app.use("/api/ipfs", ipfsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contract", contractRoutes);

// Health check
app.get("/health", (req, res) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		service: "Coffee Supply Chain API",
	});
});

// Root endpoint
app.get("/", (req, res) => {
	res.json({
		message: "Coffee Supply Chain API",
		version: "1.0.0",
		endpoints: {
			coffee: "/api/coffee",
			ipfs: "/api/ipfs",
			users: "/api/users",
			health: "/health",
		},
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({
		error: "Internal Server Error",
		message: err.message,
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		error: "Not Found",
		message: "The requested endpoint does not exist",
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📚 API Documentation: http://localhost:${PORT}/`);
	console.log(`🔗 Contract Address: ${process.env.CONTRACT_ADDRESS || "Not set"}`);
});

module.exports = app;
