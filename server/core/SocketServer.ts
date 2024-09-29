import { Server, Socket } from 'socket.io';
import http from 'http';

export default class SocketServer {
    private server: http.Server;
    private io: Server;

    constructor(port: number) {
        this.server = http.createServer();
        this.io = new Server(this.server);

        this.initializeEvents();
        this.startServer(port);
    }

    private initializeEvents(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log('A client connected:', socket.id);

            socket.on('message', (data) => {
                console.log('Message received:', data);
                this.io.emit('message', data);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    private startServer(port: number): void {
        this.server.listen(port, () => {
            console.log(`Server listening on http://localhost:${port}`);
        });
    }
}
