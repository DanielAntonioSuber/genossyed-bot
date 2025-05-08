import { proto } from 'baileys'
import { Command } from '../../structures/Command'
import { createTask } from '../../lib/notion'
import { getFlagValue } from '../../utils/flags'
import { isFullPageOrDatabase } from '@notionhq/client'
import getTasksCommand from './getTasksCcommand'

const helpText = `👋 ¡Hola! Este es el comando de Notion creado para interactuar fácilmente con el Notion de Daniel.

📚 Comanditos disponibles:

1. help  
  Muestra este mensaje de ayuda.

2. tasks create  
  Crea una nueva tarea en Notion con los datos que tú elijas mediante banderas.
  Opciones disponibles:
   - -t, --title       ➜ Título de la tarea  
   - -c, --categoria   ➜ Categoría de la tarea 
   - -p, --prioridad   ➜ Prioridad de la tarea

   Ejemplo de uso:  
.notion tasks create -t 'Leer libro' -c 'Personal' -p 'Alta'

3. tasks get  
  Obtener tareas de Notion con los filtros elegidos
  Opciones disponibles:
   - -n, --number     ➜ Últimas n tareas
   - -i, --id         ➜ Tarea con el id

  Ejemplo de uso:  
.notion tasks get -n 10

✨✨✨ ¡Más funcionalidades serán añadidas pronto!
`

function parseFlagsCreate(args: string[]) {
  return {
    title: getFlagValue(['--title', '-t'], args),
    category: getFlagValue(['--category', '-c'], args),
    priority: getFlagValue(['--priority', '-p'], args)
  }
}

export default class Notion extends Command {
  name: string
  description?: string
  aliases?: string[] | undefined

  constructor() {
    super()
    this.name = 'notion'
  }

  public async execute(message: proto.IWebMessageInfo, args?: string[] | undefined): Promise<void | never> {
    try {
      const command = args?.[0]
      const subCommand = args?.[1]

      console.log(message)

      if (!command)
        return

      if (command === 'help')
        await this.bot.replyText(message, helpText)

      if (command === 'tasks') {
        switch (subCommand) {
          case 'create':
            const { category, priority, title } = parseFlagsCreate(args)
            const response = await createTask({ category, priority, title })

            if (isFullPageOrDatabase(response)) {
              await this.bot.replyText(message, `Tarea con ID: ${(response.properties['ID'] as any)?.['unique_id']?.number} creada.`, 10)
            }
            break
          case 'get':
            await getTasksCommand(this.bot, message, args)
            break
          default:
            break
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}