import { DefaultEventsMap, Server } from "socket.io";

type Command = {
    aliases: string[];
    callback: (
        args: string[],
        io?: Server<
            DefaultEventsMap,
            DefaultEventsMap,
            DefaultEventsMap,
            any
        >
    ) => void | Promise<void>;
}

export default class CommandParser {
    private cmd: string[] = [];
    private io: Server<
        DefaultEventsMap,
        DefaultEventsMap,
        DefaultEventsMap,
        any
    >;

    /**
     * Command Parser Constructor
     * @param io - The Socket.IO server instance
     * @param command - The command to parse
     * @example command = ['ping', 'google.com']
     */
    public constructor(
        io: Server<
            DefaultEventsMap,
            DefaultEventsMap,
            DefaultEventsMap,
            any
        >,
        command: string[]
    ) {
        this.cmd = command;
        this.io = io;  

        const commands: Command[] = [
            {
                aliases: ['ignore', 'message'],
                callback: (args: string[]) => this.messageToDashboard(args, this.io)  
            },
            {
                aliases: ['ping', 'check', 'hello'],
                callback: (args: string[]) => this.ping(args) 
            }
        ];

        commands.map(async (current_cmd: Command): Promise<void> => {
            if (current_cmd.aliases.includes(this.cmd[0])) {
                await current_cmd.callback(this.cmd.slice(1), this.io);
            }
        });
    }

    /**
     * Send a message to the log
     * @param message - The message to log
     */
    private async sendLog(message: string) {
        await console.log(message);
    }

    /**
     * @function ping
     * @description Handle ping command and send a message to clients
     * @param args - Command arguments
     */
    private async ping(args: string[]): Promise<void> {
        await this.sendLog('Hello from server!');
    }

    /**
     * @function messageToDashboard
     * @description Send a message to the dashboard via Socket.IO
     * @param args - Command arguments
     * @param io - The Socket.IO server instance
     */
    private async messageToDashboard(
        args: string[],
        io: Server<
            DefaultEventsMap,
            DefaultEventsMap,
            DefaultEventsMap,
            any
        >
    ): Promise<void> {
        const message = args.join(' ');
        io.emit('dashboardMessage', message); 
        await this.sendLog(`Message sent to dashboard: ${message}`);
    }
}
