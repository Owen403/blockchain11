import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { coffeeAPI } from "../services/api";

const TrackCoffee = () => {
	const [coffeeId, setCoffeeId] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const navigate = useNavigate();

	const handleSearch = async (e) => {
		e.preventDefault();

		if (!coffeeId) {
			setMessage({ type: "error", text: "Vui lòng nhập mã cafe" });
			return;
		}

		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			// Check if coffee exists
			const result = await coffeeAPI.getDetails(coffeeId);

			if (result.success) {
				// Navigate to details page
				navigate(`/coffee/${coffeeId}`);
			}
		} catch (error) {
			console.error("Error tracking coffee:", error);
			setMessage({
				type: "error",
				text: `Không tìm thấy cafe với mã #${coffeeId}`,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="card">
				<h2>Theo Dõi Cafe</h2>
				<p>Nhập mã ID cafe để theo dõi hành trình qua chuỗi cung ứng.</p>

				{message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

				<form onSubmit={handleSearch}>
					<div className="form-group">
						<label>Mã Cafe</label>
						<input
							type="number"
							value={coffeeId}
							onChange={(e) => setCoffeeId(e.target.value)}
							placeholder="Nhập mã cafe (VD: 1)"
							min="1"
						/>
					</div>

					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? "Đang tìm kiếm..." : "Theo Dõi Cafe"}
					</button>
				</form>
			</div>

			<div className="card">
				<h2>Cách Theo Dõi</h2>
				<ol>
					<li>Nhập mã ID cafe bạn nhận được</li>
					<li>Nhấp "Theo Dõi Cafe" để xem chi tiết</li>
					<li>Xem toàn bộ hành trình chuỗi cung ứng</li>
					<li>Xác thực nguồn gốc và tính xác thực</li>
				</ol>
			</div>

			<div className="card">
				<h2>Thông Tin Bạn Sẽ Thấy</h2>
				<ul>
					<li>✅ Thông tin cafe đầy đủ (loại, số lượng, nguồn gốc)</li>
					<li>✅ Giai đoạn hiện tại trong chuỗi cung ứng</li>
					<li>✅ Tất cả bên liên quan (từ nông dân đến bán lẻ)</li>
					<li>✅ Lịch sử đầy đủ với dấu thời gian</li>
					<li>✅ Trạng thái xác thực nguồn gốc</li>
					<li>✅ Dữ liệu bổ sung được lưu trên IPFS</li>
				</ul>
			</div>
		</div>
	);
};

export default TrackCoffee;
