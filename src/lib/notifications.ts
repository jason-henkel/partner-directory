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
  const defaultUrl = 'https://mellow-elephant-424.convex.site/workflows?workflowId=zn7hk5ynrrqzb7mny9b63569ws7nq11d'
  const webhookUrl = process.env.WORKFLOW_WEBHOOK_URL || defaultUrl
  
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
  } catch (error) {
    console.log('Webhook notification failed:', error);
  }
}

// Google Sheets foundation (optional, only runs if env vars are set)
export async function appendToGoogleSheet(payload: ClaimPayload): Promise<void> {
  const sheetsId = process.env.GOOGLE_SHEETS_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!sheetsId || !clientEmail || !privateKeyRaw) {
    console.log('Google Sheets integration skipped: Missing environment variables');
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
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetsId,
      range: 'A1:G1',
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    console.log('✅ Claim recorded in Google Sheets');
  } catch (error) {
    console.log('Google Sheets error:', error);
  }
}
