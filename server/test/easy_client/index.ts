import { io } from "socket.io-client";
import readline from "readline";
import "dotenv/config";
import CryptoModule from "../../crypto/CryptoModule";
import forge from 'node-forge';
import { Socket } from "socket.io-client";

const socket = io("http://localhost:3000");

const cryptoModule = new CryptoModule(socket);
const publicKey = cryptoModule.getPublicKey();

//Send client publicKey to server
socket.emit('client_key_to_server', publicKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let server_public_key: forge.pki.rsa.PublicKey;
let publicKeyReceived = false;

// Function to handle user input
const promptUserInput = () => {
  rl.question("Enter your message: ", (message: string) => {
    if (message) {
      console.log("Sending message:", message);
      const payload = {
        auth: process.env.PASSWORD,
        command: message,
      };

      try {
        cryptoModule.sendEncryptedMessage('message', payload.command, true);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
    promptUserInput(); // Recursive call to keep the prompt going
  });
};

//Receive server public key
console.log('New connection to server!')

socket.on('public_key_received', async (data: string) => {

  server_public_key = forge.pki.publicKeyFromPem(data);
  publicKeyReceived = true;

  cryptoModule.clientKeys = [{
    id: 'server',
    pkey: cryptoModule.getPublicKey(),
  }];

  console.log('Public key received: ' + data);

  // Now that public key is received, start accepting user input
  promptUserInput();
});

socket.on("message", (data: string) => {
  let { encrypted_message, message_hash } = JSON.parse(data);
  console.log("\nMessage from server:", cryptoModule.decrypt(encrypted_message));
});
