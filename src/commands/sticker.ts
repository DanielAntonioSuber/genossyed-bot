import { WASocket, downloadMediaMessage, proto } from "@whiskeysockets/baileys";
import { pino } from "pino";
import Sticker, { StickerTypes } from "wa-sticker-formatter";

export async function sticker(webMessageInfo: proto.IWebMessageInfo, sock: WASocket) {
  const quotedImageMessage = webMessageInfo.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
  const quotedVideoMessage = webMessageInfo.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage
  const id = webMessageInfo.key.remoteJid
  if (!id) return

  if (quotedImageMessage) {
    const messageInfo: proto.IWebMessageInfo = {
      key: {
        id: quotedImageMessage.contextInfo?.stanzaId,
        participant: webMessageInfo.key.participant,
        remoteJid: webMessageInfo.key.remoteJid
      },
      message: { imageMessage: quotedImageMessage }
    }
    const logger = pino({ level: 'debug' })
    const buffer = await downloadMediaMessage(messageInfo, 'buffer', {}, { logger, reuploadRequest: sock.updateMediaMessage, })

    if (buffer instanceof Buffer) {
      const sticker = await (
        new Sticker(
          buffer,
          {
            pack: 'Thelmstone',
            author: 'B7',
            categories: ['☔️', '❤️'],
            id: 'BOTSYED-',
            quality: 99,
            background: '#00000000',
            type: StickerTypes.FULL
          }
        )
          .toMessage()
      )

      await sock.sendMessage(id, sticker, { quoted: webMessageInfo })
    }
  } else if (quotedVideoMessage) {
    const messageInfo: proto.IWebMessageInfo = {
      key: {
        id: quotedVideoMessage.contextInfo?.stanzaId,
        participant: webMessageInfo.key.participant,
        remoteJid: webMessageInfo.key.remoteJid
      },
      message: { videoMessage: quotedVideoMessage }
    }
    const logger = pino({ level: 'debug' })
    const buffer = await downloadMediaMessage(messageInfo, 'buffer', {}, { logger, reuploadRequest: sock.updateMediaMessage, })

    if (buffer instanceof Buffer) {
      const sticker = await (
        new Sticker(
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
      await sock.sendMessage(id, sticker, { quoted: webMessageInfo })
    }
  } else {
    await sock.sendMessage(id, { text: 'No es una imágen' }, { quoted: webMessageInfo })
  }
}