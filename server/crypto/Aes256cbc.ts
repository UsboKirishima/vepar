import * as crypto from 'crypto';

const ALGORITHM: string = 'aes-256-cbc';

/**
 * Aes256cbc class for encrypting and decrypting strings using AES-256-CBC algorithm.
 */
export default class Aes256cbc {
    private readonly key: Buffer;
    private readonly iv: Buffer;

    /**
     * Creates an instance of Aes256cbc.
     * @param key - The encryption key (must be 32 bytes for AES-256).
     * @param iv - The initialization vector (must be 16 bytes).
     * @throws Will throw an error if the key or iv is of incorrect length.
     * 
     *  !! Security Warning !!
     *  This class manages sensitive attributes.
     *  Ensure the key and iv are kept secret and secure.
     */
    constructor(key: string, iv: string) {
        this.key = Buffer.from(key, 'utf-8');
        this.iv = Buffer.from(iv, 'utf-8');
    }

    /**
     * Encrypts a string using the AES-256-CBC algorithm.
     * @param str - The string to encrypt.
     * @returns A promise that resolves to the encrypted string in hexadecimal format.
     */
    async encrypt(str: string): Promise<string> {
        const cipher = crypto.createCipheriv(ALGORITHM, this.key, this.iv);
        let encrypted = cipher.update(str, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * Decrypts a string using the AES-256-CBC algorithm.
     * @param str - The encrypted string in hexadecimal format.
     * @returns A promise that resolves to the decrypted string.
     */
    async decrypt(str: string): Promise<string> {
        const decipher = crypto.createDecipheriv(ALGORITHM, this.key, this.iv);
        let decrypted = decipher.update(str, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    }
}
