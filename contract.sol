pragma solidity ^0.4.21;


contract Solution {

    address public owner;

    function Solution() public {
        owner = msg.sender;
    }

    modifier onlyOwnerAllowed() {
        require(msg.sender == owner);
        _;
    }

    function getSolution() public view onlyOwnerAllowed returns (uint) {
       return 42;
    } 
}
