// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ResumeSwarmLearning {
    
    struct Node {
        address nodeAddress;
        string nodeName;
        uint256 trustScore;
        uint256 submissionCount;
        uint256 approvalCount;
        uint256 rejectionCount;
        bool isActive;
    }
    
    struct ModelUpdate {
        address nodeAddress;
        uint256 round;
        uint256 accuracy;
        string weightsHash;
        uint256 timestamp;
        bool isApproved;
    }
    
    address public owner;
    uint256 public currentRound = 1;
    uint256 public minAccuracy = 50;
    uint256 public maxAccuracy = 95;
    
    mapping(address => Node) public nodes;
    mapping(uint256 => ModelUpdate[]) public roundUpdates;
    address[] public registeredNodes;
    
    event NodeRegistered(address indexed nodeAddress, string nodeName);
    event UpdateSubmitted(address indexed nodeAddress, uint256 indexed round, uint256 accuracy, bool approved);
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerNode(string memory _nodeName) public {
        require(!nodes[msg.sender].isActive, "Already registered");
        
        nodes[msg.sender] = Node({
            nodeAddress: msg.sender,
            nodeName: _nodeName,
            trustScore: 100,
            submissionCount: 0,
            approvalCount: 0,
            rejectionCount: 0,
            isActive: true
        });
        
        registeredNodes.push(msg.sender);
        emit NodeRegistered(msg.sender, _nodeName);
    }
    
    function submitUpdate(uint256 _accuracy, string memory _weightsHash) public returns (bool) {
        require(nodes[msg.sender].isActive, "Not registered");
        
        bool approved = true;
        
        if (_accuracy < minAccuracy || _accuracy > maxAccuracy) {
            approved = false;
        }
        
        if (nodes[msg.sender].trustScore < 50) {
            approved = false;
        }
        
        ModelUpdate memory newUpdate = ModelUpdate({
            nodeAddress: msg.sender,
            round: currentRound,
            accuracy: _accuracy,
            weightsHash: _weightsHash,
            timestamp: block.timestamp,
            isApproved: approved
        });
        
        roundUpdates[currentRound].push(newUpdate);
        nodes[msg.sender].submissionCount += 1;
        
        if (approved) {
            nodes[msg.sender].approvalCount += 1;
            nodes[msg.sender].trustScore += 5;
        } else {
            nodes[msg.sender].rejectionCount += 1;
            nodes[msg.sender].trustScore = nodes[msg.sender].trustScore > 10 ? nodes[msg.sender].trustScore - 10 : 0;
        }
        
        emit UpdateSubmitted(msg.sender, currentRound, _accuracy, approved);
        return approved;
    }
    
    function completeRound() public {
        currentRound += 1;
    }
    
    function getNodeInfo(address _nodeAddress) public view returns (Node memory) {
        return nodes[_nodeAddress];
    }
    
    function getRoundUpdates(uint256 _round) public view returns (ModelUpdate[] memory) {
        return roundUpdates[_round];
    }
    
    function getAverageAccuracyForRound(uint256 _round) public view returns (uint256) {
        ModelUpdate[] memory updates = roundUpdates[_round];
        if (updates.length == 0) return 0;
        
        uint256 sum = 0;
        uint256 approvedCount = 0;
        
        for (uint256 i = 0; i < updates.length; i++) {
            if (updates[i].isApproved) {
                sum += updates[i].accuracy;
                approvedCount += 1;
            }
        }
        
        if (approvedCount == 0) return 0;
        return sum / approvedCount;
    }
}