export async function triggerWebhook(invoice) {
  let eventName = 'invoice.status_changed';
  if (invoice.status === 'Pending') eventName = 'invoice.pending';
  else if (invoice.status === 'Processing') eventName = 'invoice.processing';
  else if (invoice.status === 'Partially Paid') eventName = 'invoice.partially_paid';
  else if (invoice.status === 'Overpaid') eventName = 'invoice.overpaid';
  else if (invoice.status === 'Gas Funding') eventName = 'invoice.gas_funding';
  else if (invoice.status === 'Paid') eventName = 'invoice.paid';
  else if (invoice.status === 'Expired') eventName = 'invoice.expired';

  const webhookPayload = {
    event: eventName,
    data: {
      invoiceId: invoice._id,
      orderId: invoice.orderId,
      amount: invoice.amount,
      currency: invoice.currency,
      coin: invoice.coin,
      status: invoice.status,
      receivedAmount: invoice.receivedAmount || 0,
      walletAddress: invoice.walletAddress,
      invoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoice/${invoice._id}`,
      successUrl: invoice.successUrl,
      cancelUrl: invoice.cancelUrl,
      paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
      customerEmail: invoice.customerEmail,
      metadata: invoice.metadata || {}
    }
  };

  const finalWebhookUrl = invoice.webhookUrl || invoice.merchantId?.webhookUrl;
  const finalHeaders = invoice.merchantId?.webhookHeaders || [];

  if (finalWebhookUrl) {
    const fetchHeaders = { 'Content-Type': 'application/json' };
    finalHeaders.forEach(h => {
      if (h.key && h.value) {
        fetchHeaders[h.key] = h.value;
      }
    });

    try {
      console.log(`Sending webhook to: ${finalWebhookUrl} with status: ${invoice.status}`);
      const res = await fetch(finalWebhookUrl, {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify(webhookPayload),
        signal: AbortSignal.timeout(5000)
      });
      console.log(`Webhook responded with status code: ${res.status}`);
      
      if (res.ok) {
        invoice.webhookStatus = 'Sent';
      } else {
        invoice.webhookStatus = 'Failed';
      }
      await invoice.save();
    } catch (err) {
      console.error('Failed to trigger webhook:', err.message);
      invoice.webhookStatus = 'Failed';
      await invoice.save();
    }
  } else {
    console.log(`No webhook URL configured for invoice ${invoice._id} or merchant ${invoice.merchantId?._id || invoice.merchantId || 'Unknown'}. Skipping webhook trigger.`);
  }
}
