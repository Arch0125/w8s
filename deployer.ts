import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

export async function deployContract(contractName: string, networks: string[], construtor: any) {
    if (!contractName || !networks || networks.length === 0) {
        throw new Error("Contract name and networks must be provided");
    }

    const results = [];

    for (const network of networks) {
        const provider = new ethers.JsonRpcProvider(`https://sepolia.base.org`);
        const wallet = new ethers.Wallet(process.env.AGENT_KEY, provider);

        const contractPath = path.join(__dirname, `./hardhat/artifacts/contracts/${contractName}.sol/${contractName}.json`);
        
        if (!fs.existsSync(contractPath)) {
            throw new Error(`Contract ${contractName} not found in ./hardhat/artifacts/contracts/`);
        }

        const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
        const contractFactory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, wallet);

        console.log(`Deploying ${contractName} to ${network}...`);
        const contract = await contractFactory.deploy(construtor);

        await contract.waitForDeployment();
        console.log(`${contractName} deployed to: ${contract.target}`);
        results.push({ network, address: contract.target });
    }

    return results;
}
