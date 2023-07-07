import { Boom } from "@hapi/boom"
import makeWASocket, { ConnectionState, DisconnectReason, MessageUpsertType, WASocket, proto, useMultiFileAuthState } from "@whiskeysockets/baileys"
import { Command } from "./Command"
import { readdirSync } from 'fs-extra'
import { join } from 'path'
import { getTextFromWebMsgInfo } from "../utils/WebMessageInfoUtils"

export class Bot {
  private botId: string
  public waConnection: WASocket | undefined
  private commands = new Map<string, Command>()
  private botJid: string | undefined
  private name: string | undefined
  private commandPrefix: string = '.'

  constructor(botId: string, name: string) {
    this.name = name
    this.botId = botId
    this.loadCommands()
  }

  async connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(`auth_state_${this.botId}`)

    this.waConnection = makeWASocket({
      printQRInTerminal: true,
      auth: state
    })

    this.waConnection.ev.on('connection.update', this.handleUpdate(saveCreds))
    this.waConnection.ev.on('messages.upsert', this.handleNewMessage)
  }

  private loadCommands() {
    const path = [__dirname, '..', 'commands']
    const commands = readdirSync(join(...path))

    for (const commandName of commands) {
      path.push(commandName)
      const command: Command = new (require(join(...path)).default)()
      this.commands.set(command.name, command)
      path.splice(path.indexOf(commandName), 1)
    }

  }

  private handleUpdate(saveCreds: () => Promise<void>) {
    return (update: Partial<ConnectionState>) => {
      const { connection, lastDisconnect } = update
      if (connection === 'close' && lastDisconnect != null) {
        const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
        console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
        if (shouldReconnect) {
          this.connectToWhatsApp()
        }
      } else if (connection === 'open') {
        console.log('opened connection')
      }

      this.waConnection!.ev.on('creds.update', saveCreds)
    }
  }

  private handleNewMessage = (m: {
    messages: proto.IWebMessageInfo[];
    type: MessageUpsertType;
  }) => {
    const messageInfo = m.messages[0]
    const message = getTextFromWebMsgInfo(messageInfo)
    const isCommand = message?.startsWith(this.commandPrefix)
    const commandName = message?.split(" ")[0].replace(this.commandPrefix, "")
    const args = message?.split(" ")
    
    if (!isCommand) {
      return 
    } 

    const command = this.commands.get(commandName!)
    if(!command)
      return this.replyText(messageInfo, "El comando no existe") 

    args?.shift()
    command.bot = this
    command.execute(messageInfo, args)
  }

  public replyText = async (webMessageInfo: proto.IWebMessageInfo, text: string) => {
    if (webMessageInfo.key.remoteJid)
      await this.waConnection?.sendMessage(webMessageInfo.key.remoteJid, { text }, { quoted: webMessageInfo })
  }

  public replySticker =async (webMessageInfo: proto.IWebMessageInfo, sticker: { sticker: Buffer }) => {
    if (webMessageInfo.key.remoteJid)
      await this.waConnection?.sendMessage(webMessageInfo.key.remoteJid, sticker, { quoted: webMessageInfo })
  }
}


