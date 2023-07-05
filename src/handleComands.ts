import { MessageUpsertType, proto, WASocket } from "@whiskeysockets/baileys";
import { executeCommands } from "./commands";
import { getTextFromWebMsgInfo } from "./utils/getTextFromWebMsgInfo";

function handleCommands(sock: WASocket) {
    return async (m: {
        messages: proto.IWebMessageInfo[];
        type: MessageUpsertType;
    }) => {
        const isCommand = getTextFromWebMsgInfo(m.messages[0]!)?.startsWith(".")
        const text = getTextFromWebMsgInfo(m.messages[0]!)?.split(" ")[0].replace(".", "")
        
        if(m.messages[0].message && isCommand && text) {
            executeCommands(text, m, sock)
        }

        if(m.messages[0].message?.conversation) {
            const textMessage = m.messages[0].message
            if(textMessage.conversation == "!isixto") {
                console.log('replying to', m.messages[0].key.remoteJid)
                console.log(textMessage);
                await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Isixto es un ser anormal y estúpido creador de la inmunda frase "Producto por escalera".' }, {quoted: m.messages[0]})
            }
        }
    }
    
}




export default handleCommands