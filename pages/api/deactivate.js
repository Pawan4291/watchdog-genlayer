// pages/api/deactivate.js
// Deactivates a watch. Requires signed transaction from owner.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { watchId, signedTx } = req.body;

  if (watchId === undefined || watchId === null) {
    return res.status(400).json({ error: 'watchId is required' });
  }

  if (!signedTx) {
    return res.status(400).json({ error: 'signedTx is required' });
  }

  try {
    const rpcUrl = process.env.NEXT_PUBLIC_GENLAYER_RPC || 'https://rpc-bradbury.genlayer.com';
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendRawTransaction',
        params: [signedTx]
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({
      success: true,
      txHash: data.result,
      message: 'Watch deactivation submitted.',
    });
  } catch (error) {
    console.error('deactivate error:', error);
    return res.status(500).json({ error: error.message });
  }
}
