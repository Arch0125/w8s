import Configuration, { OpenAI } from "openai";
import { promises as fs } from 'fs';
import path from 'path';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI
const client = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
});

export async function forcedTestsCheck() {
    const testFilePath = path.resolve(__dirname, './hardhat/test/Lock.ts');

    let messages = []

    let fileContent = ``;

    try {
        const testContent = await fs.readFile(testFilePath, 'utf-8');
        fileContent = testContent;
    } catch (error) {
        console.error('Error reading the file:', error);
    }


    const systemInstructions = {
        role: "system",
        content: `You are an AI Agent to detect the hardhat tests and look for any hardcoded assertions used to pass tests forcefully like,
        expect(7).to.equal(7);
        which is not a good practice. You should check if any such hardcoded assertions are present in the test file

        skip if there is a revert assertion

        If any such are present you should insert the name of the test in an array
         and return like
        {
        "forced":[<test_name>],
        }
        `,
    };

    messages.push(systemInstructions);
    messages.push({role: "user", content: fileContent});

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
