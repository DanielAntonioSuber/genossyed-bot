import { MessageUpsertType, proto, WASocket } from "@whiskeysockets/baileys"
import { nowa } from "./nowa"
import { sticker } from "./sticker"

function executeCommands(command: string, 
    m: {
    messages: proto.IWebMessageInfo[];
    type: MessageUpsertType;
    }, 
    sock: WASocket
) {
    const commands: Map<string, () => void > = new Map()
    const webMessageInfo = m.messages[0]
    commands.set('nowa', () => nowa(webMessageInfo, sock))
    commands.set('sticker', () => sticker(webMessageInfo, sock))

    try {
        commands.get(command)!()
    } catch (error) {
        
    }
}

export { executeCommands }
