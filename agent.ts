import { forcedTestsCheck } from ".";
import { createAttestation } from "./attestation";
import { uploadBlob } from "./blobuploader";
import { coverageCheck } from "./coverage";
import { deployContract } from "./deployer";

async function main(){
    const coverage = await coverageCheck();
    const forcedTest = await forcedTestsCheck();

    
    const contractAddress = await deployContract("VulnerableERC20", ["base","holesky"], []);
    
    console.log("Contract deployed at:", contractAddress);
    
    const blobIds = await uploadBlob("VulnerableERC20")
    
    const attestation  = await createAttestation(JSON.stringify(coverage), JSON.stringify(forcedTest), JSON.stringify(contractAddress), blobIds.contractBlobId, blobIds.abiBlobId);
}

main();