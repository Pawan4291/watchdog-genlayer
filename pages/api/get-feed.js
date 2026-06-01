// pages/api/get-feed.js
// Returns all trigger events from the on-chain contract

import { getFeed, getAllWatches } from '../../lib/genlayer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [triggers, watches] = await Promise.all([
      getFeed(),
      getAllWatches(),
    ]);

    // Build a watch lookup map
    const watchMap = {};
    for (const w of watches) {
      watchMap[w.id] = w;
    }

    // Enrich triggers with watch data
    const enrichedTriggers = triggers.map(trigger => ({
      ...trigger,
      watch: watchMap[trigger.watch_id] || null,
    }));

    // Sort by ID descending (newest first)
    enrichedTriggers.sort((a, b) => b.id - a.id);

    // Cache for 30 seconds
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    return res.status(200).json({
      success: true,
      triggers: enrichedTriggers,
      total: enrichedTriggers.length,
    });
  } catch (error) {
    console.error('get-feed error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch feed',
      triggers: [],
    });
  }
}
