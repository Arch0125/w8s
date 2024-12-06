import { exec } from 'child_process';
import {OpenAI} from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI
const client = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
});

function runCoverage(): Promise<string> {
    return new Promise((resolve, reject) => {
        exec('npx hardhat coverage', { cwd: './hardhat' }, (error, stdout, stderr) => {
            if (error) {
                return resolve(error);
            }
            if (stderr) {
                
                return resolve(stderr);
            }
            return resolve(stdout);
        });
    });
}




export async function coverageCheck() {

    let coverageResult = await runCoverage();

    let messages = []

    const systemInstructions = {
        role: "system",
        content: `You are an AI Agent to detect the code coverage of the test file,
        you will be given the stdout of a coverage run and
        
        you should respond in the following way:
        {
            "passedtests": [<test_name>],
            "failedtests": [<test_name>],
            "branches": <branch_coverage>,
            "functions": <function_coverage>,
            "lines": <line_coverage>
        }
        `,
    };

    messages.push(systemInstructions);
    messages.push({role: "user", content: coverageResult.toString()});

    try {
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
        });

        const reply = response.choices[0].message.content;

        console.log(reply);

        return reply;
    } catch (error) {
        console.error("Failed to process the message with OpenAI:", error);
    }
}