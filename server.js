require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');

const app = express();
const port = 3000;

const contractABI = require('./build/contracts/YieldTracking.json').abi;


const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

app.use(express.json());

app.post('/add-farmer', async (req, res) => {
    const { address, name, yieldAmount } = req.body;
    try {
        const tx = await contract.addFarmer(address, name, yieldAmount);
        await tx.wait();
        const count = await contract.getFarmerCount();
        res.json({
            message: 'Farmer added successfully',
            transaction: tx,
            farmerCount: count.toString()
        });
    } catch (error) {
        console.error("Error in add-farmer:", error);
        res.status(500).send(error.toString());
    }
});

app.post('/add-middleman', async (req, res) => {
    const { address, name, yieldAmount } = req.body;
    try {
        const tx = await contract.addMiddleman(address, name, yieldAmount);
        await tx.wait();
        const count = await contract.getMiddlemanCount();
        res.json({
            message: 'Middleman added successfully',
            transaction: tx,
            middlemanCount: count.toString()
        });
    } catch (error) {
        console.error("Error in add-middleman:", error);
        res.status(500).send(error.toString());
    }
});


app.post('/add-retailer', async (req, res) => {
    const { address, name } = req.body;
    try {
        const tx = await contract.addRetailer(address, name);
        await tx.wait();
        const count = await contract.getRetailerCount();
        res.json({
            message: 'Retailer added successfully',
            transaction: tx,
            retailerCount: count.toString()
        });
    } catch (error) {
        console.error("Error in add-retailer:", error);
        res.status(500).send(error.toString());
    }
});


app.post('/transfer-yield', async (req, res) => {
    const { from, to, yieldAmount } = req.body;
    try {
        const tx = await contract.transferYield(from, to, yieldAmount);
        const receipt = await tx.wait();


        console.log("Receipt: ", receipt);
        console.log("Receipt Logs: ", receipt.logs);


        const eventSignature = ethers.utils.id("YieldTransferred(address,address,uint256,bool)");
        const abiCoder = new ethers.utils.Interface([
            "event YieldTransferred(address indexed from, address indexed to, uint256 yield, bool belowThreshold)"
        ]);

        let belowThreshold = false;
        for (const log of receipt.logs) {
            if (log.topics[0] === eventSignature) {
                const decodedLog = abiCoder.decodeEventLog(
                    "YieldTransferred",
                    log.data,
                    log.topics
                );
                belowThreshold = decodedLog.belowThreshold;
                console.log("Decoded Log: ", decodedLog);
                break;
            }
        }

        if (belowThreshold) {
            res.json({
                message: 'Yield transferred successfully, but middleman yield is below 20%',
                transaction: tx
            });
        } else {
            res.json({
                message: 'Yield transferred successfully',
                transaction: tx
            });
        }
    } catch (error) {
        console.error("Error in transfer-yield:", error);
        res.status(500).send(error.toString());
    }
});

app.get('/middleman-yield/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const yieldAmount = await contract.getMiddlemanYield(address);
        res.json({ yield: yieldAmount.toString() });
    } catch (error) {
        console.error("Error in getting middleman yield:", error);
        res.status(500).send(error.toString());
    }
});

app.get('/retailer-yield/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const yieldAmount = await contract.getretailerYield(address);
        res.json({ yield: yieldAmount.toString() });
    } catch (error) {
        console.error("Error in getting retailer yield:", error);
        res.status(500).send(error.toString());
    }
});

app.get('/farmer-yield/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const yieldAmount = await contract.getFarmerYield(address);
        res.json({ yield: yieldAmount.toString() });
    } catch (error) {
        console.error("Error in getting farmer yield:", error);
        res.status(500).send(error.toString());
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
