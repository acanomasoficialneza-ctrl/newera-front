/**
 * Browser-native Web Crypto API implementation for AES-GCM (256-bit).
 * Decrypts encrypted payload strings (ENC:base64) returned by the backend
 * so that plaintext passwords never travel raw over HTTP responses.
 */
export class ClientCrypto {
  private static readonly SECRET_KEY_RAW = 'NovaCapital2026SecureMasterSecretKey!';
  private static readonly PREFIX = 'ENC:';
  private static readonly IV_LENGTH = 12;

  private static cryptoKeyPromise: Promise<CryptoKey> | null = null;

  private static async getKey(): Promise<CryptoKey> {
    if (!this.cryptoKeyPromise) {
      this.cryptoKeyPromise = (async () => {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(this.SECRET_KEY_RAW);
        // Hash to 256 bits via SHA-256 (identical to backend MessageDigest.getInstance("SHA-256"))
        const hash = await window.crypto.subtle.digest('SHA-256', keyData);
        return window.crypto.subtle.importKey(
          'raw',
          hash,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
      })();
    }
    return this.cryptoKeyPromise;
  }

  /**
   * Decrypts an ENC:base64 string into plain text.
   * If value does not start with ENC:, returns it as-is (e.g. legacy or already plain).
   */
  public static async decrypt(cipherTextWithPrefix: string | null | undefined): Promise<string> {
    if (!cipherTextWithPrefix || !cipherTextWithPrefix.startsWith(this.PREFIX)) {
      return cipherTextWithPrefix || '';
    }

    try {
      const base64Data = cipherTextWithPrefix.substring(this.PREFIX.length);
      const binaryString = atob(base64Data);
      const combined = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        combined[i] = binaryString.charCodeAt(i);
      }

      const iv = combined.slice(0, this.IV_LENGTH);
      const cipherText = combined.slice(this.IV_LENGTH);

      const key = await this.getKey();
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        key,
        cipherText
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (err) {
      console.error('Error decrypting payload in client:', err);
      return cipherTextWithPrefix;
    }
  }

  /**
   * Encrypts plain text into ENC:base64 string before sending to backend.
   */
  public static async encrypt(plainText: string | null | undefined): Promise<string> {
    if (!plainText || plainText.startsWith(this.PREFIX)) {
      return plainText || '';
    }

    try {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(plainText);

      const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const key = await this.getKey();

      const cipherBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        key,
        encodedData
      );

      const cipherBytes = new Uint8Array(cipherBuffer);
      const combined = new Uint8Array(iv.length + cipherBytes.length);
      combined.set(iv, 0);
      combined.set(cipherBytes, iv.length);

      let binary = '';
      for (let i = 0; i < combined.length; i++) {
        binary += String.fromCharCode(combined[i]);
      }

      return this.PREFIX + btoa(binary);
    } catch (err) {
      console.error('Error encrypting payload in client:', err);
      return plainText;
    }
  }

  public static isEncrypted(value: string | null | undefined): boolean {
    return !!value && value.startsWith(this.PREFIX);
  }
}
