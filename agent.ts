import { forcedTestsCheck } from ".";
import { createAttestation } from "./attestation";
import { uploadBlob } from "./blobuploader";
import { coverageCheck } from "./coverage";
import { deployContract } from "./deployer";

const log = (step, message) => {
    console.log(`\x1b[34m[${step}]\x1b[0m ${message}`);
};

const success = (message) => {
    console.log(`\x1b[32m[✔️ SUCCESS]\x1b[0m ${message}`);
};

const error = (message) => {
    console.log(`\x1b[31m[❌ ERROR]\x1b[0m ${message}`);
};

const divider = () => {
    console.log("\x1b[33m--------------------------------------------------\x1b[0m");
};

const beautifyJSON = (data) => JSON.stringify(JSON.parse(data), null, 2);

async function main() {
    try {
        // Step 1: Coverage Check
        log("Step 1", "Checking code coverage...");
        const coverage = await coverageCheck();
        console.log(`Coverage Report:\n${beautifyJSON(JSON.stringify(coverage))}`);
        divider();

        // Step 2: Forced Tests Check
        log("Step 2", "Checking for forced tests...");
        const forcedTest = await forcedTestsCheck();
        console.log(`Forced Tests Report:\n${beautifyJSON(JSON.stringify(forcedTest))}`);
        divider();

        // Step 3: Deploy Contract
        log("Step 3", "Deploying VulnerableERC20 contract...");
        const contractAddress = await deployContract("VulnerableERC20", ["base", "holesky"], []);
        success("VulnerableERC20 contract deployed!");
        console.log(`Deployed Contract Address:\n${beautifyJSON(JSON.stringify(contractAddress))}`);
        divider();

        // Step 4: Upload Blobs
        log("Step 4", "Uploading contract and ABI blobs...");
        const blobIds = await uploadBlob("VulnerableERC20");
        success("Blobs uploaded!");
        console.log(`Blob IDs:\n${JSON.stringify(blobIds, null, 2)}`);
        divider();

        // Step 5: Create Attestation
        log("Step 5", "Creating attestation...");
        const attestation = await createAttestation(
            JSON.stringify(coverage),
            JSON.stringify(forcedTest),
            JSON.stringify(contractAddress),
            blobIds.contractBlobId,
            blobIds.abiBlobId
        );
        success(`Attestation created! UID: ${attestation}`);
        divider();

    } catch (e) {
        error(e.message || "An unexpected error occurred.");
        console.error(e);
    }
}

main();