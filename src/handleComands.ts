import { MessageUpsertType, proto, WASocket } from "@whiskeysockets/baileys";
import { executeCommands } from "./commands";

function handleCommands(sock: WASocket) {
    return async (m: {
        messages: proto.IWebMessageInfo[];
        type: MessageUpsertType;
    }) => {
        
        const isCommand = m.messages[0].message?.conversation?.startsWith("!")
        if(m.messages[0].message?.conversation && isCommand) {
            const command = m.messages[0].message?.conversation.split(" ")[0].replace("!", "")
            console.log(command);
            
            executeCommands(command, m.messages[0], sock)
        }
        if (m.messages[0].key.remoteJid === "5218110226795-1394215821@g.us" ) {
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
    
}




export default handleCommands