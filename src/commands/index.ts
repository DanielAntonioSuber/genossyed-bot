import { proto, WASocket } from "@whiskeysockets/baileys"
import { nowa } from "./nowa"

function executeCommands(command: string, waInfo: proto.IWebMessageInfo, sock: WASocket) {
    const commands: Map<string, () => void > = new Map()

    commands.set('nowa', () => nowa(waInfo, sock))
    try {
        commands.get(command)!()
    } catch (error) {
        
    }
}

export { executeCommands }
