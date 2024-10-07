import * as crypto from 'crypto';
import { pki, util } from 'node-forge';

export default class CryptoModule {
    private privateKey: pki.rsa.PrivateKey | null = null;
    private publicKey: pki.rsa.PublicKey | null = null;

    constructor() {
        this.generateKeyPair();
    }

    private generateKeyPair(): void {

        /*const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
        });*/

        const { publicKey, privateKey } = pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    public getPublicKey(): string {
        if (this.publicKey) {
            return pki.publicKeyToPem(this.publicKey);
        }
        throw new Error('Public key not generated');
    }

    public encryptFromKnownPublicKey(data: string, public_key_: pki.rsa.PublicKey ): { encryptedData: string, hash: string } {
        if (!public_key_) {
            throw new Error('Public key not available');
        }

        const hash = crypto.createHash('sha256').update(data).digest('hex');

        const bufferEncryptedData: Buffer = Buffer.from(data);
        const encryptedData = util.encode64(
            public_key_.encrypt(bufferEncryptedData.toString(), "RSA-OAEP")
        );

        return { encryptedData, hash };
    }

    public encrypt(data: string): { encryptedData: string, hash: string } {
        if (!this.publicKey) {
            throw new Error('Public key not available');
        }

        const hash = crypto.createHash('sha256').update(data).digest('hex');

        const bufferEncryptedData: Buffer = Buffer.from(data);
        const encryptedData = util.encode64(
            this.publicKey.encrypt(bufferEncryptedData.toString(), "RSA-OAEP")
        );

        return { encryptedData, hash };
    }

    public decrypt(encryptedData: string): string {
        if (!this.privateKey) {
            throw new Error('Private key not available');
        }
        /*
        const decryptedData = crypto.privateDecrypt({
            key: this.privateKey.toString(),
            passphrase: '',
            padding: crypto.constants.RSA_PKCS1_PADDING
        },
            Buffer.from(encryptedData, 'base64')
        );*/

        const decryptedData = this.privateKey.decrypt(
            util.decode64(encryptedData),
            "RSA-OAEP"
        );

        return decryptedData;
    }

    public verifyHash(data: string, hash: string): boolean {
        const calculatedHash = crypto.createHash('sha256').update(data).digest('hex');
        return calculatedHash === hash;
    }
}
