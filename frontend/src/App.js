import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Web3Provider, useWeb3 } from "./contexts/Web3Context";
import AddCoffee from "./components/AddCoffee";
import CoffeeList from "./components/CoffeeList";
import CoffeeDetails from "./components/CoffeeDetails";
import TrackCoffee from "./components/TrackCoffee";
import "./index.css";

function App() {
	return (
		<Web3Provider>
			<Router>
				<AppContent />
			</Router>
		</Web3Provider>
	);
}

function AppContent() {
	const { account, connectWallet, disconnectWallet, formatAddress, loading } = useWeb3();

	if (loading) {
		return (
			<div className="loading">
				<div className="spinner"></div>
				<p>Đang tải...</p>
			</div>
		);
	}

	return (
		<div className="app">
			{/* Header */}
			<header className="header">
				<div className="header-content">
					<div className="logo">
						<span>☕</span>
						<h1>Chuỗi Cung Ứng Cafe</h1>
					</div>

					<div className="wallet-section">
						{!account ? (
							<button className="btn btn-primary" onClick={connectWallet}>
								Kết Nối Ví
							</button>
						) : (
							<>
								<div className="wallet-info">
									<span>🔗</span>
									<span className="wallet-address">{formatAddress(account)}</span>
								</div>
								<button className="btn btn-secondary" onClick={disconnectWallet}>
									Ngắt Kết Nối
								</button>
							</>
						)}
					</div>
				</div>
			</header>

			{/* Navigation */}
			<nav className="nav">
				<div className="nav-content">
					<Link to="/" className="nav-link">
						Trang Chủ
					</Link>
					<Link to="/add" className="nav-link">
						Thêm Cafe
					</Link>
					<Link to="/list" className="nav-link">
						Danh Sách Cafe
					</Link>
					<Link to="/track" className="nav-link">
						Theo Dõi Cafe
					</Link>
				</div>
			</nav>

			{/* Main Content */}
			<main className="main-content">
				{!account ? (
					<div className="card">
						<h2>Chào Mừng Đến Với Hệ Thống Quản Lý Chuỗi Cung Ứng Cafe</h2>
						<p>Vui lòng kết nối ví của bạn để bắt đầu.</p>
						<button className="btn btn-primary" onClick={connectWallet}>
							Kết Nối Ví
						</button>
					</div>
				) : (
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/add" element={<AddCoffee />} />
						<Route path="/list" element={<CoffeeList />} />
						<Route path="/coffee/:id" element={<CoffeeDetails />} />
						<Route path="/track" element={<TrackCoffee />} />
					</Routes>
				)}
			</main>
		</div>
	);
}

function Home() {
	return (
		<div>
			<div className="card">
				<h2>Hệ Thống Quản Lý Chuỗi Cung Ứng Cafe</h2>
				<p>
					Ứng dụng phi tập trung giúp theo dõi cafe từ nông trại đến tay người tiêu dùng bằng công nghệ
					blockchain, smart contracts và IPFS để lưu trữ dữ liệu.
				</p>
			</div>

			<div className="card">
				<h2>Tính Năng</h2>
				<ul>
					<li>✅ Theo dõi cafe qua toàn bộ chuỗi cung ứng</li>
					<li>✅ Xác thực nguồn gốc và tính xác thực</li>
					<li>✅ Hồ sơ minh bạch và không thể thay đổi</li>
					<li>✅ Lưu trữ dữ liệu phi tập trung với IPFS</li>
					<li>✅ Hợp tác đa bên liên quan</li>
				</ul>
			</div>

			<div className="card">
				<h2>Các Giai Đoạn Chuỗi Cung Ứng</h2>
				<div className="coffee-info">
					<div className="info-row">
						<span className="stage-badge stage-harvested">Thu Hoạch</span>
						<span>Hạt cafe được nông dân thu hoạch</span>
					</div>
					<div className="info-row">
						<span className="stage-badge stage-processed">Chế Biến</span>
						<span>Hạt cafe được chế biến và làm sạch</span>
					</div>
					<div className="info-row">
						<span className="stage-badge stage-packaged">Đóng Gói</span>
						<span>Cafe được đóng gói để phân phối</span>
					</div>
					<div className="info-row">
						<span className="stage-badge stage-distributed">Phân Phối</span>
						<span>Cafe được phân phối đến nhà bán lẻ</span>
					</div>
					<div className="info-row">
						<span className="stage-badge stage-retailed">Bán Lẻ</span>
						<span>Cafe có sẵn để mua</span>
					</div>
					<div className="info-row">
						<span className="stage-badge stage-consumed">Tiêu Dùng</span>
						<span>Cafe được người tiêu dùng mua</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
