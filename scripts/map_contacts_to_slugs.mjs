import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.resolve(__dirname, '..')

// Paths
const contactsCsvPath = path.resolve(root, 'partner_contacts.csv')
const partnersJsonPath = path.resolve(root, 'all_partners_with_screenshots.json')
const outputPath = path.resolve(root, 'partner_contacts_with_slugs.json')

function createSlug(input) {
  return (input || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function normalizeName(name) {
  if (!name) return ''
  const cleaned = name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, ' ')
  const stopWords = new Set([
    'inc', 'inc.', 'llc', 'l.l.c.', 'ltd', 'ltd.', 'limited', 'gmbh', 'srl', 'sas', 'bv', 'bvba', 'pty', 'pty.', 'ptyltd', 's.a.', 'sa', 'co', 'co.', 'company', 'group', 'agency', 'studio', 'labs', 'llp', 'plc', 'corp', 'corporation'
  ])
  const tokens = cleaned.split(/\s+/).filter(Boolean).filter(t => !stopWords.has(t))
  return tokens.join(' ')
}

function similarity(a, b) {
  // Jaccard over token sets as a simple heuristic
  const as = new Set(a.split('-'))
  const bs = new Set(b.split('-'))
  const inter = new Set([...as].filter(x => bs.has(x)))
  const union = new Set([...as, ...bs])
  return union.size === 0 ? 0 : inter.size / union.size
}

function loadCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true
  })
  return records
}

function main() {
  const contacts = loadCsv(contactsCsvPath)
  const partners = JSON.parse(fs.readFileSync(partnersJsonPath, 'utf8'))

  // Build lookup maps
  const slugToPartner = new Map()
  const nameToSlug = new Map()

  for (const p of partners) {
    if (!p.company_name) continue
    const slug = createSlug(p.company_name)
    slugToPartner.set(slug, p)
    nameToSlug.set(p.company_name.toLowerCase(), slug)
  }

  const results = []

  for (const row of contacts) {
    const companyRaw = (row.company || '').trim()
    const primarySlug = createSlug(companyRaw)
    let matchedSlug = null
    let matchConfidence = 'none'

    if (slugToPartner.has(primarySlug)) {
      matchedSlug = primarySlug
      matchConfidence = 'exact'
    } else {
      const normalized = createSlug(normalizeName(companyRaw))
      if (slugToPartner.has(normalized)) {
        matchedSlug = normalized
        matchConfidence = 'normalized'
      } else {
        // soft match by similarity
        let best = { slug: null, score: 0 }
        for (const slug of slugToPartner.keys()) {
          const score = similarity(normalized, slug)
          if (score > best.score) best = { slug, score }
        }
        if (best.score >= 0.6) {
          matchedSlug = best.slug
          matchConfidence = 'fuzzy'
        }
      }
    }

    results.push({
      ...row,
      matched_slug: matchedSlug,
      match_confidence: matchConfidence
    })
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8')
  console.log(`Wrote ${results.length} rows to ${path.relative(process.cwd(), outputPath)}`)
}

main()


