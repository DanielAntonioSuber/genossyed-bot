import { createCanvas, loadImage, CanvasRenderingContext2D, registerFont } from 'canvas'

interface Task {
  id: any
  taskName: any
  taskAssignee: any
  taskPriority: any
  taskCategory: any
  taskStatus: any
  taskDate: any
  created_time: any
  last_edited_time: any
  url: any
}

interface GenerateTasksImageOptions {
  title?: string
  backgroundColor?: string
  cardColor?: string
  textColor?: string
}

export async function generateTasksImage(
  tasks: Task[],
  options: GenerateTasksImageOptions = {}
): Promise<Buffer> {
  
  const {
    title = '📋 Lista de Tareas',
    backgroundColor = '#f5f7fa',
    cardColor = '#ffffff',
    textColor = '#2c3e50'
  } = options

  const padding = 40
  const taskHeight = 90
  const taskSpacing = 15
  const width = 800
  const height = padding * 5 + (tasks.length * (taskHeight + taskSpacing)) - taskSpacing

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, backgroundColor)
  gradient.addColorStop(1, '#c3cfe2')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  ctx.fillStyle = textColor
  ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(title, width / 2, padding - 10)

  ctx.fillStyle = '#5d6b8a'
  ctx.font = '16px "Segoe UI", Arial, sans-serif'
  ctx.fillText(`Total: ${tasks.length} tareas`, width / 2, padding + 15)
  
  tasks.forEach((task, index) => {
    const y = padding + 50 + index * (taskHeight + taskSpacing)
    
    ctx.fillStyle = cardColor
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 5
    ctx.beginPath()
    ctx.roundRect(padding, y, width - padding * 2, taskHeight, 10)
    ctx.fill()
    
    ctx.shadowColor = 'transparent'

    const maxNameLength = 40
    const displayName = task.taskName.length > maxNameLength
      ? `${task.taskName.substring(0, maxNameLength)}...`
      : task.taskName

    ctx.fillStyle = textColor
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(displayName, padding + 20, y + 25)
    
    ctx.fillStyle = '#95a5a6'
    ctx.font = '12px "Segoe UI", Arial, sans-serif'
    ctx.fillText(`#${task.id.slice(0, 8)}`, padding + 20, y + 45)
    
    ctx.fillStyle = '#7f8c8d'
    ctx.font = '14px "Segoe UI", Arial, sans-serif'
    ctx.fillText(`👤 ${task.taskAssignee || 'Sin asignar'}`, padding + 20, y + 65)
    ctx.fillText(`📅 Due: ${formatDate(task.taskDate)}`, padding + 20, y + 85)

    drawStatus(ctx, width - padding - 20, y + 65, task.taskStatus)
    drawPriority(ctx, width - padding - 20, y + 85, task.taskPriority)
  })
  
  const buffer = canvas.toBuffer('image/png', { resolution: 100 })
  return buffer
}

function drawStatus(ctx: CanvasRenderingContext2D, x: number, y: number, status: string) {
  const statusConfig: Record<string, { color: string; icon: string }> = {
    'Completado': { color: '#2ecc71', icon: '✅' },
    'En progreso': { color: '#3498db', icon: '🔄' },
    'Pendiente': { color: '#f39c12', icon: '⏳' },
    'Cancelado': { color: '#e74c3c', icon: '❌' }
  }

  const config = statusConfig[status] || { color: '#95a5a6', icon: '❓' }

  ctx.textAlign = 'right'
  ctx.fillStyle = config.color
  ctx.fillText(`${config.icon} ${status}`, x, y)
}

function drawPriority(ctx: CanvasRenderingContext2D, x: number, y: number, priority: string) {
  const priorityConfig: Record<string, { color: string; icon: string }> = {
    'Alta': { color: '#e74c3c', icon: '⬆' },
    'Media': { color: '#f39c12', icon: '➡' },
    'Baja': { color: '#2ecc71', icon: '⬇' },
    'Crítica': { color: '#9b59b6', icon: '⚠' }
  }

  const config = priorityConfig[priority] || { color: '#95a5a6', icon: '⬆' }

  ctx.textAlign = 'right'
  ctx.fillStyle = config.color
  ctx.fillText(`${config.icon} ${priority}`, x, y)
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Sin fecha'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}
