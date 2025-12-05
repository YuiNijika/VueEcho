/**
 * 解析 frontmatter
 */
export function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { data: {}, content }
  }

  const frontmatter = match[1]
  const body = match[2]
  const data: Record<string, any> = {}

  // 解析 YAML frontmatter
  if (frontmatter) {
    frontmatter.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        let value = line.substring(colonIndex + 1).trim()

        // 处理数组格式 [item1, item2]
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1)
          data[key] = value.split(',').map(item => item.trim().replace(/^["']|["']$/g, ''))
        } else {
          // 移除引号
          value = value.replace(/^["']|["']$/g, '')
          data[key] = value
        }
      }
    })
  }

  return { data, content: body }
}

