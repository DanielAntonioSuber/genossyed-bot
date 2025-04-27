export function getFlagValue(flags: string[], args: string[]): string | undefined {
  const flagIndex = args.findIndex(arg => flags.includes(arg))
  if (flagIndex === -1) return undefined

  const valueParts = []
  let i = flagIndex + 1
  let quoteChar: string | null = null

  while (i < args.length) {
    const currentArg = args[i]

    if (currentArg.startsWith('-') && !quoteChar) {
      break
    }

    if (!quoteChar && (currentArg.startsWith('"') || currentArg.startsWith("'"))) {
      quoteChar = currentArg[0]
      const trimmed = currentArg.slice(1)
      if (trimmed.endsWith(quoteChar)) {

        valueParts.push(trimmed.slice(0, -1))
        quoteChar = null
      } else {
        valueParts.push(trimmed)
      }
    } else if (quoteChar && currentArg.endsWith(quoteChar)) {
      valueParts.push(currentArg.slice(0, -1))
      quoteChar = null
    } else {
      valueParts.push(currentArg)
    }

    i++

    if (!quoteChar && valueParts.length > 0) {
      break
    }
  }

  if (quoteChar) return undefined

  const result = valueParts.join(' ').trim()
  return result === '' ? undefined : result
}