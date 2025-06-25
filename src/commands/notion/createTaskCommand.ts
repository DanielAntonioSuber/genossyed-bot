import { proto } from 'baileys'
import { Bot } from '../../structures/Bot'
import { createTask } from '../../lib/notion'
import { getFlagValue } from '../../utils/flags'
import { isFullPageOrDatabase } from '@notionhq/client'

interface CreateFlags {
  title?: string
  category?: string
  priority?: string
}

function parseFlagsCreate(args: string[]): CreateFlags {
  return {
    title: getFlagValue(['--title', '-t'], args),
    category: getFlagValue(['--category', '-c'], args),
    priority: getFlagValue(['--priority', '-p'], args)
  }
}

async function createTaskCommand(
  bot: Bot,
  message: proto.IWebMessageInfo,
  args: string[]
): Promise<void> {
  const { category, priority, title } = parseFlagsCreate(args)
  const response = await createTask({ category, priority, title })

  if (isFullPageOrDatabase(response)) {
    const taskId = (response.properties['ID'] as any)?.['unique_id']?.number
    const taskTitle = (response.properties['Título'] as any)?.title?.[0]?.plain_text || 'Sin título'
    const taskCategory = (response.properties['Categoría'] as any)?.select?.name || 'Sin categoría'
    const taskPriority = (response.properties['Prioridad'] as any)?.select?.name || 'Sin prioridad'
    
    const responseMessage = `✅ *Tarea creada exitosamente*

📝 *Título:* ${taskTitle}
🏷️ *Categoría:* ${taskCategory}
⚡ *Prioridad:* ${taskPriority}
🆔 *ID:* ${taskId}

La tarea ha sido agregada a tu base de datos de Notion.`

    await bot.replyText(message, responseMessage, 10)
  }
}

export default createTaskCommand 