var MyContract = artifacts.require("./contracts/YieldTracking.sol");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(MyContract);
};