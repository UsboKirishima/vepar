import { io } from "socket.io-client";
import readline from "readline";
import "dotenv/config";
import CryptoModule from "../../crypto/CryptoModule";
import { pki } from "node-forge";

const socket = io("http://localhost:3000");
const cryptoModule = new CryptoModule();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let public_key: pki.rsa.PublicKey;


socket.on('public_key_received', (data: string) => {
  public_key = pki.publicKeyFromPem(data)
  console.log(public_key ?? 'Public key received: ' + data)
})

socket.on("message", (data: string) => {
  console.log("\nMessage from server:", cryptoModule.decrypt(data));
});

const promptUserInput = () => {
  rl.question("Enter your message: ", (message: string) => {
    if (message) {
      console.log("Sending message:", message);
      const payload = {
        auth: process.env.PASSWORD,
        command: message,
      };

      try {
        socket.emit("message", cryptoModule.encryptFromKnownPublicKey(payload.command, public_key));
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
    promptUserInput();
  });
};

promptUserInput();
