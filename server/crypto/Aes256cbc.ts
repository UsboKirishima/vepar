import * as crypto from 'crypto'

const ALGORITHM: string = 'aes-256-cbc';

export default class Aes256cbc {

    private readonly key: Buffer;

    private readonly iv: Buffer;

    constructor(key: string, iv: string) {

        /**
         *  !! Security Warning !!
         *  ! This class manages sensitive attributes
         *  ! ~ usbo
         */
        this.key = Buffer.from(key, 'utf-8');
        this.iv = Buffer.from(iv, 'utf-8');
    }

    async encrypt(str: string): Promise<string> {
        const cipher = crypto.createCipheriv(ALGORITHM, this.key, this.iv);
        let encrypted = cipher.update(str, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    async decrypt(str: string): Promise<string> {
        const decipher = crypto.createDecipheriv(ALGORITHM, this.key, this.iv);
        let decrypted = decipher.update(str, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    }
}