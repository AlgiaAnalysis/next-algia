/**
 * Classe de criptografia baseada no sistema legado PHP
 * Converte caracteres para codigos ASCII com ofuscacao
 */

const CHARACTERS = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'm',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
]

/**
 * Preenche uma string com zeros a esquerda
 */
function zeroFill(str: string, size: number): string {
  const length = size - str.length
  let zeros = ''
  for (let i = 0; i < length; i++) {
    zeros += '0'
  }
  return zeros + str
}

/**
 * Criptografa uma string convertendo caracteres para codigos ASCII
 */
export function passwordCrypt(password: string): string {
  let stringASC = ''

  for (let i = 0; i < password.length; i++) {
    const char = password.charAt(i)
    let asc = (char.charCodeAt(0) * 8 / 4) + 38
    const rnd = Math.floor(Math.random() * 52)
    stringASC += zeroFill(String(Math.floor(asc)), 3)
    stringASC += CHARACTERS[rnd]
  }

  return stringASC
}

/**
 * Descriptografa uma string convertendo codigos ASCII para caracteres
 */
export function passwordDecrypt(encrypted: string): string {
  let stringASC = ''

  // Remove todos os caracteres alfabeticos
  let cleaned = encrypted
  for (const char of CHARACTERS) {
    cleaned = cleaned.split(char).join('')
  }

  const numChars = cleaned.length / 3

  for (let i = 0; i < numChars; i++) {
    const start = i * 3
    const ascStr = cleaned.substring(start, start + 3)
    const asc = (parseInt(ascStr, 10) - 38) * 4 / 8
    const char = String.fromCharCode(asc)
    stringASC += char
  }

  return stringASC
}
