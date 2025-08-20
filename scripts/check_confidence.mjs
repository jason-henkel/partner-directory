import fs from 'fs'
import { parse } from 'csv-parse/sync'

const csv = fs.readFileSync('partners_with_emails_and_slugs.csv', 'utf8')
const data = parse(csv, { columns: true })

const confidence = {}
data.forEach(r => {
  confidence[r.slug_confidence] = (confidence[r.slug_confidence] || 0) + 1
})

console.log('Match confidence distribution:')
Object.entries(confidence)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}`))
