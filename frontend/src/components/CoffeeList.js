import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { coffeeAPI } from "../services/api";

const STAGE_NAMES = {
	0: "Harvested",
	1: "Processed",
	2: "Packaged",
	3: "Distributed",
	4: "Retailed",
	5: "Consumed",
};

const STAGE_CLASSES = {
	0: "stage-harvested",
	1: "stage-processed",
	2: "stage-packaged",
	3: "stage-distributed",
	4: "stage-retailed",
	5: "stage-consumed",
};

const CoffeeList = () => {
	const [coffeeItems, setCoffeeItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [totalItems, setTotalItems] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
		loadCoffeeItems();
	}, []);

	const loadCoffeeItems = async () => {
		try {
			// Get total number of coffee items
			const totalResult = await coffeeAPI.getTotal();
			const total = parseInt(totalResult.total);
			setTotalItems(total);

			// Load all coffee items
			const items = [];
			for (let i = 1; i <= total; i++) {
				try {
					const result = await coffeeAPI.getDetails(i);
					if (result.success && result.coffee.isActive) {
						items.push(result.coffee);
					}
				} catch (error) {
					console.error(`Error loading coffee ${i}:`, error);
				}
			}

			setCoffeeItems(items);
		} catch (error) {
			console.error("Error loading coffee list:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleItemClick = (coffeeId) => {
		navigate(`/coffee/${coffeeId}`);
	};

	if (loading) {
		return (
			<div className="loading">
				<div className="spinner"></div>
				<p>Đang tải danh sách cafe...</p>
			</div>
		);
	}

	return (
		<div>
			<div className="card">
				<h2>Danh Sách Cafe ({coffeeItems.length})</h2>
				<p>Nhấp vào bất kỳ mục nào để xem chi tiết và theo dõi hành trình.</p>
			</div>

			{coffeeItems.length === 0 ? (
				<div className="card">
					<p>Không tìm thấy cafe nào. Thêm cafe đầu tiên để bắt đầu!</p>
				</div>
			) : (
				<div className="coffee-grid">
					{coffeeItems.map((coffee) => (
						<div key={coffee.id} className="coffee-item" onClick={() => handleItemClick(coffee.id)}>
							<h3>☕ {coffee.coffeeType}</h3>
							<div className="coffee-info">
								<div className="info-row">
									<span className="info-label">ID:</span>
									<span className="info-value">#{coffee.id}</span>
								</div>
								<div className="info-row">
									<span className="info-label">Batch:</span>
									<span className="info-value">{coffee.batchNumber}</span>
								</div>
								<div className="info-row">
									<span className="info-label">Quantity:</span>
									<span className="info-value">{coffee.quantity} kg</span>
								</div>
								<div className="info-row">
									<span className="info-label">Stage:</span>
									<span className={`stage-badge ${STAGE_CLASSES[coffee.currentStage]}`}>
										{STAGE_NAMES[coffee.currentStage]}
									</span>
								</div>
								{coffee.metadata && coffee.metadata.origin && (
									<div className="info-row">
										<span className="info-label">Origin:</span>
										<span className="info-value">{coffee.metadata.origin}</span>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default CoffeeList;
