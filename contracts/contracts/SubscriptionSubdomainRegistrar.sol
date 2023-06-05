//SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {INameWrapper, PARENT_CANNOT_CONTROL, CAN_EXTEND_EXPIRY} from "@ensdomains/ens-contracts/contracts/wrapper/INameWrapper.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {BaseSubdomainRegistrar, InsufficientFunds, DataMissing, Unavailable, NameNotRegistered} from "./BaseSubdomainRegistrar.sol";

struct Name {
    uint256 registrationFee; // per registration (31 days)
    bool available;
    uint256 balance;
    mapping(string => bool) subdomainMinted;
}

contract SubscriptionSubdomainRegistrar is BaseSubdomainRegistrar, ERC1155Holder {
    mapping(bytes32 => Name) public names;
    constructor(address wrapper) BaseSubdomainRegistrar(wrapper) {}

    function setupDomain(
        bytes32 node,
        uint256 fee
    ) public onlyOwner(node) {
        names[node].registrationFee = fee;
        names[node].available = true;
    }

    function withdraw(bytes32 node) external onlyOwner(node) {
        (bool success, ) = payable(msg.sender).call{value: names[node].balance}('');
        names[node].balance = 0;
        require(success);
    }

    function subdomainMinted(bytes32 parentNode, string calldata label) public view returns (bool) {
        return names[parentNode].subdomainMinted[label];
    }

    function register(
        bytes32 parentNode,
        string calldata label,
        address newOwner,
        address resolver,
        uint16 fuses,
        uint64 duration,
        bytes[] calldata records
    ) public payable {
        require(names[parentNode].available, "parent name is not available for subdomains");
        uint256 fee = duration * names[parentNode].registrationFee;
        require(msg.value >= fee, "msg value does not meet the price");
        require(!names[parentNode].subdomainMinted[label], "this subdomain has been minted");
        
        duration = duration * 31 days;

        (, , uint64 parentExpiry) = wrapper.getData(uint256(parentNode));
        require(parentExpiry - uint64(block.timestamp) > duration, "duration exceeds limit");

        _register(
            parentNode,
            label,
            newOwner,
            resolver,
            0,
            uint64(block.timestamp) + duration,
            records
        );
        names[parentNode].balance += msg.value;
        names[parentNode].subdomainMinted[label] = true;
    }

    function renew(
        bytes32 parentNode,
        bytes32 labelhash,
        uint64 duration
    ) external payable returns (uint64 newExpiry) {
        _checkParent(parentNode, duration);

        uint256 fee = duration * names[parentNode].registrationFee;
        require(msg.value >= fee, "msg value does not meet the price");
        
        duration = duration * 31 days;

        names[parentNode].balance += msg.value;
        return _renew(parentNode, labelhash, duration);
    }

    function batchAirdrop(
        bytes32 parentNode,
        string[] calldata labels,
        address[] calldata addresses,
        address resolver,
        uint16 fuses,
        uint64[] calldata durations,
        bytes[][] calldata records
    ) public onlyOwner(parentNode) {
        if (
            labels.length != addresses.length || labels.length != records.length
        ) {
            revert DataMissing();
        }

        uint64 largest = durations[0];
        for (uint i = 1; i < durations.length; i++) {
            if (durations[i] > largest) {
                largest = durations[i];
            }
        }

        _checkParent(parentNode, largest * 31 days);

        for (uint256 i = 0; i < labels.length; i++) {
            _register(
                parentNode,
                labels[i],
                addresses[i],
                resolver,
                fuses,
                uint64(block.timestamp) + durations[i] * 31 days,
                records[i]
            );
        }
    }

    function _renew(
        bytes32 parentNode,
        bytes32 labelhash,
        uint64 duration
    ) internal returns (uint64 newExpiry) {
        bytes32 node = _makeNode(parentNode, labelhash);
        (, , uint64 expiry) = wrapper.getData(uint256(node));
        if (expiry < block.timestamp) {
            revert NameNotRegistered();
        }

        newExpiry = expiry += duration;

        wrapper.setChildFuses(parentNode, labelhash, 0, newExpiry);

        emit NameRenewed(node, newExpiry);
    }

    function _checkParent(bytes32 parentNode, uint64 duration) internal {
        (, uint64 parentExpiry) = super._checkParent(parentNode);

        require(duration + block.timestamp < parentExpiry, "duration exceeds limit");
    }

    function _makeNode(bytes32 node, bytes32 labelhash)
        private
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(node, labelhash));
    }

}
