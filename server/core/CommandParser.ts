import { DefaultEventsMap, Server, Socket } from "socket.io";

type Command = {
  aliases: string[];
  callback: (
    args: string[],
    socket: Socket,
    io?: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ) => void | Promise<void>;
};

export default class CommandParser {
  private cmd: string[] = [];
  private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

  /**
   * Command Parser Constructor
   * @param io - The Socket.IO server instance
   * @param command - The command to parse
   * @param socket - The client socket that sent the command
   * @example command = ['ping', 'google.com']
   */
  public constructor(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    command: string[],
    private socket: Socket,
  ) {
    this.cmd = command;
    this.io = io;

    const commands: Command[] = [
      {
        aliases: ["ignore", "message"],
        callback: (args: string[], socket: Socket) =>
          this.messageToDashboard(args, socket, this.io),
      },
      {
        aliases: ["ping", "check", "hello"],
        callback: (args: string[], socket: Socket) => this.ping(args, socket),
      },
    ];

    commands.map(async (current_cmd: Command): Promise<void> => {
      if (current_cmd.aliases.includes(this.cmd[0])) {
        await current_cmd.callback(this.cmd.slice(1), this.socket, this.io);
      }
    });
  }

  /**
   * Send a message to the log
   * @param message - The message to log
   */
  private sendLog(message: string) {
    console.log(message);
  }

  /**
   * @function ping
   * @description Handle ping command and send a message with all connected clients to the requesting client
   * @param args - Command arguments
   * @param socket - The socket of the client who sent the command
   */
  private async ping(args: string[], socket: Socket): Promise<void> {
    this.sendLog("COMMAND: Ping executed.");

    // Get the list of connected clients
    const clients = Array.from(this.io.sockets.sockets.keys());

    if (clients.length === 0) {
      socket.emit("message", "No clients connected.");
    } else {
      socket.emit("message", `Connected clients: \n - ${clients.join("\n - ")}`);
    }
  }

  /**
   * @function messageToDashboard
   * @description Send a message to the dashboard via Socket.IO
   * @param args - Command arguments
   * @param socket - The client socket that sent the command
   * @param io - The Socket.IO server instance
   */
  private async messageToDashboard(
    args: string[],
    socket: Socket,
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ): Promise<void> {
    const message = args.join(" ");
    io.emit("dashboardMessage", message);
    this.sendLog(`Message sent to dashboard: ${message}`);
  }
}
