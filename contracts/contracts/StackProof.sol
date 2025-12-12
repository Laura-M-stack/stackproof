// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StackProof {
    string public name = "StackProof";

    mapping(address => bool) public hasPosted;

    event ProofSubmitted(address indexed user, string proof);

    function submitProof(string calldata proof) external {
        require(!hasPosted[msg.sender], "You already submitted a proof");
        hasPosted[msg.sender] = true;
        emit ProofSubmitted(msg.sender, proof);
    }
}
