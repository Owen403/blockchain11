import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import { coffeeAPI } from "../services/api";

const STAGE_NAMES = {
	0: "Thu Hoạch",
	1: "Chế Biến",
	2: "Đóng Gói",
	3: "Phân Phối",
	4: "Bán Lẻ",
	5: "Tiêu Dùng",
};

const STAGE_CLASSES = {
	0: "stage-harvested",
	1: "stage-processed",
	2: "stage-packaged",
	3: "stage-distributed",
	4: "stage-retailed",
	5: "stage-consumed",
};

const CoffeeDetails = () => {
	const { contract } = useWeb3();
	const { id } = useParams();
	const [coffee, setCoffee] = useState(null);
	const [history, setHistory] = useState([]);
	const [verification, setVerification] = useState(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		loadCoffeeData();
	}, [id]);

	const loadCoffeeData = async () => {
		try {
			setLoading(true);

			// Load coffee details
			const detailsResult = await coffeeAPI.getDetails(id);
			setCoffee(detailsResult.coffee);

			// Load history
			const historyResult = await coffeeAPI.getHistory(id);
			setHistory(historyResult.history);

			// Load verification
			const verifyResult = await coffeeAPI.verify(id);
			setVerification(verifyResult);
		} catch (error) {
			console.error("Error loading coffee data:", error);
			setMessage({
				type: "error",
				text: "Không thể tải thông tin cafe",
			});
		} finally {
			setLoading(false);
		}
	};

	const uploadToIPFS = async (metadata) => {
		try {
			const response = await fetch("http://localhost:3001/api/ipfs/upload/json", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(metadata),
			});
			const data = await response.json();
			return data.hash;
		} catch (error) {
			console.error("Error uploading to IPFS:", error);
			throw error;
		}
	};

	const handleUpdateStage = async () => {
		if (!coffee) return;

		const nextStage = coffee.currentStage + 1;
		if (nextStage > 5) {
			alert("Cafe đã ở giai đoạn cuối cùng");
			return;
		}

		if (!contract) {
			setMessage({ type: "error", text: "Vui lòng kết nối ví của bạn trước" });
			return;
		}

		const notes = prompt(`Ghi chú cho giai đoạn ${STAGE_NAMES[nextStage]}:`) || "";

		try {
			setUpdating(true);
			setMessage({ type: "", text: "" });

			// Prepare metadata
			const metadata = {
				stage: nextStage,
				stageName: STAGE_NAMES[nextStage],
				notes: notes,
				timestamp: new Date().toISOString(),
			};

			// Upload to IPFS
			setMessage({ type: "info", text: "Đang tải lên IPFS..." });
			const ipfsHash = await uploadToIPFS(metadata);

			// Send transaction via MetaMask
			setMessage({ type: "info", text: "Vui lòng xác nhận giao dịch trong MetaMask..." });
			const tx = await contract.updateStage(id, nextStage, ipfsHash, notes);

			setMessage({ type: "info", text: "Giao dịch đã gửi. Đang chờ xác nhận..." });
			await tx.wait();

			setMessage({
				type: "success",
				text: `Đã cập nhật lìn giai đoạn ${STAGE_NAMES[nextStage]}`,
			});

			// Reload data
			await loadCoffeeData();
		} catch (error) {
			console.error("Error updating stage:", error);
			setMessage({
				type: "error",
				text: error.message || "Không thể cập nhật giai đoạn",
			});
		} finally {
			setUpdating(false);
		}
	};

	const formatAddress = (address) => {
		if (!address || address === "0x0000000000000000000000000000000000000000") {
			return "Chưa gán";
		}
		return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
	};

	const formatDate = (timestamp) => {
		if (!timestamp) return "N/A";
		const date = new Date(timestamp * 1000);
		return date.toLocaleString();
	};

	if (loading) {
		return (
			<div className="loading">
				<div className="spinner"></div>
				<p>Đang tải thông tin cafe...</p>
			</div>
		);
	}

	if (!coffee) {
		return (
			<div className="card">
				<h2>Không Tìm Thấy Cafe</h2>
				<p>Không tìm thấy cafe yêu cầu.</p>
			</div>
		);
	}

	return (
		<div>
			{message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

			{/* Coffee Details */}
			<div className="card">
				<h2>☕ Chi Tiết Cafe - #{coffee.id}</h2>

				<div className="coffee-info">
					<div className="info-row">
						<span className="info-label">Mã Lô:</span>
						<span className="info-value">{coffee.batchNumber}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Loại Cafe:</span>
						<span className="info-value">{coffee.coffeeType}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Số Lượng:</span>
						<span className="info-value">{coffee.quantity} kg</span>
					</div>
					<div className="info-row">
						<span className="info-label">Giai Đoạn Hiện Tại:</span>
						<span className={`stage-badge ${STAGE_CLASSES[coffee.currentStage]}`}>
							{STAGE_NAMES[coffee.currentStage]}
						</span>
					</div>
					<div className="info-row">
						<span className="info-label">Ngày Thu Hoạch:</span>
						<span className="info-value">{formatDate(coffee.harvestDate)}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Cập Nhật Lần Cuối:</span>
						<span className="info-value">{formatDate(coffee.lastUpdated)}</span>
					</div>
				</div>

				{coffee.currentStage < 5 && (
					<button
						className="btn btn-primary"
						onClick={handleUpdateStage}
						disabled={updating}
						style={{ marginTop: "1rem" }}
					>
						{updating ? "Đang cập nhật..." : `Cập nhật lên ${STAGE_NAMES[coffee.currentStage + 1]}`}
					</button>
				)}
			</div>

			{/* Metadata */}
			{coffee.metadata && (
				<div className="card">
					<h2>Thông Tin Bổ Sung</h2>
					<div className="coffee-info">
						{coffee.metadata.origin && (
							<div className="info-row">
								<span className="info-label">Nguồn Gốc:</span>
								<span className="info-value">{coffee.metadata.origin}</span>
							</div>
						)}
						{coffee.metadata.farmLocation && (
							<div className="info-row">
								<span className="info-label">Vị Trí Trang Trại:</span>
								<span className="info-value">{coffee.metadata.farmLocation}</span>
							</div>
						)}
						{coffee.metadata.altitude && (
							<div className="info-row">
								<span className="info-label">Độ Cao:</span>
								<span className="info-value">{coffee.metadata.altitude}</span>
							</div>
						)}
						{coffee.metadata.variety && (
							<div className="info-row">
								<span className="info-label">Giống Cafe:</span>
								<span className="info-value">{coffee.metadata.variety}</span>
							</div>
						)}
						{coffee.metadata.processingMethod && (
							<div className="info-row">
								<span className="info-label">Phương Pháp Chế Biến:</span>
								<span className="info-value">{coffee.metadata.processingMethod}</span>
							</div>
						)}
						{coffee.metadata.certifications && coffee.metadata.certifications.length > 0 && (
							<div className="info-row">
								<span className="info-label">Chứng Nhận:</span>
								<span className="info-value">{coffee.metadata.certifications.join(", ")}</span>
							</div>
						)}
						{coffee.metadata.notes && (
							<div className="info-row">
								<span className="info-label">Ghi Chú:</span>
								<span className="info-value">{coffee.metadata.notes}</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Stakeholders */}
			<div className="card">
				<h2>Các Bên Liên Quan</h2>
				<div className="coffee-info">
					<div className="info-row">
						<span className="info-label">Nông Dân:</span>
						<span className="info-value">{formatAddress(coffee.farmer)}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Nhà Chế Biến:</span>
						<span className="info-value">{formatAddress(coffee.processor)}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Nhà Phân Phối:</span>
						<span className="info-value">{formatAddress(coffee.distributor)}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Nhà Bán Lẻ:</span>
						<span className="info-value">{formatAddress(coffee.retailer)}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Người Tiêu Dùng:</span>
						<span className="info-value">{formatAddress(coffee.consumer)}</span>
					</div>
				</div>
			</div>

			{/* Verification */}
			{verification && (
				<div className="card">
					<h2>Xác Thực</h2>
					<div className={`alert ${verification.isAuthentic ? "alert-success" : "alert-error"}`}>
						{verification.isAuthentic ? "✓" : "✗"} {verification.message}
					</div>
				</div>
			)}

			{/* History Timeline */}
			<div className="card">
				<h2>Lịch Sử Chuỗi Cung Ứng</h2>
				<div className="timeline">
					{history.map((item, index) => (
						<div key={index} className="timeline-item">
							<div className="timeline-content">
								<div className="timeline-stage">
									<span className={`stage-badge ${STAGE_CLASSES[item.stage]}`}>
										{item.stageName}
									</span>
								</div>
								<div className="timeline-date">📅 {item.date}</div>
								<div className="timeline-notes">{item.notes || "Không có ghi chú bổ sung"}</div>
								<div style={{ fontSize: "0.875rem", color: "#999", marginTop: "0.5rem" }}>
									Người thực hiện: {formatAddress(item.actor)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* IPFS Hash */}
			<div className="card">
				<h2>Lưu Trữ IPFS</h2>
				<div className="info-row">
					<span className="info-label">Mã IPFS:</span>
					<span className="info-value" style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
						{coffee.ipfsHash}
					</span>
				</div>
			</div>
		</div>
	);
};

export default CoffeeDetails;
