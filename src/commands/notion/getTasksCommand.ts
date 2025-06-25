import { proto } from 'baileys'
import { Bot } from '../../structures/Bot'
import { getTasks, getTodayTasks } from '../../lib/notion'
import { getFlagValue, hasFlag } from '../../utils/flags'
import { generateTasksImage } from '../../utils/images'
import { 
  PageObjectResponse, 
  DatabaseObjectResponse
} from '@notionhq/client'

interface GetFlags {
  number?: string
  id?: string
  today: boolean
  image: boolean
}

interface FormattedTask {
  id: string
  taskName: string
  taskAssignee: string
  taskPriority: string
  taskCategory: string
  taskStatus: string
  taskDate: string
  created_time: string
  last_edited_time: string
  url: string
}

function parseFlagsGet(args: string[]): GetFlags {
  return {
    number: getFlagValue(['--number', '-n'], args),
    id: getFlagValue(['--id', '-id'], args),
    today: hasFlag(['-t', '--today'], args),
    image: hasFlag(['-img', '--image'], args)
  }
}

function formatTasksForWhatsApp(tasks: FormattedTask[], isToday: boolean = false): string {
  const title = isToday ? '📅 *Tareas de Hoy*' : '📋 *Lista de Tareas*'
  const totalTasks = tasks.length
  
  if (totalTasks === 0) {
    return `${title}\n\n❌ No hay tareas ${isToday ? 'para hoy' : 'disponibles'}`
  }

  let message = `${title}\n📊 *Total: ${totalTasks} tarea${totalTasks !== 1 ? 's' : ''}*\n\n`

  tasks.forEach((task, index) => {
    const priorityEmoji: Record<string, string> = {
      'Alta': '🔴',
      'Media': '🟡', 
      'Baja': '🟢',
      'Crítica': '⚫'
    }

    const statusEmoji: Record<string, string> = {
      'Completado': '✅',
      'En progreso': '🔄',
      'Pendiente': '⏳',
      'Cancelado': '❌'
    }

    const priorityIcon = priorityEmoji[task.taskPriority] || '⚪'
    const statusIcon = statusEmoji[task.taskStatus] || '❓'

    message += `*${index + 1}. ${task.taskName}*\n`
    message += `🆔 ID: \`${task.id.slice(0, 8)}\`\n`
    message += `👤 Asignado: ${task.taskAssignee}\n`
    message += `📅 Fecha: ${task.taskDate}\n`
    message += `🏷️ Categoría: ${task.taskCategory}\n`
    message += `${statusIcon} Estado: ${task.taskStatus}\n`
    message += `${priorityIcon} Prioridad: ${task.taskPriority}\n`
    message += `🔗 [Ver en Notion](${task.url})\n\n`
  })

  return message
}

function formatNotionTask(task: PageObjectResponse): FormattedTask {
  const properties = task.properties
  
  const taskName = (properties['Nombre'] as any)?.title?.[0]?.text?.content || 'No definido'
  const taskAssignee = (properties['Assignee'] as any)?.people?.map((person: any) => person.name).join(', ') || 'Sin asignar'
  const taskPriority = (properties['Prioridad'] as any)?.select?.name || 'Sin prioridad'
  const taskCategory = (properties['Categoría'] as any)?.select?.name || 'Sin categoría'
  const taskStatus = (properties['Estado'] as any)?.status?.name || 'Estado desconocido'
  const taskDate = (properties['Fecha'] as any)?.date?.start || 'No definida'

  return {
    id: task.id,
    taskName,
    taskAssignee,
    taskPriority,
    taskCategory,
    taskStatus,
    taskDate,
    created_time: task.created_time,
    last_edited_time: task.last_edited_time,
    url: task.url
  }
}

async function getTasksCommand(
  bot: Bot, 
  message: proto.IWebMessageInfo, 
  args: string[]
): Promise<void> {
  const { number, today, image } = parseFlagsGet(args)

  if (parseInt(number ?? '0') > 5) {
    bot.replyText(message, 'Máximo puedes listar 5 tareas')
    return
  }

  const tasksResponse = today 
    ? await getTodayTasks() 
    : await getTasks({ number: parseInt(number ?? '0') })
    
  if (!tasksResponse) {
    await bot.replyText(message, '❌ No se pudieron obtener las tareas')
    return
  }

  const formattedTasks: FormattedTask[] = tasksResponse.results
    .filter((task: any): task is PageObjectResponse => task.object === 'page')
    .map(formatNotionTask)

  try {
    if (image) {
      const imageBuffer = await generateTasksImage(formattedTasks, {
        title: today ? 'Tareas de hoy de Daniii' : 'Tareas de Daniii'
      })
      await bot.replyImage(message, imageBuffer)
    } else {
      const formattedMessage = formatTasksForWhatsApp(formattedTasks, today)
      await bot.replyText(message, formattedMessage)
    }
  } catch (error) {
    console.error('Error al procesar tareas:', error)
    const formattedMessage = formatTasksForWhatsApp(formattedTasks, today)
    await bot.replyText(message, formattedMessage)
  }
}

export default getTasksCommand