import { Boom } from '@hapi/boom'
import makeWASocket, { ConnectionState, DisconnectReason, MessageUpsertType, WASocket, proto, delay, makeCacheableSignalKeyStore } from 'baileys'
import { Command } from './Command'
import { readdirSync } from 'fs-extra'
import { join } from 'path'
import { getTextFromWebMsgInfo } from '../utils/WebMessageInfoUtils'
import QRCode from 'qrcode'
import useMongoAuthState from '../utils/useMongoAuthState'
import { MongoClient } from 'mongodb'
import pino from 'pino'
import NodeCache from 'node-cache'

export class Bot {
  private botId: string
  public waSock: WASocket | undefined
  public waSocks: WASocket[] | undefined
  private commands = new Map<string, Command>()
  private botJid: string | undefined
  private name: string | undefined
  private commandPrefix: string = '.'
  private groupCache = new NodeCache({ /* ... */ })
  private messageCache = new NodeCache({ stdTTL: 60 })
  private mongo?: MongoClient

  constructor(botId: string, name: string) {
    this.name = name
    this.botId = botId
    this.loadCommands()
  }

  async connectToWhatsApp() {
    this.mongo = new MongoClient('mongodb://localhost:27017', {
      socketTimeoutMS: 1_00_000,
      connectTimeoutMS: 1_00_000,
      waitQueueTimeoutMS: 1_00_000,
    })

    const authCollection = this.mongo.db('wpsessions').collection('authState');
    const { state, saveCreds } = await useMongoAuthState(authCollection)

    this.waSock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino())
      },
      shouldSyncHistoryMessage: () => false,
      cachedGroupMetadata: async (jid) => this.groupCache.get(jid)
    })

    this.waSock.ev.on('creds.update', saveCreds)
    this.waSock.ev.on('connection.update', this.handleUpdate(saveCreds))
    this.waSock.ev.on('messages.upsert', this.handleNewMessage)
  }

  private loadCommands() {
    const path = [__dirname, '..', 'commands']
    const commands = readdirSync(join(...path))

    for (const commandName of commands) {
      path.push(commandName)
      const command: Command = new (require(join(...path)).default)()
      this.commands.set(command.name, command)
      command.bot = this
      path.splice(path.indexOf(commandName), 1)
    }
  }

  private handleUpdate(saveCreds: () => Promise<void>) {
    return async (update: Partial<ConnectionState>) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        console.log(await QRCode.toString(qr, { type: 'terminal', small: true }))
      }

      if (connection === 'close' && lastDisconnect != null) {
        const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
        console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
        if (shouldReconnect) {
          this.waSock = undefined
          await this.mongo?.close()
          this.connectToWhatsApp()
        }
      } else if (connection === 'open') {
        console.log('opened connection')
      }

      this.waSock?.ev.on('creds.update', saveCreds)
    }
  }

  private handleNewMessage = ({ messages, type }: {
    messages: proto.IWebMessageInfo[];
    type: MessageUpsertType;
  }) => {
    const messageInfo = messages[0]
    const message = getTextFromWebMsgInfo(messageInfo)
    const messageId = messageInfo.key.id

    if (!messageId || this.messageCache.has(messageId)) return
    this.messageCache.set(messageId, true)

    if (type === 'notify' && message !== null) {
      const isCommand = message?.startsWith(this.commandPrefix)
      const commandName = message?.split(' ')[0].replace(this.commandPrefix, '')
      const args = message?.split(' ')

      console.log(`${messageInfo.key.remoteJid?.replace(/\..+\..+/, '')}:${message}`)

      if (!isCommand) {
        return
      }

      const command = this.commands.get(commandName!)
      if (!command)
        return
      args?.shift()
      command.execute(messageInfo, args ?? [] as string[])
    }
  }

  public replyText = async (webMessageInfo: proto.IWebMessageInfo, text: string, typingDelay?: number) => {
    const jid = webMessageInfo.key.remoteJid

    if (jid) {
      if (typingDelay) {
        await this.waSock?.presenceSubscribe(jid)
        await delay(500)

        await this.waSock?.sendPresenceUpdate('composing', jid)
        await delay(typingDelay)

        await this.waSock?.sendPresenceUpdate('paused', jid)
      }

      await this.waSock?.sendMessage(jid, { text }, { quoted: webMessageInfo })
    }
  }

  public replySticker = async (webMessageInfo: proto.IWebMessageInfo, sticker: { sticker: Buffer }) => {
    if (webMessageInfo.key.remoteJid)
      await this.waSock?.sendMessage(webMessageInfo.key.remoteJid, sticker, { quoted: webMessageInfo })
  }

  public replyImage = async (webMessageInfo: proto.IWebMessageInfo, imageBuffer: Buffer<ArrayBufferLike>) => {
    if (webMessageInfo.key.remoteJid)
      await this.waSock?.sendMessage(webMessageInfo.key.remoteJid, { image: imageBuffer }, { quoted: webMessageInfo })
  }
}


