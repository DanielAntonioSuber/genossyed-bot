import { Client } from '@notionhq/client'

import { isFullDatabase } from '@notionhq/client'
import { DatabaseObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function getDBTasks() {
  const response = await notion.search({
    filter: {
      property: 'object',
      value: 'database'
    }
  }) as QueryDatabaseResponse

  const results = response.results.filter(db => {
    if (isFullDatabase(db)) {
      const nombre = db.title?.[0]?.plain_text || ''
      return nombre.toLowerCase() === 'tasks'
    }
    return false
  }) as DatabaseObjectResponse[]

  return results[0]
}

type TaskProperties = {
  title?: string
  category?: string
  priority?: string
  date?: string
}

export async function createTask({
  title,
  category,
  priority,
  date
}: TaskProperties) {
  try {
    const tasksDB = await getDBTasks()
    
    if (!tasksDB) {
      throw new Error('No se encontró la base de datos de tareas')
    }

    const properties: any = {
      Nombre: {
        title: [
          {
            text: {
              content: title || 'Nueva tarea sin título'
            }
          }
        ]
      }
    }

    if (category) {
      properties['Categoría'] = {
        select: {
          name: category
        }
      }
    }

    if (priority) {
      properties['Prioridad'] = {
        select: {
          name: priority
        }
      }
    }

    properties['Fecha'] = {
      date: {
        start: new Date().toISOString()
      }
    }

    const newPage = await notion.pages.create({
      parent: {
        database_id: tasksDB.id
      },
      properties: properties,
      icon: {
        type: 'external',
        external: { url: 'https://www.notion.so/icons/document_gray.svg'}
      }
    })

    return newPage
  } catch (error) {
    console.error('Error al crear la tarea:', error)
    throw error
  }
}

export async function getTasks ({ number = 1 }: { number?: number }) {
  const dbTask = await getDBTasks()
  if (dbTask) {
    return notion.databases.query({
      database_id: dbTask.id,
      page_size: number
    })
  }
  return null
}

export async function getTodayTasks () {
  const dbTasks = await getDBTasks()

  if(dbTasks) {
    return notion.databases.query({
      database_id: dbTasks.id,
      filter: {
        property: 'Fecha',
        date: {
          on_or_after: new Date().toISOString()
        }
      }
    })
  }
}

export default notion