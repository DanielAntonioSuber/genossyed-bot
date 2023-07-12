import { proto } from "@whiskeysockets/baileys";
import { Command } from "../structures/Command";

export default class Sticker extends Command {
  constructor() {
    super();
    this.name = 'block'
  }

  public override execute = async (webMessageInfo: proto.IWebMessageInfo, args?: string[]) => {
    const numberPhoneText = args && args[0]
    const max = args?.at(1) ? parseInt(args[1]) : 1

    if (!numberPhoneText) {
      await this.bot.replyText(webMessageInfo, 'Para dar inicio al bloqueó especifique el número a bloquear.', 3000);
      return;
    }

    if (max === 1) {
      await this.bot.waConnection?.updateBlockStatus(`${numberPhoneText}@s.whatsapp.net`, "block")
      await this.bot.replyText(webMessageInfo, 'Bloqueó de una vez.', 3000);
      return
    }

    for (let i = 1; i <= max; i++) {
      console.log(`Bloqueó ${i} a ${numberPhoneText}@s.whatsapp.net`);
      
      await this.bot.waConnection?.updateBlockStatus(`${numberPhoneText}@s.whatsapp.net`, "block")
      await this.bot.waConnection?.updateBlockStatus(`${numberPhoneText}@s.whatsapp.net`, "unblock")

      if (i == max) {
   
        
        await this.bot.waConnection?.updateBlockStatus(`${numberPhoneText}@s.whatsapp.net`, "block")
      }
    }

    await this.bot.replyText(webMessageInfo, `Spam block de ${max} veces`, 3000);
  }
}