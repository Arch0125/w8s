import { EAS, NO_EXPIRATION, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { deployContract } from "./deployer";


export async function createAttestation(coverage: string, forcedtests: string, contractAddress: string, contractBlobId: string, abiBlobId: string) {

    const easContractAddress = "0x4200000000000000000000000000000000000021";
    const schemaUID = "0xa9e793cdc0cbf407fa0de7c0bc0a24483002238eee55690f16f2fb1758f258c1";
    const eas = new EAS(easContractAddress);


    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const signer = new ethers.Wallet(process.env.AGENT_KEY || "", provider);

    await eas.connect(signer);
    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder("string coverage,string assertions,string deployments,string contractblobid,string abiblobid");
    const encodedData = schemaEncoder.encodeData([
        { name: "coverage", value: coverage, type: "string" },
        { name: "assertions", value: forcedtests, type: "string" },
        { name: "deployments", value: contractAddress, type: "string" },
        { name: "contractblobid", value: contractBlobId, type: "string" },
        { name: "abiblobid", value: abiBlobId, type: "string" }
    ]);
    const tx = await eas.attest({
        schema: schemaUID,
        data: {
            recipient: signer.address,
            expirationTime: NO_EXPIRATION,
            revocable: false, // Be aware that if your schema is not revocable, this MUST be false
            data: encodedData,
        },
    });
    const newAttestationUID = await tx.wait();

    return newAttestationUID;

}