type Command = {
    aliases: string[];
    callback: (args: string[]) => void | Promise<void>;
}

export default class CommmandParser {
    private cmd: string[] = [];

    /**
     * Command Parser Contructor
     * @param command 
     * @example command = ['ping', 'google.com']
     */
    public constructor(command: string[]) {
        /* NOTE: Command is already lowercase */
        this.cmd = command;

        const commands: Command[] = [
            {
                aliases: ['ping', 'check', 'hello'],
                callback: (args: string[]) => this.ping(args)
            }
        ]

        commands.map(async (current_cmd: Command): Promise<void> => {
            if(current_cmd.aliases.includes(this.cmd[0]))
                await current_cmd.callback(this.cmd.slice(1));
        })
    }

    private async sendLog(message: string) {
        await console.log(message);
    }

    /**
     * @function ping()
     * @description Send a ping to clients
     */
    private async ping(args: string[]): Promise<void> {
        this.sendLog('Hello from server!');
    }
}