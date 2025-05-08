import { proto } from 'baileys'
import { Bot } from '../../structures/Bot'
import { getTasks, getTodayTasks } from '../../lib/notion'
import { getFlagValue, hasFlag } from '../../utils/flags'
import { generateTasksImage } from '../../utils/images'

function parseFlagsGet(args: string[]) {
  return {
    number: getFlagValue(['--number', '-n'], args),
    id: getFlagValue(['--id', '-id'], args),
    today: hasFlag(['-t', '--t'], args)
  }
}

async function getTasksCommand(bot: Bot, message: proto.IWebMessageInfo, args: string[]) {
  const { number, today } = parseFlagsGet(args)

  if (parseInt(number ?? '0') > 5) {
    bot.replyText(message, 'Máximo puedes listar 5 tareas')
    return
  }

  const tasks = today ? await getTodayTasks() : await getTasks({ number: parseInt(number ?? '0') })
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

  try {
    const imageBuffer = await generateTasksImage(formattedTasks!, {
      title: today ? 'Tareas de hoy de Daniii' : 'Tareas de Daniii'
    })
    await bot.replyImage(message, imageBuffer)
  } catch (error) {
    console.error('Error al generar imagen:', error)
    await bot.replyText(message, JSON.stringify(formattedTasks, null, 2))
  }
}

export default getTasksCommand