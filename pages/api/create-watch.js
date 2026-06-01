// pages/api/create-watch.js
// API route called by the frontend to create a new watch on-chain

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, condition, discordWebhook, signedTx } = req.body;

  // Validation
  if (!url || !condition) {
    return res.status(400).json({ error: 'url and condition are required' });
  }

  if (!signedTx) {
    return res.status(400).json({ 
      error: 'signedTx is required — sign the transaction with MetaMask first' 
    });
  }

  try {
    // Validate URL format
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    const rpcUrl = process.env.NEXT_PUBLIC_GENLAYER_RPC || 'https://rpc-bradbury.genlayer.com';
    
    // Forward the signed transaction to GenLayer network
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
      console.error('GenLayer RPC error:', data.error);
      return res.status(500).json({ error: data.error.message || 'Transaction failed' });
    }

    const txHash = data.result;

    return res.status(200).json({
      success: true,
      txHash,
      message: 'Watch creation transaction submitted. It will be confirmed in ~30 seconds.',
    });
  } catch (error) {
    console.error('create-watch error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to create watch' 
    });
  }
}
