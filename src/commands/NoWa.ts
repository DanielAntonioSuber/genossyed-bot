import { delay, proto } from "@whiskeysockets/baileys";
import { Command } from "../structures/Command";
import { PhoneNumber, parsePhoneNumber, CountryCode } from "libphonenumber-js";

export default class NoWa extends Command {
  verifiedNumbers: string[] = []
  unVerifiedNumbers: string[] = []

  constructor() {
    super();
    this.name = 'nowa';
  }

  public override execute = async (webMessageInfo: proto.IWebMessageInfo, args?: string[]) => {
    try {
      const numberPhoneRegExp = /\d|x/i;
      const jid = webMessageInfo.key.remoteJid!
      const promises: Promise<void>[] = []
      const numberPattern = webMessageInfo.message?.conversation?.substring(5);

      if (!numberPattern) {
        await this.bot.replyText(webMessageInfo, 'Para dar inicio al cómputo debe escribir el fragmento del número teléfonico con el que desea operar y finalizar dejando *x* aquellos dígitos sobre los que se busca iterar. La cantidad de veces que se iterarán esos dígitos dependerá de cuántos dígitos se hayan sustituido con *x*, de tal manera que si se han sustituido tres dígitos con *x* la iteración finalizará cuando se hayan verificado 999 números. Esta iteración viene en la forma de un incremento de 1 que tiene como límite a la cantidad de dígitos del número telefónico que se hayan sustituido por *x*. \n\nEl sintaxis que deben seguir los argumentos del comando debe ser así: \n\n*.nowa [número de teléfono]* \n\nEl número telefónico no debe ser escrito con espacios ni signos.', 4000);
        return;
      }

      if (!numberPhoneRegExp.test(numberPattern)) {
        await this.bot.replyText(webMessageInfo, 'El número telefónico ingresado no es válido. Por favor, reescribe el número y vuelve a intentarlo.', 2000);
        return;
      }

      const digits = numberPattern.match(new RegExp("x", "g"))?.length!;
      const max = parseInt("9".repeat(digits));

      await this.bot.replyText(webMessageInfo, 'Por favor, espera mientras se completa el cómputo.');

      if (max < 999) {
        await this.numbersOnWhatsapp(0, max, numberPattern, webMessageInfo, digits)
        return
      }

      if (max === 999) {
        for (let i = 1; i <= 5; i++) {
          if (i == 5) {
            promises.push(this.numbersOnWhatsapp(200 * (i - 1), 999, numberPattern, webMessageInfo, digits))
          } else {
            promises.push(this.numbersOnWhatsapp(200 * (i - 1), 200 * i, numberPattern, webMessageInfo, digits))
          }
        }
      }

      if (max === 9999) {
        for (let i = 1; i <= 33; i++) {
          if (i == 33) {
            promises.push(this.numbersOnWhatsapp(300 * (i - 1), 9999, numberPattern, webMessageInfo, digits))
          } else {
            promises.push(this.numbersOnWhatsapp(300 * (i - 1), 300 * i, numberPattern, webMessageInfo, digits))
          }
        }
      }

      if (max > 9999) {
        this.bot.replyText(webMessageInfo, 'Demasiado cómputo, no haré eso.', 2000);
        return
      }

      await this.bot.waConnection?.presenceSubscribe(jid)
      await delay(500)

      await this.bot.waConnection?.sendPresenceUpdate('composing', jid)

      Promise.all(promises).then(async () => {
        let verifiedNumbersText = ""
        let unverifiedNumbersText = ""
        this.verifiedNumbers.forEach((number, index) => {
          verifiedNumbersText += `${index + 1}. ${number}\n`;
        })

        this.unVerifiedNumbers.forEach((number, index) => {
          unverifiedNumbersText += `${index + 1}. ${number}\n`;
        })

        let text = `[✅] - Números registrados en WhatsApp (${this.verifiedNumbers.length}):\n\n${verifiedNumbersText}`;
        text += `\n[🚫] - Números no registrados en WhatsApp (${this.unVerifiedNumbers.length}):\n\n${unverifiedNumbersText}`;

        await this.bot.waConnection?.sendPresenceUpdate('paused', jid)
        this.bot.replyText(webMessageInfo, text);
      })

    } catch (error) {
      await this.bot.replyText(webMessageInfo, 'Un error.');
    }
  };

  numbersOnWhatsapp = async (init: number, max: number, numberPattern: string, webMessageInfo: proto.IWebMessageInfo, digits: number) => {
    for (let i = init; i <= max; i++) {
      const numberPhone = numberPattern.replace("x".repeat(digits), this.addZeros(i, digits));
      const phoneNumber = parsePhoneNumber(`+${numberPhone}`);
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      console.log(formattedNumber);

      const result = await this.bot.waConnection?.onWhatsApp(`${numberPhone}@s.whatsapp.net`);

      if (result && result.length !== 0) {
        this.verifiedNumbers.push(formattedNumber)
      } else {
        this.unVerifiedNumbers.push(formattedNumber)
      }

    }

  }

  addZeros(num: number, cantidadCeros: number) {
    let numeroString = num.toString();
    let cerosFaltantes = cantidadCeros - numeroString.length;
    if (cerosFaltantes > 0) {
      numeroString = "0".repeat(cerosFaltantes) + numeroString;
    }
    return numeroString;
  }

  formatPhoneNumber(phoneNumber: PhoneNumber) {
    const prefix = `+${phoneNumber.countryCallingCode}`;
    let formattedNumber = phoneNumber.formatNational();

    if (formattedNumber.startsWith("0")) {
      formattedNumber = formattedNumber.substring(1);
    }

    return `${prefix} ${formattedNumber}`;
  }
}
