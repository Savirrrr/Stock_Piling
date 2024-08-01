const YieldTracking = artifacts.require("YieldTracking");

async function getUserDetails(instance, address, userType) {
    const user = await instance[userType](address);
    return {
        address: address,
        name: user.name,
        yield: user.yield.toString()
    };
}

module.exports = async function(callback) {
    try {
        const accounts = await web3.eth.getAccounts();
        const instance = await YieldTracking.deployed();

        console.log("Adding a farmer...");
        await instance.addFarmer(accounts[1], "Farmer1", 1000, { from: accounts[0] });
        const farmerDetails = await getUserDetails(instance, accounts[1], 'farmers');
        console.log("Farmer added:", farmerDetails);

        console.log("Adding a middleman...");
        await instance.addMiddleman(accounts[2], "Middleman1", 500, { from: accounts[0] });
        const middlemanDetails = await getUserDetails(instance, accounts[2], 'middlemen');
        console.log("Middleman added:", middlemanDetails);

        console.log("Adding a retailer...");
        await instance.addRetailer(accounts[3], "Retailer1", { from: accounts[0] });
        const retailerDetails = await getUserDetails(instance, accounts[3], 'retailers');
        console.log("Retailer added:", retailerDetails);

        console.log("Transferring yield from farmer to middleman...");
        await instance.transferYield(accounts[1], accounts[2], 200, { from: accounts[0] });
        const updatedFarmerDetails = await getUserDetails(instance, accounts[1], 'farmers');
        const updatedMiddlemanDetails = await getUserDetails(instance, accounts[2], 'middlemen');
        console.log("Yield transferred.");
        console.log("Updated Farmer details:", updatedFarmerDetails);
        console.log("Updated Middleman details:", updatedMiddlemanDetails);

        console.log("Transferring yield from middleman to retailer...");
        await instance.transferYield(accounts[2], accounts[3], 100, { from: accounts[0] });
        const finalMiddlemanDetails = await getUserDetails(instance, accounts[2], 'middlemen');
        const updatedRetailerDetails = await getUserDetails(instance, accounts[3], 'retailers');
        console.log("Yield transferred.");
        console.log("Updated Middleman details:", finalMiddlemanDetails);
        console.log("Updated Retailer details:", updatedRetailerDetails);

        callback();
    } catch (error) {
        console.error(error);
        callback(error);
    }
};
