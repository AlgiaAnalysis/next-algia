/**
 * Classe de criptografia TripleDES baseada no sistema legado PHP
 * Usa AES-256-CBC com chaves especificas
 */

import crypto from 'crypto'
import { passwordCrypt, passwordDecrypt } from './password'

const ENCRYPT_METHOD = 'aes-256-cbc'
const SECRET_KEY = '9iu07dzd4os2la8ze6h525tg'
const SECRET_IV = 'qk1ggwng5963dw67apzmpxcu'

/**
 * Gera a chave de criptografia
 * No PHP: $key = hash('sha256', $this->secret_key);
 * hash() retorna string hexadecimal (64 chars), openssl usa como bytes
 */
function getKey(): Buffer {
  const hexHash = crypto.createHash('sha256').update(SECRET_KEY).digest('hex')
  // O PHP openssl_encrypt interpreta a string hex como bytes
  // Para AES-256 precisa de 32 bytes, entao pega os primeiros 32 chars do hex
  return Buffer.from(hexHash.substring(0, 32), 'utf8')
}

/**
 * Gera o IV de criptografia
 * No PHP: $iv = substr(hash('sha256', $this->secret_iv), 0, 16);
 */
function getIV(): Buffer {
  const hexHash = crypto.createHash('sha256').update(SECRET_IV).digest('hex')
  return Buffer.from(hexHash.substring(0, 16), 'utf8')
}

/**
 * Criptografa uma string usando AES-256-CBC + ofuscacao Password
 */
export function encrypt(data: string): string {
  const key = getKey()
  const iv = getIV()

  const cipher = crypto.createCipheriv(ENCRYPT_METHOD, key, iv)
  let encrypted = cipher.update(data, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  // Aplica a camada adicional de ofuscacao
  return passwordCrypt(encrypted)
}

/**
 * Descriptografa uma string usando AES-256-CBC + ofuscacao Password
 */
export function decrypt(data: string): string {
  // Remove a camada de ofuscacao
  const decoded = passwordDecrypt(data)

  const key = getKey()
  const iv = getIV()

  const decipher = crypto.createDecipheriv(ENCRYPT_METHOD, key, iv)
  let decrypted = decipher.update(decoded, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Compara uma senha em texto plano com uma senha criptografada
 */
export function comparePassword(plainPassword: string, encryptedPassword: string): boolean {
  try {
    const decrypted = decrypt(encryptedPassword)
    return plainPassword === decrypted
  } catch (error) {
    console.error('Erro ao descriptografar:', error)
    return false
  }
}
