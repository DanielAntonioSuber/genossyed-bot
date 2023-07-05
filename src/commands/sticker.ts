import { WASocket, downloadMediaMessage, proto } from "@whiskeysockets/baileys";
import { pino } from "pino";
import Sticker from "wa-sticker-formatter";

export async function sticker (webMessageInfo: proto.IWebMessageInfo, sock: WASocket) {
  const quotedImageMessage = webMessageInfo.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
  const id = webMessageInfo.key.remoteJid
  if(!id) return
  
  if(quotedImageMessage) {
    const messageInfo: proto.IWebMessageInfo = {
      key: {
        id: quotedImageMessage.contextInfo?.stanzaId,
        participant: webMessageInfo.key.participant,
        remoteJid: webMessageInfo.key.remoteJid
      },
      message: {imageMessage: quotedImageMessage}
    }
    const logger = pino({ level: 'debug'})
    const buffer = await downloadMediaMessage(messageInfo, 'buffer', {}, {logger, reuploadRequest: sock.updateMediaMessage, })
    
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
      
      await sock.sendMessage(id, sticker, {quoted: webMessageInfo})
    }
  } else {
    await sock.sendMessage(id,{text: 'No es una imágen' }, {quoted: webMessageInfo})
  }
}