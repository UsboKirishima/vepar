import { Server, Socket } from 'socket.io';
import http from 'http';
import * as bcrypt from 'bcrypt';
import 'dotenv/config'
import CommmandParser from './CommandParser';

export default class SocketServer {
    private server: http.Server;
    private io: Server;

    constructor(port: number) {
        this.server = http.createServer();
        this.io = new Server(this.server);

        this.initializeEvents();
        this.startServer(port);
    }

    private invalidAuth(message?: string) {
        /**
         * @todo Check if devenv is production else don't display logs
         * @example process.env.DEBUG === true ?? this.io.emit(...)
         */

        return this.io.emit('message', `Invalid Auth: ` + message)
    }

    private initializeEvents(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log('A client connected:', socket.id);

            socket.on('message', async (data: string) => {
                console.log('Message received:', data);

                /**
                 * Input security checker & decoder
                 * @example
                 * {"auth": "key123", "command": "send <message>"}
                 */

                /* Function to check if a string is json */
                const isJson = (str: string): boolean => {
                    try {
                        JSON.parse(str);
                    } catch (e) {
                        return false;
                    }

                    return true;
                }

                if(!isJson(data))
                    return this.invalidAuth('String content is not a valid json.')

                if(!data.includes('auth') || !data.includes('command'))
                    return this.invalidAuth('Fields `auth` and `command` not found.');

                type Data = {
                    auth: string;
                    command: string;
                }

                let data_object: Data = JSON.parse(data);

                /* Chars Blacklist */
                const regex = /^[a-zA-Z0-9]+$/;

                /* Regex filter */
                if(!regex.test(data_object.auth.toString()))
                    return this.invalidAuth('Regex test failed.');

                /* Length filter */
                if(data_object.auth.toString().length !== 2**7)
                    return this.invalidAuth('Length test failed.');

                let hashed_password: string = await bcrypt.hash(data_object.auth.toString(), 10);

                if(!process.env.PASSWORD)
                    return this.invalidAuth('Password not set on server settings.');

                const isAuthValid: boolean = await bcrypt.compare(process.env.PASSWORD, hashed_password);

                /* Command length limiter */
                if(data_object.command.length >= 1024) 
                    return this.io.emit('message', 'Invalid Command: Command length must be < 1024 .');

                if(isAuthValid === true) {
                    new CommmandParser(data_object.command.split(' '));
                    return this.io.emit('EOF');
                }

                return this.invalidAuth('Unexpected Behavior.');
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
