import fs from 'fs'
import { parse } from 'csv-parse/sync'

const csv = fs.readFileSync('partners_with_emails_and_slugs.csv', 'utf8')
const data = parse(csv, { columns: true })

console.log('Checking for potential mismatches...\n')

let suspiciousCount = 0
const suspicious = []

for (const row of data) {
  if (!row.slug || row.slug_confidence === 'no_match') continue
  
  const origCompany = (row.company || '').toLowerCase().trim()
  const enrichedCompany = (row.Company || '').toLowerCase().trim()
  const slug = row.slug
  
  // Skip if companies are empty
  if (!origCompany && !enrichedCompany) continue
  
  // Check if slug seems to match neither company name
  const slugWords = slug.split('-').filter(w => w.length > 2)
  const origWords = origCompany.split(/\s+/).filter(w => w.length > 2)
  const enrichedWords = enrichedCompany.split(/\s+/).filter(w => w.length > 2)
  
  let matchesOrig = false
  let matchesEnriched = false
  
  // Check if any significant slug words appear in company names
  for (const sw of slugWords) {
    if (origWords.some(ow => ow.includes(sw) || sw.includes(ow))) matchesOrig = true
    if (enrichedWords.some(ew => ew.includes(sw) || sw.includes(ew))) matchesEnriched = true
  }
  
  // If slug doesn't match either company name, it's suspicious
  if (!matchesOrig && !matchesEnriched && origCompany && enrichedCompany) {
    suspiciousCount++
    suspicious.push({
      row: data.indexOf(row) + 2, // +2 for header and 0-index
      origCompany: row.company,
      enrichedCompany: row.Company,
      slug: row.slug,
      confidence: row.slug_confidence,
      linkedin: row.linkedin_url
    })
  }
}

console.log(`Found ${suspiciousCount} potentially suspicious matches:\n`)

for (const s of suspicious.slice(0, 20)) { // Show first 20
  console.log(`Row ${s.row}:`)
  console.log(`  Original: "${s.origCompany}"`)
  console.log(`  Enriched: "${s.enrichedCompany}"`)
  console.log(`  Slug: "${s.slug}"`)
  console.log(`  Confidence: ${s.confidence}`)
  console.log(`  LinkedIn: ${s.linkedin}`)
  console.log('')
}

if (suspicious.length > 20) {
  console.log(`... and ${suspicious.length - 20} more\n`)
}

// Also check for duplicates
const slugCounts = {}
for (const row of data) {
  if (row.slug) {
    slugCounts[row.slug] = (slugCounts[row.slug] || 0) + 1
  }
}

const duplicates = Object.entries(slugCounts).filter(([slug, count]) => count > 1)
console.log(`\nFound ${duplicates.length} duplicate slugs:`)
for (const [slug, count] of duplicates.slice(0, 10)) {
  console.log(`  "${slug}" appears ${count} times`)
}
