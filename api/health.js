const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret to prevent unauthorized access
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers['x-vercel-cron-secret'] !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL ? process.env.REACT_APP_SUPABASE_URL.trim().replace(/\/+$/, '') : '';
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY ? process.env.REACT_APP_SUPABASE_ANON_KEY.trim() : '';

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      error: 'Missing Supabase configuration',
      db: false,
      timestamp: new Date().toISOString()
    });
  }

  let dbHealth = false;
  let errorMessage = '';

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    // Simple health check query - just verify DB connection
    // Using a lightweight query that doesn't require any specific table
    const { data, error } = await supabase
      .from('documents')
      .select('id')
      .limit(1);

    if (error) {
      // If documents table doesn't exist, try a raw query
      const { data: rawData, error: rawError } = await supabase.rpc('version');
      
      if (rawError) {
        errorMessage = rawError.message;
        dbHealth = false;
      } else {
        dbHealth = true;
      }
    } else {
      dbHealth = true;
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Unknown error';
    dbHealth = false;
  }

  const statusCode = dbHealth ? 200 : 503;
  
  return res.status(statusCode).json({
    db: dbHealth,
    timestamp: new Date().toISOString(),
    message: dbHealth ? 'Database is healthy' : 'Database check failed',
    ...(errorMessage && { error: errorMessage })
  });
}
