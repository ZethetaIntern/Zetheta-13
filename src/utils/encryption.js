/**
 * Web Crypto API AES-256-GCM Encryption & Decryption Utility
 * Secures PII in LocalStorage adhering to RBI digital lending data protection norms.
 */

const SECRET_SALT = new TextEncoder().encode('LendSwift_Secure_Salt_2026');
const PASSPHRASE = 'LendSwift_Production_Form_Encryption_Key_Secure';

let cachedCryptoKey = null;

async function getKey() {
  if (cachedCryptoKey) return cachedCryptoKey;

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(PASSPHRASE),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  cachedCryptoKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SECRET_SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return cachedCryptoKey;
}

/**
 * Encrypts a JavaScript object/string to an AES-256-GCM ciphertext payload
 */
export async function encryptData(data) {
  try {
    const key = await getKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );

    // Combine IV and Ciphertext into base64 payload
    const ivArray = Array.from(iv);
    const cipherArray = Array.from(new Uint8Array(encrypted));
    const combined = {
      iv: btoa(String.fromCharCode.apply(null, ivArray)),
      payload: btoa(String.fromCharCode.apply(null, cipherArray)),
    };

    return JSON.stringify(combined);
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('Failed to encrypt form data');
  }
}

/**
 * Decrypts an AES-256-GCM ciphertext payload back to original JavaScript object
 */
export async function decryptData(encryptedString) {
  try {
    if (!encryptedString) return null;
    const combined = JSON.parse(encryptedString);
    if (!combined.iv || !combined.payload) return null;

    const key = await getKey();
    const iv = new Uint8Array(
      atob(combined.iv)
        .split('')
        .map((c) => c.charCodeAt(0))
    );
    const ciphertext = new Uint8Array(
      atob(combined.payload)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded);
  } catch (err) {
    // If decryption fails (e.g. data corrupted or tampered), return null
    return null;
  }
}
