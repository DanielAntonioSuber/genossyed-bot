import { proto } from "baileys";

export function getTextFromWebMsgInfo(webMessageInfo: proto.IWebMessageInfo) {
  if(webMessageInfo.message ) {
    if(webMessageInfo.message.extendedTextMessage) {
      return webMessageInfo.message.extendedTextMessage.text
    } 
    if (webMessageInfo.message.conversation) {
      return webMessageInfo.message.conversation
    } if (webMessageInfo.message.imageMessage) {
      return webMessageInfo.message.imageMessage.caption
    } if(webMessageInfo.message.videoMessage) {
      return webMessageInfo.message.videoMessage.caption
    }
  } 
  return null
}

export function isMediaMessage(webMessageInfo: proto.IWebMessageInfo) {
  return (webMessageInfo.message?.videoMessage != null || webMessageInfo.message?.imageMessage != null)

}

export function hasQuotedMediaMessage(webMessageInfo: proto.IWebMessageInfo) {
  const imageMessage = webMessageInfo.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
  const videoMessage = webMessageInfo.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage

  return (imageMessage != null && imageMessage != undefined) || (videoMessage != null && videoMessage != undefined)
}

export function getQuotedMessage(webMessageInfo: proto.IWebMessageInfo) {
  const quotedMessage = webMessageInfo.message?.extendedTextMessage?.contextInfo?.quotedMessage
  const id = quotedMessage?.videoMessage?.contextInfo?.stanzaId || quotedMessage?.extendedTextMessage?.contextInfo?.stanzaId || quotedMessage?.imageMessage?.contextInfo?.stanzaId

  const messageInfo: proto.IWebMessageInfo = {
    key: {
      id,
      participant: webMessageInfo.key.participant,
      remoteJid: webMessageInfo.key.remoteJid
    },
    message: { ...webMessageInfo.message?.extendedTextMessage?.contextInfo?.quotedMessage }
  }

  return messageInfo
}