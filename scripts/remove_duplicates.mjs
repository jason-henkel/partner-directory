import fs from 'fs'
import { parse } from 'csv-parse/sync'

const csv = fs.readFileSync('partners_with_emails_and_slugs.csv', 'utf8')
const data = parse(csv, { columns: true })

console.log(`Original rows: ${data.length}`)

// Track seen slugs and LinkedIn URLs to identify duplicates
const seenSlugs = new Set()
const seenLinkedIn = new Set()
const dedupedData = []
let removedCount = 0

for (const row of data) {
  const slug = row.slug
  const linkedin = row.linkedin_url
  
  // Skip if we've seen this slug AND LinkedIn combo before
  if (slug && linkedin && seenSlugs.has(slug) && seenLinkedIn.has(linkedin)) {
    removedCount++
    console.log(`Removing duplicate: ${row.first_name} ${row.last_name} - ${row.company} (${slug})`)
    continue
  }
  
  // Add to deduped data
  dedupedData.push(row)
  
  // Track this slug and LinkedIn
  if (slug) seenSlugs.add(slug)
  if (linkedin) seenLinkedIn.add(linkedin)
}

console.log(`\nRemoved ${removedCount} duplicates`)
console.log(`Final rows: ${dedupedData.length}`)

// Simple CSV stringify
function csvStringify(data) {
  if (!data.length) return ''
  const headers = Object.keys(data[0])
  const rows = [headers.join(',')]
  
  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h] || ''
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    })
    rows.push(values.join(','))
  }
  
  return rows.join('\n')
}

// Write deduped CSV
const output = csvStringify(dedupedData)
fs.writeFileSync('partners_with_emails_and_slugs_deduped.csv', output, 'utf8')
console.log('\nWrote deduped data to: partners_with_emails_and_slugs_deduped.csv')
