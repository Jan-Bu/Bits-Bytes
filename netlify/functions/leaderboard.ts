import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

interface Score {
  score: number;
  timestamp: number;
  id: string;
  name: string;
}

const BLOB_KEY = 'flappy-bits-scores';
const MAX_SCORE = 99999; // Maximální možné skóre (anti-cheat)
const MAX_SCORES_STORED = 1000;

function createStore() {
  // Použít environment proměnné z Netlify
  const siteID = process.env.SITE_ID || process.env.NETLIFY_SITE_ID || '14d1ea5d-2320-4068-b6dc-ed8335d1f5a9';
  const token = process.env.NETLIFY_AUTH_TOKEN;

  console.log('Environment check:', {
    hasSiteId: !!siteID,
    hasToken: !!token,
    hasContext: !!process.env.NETLIFY_BLOBS_CONTEXT,
  });

  if (!token) {
    console.warn('NETLIFY_AUTH_TOKEN not set — Blobs unavailable. Falling back to in-memory/no-op for GET.');
    return null as unknown as ReturnType<typeof getStore> | null;
  }

  return getStore({
    name: 'flappy-bits',
    siteID: siteID,
    token: token,
  });
}

// Simple rate limiting (IP-based)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuta
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requestů za minutu

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

function extractIp(headers: Record<string, string | undefined>, event?: any): string {
  // Robust extraction: prefer x-forwarded-for, handle casing and comma-separated lists
  const key = Object.keys(headers).find(k => k.toLowerCase() === 'x-forwarded-for');
  const headerVal = key ? headers[key] : headers['x-forwarded-for'] || headers['X-Forwarded-For'] || headers['client-ip'] || headers['Client-Ip'];
  if (typeof headerVal === 'string' && headerVal.length) {
    return headerVal.split(',')[0].trim();
  }
  // Try platform-specific places
  if (event && (event.requestContext?.identity?.sourceIp)) return event.requestContext.identity.sourceIp;
  return 'unknown';
}

function validateName(name: string): boolean {
  // Max 8 znaků, pouze písmena, čísla, mezery a základní znaky
  return typeof name === 'string' &&
         name.length > 0 &&
         name.length <= 8 &&
         /^[a-zA-Z0-9\s\-_]+$/.test(name);
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS pre-flight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  let store;
  try {
    console.log('Initializing Blobs store...');
    store = createStore();
    console.log('Blobs store initialized successfully');
  } catch (error) {
    console.error('Blobs initialization error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Leaderboard temporarily unavailable. Blobs storage not configured.',
        details: errorMessage,
      }),
    };
  }

  // GET - získat top skóre
  if (event.httpMethod === 'GET') {
    try {
      console.log('Fetching scores from Blobs...');
      if (!store) {
        console.warn('Blobs store not configured — returning empty leaderboard');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([]),
        };
      }
      const scoresData = await store.get(BLOB_KEY, { type: 'json' }) as Score[] | null;
      console.log('Scores fetched:', scoresData ? `${scoresData.length} entries` : 'no data');
      const scores = scoresData || [];

      // Seřadit sestupně a vzít top 100
      const topScores = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(topScores),
      };
    } catch (error) {
      console.error('Blobs GET error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error details:', errorMessage);
      // Return empty array instead of crashing
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([]),
      };
    }
  }

  // POST - přidat nové skóre
  if (event.httpMethod === 'POST') {
    try {
      // Rate limiting
      const ip = extractIp(event.headers || {}, event);
      if (!checkRateLimit(ip)) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        };
      }

      const { score, name } = JSON.parse(event.body || '{}');

      // Validace skóre
      if (typeof score !== 'number' || score < 0 || score > MAX_SCORE) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid score' }),
        };
      }

      // Validace jména
      if (!validateName(name)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid name. Max 8 characters, alphanumeric only.' }),
        };
      }

      // If blobs store not configured, reject POST (service unavailable)
      if (!store) {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({ error: 'Leaderboard storage not configured' }),
        };
      }

      // Načíst aktuální skóre
      let scoresData;
      try {
        scoresData = await store.get(BLOB_KEY, { type: 'json' }) as Score[] | null;
      } catch (error) {
        console.error('Blobs GET error during POST:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to access leaderboard storage' }),
        };
      }

      const scores = scoresData || [];

      const newScore: Score = {
        score,
        name: name.trim(),
        timestamp: Date.now(),
        id: Math.random().toString(36).substring(7),
      };

      scores.push(newScore);

      // Seřadit a omezit
      const sortedScores = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SCORES_STORED);

      // Uložit zpět do Blobs
      try {
        await store.setJSON(BLOB_KEY, sortedScores);
      } catch (error) {
        console.error('Blobs setJSON error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to save score to storage' }),
        };
      }

      // Zjistit, jestli se hráč dostal do top 10
      const top10 = sortedScores.slice(0, 10);
      const isTop10 = top10.some(s => s.id === newScore.id);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          ...newScore,
          isTop10,
          rank: sortedScores.findIndex(s => s.id === newScore.id) + 1,
        }),
      };
    } catch (error) {
      console.error('Error saving score:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request' }),
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
