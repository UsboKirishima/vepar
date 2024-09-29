import { io } from 'socket.io-client';
import readline from 'readline';

const socket = io('http://localhost:3000');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

socket.on('message', (data: string) => {
    console.log('Message from server:', data);
});

const promptUserInput = () => {
    rl.question('Enter your message: ', (message: string) => {
        if (message) {
            console.log('Sending message:', message);
            socket.emit('message', message);
        }
        promptUserInput(); 
    });
};

promptUserInput();
