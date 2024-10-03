import { io } from "socket.io-client";
import readline from "readline";
import "dotenv/config";

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

socket.on("message", (data: string) => {
  console.log("\nMessage from server:", data);
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
        socket.emit("message", JSON.stringify(payload));
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
    promptUserInput();
  });
};

promptUserInput();
