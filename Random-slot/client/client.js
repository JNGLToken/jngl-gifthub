const { Connection, PublicKey, Transaction, Keypair, TransactionInstruction, sendAndConfirmTransaction } = require('@solana/web3.js');
const fs = require('fs');
const crypto = require('crypto');

// Define the Solana cluster to connect to (devnet, testnet, or mainnet)
const clusterUrl = 'https://api.devnet.solana.com';
const connection = new Connection(clusterUrl, 'confirmed');

// Load your wallet (keypair) from a file
const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('wallet-keypair.json')))
);

// Define the program ID of your Solana program (replace with your actual program ID)
const programId = new PublicKey('yiceQsjcTNcp92V7isaYrmvRi6CvvA21HR5gA3TrS47');

// Define the account that will interact with your program
const userAccount = wallet.publicKey;

// Function to send and confirm the transaction
async function generateRandomNumber() {
    try {

        const maxNumber = 1500;
        const block = await connection.getLatestBlockhash();
        console.log('block', block);
        const slot = await connection.getSlot();
        console.log('slot', slot);

        const blockHeight = await connection.getBlockHeight();
        console.log('blockHeight', blockHeight);

        const hashed = crypto.createHash('sha256').update(block.blockhash).digest('hex');
        const largeNumber = BigInt('0x' + hashed);

        console.log('hashed', largeNumber);

        const nineDigitNumber = largeNumber % 1000000000n; // Modulo 1 billion (10^9)
        const secondNumber = nineDigitNumber.toString().padStart(9, '0');
        console.log('generatedLogical: ', secondNumber);

        const instructionData = Buffer.concat([
            Buffer.from(new BigUint64Array([BigInt(slot)]).buffer),
            Buffer.from(new BigUint64Array([BigInt(secondNumber)]).buffer),
            Buffer.from(new Uint32Array([maxNumber]).buffer),
        ]);

        // Create the instruction to call the Solana smart contract (program)
        const instruction = new TransactionInstruction({
            programId,
            keys: [{ pubkey: userAccount, isSigner: true, isWritable: true }],
            data: instructionData,
        });

        // Create a transaction and add the instruction
        const transaction = new Transaction().add(instruction);

        const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
        console.log('Transaction confirmed with signature:', signature);
        console.log(
            `View your transaction in Solana Explorer:
            https://explorer.solana.com/tx/${signature}?cluster=devnet`
        );
    } catch (error) {
        console.error('Error calling smart contract:', error);
    }
}

// Execute the function
generateRandomNumber();
