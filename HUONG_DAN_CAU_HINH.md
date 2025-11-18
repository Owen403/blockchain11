# 🔧 HƯỚNG DẪN CÁU HÌNH FILE .ENV

## Bước 1: Tạo file .env

Sao chép file `.env.example` thành `.env`:

```cmd
copy .env.example .env
```

Hoặc file `.env` đã được tạo sẵn, bạn chỉ cần cấu hình.

---

## Bước 2: Cấu hình từng phần

### 📡 **BLOCKCHAIN NETWORK**

#### **Option 1: Chạy trên Local Network (Khuyến nghị cho test)**

```env
SEPOLIA_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

-    Đây là RPC của Hardhat local node
-    Private key mặc định của Hardhat (account #0)
-    **CHÚ Ý:** Private key này chỉ dùng cho test local, KHÔNG BAO GIỜ dùng cho mainnet!

**Cách lấy Private Key từ Hardhat:**

```cmd
npx hardhat node
```

Hardhat sẽ hiển thị danh sách accounts với private keys.

---

#### **Option 2: Chạy trên Sepolia Testnet (Cho production test)**

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_metamask_private_key_here
```

**Các bước:**

1. **Đăng ký Infura:**

     - Truy cập: https://infura.io
     - Đăng ký tài khoản miễn phí
     - Tạo project mới
     - Copy PROJECT ID
     - Thay `YOUR_INFURA_PROJECT_ID` bằng Project ID của bạn

2. **Lấy Private Key từ MetaMask:**

     - Mở MetaMask
     - Click vào menu (3 chấm)
     - Account Details → Export Private Key
     - Nhập password
     - Copy private key (bắt đầu bằng 0x)
     - Paste vào `PRIVATE_KEY=`

3. **Lấy Sepolia ETH test:**
     - Truy cập: https://sepoliafaucet.com
     - Hoặc: https://faucet.quicknode.com/ethereum/sepolia
     - Nhập địa chỉ wallet của bạn
     - Nhận ETH test miễn phí

---

### 💾 **IPFS CONFIGURATION**

#### **Option 1: IPFS Local (Khuyến nghị)**

```env
IPFS_API_URL=http://127.0.0.1:5001
IPFS_GATEWAY=http://127.0.0.1:8080
```

**Cài đặt IPFS:**

**Cách 1: IPFS Desktop (Dễ nhất)**

1. Download: https://docs.ipfs.tech/install/ipfs-desktop/
2. Cài đặt và chạy
3. IPFS sẽ tự động chạy trên cổng 5001 (API) và 8080 (Gateway)

**Cách 2: IPFS CLI**

```cmd
# Download IPFS
# https://dist.ipfs.tech/#go-ipfs

# Khởi tạo
ipfs init

# Chạy daemon
ipfs daemon
```

---

#### **Option 2: IPFS Cloud (Infura/Pinata)**

**Sử dụng Infura IPFS:**

```env
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_GATEWAY=https://ipfs.infura.io/ipfs
```

**Sử dụng Pinata:**

```env
IPFS_API_URL=https://api.pinata.cloud
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
```

---

### 📝 **CONTRACT ADDRESS**

```env
CONTRACT_ADDRESS=
```

-    Ban đầu để trống
-    Sau khi deploy contract, copy địa chỉ contract và paste vào đây
-    Ví dụ: `CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

### 🚀 **BACKEND CONFIGURATION**

```env
PORT=3001
```

-    Cổng cho backend API
-    Mặc định là 3001
-    Có thể thay đổi nếu cổng bị chiếm

---

## Bước 3: Ví dụ file .env hoàn chỉnh

### **Cho Local Development:**

```env
# Blockchain Network - Local Hardhat
SEPOLIA_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# IPFS Configuration - Local
IPFS_API_URL=http://127.0.0.1:5001
IPFS_GATEWAY=http://127.0.0.1:8080

# Contract Address (sau khi deploy)
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Backend Configuration
PORT=3001
```

### **Cho Sepolia Testnet:**

```env
# Blockchain Network - Sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456ghi789
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# IPFS Configuration - Local hoặc Cloud
IPFS_API_URL=http://127.0.0.1:5001
IPFS_GATEWAY=http://127.0.0.1:8080

# Contract Address (sau khi deploy)
CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Backend Configuration
PORT=3001
```

---

## Bước 4: Kiểm tra cấu hình

### **Test kết nối Blockchain:**

```cmd
npx hardhat console --network localhost
```

Trong console:

```javascript
const accounts = await ethers.getSigners();
console.log(accounts[0].address);
```

### **Test kết nối IPFS:**

```cmd
curl http://127.0.0.1:5001/api/v0/version
```

Hoặc mở trình duyệt: http://127.0.0.1:5001/webui

---

## ⚠️ BẢO MẬT QUAN TRỌNG

1. **KHÔNG BAO GIỜ** commit file `.env` lên Git
2. **KHÔNG BAO GIỜ** share private key thật
3. **KHÔNG BAO GIỜ** dùng private key có tiền thật để test
4. Luôn dùng test accounts cho development
5. File `.env` đã được thêm vào `.gitignore`

---

## 🔥 Troubleshooting

### **Lỗi: Cannot connect to blockchain**

-    Kiểm tra Hardhat node đang chạy: `npx hardhat node`
-    Kiểm tra RPC URL đúng
-    Kiểm tra private key hợp lệ

### **Lỗi: IPFS connection failed**

-    Kiểm tra IPFS daemon đang chạy
-    Kiểm tra cổng 5001 và 8080 không bị chặn
-    Thử restart IPFS

### **Lỗi: Contract not deployed**

-    Deploy contract trước: `npx hardhat run scripts/deploy.js --network localhost`
-    Copy địa chỉ contract vào `CONTRACT_ADDRESS`
-    Restart backend server

---

## 📞 Cần trợ giúp?

-    Hardhat Docs: https://hardhat.org/docs
-    IPFS Docs: https://docs.ipfs.tech
-    Infura: https://docs.infura.io
-    Ethers.js: https://docs.ethers.org
