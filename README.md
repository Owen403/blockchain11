# Coffee Supply Chain Management - Blockchain

Hệ thống quản lý chuỗi cung ứng cafe sử dụng Blockchain, Smart Contract (Ethereum) và IPFS.

## Tính năng chính

-    **Theo dõi nguồn gốc**: Theo dõi hành trình từ nông trại đến người tiêu dùng
-    **Smart Contract**: Tự động hóa quy trình xác thực và chuyển giao quyền sở hữu
-    **IPFS Storage**: Lưu trữ phi tập trung cho dữ liệu và hình ảnh sản phẩm
-    **Transparent & Immutable**: Dữ liệu minh bạch và không thể thay đổi trên blockchain

## Các giai đoạn trong chuỗi cung ứng

1. **Farmer (Nông dân)**: Trồng và thu hoạch cafe
2. **Processor (Nhà chế biến)**: Chế biến hạt cafe
3. **Distributor (Nhà phân phối)**: Phân phối sản phẩm
4. **Retailer (Nhà bán lẻ)**: Bán cho người tiêu dùng
5. **Consumer (Người tiêu dùng)**: Mua và tiêu dùng

## Cấu trúc dự án

```
├── contracts/           # Smart contracts Solidity
├── scripts/            # Deployment & IPFS scripts
├── test/               # Contract tests
├── backend/            # Express.js API server
├── frontend/           # React web application
└── docs/               # Documentation
```

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Sao chép file `.env.example` thành `.env` và cấu hình:

```bash
copy .env.example .env
```

### 3. Compile smart contracts

```bash
npm run compile
```

### 4. Deploy smart contract

**Deploy lên local network:**

```bash
# Terminal 1: Start local blockchain
npm run node

# Terminal 2: Deploy contract
npm run deploy
```

**Deploy lên Sepolia testnet:**

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Chạy backend API

```bash
cd backend
npm install
npm start
```

### 6. Chạy frontend

```bash
cd frontend
npm install
npm start
```

## Sử dụng IPFS

### Cài đặt IPFS Desktop

Download từ: https://docs.ipfs.tech/install/ipfs-desktop/

Hoặc sử dụng IPFS daemon:

```bash
ipfs daemon
```

## Testing

```bash
npm test
```

## Smart Contract Functions

-    `addCoffeeItem()`: Thêm sản phẩm cafe mới
-    `updateStage()`: Cập nhật giai đoạn trong chuỗi cung ứng
-    `transferOwnership()`: Chuyển quyền sở hữu
-    `getCoffeeDetails()`: Lấy thông tin chi tiết sản phẩm
-    `verifyAuthenticity()`: Xác thực tính xác thực

## API Endpoints

-    `POST /api/coffee/add` - Thêm cafe mới
-    `GET /api/coffee/:id` - Lấy thông tin cafe
-    `PUT /api/coffee/:id/stage` - Cập nhật giai đoạn
-    `POST /api/ipfs/upload` - Upload file lên IPFS
-    `GET /api/ipfs/:hash` - Lấy dữ liệu từ IPFS

## License

MIT
