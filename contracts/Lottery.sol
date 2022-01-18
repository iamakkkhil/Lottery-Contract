// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .001 ether, "Provide .001 ether to proceed ahead");
        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        // keccak256/sha256 is a hashing algorithm
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function pickWinner() public restricted {
        uint index = random() % players.length;
        payable(players[index]).transfer(address(this).balance);
        // Resetting the array for new round of lottery
        players = new address[](0);
    }

    // Added a modifier as we can keep our code DRY
    modifier restricted() {
        require(msg.sender == manager, "Can only access by the manager");
        _;
    }

    function getPlayers() public view returns(address[] memory) {
        return players;
    }
}