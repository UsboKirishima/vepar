import * as crypto from 'node:crypto';
import forge from 'node-forge';
import type { DefaultEventsMap, Socket } from 'socket.io';
import { Socket as ClientSocket_ } from 'socket.io-client';

/**
 * ATTENTION: Mirror of vepar/server/crypto/CryptoModule.ts
 */
export default class CryptoModule {
    private privateKey: forge.pki.rsa.PrivateKey | null = null;
    private publicKey: forge.pki.rsa.PublicKey | null = null;
    private clientPublicKeys: { id: string; pkey: string }[] = [];
    private socket: Socket | ClientSocket_ | null = null;

    constructor(socket: Socket | ClientSocket_) {
        this.generateKeyPair();
        this.socket = socket;
    }

    private isValidBase64(str: string): boolean {
        return /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(
            str
        );
    }

    public set clientKeys(arr: { id: string; pkey: string }[]) {

        this.clientPublicKeys = arr;
    }

    public get clientKeys(): { id: string; pkey: string }[] {
        return this.clientPublicKeys;
    }

    private generateKeyPair(): void {

        const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 });

        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    public getPublicKey(): string {
        if (this.publicKey) {
            return forge.pki.publicKeyToPem(this.publicKey);
        }
        throw new Error('Public key not generated');
    }

    public encrypt(data: string, server: boolean = false): { encryptedData: string, hash: string } {

        const keyOfThisSocketObject: {
            id: string;
            pkey: string;
        } | undefined = this.clientPublicKeys.find(client => server ? client.id === 'server' : client.id === this.socket?.id);

        console.log(this.clientPublicKeys)
        if (keyOfThisSocketObject == undefined) {
            throw new Error('Public key not available');
        }
        const socketPublicKey: forge.pki.rsa.PublicKey = forge.pki.publicKeyFromPem(keyOfThisSocketObject.pkey);

        const hash = crypto.createHash('sha256').update(data).digest('hex');

        const encodedData = forge.util.encodeUtf8(data)

        const encryptedData = forge.util.encode64(
            socketPublicKey.encrypt(encodedData, 'RSA-OAEP', {
                md: forge.md.sha256.create()
            }),
        );

        return { encryptedData, hash };
    }

    public sendEncryptedMessage(event: string, data: string, server: boolean = false) {
        let encData = this.encrypt(data, server ?? true);
        return this.socket?.emit(event,
            JSON.stringify({ encrypted_message: encData.encryptedData, message_hash: encData.hash })
        );
    }

    public decrypt(encryptedData: string): string {
        if (!this.privateKey) {
            throw new Error('Private key not available');
        }

        if (!this.isValidBase64(encryptedData)) {
            throw new Error('Invalid base64 Detected!');
        }

        try {
            const decodedData = forge.util.decode64(encryptedData);
            const decryptedData = this.privateKey.decrypt(decodedData, 'RSA-OAEP', {
                md: forge.md.sha256.create()
            });

            return forge.util.decodeUtf8(decryptedData);
        } catch (error: any) {
            throw new Error(error);
        }
    }

    public verifyHash(data: string, hash: string): boolean {
        const calculatedHash = crypto.createHash('sha256').update(data).digest('hex');
        return calculatedHash === hash;
    }
}
