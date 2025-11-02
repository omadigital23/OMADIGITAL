import fs from 'fs'
import path from 'path'

export async function getLocalizedContent(locale: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', locale, 'common.json')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error loading content:', error)
    return null
  }
}