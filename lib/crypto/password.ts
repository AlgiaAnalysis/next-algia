// src/utils/Password.ts

export class Password {
  private caracteres: string[] = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "m", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ];

  /**
   * "Criptografa" uma string convertendo os caracteres alfanuméricos
   * em pseudo-códigos ASCII modificados.
   * @param senha - String a ser convertida
   * @returns String criptografada
   */
  cript(senha: string): string {
    let stringASC = "";

    for (let i = 0; i < senha.length; i++) {
      const asc = senha.charCodeAt(i);
      const convertido = (asc * 8 / 4) + 38;
      const rnd = Math.floor(Math.random() * 52);
      stringASC += this.zeroFill(convertido.toString(), 3);
      stringASC += this.caracteres[rnd];
    }

    return stringASC;
  }

  /**
   * Descriptografa a string retornando ao texto original.
   * @param string - String criptografada
   * @returns String original
   */
  deCript(string: string): string {
    let limpa = string;
    this.caracteres.forEach(c => {
      limpa = limpa.split(c).join("");
    });

    const nroCaracteres = limpa.length / 3;
    let resultado = "";

    for (let i = 0; i < nroCaracteres; i++) {
      const inicio = i * 3;
      const ascPart = limpa.substring(inicio, inicio + 3);
      const valor = parseInt(ascPart);
      const original = (valor - 38) * 4 / 8;
      resultado += String.fromCharCode(original);
    }

    return resultado;
  }

  /**
   * Adiciona zeros à esquerda até o tamanho definido.
   * @param value - String numérica
   * @param size - Tamanho final
   * @returns String com zeros à esquerda
   */
  private zeroFill(value: string, size: number): string {
    let zeros = "";
    const length = size - value.length;
    for (let i = 0; i < length; i++) {
      zeros += "0";
    }
    return zeros + value;
  }
}
