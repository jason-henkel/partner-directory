import { NextResponse } from 'next/server'
import { appendToGoogleSheet, sendWorkflowNotification } from '@/lib/notifications'

export async function POST(request: Request) {
	console.log('🎯 [VERCEL] /api/claim called at', new Date().toISOString());
	
	try {
		const data = await request.json()
		const { name, email, companyName, companySlug, source, companyWebsite } = data || {}

		console.log('📝 [VERCEL] Claim data received:', { name, email, companyName, companySlug, source, companyWebsite });

		if (!name || !email || !companyName || !companySlug) {
			console.error('❌ [VERCEL] Missing required fields');
			return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
		}

		console.log('🚀 [VERCEL] Starting parallel processing...');
		
		const results = await Promise.allSettled([
			sendWorkflowNotification({ name, email, companyName, companySlug, source, companyWebsite }),
			appendToGoogleSheet({ name, email, companyName, companySlug, source, companyWebsite }),
		]);

		console.log('📊 [VERCEL] Processing results:', results.map((r, i) => ({
			index: i,
			status: r.status,
			...(r.status === 'rejected' ? { reason: r.reason?.message } : {})
		})));

		return NextResponse.json({ ok: true, results: results.map(r => r.status) })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		const errorStack = error instanceof Error ? error.stack : undefined;
		console.error('❌ [VERCEL] API route error:', errorMessage, errorStack);
		return NextResponse.json({ ok: false, error: 'server_error', details: errorMessage }, { status: 500 })
	}
}
