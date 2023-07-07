import { downloadMediaMessage, proto } from "@whiskeysockets/baileys";
import { Command } from "../structures/Command";
import { getQuotedMessage, hasQuotedMediaMessage, isMediaMessage } from "../utils/WebMessageInfoUtils";
import StickerF, { StickerTypes } from "wa-sticker-formatter";

export default class Sticker extends Command {
  constructor() {
    super();
    this.name = 'sticker'
  }

  public override execute = async (webMessageInfo: proto.IWebMessageInfo, args?: string[]) => {
    const isMedia: boolean = isMediaMessage(webMessageInfo)
    const hasQuotedMedia: boolean = hasQuotedMediaMessage(webMessageInfo)

    if (!isMedia && !hasQuotedMedia) {
      return this.bot.replyText(webMessageInfo, 'No es una imágen o vídeo')
    }

    const buffer = await downloadMediaMessage(isMedia ? webMessageInfo : getQuotedMessage(webMessageInfo), 'buffer', {}) as Buffer

    const sticker = await (
      new StickerF(
        buffer,
        {
          pack: 'Thelmstone',
          author: 'B7',
          categories: ['☔️', '❤️'],
          id: 'BOTSYED-',
          quality: 15,
          background: '#00000000',
          type: StickerTypes.FULL
        }
      )
        .toMessage()
    )
    await this.bot.replySticker(webMessageInfo, sticker)
  }
}