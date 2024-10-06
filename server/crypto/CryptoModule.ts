import * as crypto from 'crypto';

export default class CryptoModule {
    private privateKey: crypto.KeyObject | null = null;
    private publicKey: crypto.KeyObject | null = null;

    constructor() {
        this.generateKeyPair();
    }

    private generateKeyPair(): void {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
        });
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    public getPublicKey(): string {
        if (this.publicKey) {
            return this.publicKey.export({ type: 'spki', format: 'pem' }) as string;
        }
        throw new Error('Public key not generated');
    }

    public encrypt(data: string): { encryptedData: string, hash: string } {
        if (!this.publicKey) {
            throw new Error('Public key not available');
        }

        const hash = crypto.createHash('sha256').update(data).digest('hex');

        const encryptedData = crypto.publicEncrypt(this.publicKey, Buffer.from(data, 'utf-8')).toString('base64');

        return { encryptedData, hash };
    }

    public decrypt(encryptedData: string): string {
        if (!this.privateKey) {
            throw new Error('Private key not available');
        }

        const decryptedData = crypto.privateDecrypt({
            key: this.privateKey.toString(),
            passphrase: '',
            padding: crypto.constants.RSA_PKCS1_PADDING
        },
            Buffer.from(encryptedData, 'base64')
        );
        return decryptedData.toString('utf-8');
    }

    public verifyHash(data: string, hash: string): boolean {
        const calculatedHash = crypto.createHash('sha256').update(data).digest('hex');
        return calculatedHash === hash;
    }
}
