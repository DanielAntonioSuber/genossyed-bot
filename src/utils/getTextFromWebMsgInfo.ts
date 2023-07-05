import { proto } from "@whiskeysockets/baileys";

export function getTextFromWebMsgInfo(webMessageInfo: proto.IWebMessageInfo) {
  if(webMessageInfo.message ) {
    if(webMessageInfo.message.extendedTextMessage) {
      return webMessageInfo.message.extendedTextMessage.text
    } 
    if (webMessageInfo.message.conversation) {
      return webMessageInfo.message.conversation
    }
  } 
  return null
}