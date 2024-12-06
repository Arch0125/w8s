import { forcedTestsCheck } from ".";
import { createAttestation } from "./attestation";
import { coverageCheck } from "./coverage";

async function main(){
    const coverage = await coverageCheck();
    const forcedTest = await forcedTestsCheck();

    const attestation  = await createAttestation(JSON.stringify(coverage), JSON.stringify(forcedTest));
}

main();