// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {  // Must match exactly in deploy.js
    mapping(string => uint256) public votes;
    string[] public candidates;
    mapping(address => bool) public hasVoted;

    event Voted(address indexed voter, uint256 candidateId);

    constructor(string[] memory _candidates) {
        candidates = _candidates;
    }

    function vote(string memory _candidate, uint256 _candidateId) public {
        require(!hasVoted[msg.sender], "Already voted!");
        votes[_candidate]++;
        hasVoted[msg.sender] = true;

        emit Voted(msg.sender, _candidateId);
    }

    function getCandidates() public view returns (string[] memory) {
        return candidates;
    }
}
