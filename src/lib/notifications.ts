import type { JWTInput } from 'google-auth-library';

export interface ClaimPayload {
  name: string;
  email: string;
  companyName: string;
  companySlug: string;
  source?: string;
  companyWebsite?: string;
}

// Generic workflow webhook (Convex or similar)
export async function sendWorkflowNotification(payload: ClaimPayload): Promise<void> {
  console.log('🔗 [VERCEL] sendWorkflowNotification called');
  
  const defaultUrl = 'https://mellow-elephant-424.convex.site/workflows?workflowId=zn7hk5ynrrqzb7mny9b63569ws7nq11d'
  const webhookUrl = process.env.WORKFLOW_WEBHOOK_URL || defaultUrl
  
  console.log('🌐 [VERCEL] Webhook URL:', webhookUrl);
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'partner_claim',
        name: payload.name,
        email: payload.email,
        companyName: payload.companyName,
        companySlug: payload.companySlug,
        companyWebsite: payload.companyWebsite || '',
        source: payload.source || ''
      })
    });
    console.log('✅ [VERCEL] Webhook sent successfully');
  } catch (error) {
    console.error('❌ [VERCEL] Webhook failed:', error instanceof Error ? error.message : String(error));
  }
}

// Google Sheets foundation (optional, only runs if env vars are set)
export async function appendToGoogleSheet(payload: ClaimPayload): Promise<void> {
  console.log('🔍 [VERCEL] appendToGoogleSheet called with payload:', JSON.stringify(payload, null, 2));
  
  const sheetsId = process.env.GOOGLE_SHEETS_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  console.log('📋 [VERCEL] Environment check:', {
    sheetsId: sheetsId ? `SET (${sheetsId.substring(0, 10)}...)` : 'MISSING',
    clientEmail: clientEmail ? `SET (${clientEmail})` : 'MISSING', 
    privateKey: privateKeyRaw ? `SET (length: ${privateKeyRaw.length})` : 'MISSING',
    nodeEnv: process.env.NODE_ENV
  });
  
  if (!sheetsId || !clientEmail || !privateKeyRaw) {
    console.error('❌ [VERCEL] Google Sheets integration skipped: Missing environment variables');
    return;
  }

  const { google } = await import('googleapis');

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  const jwtConfig: JWTInput = {
    client_email: clientEmail,
    private_key: privateKey,
  };

  const auth = new google.auth.JWT(jwtConfig.client_email as string, undefined, jwtConfig.private_key, ['https://www.googleapis.com/auth/spreadsheets']);
  const sheets = google.sheets({ version: 'v4', auth });

  const now = new Date().toISOString();
  const values = [[
    now,
    payload.name,
    payload.email,
    payload.companyName,
    payload.companySlug,
    payload.source || '',
    payload.companyWebsite || ''
  ]];

  try {
    console.log('🚀 [VERCEL] Attempting to write to Google Sheets...', {
      spreadsheetId: sheetsId,
      range: 'A1:G1',
      values: values
    });
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetsId,
      range: 'A1:G1',
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    
    console.log('✅ [VERCEL] Successfully recorded claim in Google Sheets:', values[0]);
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
      status: error && typeof error === 'object' && 'status' in error ? error.status : undefined,
      details: error && typeof error === 'object' && 'errors' in error ? error.errors : undefined,
      stack: error instanceof Error ? error.stack : undefined
    };
    console.error('❌ [VERCEL] Google Sheets error:', errorDetails);
    
    // Still throw so we know it failed
    throw new Error(`Google Sheets API failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
