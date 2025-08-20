import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

const root = process.cwd()

// Simple CSV stringify function
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

// Load data
const emailsCsv = fs.readFileSync(path.join(root, 'partners_with_emails.csv'), 'utf8')
const emailsData = parse(emailsCsv, { columns: true })
const contactsWithSlugs = JSON.parse(fs.readFileSync(path.join(root, 'partner_contacts_with_slugs.json'), 'utf8'))
const partnersData = JSON.parse(fs.readFileSync(path.join(root, 'all_partners_with_screenshots.json'), 'utf8'))

// Build lookup maps
const companyToSlug = new Map()
const linkedinToSlug = new Map()

// From contacts data
for (const contact of contactsWithSlugs) {
  if (contact.matched_slug && contact.company) {
    companyToSlug.set(contact.company.toLowerCase().trim(), contact.matched_slug)
  }
  if (contact.matched_slug && contact.linkedin_url) {
    linkedinToSlug.set(contact.linkedin_url.toLowerCase().trim(), contact.matched_slug)
  }
}

// From partners data
for (const partner of partnersData) {
  if (partner.company_name) {
    const slug = partner.company_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    companyToSlug.set(partner.company_name.toLowerCase().trim(), slug)
  }
}

// Normalize company name for matching
function normalize(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Remove common suffixes
function stripSuffixes(name) {
  const suffixes = ['inc', 'llc', 'ltd', 'limited', 'gmbh', 'srl', 'sas', 'bv', 'pty', 'sa', 'co', 'company', 'corp', 'corporation', 'ai', 'io', 'tech', 'technologies', 'solutions', 'consulting', 'services', 'agency', 'studio', 'labs', 'group']
  let stripped = normalize(name)
  for (const suffix of suffixes) {
    const regex = new RegExp(`\\b${suffix}\\b`, 'g')
    stripped = stripped.replace(regex, ' ').trim()
  }
  return stripped
}

// Calculate similarity score
function similarity(a, b) {
  const set1 = new Set(a.split(' ').filter(Boolean))
  const set2 = new Set(b.split(' ').filter(Boolean))
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  return union.size === 0 ? 0 : intersection.size / union.size
}

// Find best matching slug
function findSlug(row) {
  // Try exact LinkedIn URL match first
  if (row.linkedin_url) {
    const slug = linkedinToSlug.get(row.linkedin_url.toLowerCase().trim())
    if (slug) return { slug, confidence: 'linkedin_exact' }
  }
  
  // Try exact company name from original data
  if (row.company) {
    const slug = companyToSlug.get(row.company.toLowerCase().trim())
    if (slug) return { slug, confidence: 'company_exact' }
  }
  
  // Try company name from enriched data
  if (row.Company) {
    const slug = companyToSlug.get(row.Company.toLowerCase().trim())
    if (slug) return { slug, confidence: 'enriched_exact' }
  }
  
  // Try normalized matching
  const names = [row.company, row.Company].filter(Boolean)
  for (const name of names) {
    const normalized = normalize(name)
    for (const [comp, slug] of companyToSlug) {
      if (normalize(comp) === normalized) {
        return { slug, confidence: 'normalized' }
      }
    }
  }
  
  // Try without suffixes
  for (const name of names) {
    const stripped = stripSuffixes(name)
    if (!stripped) continue
    
    let bestMatch = { slug: null, score: 0 }
    for (const [comp, slug] of companyToSlug) {
      const compStripped = stripSuffixes(comp)
      const score = similarity(stripped, compStripped)
      if (score > bestMatch.score) {
        bestMatch = { slug, score }
      }
    }
    
    if (bestMatch.score >= 0.7) {
      return { slug: bestMatch.slug, confidence: `fuzzy_${Math.round(bestMatch.score * 100)}` }
    }
  }
  
  // Manual mappings for known variations
  const manualMappings = {
    'silveray': 'ai-gpo',
    'doyb technical solutions inc': 'doyb-technical-solutions-inc',
    'adlumin': 'lift-off-automation',
    'insuros': 'insuros',
    'hivelosity ai llc': 'agor-integration-consulting',
    'fermi systems': 'fermi-systems-pty-ltd',
    'the kings trust': 'convoboss',
    'ship 30 for 30': 'productized',
    'mvp1 ventures': 'mvp-ventures',
    'ray global advisors': 'dashops',
    'ifg the ifish group': 'ifg-group',
    'data interactive': 'data-interactive',
    'the growth partner': 'the-growth-partner',
  }
  
  for (const name of names) {
    const normalized = normalize(name).replace(/[^a-z0-9 ]/g, '')
    for (const [pattern, slug] of Object.entries(manualMappings)) {
      if (normalized.includes(pattern)) {
        return { slug, confidence: 'manual_mapping' }
      }
    }
  }
  
  return { slug: null, confidence: 'no_match' }
}

// Process each row
console.log('Processing', emailsData.length, 'rows...')
let matched = 0
let unmatched = 0

for (const row of emailsData) {
  const result = findSlug(row)
  row.slug = result.slug || ''
  row.slug_confidence = result.confidence
  
  if (result.slug) {
    matched++
    console.log(`✓ ${row.company || row.Company} → ${result.slug} (${result.confidence})`)
  } else {
    unmatched++
    console.log(`✗ ${row.company || row.Company} - NO MATCH`)
  }
}

// Write output
const output = csvStringify(emailsData)
fs.writeFileSync(path.join(root, 'partners_with_emails_and_slugs.csv'), output, 'utf8')

console.log(`\nComplete! Matched: ${matched}, Unmatched: ${unmatched}`)
console.log('Output written to: partners_with_emails_and_slugs.csv')
