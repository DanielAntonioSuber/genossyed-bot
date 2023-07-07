import { proto } from "@whiskeysockets/baileys"
import { Command } from "../structures/Command"

export default class NoWa extends Command {
  constructor() {
    super();
    this.name = 'nowa'
  }

  public override execute = async (webMessageInfo: proto.IWebMessageInfo, args?: string[]) => {
    const numberPhoneRegExp = /\d|x/i
    const numberPattern = webMessageInfo.message?.conversation?.split(" ")[1]!

    if (numberPhoneRegExp.test(numberPattern)) {
      let verifiedNumbers = ""
      let unVerifiedNumbers = ""
      const digits = numberPattern.match(new RegExp("x", "g"))?.length!
      const max = parseInt("9".repeat(digits));

      await this.bot.replyText(webMessageInfo,  'Esperar a que el computo finalice.')

      for (let i = 0; i <= max; i++) {
        const numberPhone = numberPattern.replace("x".repeat(digits), this.addZeros(i, digits));
        const result = await this.bot.waConnection?.onWhatsApp(`${numberPhone}@s.whatsapp.net`)

        if (result && result.length !== 0) {
          verifiedNumbers += `wa.me//+${numberPhone}\n`
        } else {
          unVerifiedNumbers += `${numberPhone}\n`
        }
      }
      const text = `Números verificados \n${verifiedNumbers}\nNúmeros no verificados \n${unVerifiedNumbers}`

      await this.bot.replyText(webMessageInfo, text)
    } else {
      await this.bot.replyText(webMessageInfo, 'Número incorrecto para whatsapp')
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