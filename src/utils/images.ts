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
  isMobile?: boolean
  width?: number
}

export async function generateTasksImage(
  tasks: Task[],
  options: GenerateTasksImageOptions = {}
): Promise<Buffer> {
  
  const {
    title = '📋 Lista de Tareas',
    backgroundColor = '#f5f7fa',
    cardColor = '#ffffff',
    textColor = '#2c3e50',
    isMobile = true, // Por defecto optimizado para móvil
    width: customWidth
  } = options

  // Configuración responsiva
  const isMobileLayout = isMobile || (customWidth && customWidth < 500)
  const width = customWidth || (isMobileLayout ? 400 : 800)
  const padding = isMobileLayout ? 20 : 40
  const taskHeight = isMobileLayout ? 120 : 90 // Más alto en móvil para mejor distribución
  const taskSpacing = isMobileLayout ? 12 : 15
  
  // Altura dinámica basada en contenido
  const headerHeight = isMobileLayout ? 80 : 100
  const height = headerHeight + padding + (tasks.length * (taskHeight + taskSpacing))

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Gradiente de fondo
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, backgroundColor)
  gradient.addColorStop(1, '#c3cfe2')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // Título principal
  ctx.fillStyle = textColor
  ctx.font = `bold ${isMobileLayout ? 22 : 28}px "Segoe UI", Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(title, width / 2, padding + 25)

  // Contador de tareas
  ctx.fillStyle = '#5d6b8a'
  ctx.font = `${isMobileLayout ? 14 : 16}px "Segoe UI", Arial, sans-serif`
  ctx.fillText(`Total: ${tasks.length} tareas`, width / 2, padding + 50)
  
  // Renderizar cada tarea
  tasks.forEach((task, index) => {
    const y = headerHeight + padding + index * (taskHeight + taskSpacing)
    
    // Sombra y fondo de la tarjeta
    ctx.fillStyle = cardColor
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'
    ctx.shadowBlur = isMobileLayout ? 6 : 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = isMobileLayout ? 2 : 5
    ctx.beginPath()
    ctx.roundRect(padding, y, width - padding * 2, taskHeight, isMobileLayout ? 8 : 10)
    ctx.fill()
    
    ctx.shadowColor = 'transparent'

    // Nombre de la tarea (ajustado para móvil)
    const maxNameLength = isMobileLayout ? 28 : 40
    const displayName = task.taskName.length > maxNameLength
      ? `${task.taskName.substring(0, maxNameLength)}...`
      : task.taskName

    ctx.fillStyle = textColor
    ctx.font = `bold ${isMobileLayout ? 16 : 18}px "Segoe UI", Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText(displayName, padding + 15, y + 22)
    
    // ID de la tarea
    ctx.fillStyle = '#95a5a6'
    ctx.font = `${isMobileLayout ? 11 : 12}px "Segoe UI", Arial, sans-serif`
    ctx.fillText(`#${task.id.slice(0, 8)}`, padding + 15, y + 40)
    
    if (isMobileLayout) {
      // Layout móvil: información en dos columnas
      const leftX = padding + 15
      const rightX = width - padding - 15
      
      // Columna izquierda
      ctx.fillStyle = '#7f8c8d'
      ctx.font = `${isMobileLayout ? 12 : 14}px "Segoe UI", Arial, sans-serif`
      ctx.textAlign = 'left'
      
      // Asignado y fecha en líneas separadas
      const assigneeText = `👤 ${task.taskAssignee || 'Sin asignar'}`
      const truncatedAssignee = assigneeText.length > 18 ? `${assigneeText.substring(0, 15)}...` : assigneeText
      ctx.fillText(truncatedAssignee, leftX, y + 58)
      
      ctx.fillText(`📅 ${formatDate(task.taskDate)}`, leftX, y + 76)
      
      // Columna derecha - Estado y prioridad
      drawMobileStatus(ctx, rightX, y + 58, task.taskStatus)
      drawMobilePriority(ctx, rightX, y + 76, task.taskPriority)
      
      // Línea divisoria sutil
      ctx.strokeStyle = '#e8e8e8'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(leftX, y + 90)
      ctx.lineTo(width - padding - 15, y + 90)
      ctx.stroke()
      
      // Categoría si existe
      if (task.taskCategory) {
        ctx.fillStyle = '#9b59b6'
        ctx.font = `${isMobileLayout ? 10 : 11}px "Segoe UI", Arial, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(`📂 ${task.taskCategory}`, width / 2, y + 105)
      }
      
    } else {
      // Layout escritorio (original)
      ctx.fillStyle = '#7f8c8d'
      ctx.font = '14px "Segoe UI", Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`👤 ${task.taskAssignee || 'Sin asignar'}`, padding + 20, y + 65)
      ctx.fillText(`📅 Due: ${formatDate(task.taskDate)}`, padding + 20, y + 85)

      drawStatus(ctx, width - padding - 20, y + 65, task.taskStatus)
      drawPriority(ctx, width - padding - 20, y + 85, task.taskPriority)
    }
  })
  
  // Mayor resolución para mejor calidad en móviles
  const buffer = canvas.toBuffer('image/png', { resolution: isMobileLayout ? 150 : 100 })
  return buffer
}

// Funciones optimizadas para móvil
function drawMobileStatus(ctx: CanvasRenderingContext2D, x: number, y: number, status: string) {
  const statusConfig: Record<string, { color: string; icon: string }> = {
    'Completado': { color: '#2ecc71', icon: '✅' },
    'En progreso': { color: '#3498db', icon: '🔄' },
    'Pendiente': { color: '#f39c12', icon: '⏳' },
    'Cancelado': { color: '#e74c3c', icon: '❌' }
  }

  const config = statusConfig[status] || { color: '#95a5a6', icon: '❓' }

  ctx.textAlign = 'right'
  ctx.fillStyle = config.color
  ctx.font = '12px "Segoe UI", Arial, sans-serif'
  
  // Texto más corto para móvil
  const shortStatus = status === 'En progreso' ? 'En curso' : status
  ctx.fillText(`${config.icon} ${shortStatus}`, x, y)
}

function drawMobilePriority(ctx: CanvasRenderingContext2D, x: number, y: number, priority: string) {
  const priorityConfig: Record<string, { color: string; icon: string }> = {
    'Alta': { color: '#e74c3c', icon: '🔴' },
    'Media': { color: '#f39c12', icon: '🟡' },
    'Baja': { color: '#2ecc71', icon: '🟢' },
    'Crítica': { color: '#9b59b6', icon: '🟣' }
  }

  const config = priorityConfig[priority] || { color: '#95a5a6', icon: '⚪' }

  ctx.textAlign = 'right'
  ctx.fillStyle = config.color
  ctx.font = '12px "Segoe UI", Arial, sans-serif'
  ctx.fillText(`${config.icon} ${priority}`, x, y)
}

// Funciones originales para escritorio
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
