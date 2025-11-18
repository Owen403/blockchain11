import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";

const AddCoffee = () => {
	const { contract } = useWeb3();
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const [formData, setFormData] = useState({
		batchNumber: "",
		coffeeType: "Arabica",
		quantity: "",
		origin: "",
		farmLocation: "",
		altitude: "",
		variety: "",
		processingMethod: "Washed",
		certifications: "",
		notes: "",
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			if (!contract) {
				setMessage({ type: "error", text: "Vui lòng kết nối ví của bạn trước" });
				setLoading(false);
				return;
			}

			// Prepare metadata
			const metadata = {
				batchNumber: formData.batchNumber,
				coffeeType: formData.coffeeType,
				quantity: formData.quantity,
				origin: formData.origin,
				farmLocation: formData.farmLocation,
				altitude: formData.altitude,
				variety: formData.variety,
				processingMethod: formData.processingMethod,
				certifications: formData.certifications
					.split(",")
					.map((c) => c.trim())
					.filter((c) => c),
				notes: formData.notes,
				harvestDate: new Date().toISOString(),
			};

			// Upload metadata to IPFS
			setMessage({ type: "info", text: "Đang tải metadata lên IPFS..." });
			const ipfsHash = await uploadToIPFS(metadata);

			// Send transaction via MetaMask
			setMessage({ type: "info", text: "Vui lòng xác nhận giao dịch trong MetaMask..." });
			const tx = await contract.addCoffeeItem(
				formData.batchNumber,
				formData.coffeeType,
				parseInt(formData.quantity),
				ipfsHash,
			);

			setMessage({ type: "info", text: "Giao dịch đã gửi. Đang chờ xác nhận..." });
			const receipt = await tx.wait();

			// Get coffee ID from event
			const event = receipt.logs.find((log) => {
				try {
					return contract.interface.parseLog(log).name === "CoffeeItemAdded";
				} catch (e) {
					return false;
				}
			});

			const coffeeId = event ? contract.interface.parseLog(event).args.coffeeId : null;

			setMessage({
				type: "success",
				text: `Thêm cafe thành công! Mã cafe: ${coffeeId ? coffeeId.toString() : "N/A"} | TX: ${
					receipt.hash
				}`,
			});

			// Reset form
			setFormData({
				batchNumber: "",
				coffeeType: "Arabica",
				quantity: "",
				origin: "",
				farmLocation: "",
				altitude: "",
				variety: "",
				processingMethod: "Washed",
				certifications: "",
				notes: "",
			});
		} catch (error) {
			console.error("Error adding coffee:", error);
			setMessage({
				type: "error",
				text: error.response?.data?.message || "Không thể thêm cafe",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card">
			<h2>Thêm Sản Phẩm Cafe Mới</h2>

			{message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label>Mã Lô *</label>
					<input
						type="text"
						name="batchNumber"
						value={formData.batchNumber}
						onChange={handleChange}
						required
						placeholder="VD: VN-2024-001"
					/>
				</div>

				<div className="form-group">
					<label>Loại Cafe *</label>
					<select name="coffeeType" value={formData.coffeeType} onChange={handleChange} required>
						<option value="Arabica">Arabica</option>
						<option value="Robusta">Robusta</option>
						<option value="Liberica">Liberica</option>
						<option value="Excelsa">Excelsa</option>
					</select>
				</div>

				<div className="form-group">
					<label>Số Lượng (kg) *</label>
					<input
						type="number"
						name="quantity"
						value={formData.quantity}
						onChange={handleChange}
						required
						min="1"
						placeholder="VD: 1000"
					/>
				</div>

				<div className="form-group">
					<label>Nguồn Gốc *</label>
					<input
						type="text"
						name="origin"
						value={formData.origin}
						onChange={handleChange}
						required
						placeholder="VD: Đà Lạt, Việt Nam"
					/>
				</div>

				<div className="form-group">
					<label>Vị Trí Trang Trại</label>
					<input
						type="text"
						name="farmLocation"
						value={formData.farmLocation}
						onChange={handleChange}
						placeholder="VD: Tỉnh Lâm Đồng"
					/>
				</div>

				<div className="form-group">
					<label>Độ Cao</label>
					<input
						type="text"
						name="altitude"
						value={formData.altitude}
						onChange={handleChange}
						placeholder="VD: 1500m"
					/>
				</div>

				<div className="form-group">
					<label>Giống Cafe</label>
					<input
						type="text"
						name="variety"
						value={formData.variety}
						onChange={handleChange}
						placeholder="VD: Catimor"
					/>
				</div>

				<div className="form-group">
					<label>Phương Pháp Chế Biến</label>
					<select name="processingMethod" value={formData.processingMethod} onChange={handleChange}>
						<option value="Washed">Ướt (Washed)</option>
						<option value="Natural">Khô (Natural)</option>
						<option value="Honey">Mật ong (Honey)</option>
						<option value="Semi-washed">Bán ướt (Semi-washed)</option>
					</select>
				</div>

				<div className="form-group">
					<label>Chứng Nhận</label>
					<input
						type="text"
						name="certifications"
						value={formData.certifications}
						onChange={handleChange}
						placeholder="VD: Organic, Fair Trade (phân cách bằng dấu phẩy)"
					/>
				</div>

				<div className="form-group">
					<label>Ghi Chú</label>
					<textarea
						name="notes"
						value={formData.notes}
						onChange={handleChange}
						placeholder="Thông tin bổ sung về cafe..."
					/>
				</div>

				<button type="submit" className="btn btn-primary" disabled={loading}>
					{loading ? "Đang thêm cafe..." : "Thêm Cafe"}
				</button>
			</form>
		</div>
	);
};

export default AddCoffee;
