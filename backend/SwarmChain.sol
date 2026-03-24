// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SwarmChain {

    struct Update {
        string  nodeId;
        uint256 accuracy;
        string  weightsHash;
        bool    approved;
        uint256 trustScore;
        uint256 timestamp;
    }

    mapping(string => uint256) public trustScores;
    Update[] public updates;

    uint256 public approvalCount;
    uint256 public rejectionCount;

    uint256 constant MIN_ACCURACY = 50;
    uint256 constant MAX_ACCURACY = 95;
    uint256 constant MIN_TRUST    = 50;

    event UpdateSubmitted(
        string  indexed nodeId,
        uint256 accuracy,
        bool    approved,
        uint256 trustScore,
        string  weightsHash
    );

    constructor() {
        // seed each node with a starting trust score
        trustScores["Node_A"] = 100;
        trustScores["Node_B"] = 100;
        trustScores["Node_C"] = 100;
    }

    function submitUpdate(
        string  memory nodeId,
        uint256 accuracy,
        string  memory weightsHash
    ) public returns (bool approved) {

        approved = (
            accuracy >= MIN_ACCURACY &&
            accuracy <= MAX_ACCURACY &&
            trustScores[nodeId] >= MIN_TRUST
        );

        if (approved) {
            trustScores[nodeId] = _min(trustScores[nodeId] + 5, 200);
            approvalCount++;
        } else {
            trustScores[nodeId] = trustScores[nodeId] >= 10
                ? trustScores[nodeId] - 10
                : 0;
            rejectionCount++;
        }

        updates.push(Update({
            nodeId:      nodeId,
            accuracy:    accuracy,
            weightsHash: weightsHash,
            approved:    approved,
            trustScore:  trustScores[nodeId],
            timestamp:   block.timestamp
        }));

        emit UpdateSubmitted(nodeId, accuracy, approved, trustScores[nodeId], weightsHash);
        return approved;
    }

    function getTrustScore(string memory nodeId) public view returns (uint256) {
        return trustScores[nodeId];
    }

    function getUpdateCount() public view returns (uint256) {
        return updates.length;
    }

    function getApprovalStats() public view returns (uint256, uint256) {
        return (approvalCount, rejectionCount);
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
