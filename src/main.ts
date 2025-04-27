import { Bot } from './structures/Bot'
import dotenv from 'dotenv'

dotenv.config()

const bot = new Bot('GenosyedBot', '1')
bot.connectToWhatsApp()
