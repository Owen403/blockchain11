// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CoffeeSupplyChain
 * @dev Quản lý chuỗi cung ứng cafe trên blockchain
 */
contract CoffeeSupplyChain is Ownable {
    uint256 private _coffeeIds;

    // Các giai đoạn trong chuỗi cung ứng
    enum Stage {
        Harvested,      // Thu hoạch
        Processed,      // Chế biến
        Packaged,       // Đóng gói
        Distributed,    // Phân phối
        Retailed,       // Bán lẻ
        Consumed        // Tiêu dùng
    }

    // Vai trò của người dùng
    enum Role {
        Farmer,         // Nông dân
        Processor,      // Nhà chế biến
        Distributor,    // Nhà phân phối
        Retailer,       // Nhà bán lẻ
        Consumer        // Người tiêu dùng
    }

    // Thông tin cafe
    struct CoffeeItem {
        uint256 id;
        string batchNumber;         // Mã lô
        string coffeeType;          // Loại cafe
        uint256 quantity;           // Số lượng (kg)
        Stage currentStage;         // Giai đoạn hiện tại
        address farmer;             // Địa chỉ nông dân
        address processor;          // Địa chỉ nhà chế biến
        address distributor;        // Địa chỉ nhà phân phối
        address retailer;           // Địa chỉ nhà bán lẻ
        address consumer;           // Địa chỉ người tiêu dùng
        string ipfsHash;            // Hash IPFS chứa thông tin chi tiết
        uint256 harvestDate;        // Ngày thu hoạch
        uint256 lastUpdated;        // Lần cập nhật cuối
        bool isActive;              // Trạng thái hoạt động
    }

    // Lịch sử giai đoạn
    struct StageHistory {
        Stage stage;
        address actor;
        uint256 timestamp;
        string ipfsHash;
        string notes;
    }

    // Mapping lưu trữ
    mapping(uint256 => CoffeeItem) public coffeeItems;
    mapping(uint256 => StageHistory[]) public stageHistories;
    mapping(address => Role) public userRoles;
    mapping(address => bool) public authorizedUsers;

    // Events
    event CoffeeItemAdded(
        uint256 indexed coffeeId,
        string batchNumber,
        address indexed farmer,
        uint256 timestamp
    );

    event StageUpdated(
        uint256 indexed coffeeId,
        Stage newStage,
        address indexed updatedBy,
        uint256 timestamp
    );

    event OwnershipTransferred(
        uint256 indexed coffeeId,
        address indexed from,
        address indexed to,
        Stage stage
    );

    event UserAuthorized(address indexed user, Role role);
    event UserRevoked(address indexed user);

    // Modifiers
    modifier onlyAuthorized() {
        require(authorizedUsers[msg.sender], "Not authorized");
        _;
    }

    modifier coffeeExists(uint256 _coffeeId) {
        require(_coffeeId > 0 && _coffeeId <= _coffeeIds, "Coffee item does not exist");
        require(coffeeItems[_coffeeId].isActive, "Coffee item is not active");
        _;
    }

    modifier atStage(uint256 _coffeeId, Stage _stage) {
        require(coffeeItems[_coffeeId].currentStage == _stage, "Invalid stage");
        _;
    }

    constructor() Ownable(msg.sender) {
        // Owner tự động được authorize
        authorizedUsers[msg.sender] = true;
        userRoles[msg.sender] = Role.Farmer;
    }

    /**
     * @dev Thêm người dùng được phép
     */
    function authorizeUser(address _user, Role _role) external onlyOwner {
        require(_user != address(0), "Invalid address");
        authorizedUsers[_user] = true;
        userRoles[_user] = _role;
        emit UserAuthorized(_user, _role);
    }

    /**
     * @dev Thu hồi quyền người dùng
     */
    function revokeUser(address _user) external onlyOwner {
        authorizedUsers[_user] = false;
        emit UserRevoked(_user);
    }

    /**
     * @dev Thêm sản phẩm cafe mới (bởi Farmer)
     */
    function addCoffeeItem(
        string memory _batchNumber,
        string memory _coffeeType,
        uint256 _quantity,
        string memory _ipfsHash
    ) external onlyAuthorized returns (uint256) {
        require(userRoles[msg.sender] == Role.Farmer, "Only farmers can add coffee");
        require(bytes(_batchNumber).length > 0, "Batch number required");
        require(_quantity > 0, "Quantity must be greater than 0");

        _coffeeIds++;
        uint256 newCoffeeId = _coffeeIds;

        coffeeItems[newCoffeeId] = CoffeeItem({
            id: newCoffeeId,
            batchNumber: _batchNumber,
            coffeeType: _coffeeType,
            quantity: _quantity,
            currentStage: Stage.Harvested,
            farmer: msg.sender,
            processor: address(0),
            distributor: address(0),
            retailer: address(0),
            consumer: address(0),
            ipfsHash: _ipfsHash,
            harvestDate: block.timestamp,
            lastUpdated: block.timestamp,
            isActive: true
        });

        // Thêm vào lịch sử
        stageHistories[newCoffeeId].push(StageHistory({
            stage: Stage.Harvested,
            actor: msg.sender,
            timestamp: block.timestamp,
            ipfsHash: _ipfsHash,
            notes: "Coffee harvested"
        }));

        emit CoffeeItemAdded(newCoffeeId, _batchNumber, msg.sender, block.timestamp);

        return newCoffeeId;
    }

    /**
     * @dev Cập nhật giai đoạn cafe
     */
    function updateStage(
        uint256 _coffeeId,
        Stage _newStage,
        string memory _ipfsHash,
        string memory _notes
    ) external onlyAuthorized coffeeExists(_coffeeId) {
        CoffeeItem storage coffee = coffeeItems[_coffeeId];
        
        // Kiểm tra giai đoạn hợp lệ
        require(uint8(_newStage) == uint8(coffee.currentStage) + 1, "Invalid stage transition");

        // Cập nhật địa chỉ theo vai trò
        if (_newStage == Stage.Processed) {
            require(userRoles[msg.sender] == Role.Processor, "Only processor can process");
            coffee.processor = msg.sender;
        } else if (_newStage == Stage.Packaged) {
            require(userRoles[msg.sender] == Role.Processor, "Only processor can package");
        } else if (_newStage == Stage.Distributed) {
            require(userRoles[msg.sender] == Role.Distributor, "Only distributor can distribute");
            coffee.distributor = msg.sender;
        } else if (_newStage == Stage.Retailed) {
            require(userRoles[msg.sender] == Role.Retailer, "Only retailer can retail");
            coffee.retailer = msg.sender;
        } else if (_newStage == Stage.Consumed) {
            require(userRoles[msg.sender] == Role.Consumer, "Only consumer can mark as consumed");
            coffee.consumer = msg.sender;
        }

        coffee.currentStage = _newStage;
        coffee.lastUpdated = block.timestamp;

        // Thêm vào lịch sử
        stageHistories[_coffeeId].push(StageHistory({
            stage: _newStage,
            actor: msg.sender,
            timestamp: block.timestamp,
            ipfsHash: _ipfsHash,
            notes: _notes
        }));

        emit StageUpdated(_coffeeId, _newStage, msg.sender, block.timestamp);
    }

    /**
     * @dev Lấy thông tin chi tiết cafe
     */
    function getCoffeeDetails(uint256 _coffeeId) 
        external 
        view 
        coffeeExists(_coffeeId) 
        returns (CoffeeItem memory) 
    {
        return coffeeItems[_coffeeId];
    }

    /**
     * @dev Lấy lịch sử giai đoạn
     */
    function getStageHistory(uint256 _coffeeId) 
        external 
        view 
        coffeeExists(_coffeeId) 
        returns (StageHistory[] memory) 
    {
        return stageHistories[_coffeeId];
    }

    /**
     * @dev Xác thực tính xác thực của cafe
     */
    function verifyAuthenticity(uint256 _coffeeId) 
        external 
        view 
        coffeeExists(_coffeeId) 
        returns (bool, string memory) 
    {
        CoffeeItem memory coffee = coffeeItems[_coffeeId];
        
        if (coffee.farmer == address(0)) {
            return (false, "No farmer record");
        }

        if (stageHistories[_coffeeId].length == 0) {
            return (false, "No history records");
        }

        return (true, "Coffee is authentic");
    }

    /**
     * @dev Lấy tổng số cafe items
     */
    function getTotalCoffeeItems() external view returns (uint256) {
        return _coffeeIds;
    }

    /**
     * @dev Kiểm tra vai trò người dùng
     */
    function getUserRole(address _user) external view returns (Role) {
        return userRoles[_user];
    }

    /**
     * @dev Kiểm tra quyền truy cập
     */
    function isUserAuthorized(address _user) external view returns (bool) {
        return authorizedUsers[_user];
    }
}
