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
  // Netlify automaticky nastaví siteID a token když funkce běží na Netlify
  // Nepotřebujeme je explicitně předávat
  return getStore('flappy-bits');
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
      const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
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
