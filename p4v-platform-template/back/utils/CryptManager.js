const crypto = require('crypto');

class CryptManager {
    static BLOCK_SIZE = 16;

    constructor() {
        this.method = 'aes-128-cbc';
        this.encryptionKey = null;
        this.encryptedAESkey = null;
    }

    reset() {
        this.encryptionKey = null;
        this.encryptedAESkey = null;
    }

    encrypt(data) {
        // Reset encryption key on each operation
        this.generateEncryptionKey();
        const iv = crypto.randomBytes(CryptManager.BLOCK_SIZE);
        const cipher = crypto.createCipheriv(this.method, this.getEncryptionKey(), iv);
        let encryptedData = cipher.update(Buffer.from(data));
        encryptedData = Buffer.concat([iv, encryptedData, cipher.final()]);
        return encryptedData.toString('base64');
    }

    decrypt(aesKey, data, privateKey) {    
        const key = Buffer.from(aesKey, 'base64');
        // STEP 3: Decrypt the AES key with RSA
        const rsa = crypto.createPrivateKey(privateKey);
        const decryptedKey = crypto.privateDecrypt({ key: rsa, padding: crypto.constants.RSA_PKCS1_PADDING }, key);
    
        const iv = Buffer.from(data, 'base64').slice(0, CryptManager.BLOCK_SIZE);
        const encryptedData = Buffer.from(data, 'base64').slice(CryptManager.BLOCK_SIZE);

        const decipher = crypto.createDecipheriv(this.method, decryptedKey, iv);

        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }

    getEncryptedAESKey(publicKey) {
        if (!this.encryptedAESkey) {
            const rsa = crypto.createPublicKey(publicKey);
            this.encryptedAESkey = crypto.publicEncrypt({ key: rsa, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(this.getEncryptionKey()));
            this.encryptedAESkey = this.encryptedAESkey.toString('base64');
        }

        return this.encryptedAESkey;
    }

    getEncryptionKey() {
        if (!this.encryptionKey) {
            throw new Error('Run encrypt to generate key.');
        }

        return this.encryptionKey;
    }

    getSignedKey(privateKey) {
        const binaryEncryptedKey = Buffer.from(this.encryptedAESkey, 'base64');

        const rsa = crypto.createPrivateKey(privateKey);
        const signature = crypto.sign('sha256', binaryEncryptedKey, { key: rsa, padding: crypto.constants.RSA_PKCS1_PADDING });

        return signature.toString('base64');
    }

    generateEncryptionKey() {
        this.encryptionKey = crypto.randomBytes(CryptManager.BLOCK_SIZE);
    }
}

module.exports = CryptManager;