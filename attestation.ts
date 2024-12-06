import { EAS, NO_EXPIRATION, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";


export async function createAttestation(coverage:string, forcedtests:string) {

    const easContractAddress = "0x4200000000000000000000000000000000000021";
    const schemaUID = "0x3f6d2b265166430e34e3c3e8b7742f2d5a09e5065c629514230e9cb850823e1d";
    const eas = new EAS(easContractAddress);
    

    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const signer = new ethers.Wallet(process.env.AGENT_KEY, provider);

    await eas.connect(signer);
    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder("string coverage,string forcedtests");
    const encodedData = schemaEncoder.encodeData([
        { name: "coverage", value: coverage, type: "string" },
	{ name: "forcedtests", value: forcedtests, type: "string" }
    ]);
    const tx = await eas.attest({
        schema: schemaUID,
        data: {
            recipient: "0x0000000000000000000000000000000000000000",
            expirationTime: NO_EXPIRATION,
            revocable: false, // Be aware that if your schema is not revocable, this MUST be false
            data: encodedData,
        },
    });
    const newAttestationUID = await tx.wait();
    console.log("New attestation UID:", newAttestationUID);
}