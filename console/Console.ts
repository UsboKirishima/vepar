import { io, Socket } from 'socket.io-client';
import CryptoModule from './CryptoModule';
import forge from 'node-forge';
import { Logger } from './Logger';

/**
 * The `Console` class manages the WebSocket connection and cryptographic key exchange.
 */
export class Console {
    private socket: Socket;
    private public_key: forge.pki.rsa.PublicKey;
    /*@ts-ignore*/
    private server_public_key: forge.pki.rsa.PublicKey; 
    private server_public_key_received: boolean = false;

    /**
     * Initializes the WebSocket connection and handles public key exchange.
     * 
     * @param url - The server URL to connect to.
     */
    public constructor(socket: Socket) {
        // Connect to the server
        this.socket = socket;

        // Initialize cryptographic module and get public key
        const cryptoModule = new CryptoModule(this.socket);
        const publicKey = cryptoModule.getPublicKey();

        // Convert the public key from PEM format
        this.public_key = forge.pki.publicKeyFromPem(publicKey);

        // Send public key to server
        this.socket.emit('client_key_to_server', publicKey);

        /**
         * Listens for the server's public key.
         *
         * @param data - Server's public key data.
         */
        this.socket.on('public_key_received', async (data: string) => {
            this.server_public_key = forge.pki.publicKeyFromPem(data);
            this.server_public_key_received = true;

            cryptoModule.clientKeys = [{
                id: 'server',
                pkey: cryptoModule.getPublicKey(),
            }];

            Logger.info('Public key received from server.')
        });

        this.socket.on("message", (data: string) => {
            let { encrypted_message, message_hash } = JSON.parse(data);
            Logger.info("\nMessage from server: " + cryptoModule.decrypt(encrypted_message));
        });

    }
}
