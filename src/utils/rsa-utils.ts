
import { promises as fs } from 'fs';
import { publicEncrypt, privateDecrypt, constants } from 'crypto';

const publicKeyPath = "./static/certs/public_key.pem";
const privateKeyPath = './static/certs/private_key.pem';

export async function encryptWithPublicKey(text: string): Promise<string> {
    const publicKey = await fs.readFile(publicKeyPath, { encoding: 'utf-8' });
    const buffer = Buffer.from(text);
    const encrypted = publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
}

export async function decryptWithPrivateKey(encryptedText: string): Promise<string> {
    const privateKey = await fs.readFile(privateKeyPath, { encoding: 'utf-8' });
    const buffer = Buffer.from(encryptedText, 'base64');
    const decrypted = privateDecrypt(
        {
            key: privateKey,
            passphrase: 'whatcanido',
            padding: constants.RSA_PKCS1_OAEP_PADDING,
        },
        buffer,
    );
    return decrypted.toString();
}
