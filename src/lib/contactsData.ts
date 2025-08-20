import companiesData from '../../all_partners_with_screenshots.json'
import contactsData from '../../partner_contacts_with_slugs.json'
import { createCompanySlug } from './companyData'

interface RawCompany {
  company_name: string
  company_website?: string
  source: string
  screenshot?: string
  screenshot_status?: string
}

interface RawContactRow {
  first_name?: string
  last_name?: string
  job_title?: string
  linkedin_url?: string
  company?: string
  source?: string
  matched_slug?: string | null
  match_confidence?: string
}

export interface ContactWithCompany {
  firstName: string
  lastName: string
  jobTitle: string
  linkedinUrl: string
  personSource: string
  companyName: string
  companyWebsite?: string
  companySource: string
  companySlug: string
  screenshot?: string
}

export function getAllContactsWithCompanies(): ContactWithCompany[] {
  const screenshotOverrides: Record<string, string> = {
    dashops: 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/dashops_screenshot.png',
    'apex-labs-ai': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/apex_labs_ai.png',
    'metaloss-inc': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/metaloss.png',
    'sunrise-leads': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/Sunrise_Leads_lindy_20250804_170641.png',
    'crm-pros': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/crmpros.png',
    'aitoflo': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/aitoflow.png',
    'altimateai': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/altimate.png',
    'envyro': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/envyro.png',
    'mindcraft': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/mindcraft.png',
    'neurafirst': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/neurafirst.png',
    'originx-ai': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/originx.png',
    'summit-ai': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/summit.png',
    'vaantai': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/vaant.png',
    'upscale-ninjas': 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/upscaleninjas.png',
  }

  const companies = (companiesData as RawCompany[])
    .filter(c => c.screenshot_status === 'success' && !!c.screenshot)

  const slugToCompany = new Map<string, RawCompany>()
  for (const c of companies) {
    slugToCompany.set(createCompanySlug(c.company_name), c)
  }

  const contacts = contactsData as RawContactRow[]
  const results: ContactWithCompany[] = []

  for (const row of contacts) {
    const slug = (row.matched_slug && row.matched_slug.trim()) || (row.company ? createCompanySlug(row.company) : '')
    if (!slug) continue
    const company = slugToCompany.get(slug)
    if (!company) continue

    const defaultShot = company.screenshot ? `https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/${company.screenshot.replace(/\\/g, '/').replace('screenshots/', '')}` : undefined
    const shot = screenshotOverrides[slug] || defaultShot

    results.push({
      firstName: (row.first_name || '').trim(),
      lastName: (row.last_name || '').trim(),
      jobTitle: (row.job_title || '').trim(),
      linkedinUrl: (row.linkedin_url || '').trim(),
      personSource: (row.source || '').trim(),
      companyName: company.company_name,
      companyWebsite: company.company_website,
      companySource: company.source,
      companySlug: slug,
      screenshot: shot,
    })
  }

  return results
}


