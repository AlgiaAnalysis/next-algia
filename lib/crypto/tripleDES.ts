import { createHash, createCipheriv, createDecipheriv } from "crypto";
import { Password } from "./password";

export class TripleDES {
  private readonly encrypt_method = "aes-256-cbc";
  private readonly secret_key = "9iu07dzd4os2la8ze6h525tg";
  private readonly secret_iv = "qk1ggwng5963dw67apzmpxcu";

  private getKey(): Buffer {
    // chave de 32 bytes (SHA-256 binário)
    return createHash("sha256").update(this.secret_key).digest(); // 32 bytes
  }

  private getIv(): Buffer {
    // 16 bytes a partir do SHA-256 binário do secret_iv
    const full = createHash("sha256").update(this.secret_iv).digest(); // 32 bytes
    return full.subarray(0, 16); // 16 bytes
  }

  encrypt(data: string): string {
    const passwordImaxis = new Password();

    const key = this.getKey();
    const iv = this.getIv();

    const cipher = createCipheriv(this.encrypt_method, key, iv);
    let output = cipher.update(data, "utf8", "base64");
    output += cipher.final("base64");

    return passwordImaxis.cript(output);
  }

  decrypt(data: string): string {
    const passwordImaxis = new Password();

    const decryptedPassword = passwordImaxis.deCript(data);

    const key = this.getKey();
    const iv = this.getIv();

    const decipher = createDecipheriv(this.encrypt_method, key, iv);
    let decrypted = decipher.update(decryptedPassword, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  encryptToken(token: string): string {
    let crypted = "";

    const array: Record<string, string[]> = {
      "0": ["3", "9", "6", "5", "4", "1", "8", "7", "2", "0"],
      "1": ["0", "3", "9", "6", "5", "4", "1", "8", "7", "2"],
      "2": ["2", "0", "3", "9", "6", "5", "4", "1", "8", "7"],
      "3": ["7", "2", "0", "3", "9", "6", "5", "4", "1", "8"],
      "4": ["8", "7", "2", "0", "3", "9", "6", "5", "4", "1"],
      "5": ["1", "8", "7", "2", "0", "3", "9", "6", "5", "4"],
      "6": ["4", "1", "8", "7", "2", "0", "3", "9", "6", "5"],
      "7": ["5", "4", "1", "8", "7", "2", "0", "3", "9", "6"],
      "8": ["6", "5", "4", "1", "8", "7", "2", "0", "3", "9"],
      "9": ["9", "6", "5", "4", "1", "8", "7", "2", "0", "3"],
    };

    for (let i = 0; i < token.length; i++) {
      const ch = token.charAt(i);
      const arrayCrypted = array[ch];
      const digit = arrayCrypted[i];
      crypted += digit;
    }

    return crypted;
  }

  decryptToken(token: string): string {
    let decrypted = "";

    const array: string[][] = [
      ["3", "9", "6", "5", "4", "1", "8", "7", "2", "0"],
      ["0", "3", "9", "6", "5", "4", "1", "8", "7", "2"],
      ["2", "0", "3", "9", "6", "5", "4", "1", "8", "7"],
      ["7", "2", "0", "3", "9", "6", "5", "4", "1", "8"],
      ["8", "7", "2", "0", "3", "9", "6", "5", "4", "1"],
      ["1", "8", "7", "2", "0", "3", "9", "6", "5", "4"],
      ["4", "1", "8", "7", "2", "0", "3", "9", "6", "5"],
      ["5", "4", "1", "8", "7", "2", "0", "3", "9", "6"],
      ["6", "5", "4", "1", "8", "7", "2", "0", "3", "9"],
      ["9", "6", "5", "4", "1", "8", "7", "2", "0", "3"],
    ];

    for (let i = 0; i < token.length; i++) {
      const current = token.charAt(i);
      for (let k = 0; k < array.length; k++) {
        if (array[k][i] === current) {
          decrypted += String(k);
          break;
        }
      }
    }

    return decrypted;
  }

  createPassword(
    size = 6,
    hasUpperChars = true,
    hasLowerChars = true,
    hasNumbers = true,
    hasSymbols = false
  ): string {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVYXWZ";
    const lower = "abcdefghijklmnopqrstuvyxwz";
    const numbers = "0123456789";
    const symbols = "!@#$%¨&*()_+=";
    let passwordPool = "";

    if (hasUpperChars) passwordPool += this.strShuffle(upper);
    if (hasLowerChars) passwordPool += this.strShuffle(lower);
    if (hasNumbers) passwordPool += this.strShuffle(numbers);
    if (hasSymbols) passwordPool += this.strShuffle(symbols);

    const shuffled = this.strShuffle(passwordPool);
    const plainPassword = shuffled.substring(0, size);

    return this.encrypt(plainPassword);
  }

  private strShuffle(input: string): string {
    const arr = input.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  }
}
