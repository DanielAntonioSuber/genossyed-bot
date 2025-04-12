import { WASocket, proto } from "baileys";
import { Bot } from "./Bot";


export class Command {
  name!: string
  description!: string

  public execute = async (message: proto.IWebMessageInfo, args?: string[] | undefined): Promise<void | never> => {
    throw new Error('Command method not implemented')
  }

  public bot!: Bot;
}