import { proto } from "@whiskeysockets/baileys"
import { Command } from "../structures/Command"
import { PhoneNumber, parsePhoneNumber } from "libphonenumber-js";

export default class NoWa extends Command {
  constructor() {
    super();
    this.name = 'nowa'
  }

  public override execute = async (webMessageInfo: proto.IWebMessageInfo, args?: string[]) => {
    try {
      const numberPhoneRegExp = /\d|x/i;
      const numberPattern = webMessageInfo.message?.conversation?.substring(5)

      if (numberPattern && numberPhoneRegExp.test(numberPattern)) {
        let verifiedNumbers = "";
        let unVerifiedNumbers = "";
        const digits = numberPattern.match(new RegExp("x", "g"))?.length!;
        const max = parseInt("9".repeat(digits));

        await this.bot.replyText(webMessageInfo, '⚠️ Por favor, espere hasta que el cómputo finalice.');

        for (let i = 0; i <= max; i++) {
          const numberPhone = numberPattern.replace("x".repeat(digits), this.addZeros(i, digits));
          const phoneNumber = parsePhoneNumber(`+${numberPhone}`);
          const formattedNumber = phoneNumber.formatInternational();

          console.log(formattedNumber);
          

          const result = await this.bot.waConnection?.onWhatsApp(`${numberPhone}@s.whatsapp.net`);

          if (result && result.length !== 0) {
            verifiedNumbers += `${formattedNumber}\n`;
          } else {
            unVerifiedNumbers += `${formattedNumber}\n`;
          }
        }
        const text = `✅ Números registrados en WhatsApp: \n\n${verifiedNumbers}\n 🚫 Números no registrados en WhatsApp: \n\n${unVerifiedNumbers}\n`;

        await this.bot.replyText(webMessageInfo, text);
      } else {
        await this.bot.replyText(webMessageInfo, 'Número telefónico inválido. Por favor, reescriba el número y vuelva a intentar.')
      }
    } catch (error) {  await this.bot.replyText(webMessageInfo, 'Un error.')

    }
  }

  addZeros(numero: number, cantidadCeros: number) {
    let numeroString = numero.toString();
    let cerosFaltantes = cantidadCeros - numeroString.length;
    if (cerosFaltantes > 0) {
      numeroString = "0".repeat(cerosFaltantes) + numeroString;
    }
    return numeroString;
  }
}