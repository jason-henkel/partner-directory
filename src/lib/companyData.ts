import companiesData from '../../all_partners_with_screenshots.json'
import descriptions from '../../partner_descriptions.json'

export interface Company {
  company_name: string
  company_website: string
  source: string
  screenshot?: string
  screenshot_timestamp?: string
  screenshot_status?: string
  screenshot_method?: string
}

// Convert company name to URL-safe slug
export function createCompanySlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

// Convert slug back to search for company
export function findCompanyBySlug(slug: string): Company | undefined {
  return companiesData.find(company => {
    const companySlug = createCompanySlug(company.company_name)
    return companySlug === slug
  })
}

// Get all companies
export function getAllCompanies(): Company[] {
  return companiesData as Company[]
}

// Get companies by source
export function getCompaniesBySource(source: string): Company[] {
  return companiesData.filter(company => company.source === source) as Company[]
}

// Transform company data to the format expected by the client component
export function transformCompanyData(company: Company) {
  // Allow per-slug screenshot overrides so details pages match homepage
  const slug = createCompanySlug(company.company_name)
  // Just use the actual screenshot from R2 for everyone
  const finalScreenshot = company.screenshot ? `https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/${company.screenshot.replace(/\\/g, '/').replace('screenshots/', '')}` : 'https://pub-04f37fd09b7749f4b6239ce1e82b0cea.r2.dev/backup_partner_ss.png'
  // Generate some default/placeholder data for missing fields
  const defaultOfferings = [
    'AI Automation Solutions',
    'Workflow Optimization',
    'Integration Services'
  ]
  
  const defaultIntegrations = [
    'Zapier', 'Make', 'Slack', 'Google Workspace', 'Airtable'
  ]

  // Determine platform-specific offerings
  let offerings = defaultOfferings
  if (company.source === 'retell') {
    offerings = [
      'Voice AI Solutions',
      'Call Automation',
      'Custom Voice Agents'
    ]
  } else if (company.source === 'lindy') {
    offerings = [
      'AI Assistant Development',
      'Automated Workflows',
      'Custom AI Solutions'
    ]
  } else if (company.source === 'make') {
    offerings = [
      'Integration Solutions',
      'Workflow Automation',
      'Process Optimization'
    ]
  }

  return {
    name: company.company_name,
    location: 'Global', // Default since we don't have location data
    establishedDate: 'Partner since 2024', // Default
    website: company.company_website || '#',
    logo: '', // Will show company initial instead of Chrome icon
    tagline: `${company.company_name} - Automation & Integration Solutions`,
    description: (descriptions as Record<string,string>)[slug] || `Professional automation and integration solutions`,
    offerings,
    about: `${company.company_name} specializes in automation and integration solutions. They help businesses streamline operations, improve efficiency, and scale their processes through innovative technology implementations.`,
    integrations: defaultIntegrations,
    screenshot: finalScreenshot, // Use override if present, else web path from dataset
    source: company.source
  }
}
