// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract YieldTracking {
    struct User {
        string name;
        uint256 yield;
    }

    struct Transaction {
        address from;
        address to;
        uint256 yield;
        uint256 timestamp;
    }

    // uint256 checker;

    mapping(address => User) public farmers;
    mapping(address => User) public middlemen;
    mapping(address => User) public retailers;

    address[] public farmerAddresses;
    address[] public middlemanAddresses;
    address[] public retailerAddresses;

    Transaction[] public transactions;

    event YieldTransferred(address indexed from, address indexed to, uint256 yield, bool belowThreshold);

    function addFarmer(address _address, string memory _name, uint256 _yield) public {
        farmers[_address] = User(_name, _yield);
        farmerAddresses.push(_address);
    }

    function addMiddleman(address _address, string memory _name, uint256 _yield) public {
        middlemen[_address] = User(_name, _yield);
        middlemanAddresses.push(_address);
    }

    function addRetailer(address _address, string memory _name) public {
        retailers[_address] = User(_name, 0);
        retailerAddresses.push(_address);
    }

    function transferYield(address _from, address _to, uint256 _yield) public {
        require(_yield > 0, "Yield must be greater than 0");

        bool belowThreshold = false;

        if (farmers[_from].yield >= _yield) {
            farmers[_from].yield -= _yield;
            middlemen[_to].yield += _yield;
        } else if (middlemen[_from].yield >= _yield) {
            // checker=middlemen[_from].yield ;
            middlemen[_from].yield -= _yield;
            if (_yield < ((middlemen[_from].yield ) * 2 / 10)) { // Checking if remaining yield is below 20% of transferred yield
                belowThreshold = true;
            }
            if (bytes(retailers[_to].name).length != 0) {
                retailers[_to].yield += _yield;
            } else {
                middlemen[_to].yield += _yield;
            }
        } else {
            revert("Insufficient yield to transfer");
        }

        transactions.push(Transaction(_from, _to, _yield, block.timestamp));
        emit YieldTransferred(_from, _to, _yield, belowThreshold);
    }

    function getAllFarmers() public view returns (address[] memory) {
        return farmerAddresses;
    }

    function getAllMiddlemen() public view returns (address[] memory) {
        return middlemanAddresses;
    }

    function getAllRetailers() public view returns (address[] memory) {
        return retailerAddresses;
    }

    function getFarmerCount() public view returns (uint256) {
        return farmerAddresses.length;
    }

    function getMiddlemanCount() public view returns (uint256) {
        return middlemanAddresses.length;
    }

    function getRetailerCount() public view returns (uint256) {
        return retailerAddresses.length;
    }

    function getMiddlemanYield(address _address) public view returns (uint256) {
        return middlemen[_address].yield;
    }

    function getFarmerYield(address _address) public view returns (uint256){
        return farmers[_address].yield;
    }

    function getretailerYield(address _address) public view returns (uint256){
        return retailers[_address].yield;
    }
}
