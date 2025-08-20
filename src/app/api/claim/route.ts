import { NextResponse } from 'next/server'
import { appendToGoogleSheet, sendWorkflowNotification } from '@/lib/notifications'

export async function POST(request: Request) {
	try {
		const data = await request.json()
		const { name, email, companyName, companySlug, source, companyWebsite } = data || {}

		if (!name || !email || !companyName || !companySlug) {
			return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
		}

		await Promise.all([
			sendWorkflowNotification({ name, email, companyName, companySlug, source, companyWebsite }),
			appendToGoogleSheet({ name, email, companyName, companySlug, source, companyWebsite }),
		])

		return NextResponse.json({ ok: true })
	} catch {
		return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
	}
}
