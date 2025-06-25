import { proto } from 'baileys'
import { Command } from '../../structures/Command'
import getTasksCommand from './getTasksCommand'
import createTaskCommand from './createTaskCommand'

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
   - -img, --image    ➜ Enviar imagen de las tareas (sin esta bandera envía texto)

  Ejemplo de uso:  
.notion tasks get -n 10
.notion tasks get -n 5 -img

✨✨✨ ¡Más funcionalidades serán añadidas pronto!
`

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

      if (!command)
        return

      if (command === 'help')
        await this.bot.replyText(message, helpText)

      if (command === 'tasks') {
        switch (subCommand) {
          case 'create':
            await createTaskCommand(this.bot, message, args)
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