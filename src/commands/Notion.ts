import { proto } from 'baileys';
import { Command } from '../structures/Command';
import { createTask, getTasks } from '../lib/notion';
import { getFlagValue } from '../utils/flags';
import { isFullPageOrDatabase } from '@notionhq/client';


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

function parseFlagsGet(args: string[]) {
  return {
    number: getFlagValue(['--number', '-n'], args),
    id: getFlagValue(['--id', '-id'], args)
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
              await this.bot.replyText(message, `Tarea con ${response.properties['Nombre'].id} creada.`);
            }
            break
          case 'get':
            const { number } = parseFlagsGet(args)

            const tasks = await getTasks({ number: parseInt(number ?? '0') })
            const formattedTasks = tasks?.results.map((task: any) => {
              const {
                id,
                created_time,
                last_edited_time,
                properties,
                url
              } = task
            
              const taskName = properties['Nombre']?.title?.[0]?.text?.content || 'No definido'
              const taskAssignee = properties['Assignee']?.people?.map((person: any) => person.name).join(', ') || 'Sin asignar'
              const taskPriority = properties['Prioridad']?.select?.name || 'Sin prioridad'
              const taskCategory = properties['Categoría']?.select?.name || 'Sin categoría'
              const taskStatus = properties['Estado']?.status?.name || 'Estado desconocido'
              const taskDate = properties['Fecha']?.date?.start || 'No definida'
            
              return {
                id,
                taskName,
                taskAssignee,
                taskPriority,
                taskCategory,
                taskStatus,
                taskDate,
                created_time,
                last_edited_time,
                url
              }
            })
            
            await this.bot.replyText(
              message, 
              JSON.stringify(formattedTasks, null, 2)
            )
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