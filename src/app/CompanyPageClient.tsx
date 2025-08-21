'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface CompanyData {
  name: string
  location: string
  establishedDate: string
  website: string
  logo: string
  tagline: string
  description: string
  offerings: string[]
  about: string
  integrations: string[]
  screenshot?: string
  source?: string
}

interface CompanyPageClientProps {
  companyData: CompanyData
}

export default function CompanyPageClient({ companyData }: CompanyPageClientProps) {
  const searchParams = useSearchParams()
  const claimedParam = searchParams.get('claimed') || searchParams.get('preview')
  const initialClaimed = claimedParam === '1' || claimedParam === 'true'

  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isClaimed, setIsClaimed] = useState(initialClaimed)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [claimForm, setClaimForm] = useState({
    name: '',
    email: ''
  })

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Show success immediately for better UX
    setIsClaimed(true)
    
    // Process the claim in the background
    fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: claimForm.name,
        email: claimForm.email,
        companyName: companyData.name,
        companySlug: companyData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
        companyWebsite: companyData.website || undefined,
        source: companyData.source || undefined,
      })
    }).catch(() => {
      // Silently handle errors - user already sees success
      console.log('Background claim processing failed')
    })
  }

  // Show full page content
  return (
    <div className="min-h-screen bg-white relative">
      {/* Claim Overlay */}
      {!isClaimed && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black/10" />
            
            {/* Claim form */}
            <div className="relative bg-white rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-2xl mx-4">
              <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  Claim Your Conduit Partner Page
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Claim this page to manage your profile.
                </p>
              </div>

              <form onSubmit={handleClaimSubmit} className="space-y-4 sm:space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm sm:text-xs font-medium text-gray-700 mb-2 sm:mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={claimForm.name}
                    onChange={(e) => setClaimForm({...claimForm, name: e.target.value})}
                    className="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors text-base sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm sm:text-xs font-medium text-gray-700 mb-2 sm:mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={claimForm.email}
                    onChange={(e) => setClaimForm({...claimForm, email: e.target.value})}
                    className="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors text-base sm:text-sm"
                    placeholder="john@crmpos.com"
                  />
                </div>



                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 sm:mt-4 bg-black text-white py-3 sm:py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium text-base sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Claiming...
                    </>
                  ) : (
                    'Claim This Page'
                  )}
                </button>
              </form>

              <div className="text-center mt-6 sm:mt-4">
                <button
                  onClick={() => setIsClaimed(true)}
                  className="text-sm sm:text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Preview without claiming
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content - visible but grayed out when not claimed */}
      <div className={!isClaimed ? 'filter blur-[1px] opacity-95 pointer-events-none' : ''}>
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center">
                  <Image src="/conduit.svg" alt="Conduit" width={100} height={28} />
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <Link href={companyData.website} target="_blank" className="text-gray-600 hover:text-gray-900 transition-colors underline">
                  Visit Website
                </Link>
                <Link href="https://www.conduit.ai/agency?utm_source=email&utm_medium=instantly&utm_campaign=claim_your_page" target="_blank" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                  Learn More
                </Link>
              </div>
            </div>
          </nav>
        </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
          {/* Left Sidebar - Company Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 h-full flex flex-col">
              {/* Logo and Name */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-black rounded-2xl flex items-center justify-center p-3 sm:p-4">
                  {companyData.logo ? (
                    <Image src={companyData.logo} alt={`${companyData.name} logo`} width={48} height={48} className="rounded-lg" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {companyData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{companyData.name}</h2>
                <p className="text-gray-500 text-sm sm:text-sm flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {companyData.location}
                </p>
              </div>

              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="w-full bg-black text-white py-3 sm:py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium mb-6 sm:mb-10 text-base sm:text-sm"
              >
                Get in Touch
              </button>

              {/* Resources */}
              <div className="mb-8">
                <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Resources</h3>
                <Link href="#" className="text-black hover:text-gray-700 transition-colors flex items-center gap-1 text-sm">
                  <span>→</span>
                  Free Consultation
                </Link>
              </div>

              {/* Details */}
              <div className="mb-8">
                <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Details</h3>
                <div className="space-y-2.5">
                  <Link href={companyData.website} target="_blank" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm underline">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span>Visit website</span>
                  </Link>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>English</span>
                  </div>
                </div>
              </div>

              {/* Offerings */}
              <div className="flex-grow">
                <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Services</h3>
                <div className="space-y-3">
                  {companyData.offerings.map((offering, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-black flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">{offering}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Screenshot and About */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Screenshot - No container, just floating */}
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={companyData.screenshot || "/crm_pros_screenshot.png"}
                alt={`${companyData.name} Dashboard`}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">About {companyData.name}</h3>
              <p className="text-gray-600 leading-relaxed">
                {companyData.about}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal - Cleaner design */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Get in Touch</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
              />
              <textarea
                placeholder="Tell us about your project..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors resize-none"
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}