import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import CompanyPageClient from '../CompanyPageClient'
import { findCompanyBySlug, transformCompanyData, createCompanySlug, getAllCompanies } from '../../lib/companyData'

interface CompanyPageProps {
  params: Promise<{
    company: string
  }>
}

// Generate metadata for each company page
export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { company: companySlug } = await params
  const company = findCompanyBySlug(companySlug)
  
  if (!company) {
    return {
      title: 'Company Not Found',
      description: 'This company page could not be found.',
    }
  }

  return {
    title: `${company.company_name} - Automation & Integration Solutions`,
    description: `${company.company_name} specializes in automation and integration solutions, helping businesses transform with innovative technology.`,
  }
}

// Generate static paths for all companies (optional - for better performance)
export async function generateStaticParams() {
  const companies = getAllCompanies()
  const excludedSlugs = new Set<string>(['tasky-ai','better-call-so'])
  
  return companies
    .filter(company => company.screenshot_status === 'success')
    .map((company) => createCompanySlug(company.company_name))
    .filter((slug) => !excludedSlugs.has(slug))
    .map((slug) => ({ company: slug }))
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  // Find the company data from our JSON
  const { company: companySlug } = await params
  if (companySlug === 'tasky-ai' || companySlug === 'better-call-so') {
    notFound()
  }
  const company = findCompanyBySlug(companySlug)
  
  if (!company) {
    notFound()
  }

  // Transform the company data to match the expected format
  const companyData = transformCompanyData(company)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanyPageClient companyData={companyData} />
    </Suspense>
  )
}
