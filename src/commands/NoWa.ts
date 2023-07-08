import { proto } from "@whiskeysockets/baileys";
import { Command } from "../structures/Command";
import { PhoneNumber, parsePhoneNumber, CountryCode } from "libphonenumber-js";

export default class NoWa extends Command {
  constructor() {
    super();
    this.name = 'nowa';
  }

  public override execute = async (webMessageInfo: proto.IWebMessageInfo, args?: string[]) => {
    try {
      const numberPhoneRegExp = /\d|x/i;
      const numberPattern = webMessageInfo.message?.conversation?.substring(5);

      if (!numberPattern) {
        await this.bot.replyText(webMessageInfo, 'Para dar inicio al cómputo debe escribir el fragmento del número teléfonico con el que desea operar y finalizar dejando *x* aquellos dígitos sobre los que se busca iterar. La cantidad de veces que se iterarán esos dígitos dependerá de cuántos dígitos se hayan sustituido con *x*, de tal manera que si se han sustituido tres dígitos con *x* la iteración finalizará cuando se hayan verificado 999 números. Esta iteración viene en la forma de un incremento de 1 que tiene como límite a la cantidad de dígitos del número telefónico que se hayan sustituido por *x*. \n\nEl sintaxis que deben seguir los argumentos del comando debe ser así: \n\n*.nowa [número de teléfono]* \n\nEl número telefónico no debe ser escrito con espacios ni signos.');
        return;
      }

      if (!numberPhoneRegExp.test(numberPattern)) {
        await this.bot.replyText(webMessageInfo, 'El número telefónico ingresado no es válido. Por favor, reescribe el número y vuelve a intentarlo.');
        return;
      }

      let verifiedNumbers = "";
      let unVerifiedNumbers = "";
      let countVerified = 0;
      let countUnVerified = 0;
      const digits = numberPattern.match(new RegExp("x", "g"))?.length!;
      const max = parseInt("9".repeat(digits));

      await this.bot.replyText(webMessageInfo, 'Por favor, espera mientras se completa el cómputo.');

      let verifiedOrdinal = 1;
      let unVerifiedOrdinal = 1;

      for (let i = 0; i <= max; i++) {
        const numberPhone = numberPattern.replace("x".repeat(digits), this.addZeros(i, digits));
        const phoneNumber = parsePhoneNumber(`+${numberPhone}`);
        const formattedNumber = this.formatPhoneNumber(phoneNumber);

        console.log(formattedNumber);

        const result = await this.bot.waConnection?.onWhatsApp(`${numberPhone}@s.whatsapp.net`);

        if (result && result.length !== 0) {
          verifiedNumbers += `${verifiedOrdinal}. ${formattedNumber}\n`;
          verifiedOrdinal++;
          countVerified++; 
        } else {
          unVerifiedNumbers += `${unVerifiedOrdinal}. ${formattedNumber}\n`;
          unVerifiedOrdinal++;
          countUnVerified++;
        }
      }

      let text = `[✅] - Números registrados en WhatsApp (${countVerified}):\n\n${verifiedNumbers}`;
      if (unVerifiedNumbers) {
        text += `\n[🚫] - Números no registrados en WhatsApp (${countUnVerified}):\n\n${unVerifiedNumbers}`;
      }

      await this.bot.replyText(webMessageInfo, text);
    } catch (error) {
      await this.bot.replyText(webMessageInfo, 'Un error.');
    }
  };

  addZeros(numero: number, cantidadCeros: number) {
    let numeroString = numero.toString();
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
