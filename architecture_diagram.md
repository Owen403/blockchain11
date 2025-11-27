# Kiến trúc tổng thể hệ thống DApp

```mermaid
flowchart TD
  A[Frontend React SPA] -->|MetaMask + ethers (Web3Context)| B[Smart Contract CoffeeSupplyChain<br/>(Hardhat localhost)]
  A -->|Axios → /api/contract/address| C[Backend Express]
  C -->|Upload file/metadata| D[IPFS daemon (127.0.0.1:5001)]
  C -->|Trả về contract address| A
  B -->|Emit event + lưu StageHistory| A
  D -->|CID| A
```
