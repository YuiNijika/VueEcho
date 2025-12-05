/**
 * 格式化日期
 * @param dateString ISO 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

