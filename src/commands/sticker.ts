import { WASocket, downloadMediaMessage, proto } from "@whiskeysockets/baileys";
import Sticker from "wa-sticker-formatter";

export async function sticker (waMessageInfo: proto.IWebMessageInfo, sock: WASocket) {
  const quotedImageMessage = waMessageInfo.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
  const id = waMessageInfo.key.remoteJid
  if(!id) return
  
  if(quotedImageMessage) {
    const messageInfo: proto.IWebMessageInfo = {
      key: {
        id: quotedImageMessage.contextInfo?.stanzaId,
        participant: waMessageInfo.key.participant,
        remoteJid: waMessageInfo.key.remoteJid
      },
      message: {imageMessage: quotedImageMessage}
    }

    const buffer = await downloadMediaMessage(messageInfo, 'buffer', {})
    
    if(buffer instanceof Buffer) {
      const sticker = await (
        new Sticker(
            buffer, 
            { 
              pack: 'Bot PACK',
              author: 'BOT',
              categories: ['☔️', '❤️'], 
              id: 'BOTSYED-', 
              quality: 90, 
              background:  '#000000'
            }
          )
          .toMessage()
        )

      await sock.sendMessage(id, sticker, {quoted: waMessageInfo})
    }
  } else {
    await sock.sendMessage(id,{text: 'No es una imágen' }, {quoted: waMessageInfo})
  }
}