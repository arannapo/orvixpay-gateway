import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { webhookUrl, headers = [] } = await req.json();

    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      return NextResponse.json({ success: false, error: 'Valid Webhook URL is required (must start with http or https)' }, { status: 400 });
    }

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const dummyPayload = {
      event: 'invoice.paid',
      data: {
        invoiceId: 'test_inv_837492837',
        orderId: 'TEST_ORDER_001',
        amount: 100.00,
        currency: 'USD',
        coin: 'USDT',
        status: 'Paid',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        invoiceUrl: `${APP_URL}/invoice/test_inv_837492837`,
        successUrl: `${APP_URL}/success`,
        cancelUrl: `${APP_URL}/cancel`,
        blockchainTxId: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        paidAt: new Date().toISOString(),
        customerEmail: 'customer@example.com',
        metadata: {
          userId: 'user_98765',
          customField: 'customValue'
        }
      }
    };

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 5000); // 5s timeout

    const fetchHeaders = { 'Content-Type': 'application/json' };
    headers.forEach(h => {
      if (h.key && h.value) {
        fetchHeaders[h.key] = h.value;
      }
    });

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify(dummyPayload),
      signal: abortController.signal
    });
    
    clearTimeout(timeout);

    let responseBody = '';
    try {
      responseBody = await res.text();
    } catch (e) {
      responseBody = 'Could not read response body';
    }

    const responsePayload = {
      success: res.ok,
      status: res.status,
      data: responseBody,
      sent: { payload: dummyPayload, headers: fetchHeaders }
    };

    if (res.ok) {
      return NextResponse.json(responsePayload);
    } else {
      return NextResponse.json({ ...responsePayload, error: `Webhook returned error status: ${res.status}` }, { status: 400 });
    }

  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.name === 'AbortError' ? 'Webhook test timed out (5s)' : 'Failed to reach webhook URL' 
    }, { status: 500 });
  }
}
