import { WASocket, proto } from 'baileys'
import { Bot } from './Bot'

export abstract class Command {
  abstract name: string
  abstract description?: string
  abstract aliases?: string[]

  public abstract execute (message: proto.IWebMessageInfo, args?: string[] | undefined): Promise<void | never>

  public bot!: Bot
}