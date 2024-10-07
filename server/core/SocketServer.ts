import { Server, Socket } from "socket.io";
import http from "http";
import * as bcrypt from "bcrypt";
import "dotenv/config";
import CommandParser from "./CommandParser";
import LogsManager from "./LogsManager";
import { cryptoModule } from "..";

const logger: LogsManager = new LogsManager();

export default class SocketServer {
  private server: http.Server;
  private io: Server;
  public clientIPs: Map<string, string> = new Map();

  /**
   * Creates a new SocketServer instance.
   * @param port - The port number on which the server will listen.
   */
  constructor(port: number) {
    this.server = http.createServer();
    this.io = new Server(this.server);

    this.initializeEvents();
    this.startServer(port);
  }

  /**
   * Sends an "Invalid Auth" message to the client if the authentication fails.
   * @param socket - The client socket that triggered the event.
   * @param message - Optional message to specify why the authentication failed.
   * @returns Emits a message to the client with the invalid authentication reason.
   */
  private invalidAuth(socket: Socket, message?: string) {
    return socket.emit("message", `Invalid Auth: ${message}`);
  }

  /**
   * Initializes event listeners for the Socket.IO server.
   * This handles client connections, message reception, and disconnections.
   */
  private initializeEvents(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log("A client connected:", socket.id);

      const publicKey = cryptoModule.getPublicKey();
      socket.emit('public_key_received', publicKey);
      console.log('Sent public_key to ' + socket.handshake.address)

      const ip = socket.handshake.address.replace('::ffff:', '').replace('::1', '127.0.0.1');
      this.clientIPs.set(socket.id, ip);

      /**
       * Handles the "message" event for a connected client.
       * The event expects a JSON string containing `auth` and `command`.
       */
      socket.on("message", async (data: string) => {
        const { encrypted_message, message_hash } = JSON.parse(data);
        const decrypted_message = cryptoModule.decrypt(encrypted_message);
        const isValid = cryptoModule.verifyHash(decrypted_message, message_hash);
        
        /**
         * @todo Fix hash check -> returns always invalid
         */
        if(!isValid) return console.log('Invalid message hash check!');
        data = decrypted_message;

        console.log("Message received:", data);

        console.log(data)

        if (typeof data === 'string' && ['message', 'ignore'].includes(data.split(' ')[0].toLowerCase()) && data.split(' ')[1] !== '') {
          return new CommandParser(this.io, data.split(' '), socket, false);
        }

        /**
         * Admin authentication requires the IP and password to match.
         */

        let fix_ip = socket.handshake.address.replace('::1', '127.0.0.1').replace('::ffff:', '')
        if (!fix_ip.includes(process.env.DASHBOARD_IP as string))
          return this.invalidAuth(socket, "Client IP does not match with dashboard IP");

        /**
         * Checks if a string is a valid JSON format.
         * @param str - The string to be checked.
         * @returns `true` if the string is a valid JSON, `false` otherwise.
         */
        const isJson = (str: string): boolean => {
          try {
            JSON.parse(str);
          } catch (e) {
            return false;
          }
          return true;
        };

        if (!isJson(data)) {
          return this.invalidAuth(socket, "String content is not a valid JSON.");
        }

        if (!data.includes("auth") || !data.includes("command")) {
          return this.invalidAuth(socket, "Fields `auth` and `command` not found.");
        }

        type Data = {
          auth: string;
          command: string;
        };

        const data_object: Data = JSON.parse(data);
        const regex = /^[a-zA-Z0-9]+$/;

        if (typeof data_object.auth !== "string") {
          return this.invalidAuth(socket, "Not a string.");
        }

        if (!regex.test(data_object.auth)) {
          return this.invalidAuth(socket, "Regex test failed.");
        }

        if (data_object.auth.length !== 2 ** 7) {
          return this.invalidAuth(socket, "Length test failed.");
        }

        const hashed_password: string = await bcrypt.hash(data_object.auth, 10);

        if (!process.env.PASSWORD) {
          return this.invalidAuth(socket, "Password not set on server settings.");
        }

        const isAuthValid: boolean = await bcrypt.compare(process.env.PASSWORD, hashed_password);

        if (isAuthValid === true) {
          return new CommandParser(this.io, data_object.command.split(" "), socket, true);
        }

        return this.invalidAuth(socket, "Unexpected Behavior.");
      });

      /**
       * Handles the "disconnect" event when a client disconnects from the server.
       */
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        this.clientIPs.delete(socket.id);
      });
    });
  }

  /**
   * Starts the HTTP server on the given port.
   * @param port - The port number to listen on.
   */
  private startServer(port: number): void {
    this.server.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  }
}
