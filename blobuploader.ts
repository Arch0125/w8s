import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

export async function uploadBlob(contractName: string) {
    if (!contractName) {
        throw new Error("Contract name and networks must be provided");
    }


        const contractJsonPath = path.join(__dirname, `./hardhat/artifacts/contracts/${contractName}.sol/${contractName}.json`);
        
        if (!fs.existsSync(contractJsonPath)) {
            throw new Error(`Contract ${contractName} not found in ./hardhat/artifacts/contracts/`);
        }

        const contractJson = fs.readFileSync(contractJsonPath, "utf8");
        
        const contractPath = path.join(__dirname, `./hardhat/contracts/${contractName}.sol`);

        if (!fs.existsSync(contractPath)) {
            throw new Error(`Contract ${contractName} not found in ./hardhat/contracts/`);
        }

        const contractContent = fs.readFileSync(contractPath, "utf8");

        
        const response = await axios.put("https://publisher.walrus-testnet.walrus.space/v1/store", contractContent, {
            headers: {
                "Content-Type": "text/plain"
            }
        });

        let contractBlobId: string;

        if (response.data.newlyCreated) {
            contractBlobId = response.data.newlyCreated.blobObject.blobId;
        } else if (response.data.alreadyCertified) {
            contractBlobId = response.data.alreadyCertified.blobId;
        } else {
            throw new Error("Unexpected response format");
        }

        const responseabi = await axios.put("https://publisher.walrus-testnet.walrus.space/v1/store", contractJson, {
            headers: {
                "Content-Type": "text/plain"
            }
        });

        let abiBlobId: string;

        if (responseabi.data.newlyCreated) {
            abiBlobId = responseabi.data.newlyCreated.blobObject.blobId;
        } else if (responseabi.data.alreadyCertified) {
            abiBlobId = responseabi.data.alreadyCertified.blobId;
        } else {
            throw new Error("Unexpected response format");
        }

        return { contractBlobId, abiBlobId };

}

