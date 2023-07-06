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
            } else if(textMessage.conversation == "!tesan") {
                console.log('replying to', m.messages[0].key.remoteJid)
                console.log(textMessage);
                await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Tesan es un buzonero de mierda, pero prefieren que lo llamen "phreaker", no tiene vida social y sólo roba números de lugares que ni Dios se acuerda que hizo, es venezolano emigrado a España' }, {quoted: m.messages[0]})
            } else if(textMessage.conversation == "!zlider") {
                console.log('replying to', m.messages[0].key.remoteJid)
                console.log(textMessage);
                await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'El famosisimo gordito cariñosito que hizo el video de "yo y elias tuvimos sexo" fanático del trap latino y de la comida rápida, tiene chaleco antibalas con 7 kilos de manteca abdominal, ¡POR DIOS, PUEDE FRENAR UN CARGADOR COMPLETO DE UNA M4A1! Zlider. El mejor osito cariñosito color aceite de carro quemado.' }, {quoted: m.messages[0]})
            } else if(textMessage.conversation == "!nik") {
                console.log('replying to', m.messages[0].key.remoteJid)
                console.log(textMessage);
                await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'MEXICANO BASURA, EDGY Y FAN DE EVANGELION, NO HABLA EN LAS LLAMADAS PORQUE CREE QUE CON SU VOZ LE VAN A HACER UN DOXX SONORO-GEOLOGICO Y DARÁN CON SU CHOZA EN CHAPULTEPEC.' }, {quoted: m.messages[0]})
            } 

        }
    }
    
}




export default handleCommands