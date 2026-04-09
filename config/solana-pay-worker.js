/**
 * Solana Pay Verification Worker
 * Cloudflare Worker that verifies on-chain SOL/USDC payments
 * and generates time-limited download tokens.
 *
 * Environment variables (set in Cloudflare dashboard):
 *   HMAC_SECRET    — random string for signing download tokens
 *   EBOOK_URL      — URL to the ebook file (private Cloudflare Pages path or R2 bucket)
 *   WALLET_ADDRESS — FFoCtKu374GmmEkCY5p48NF2ytgUvGc6fJGr7UbgCT96
 *   RPC_URL        — Solana RPC endpoint (default: mainnet public)
 */

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SLIPPAGE = 0.02; // 2% tolerance for price fluctuation
const TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Simple in-memory signature tracking (resets on worker restart, but prevents immediate double-use)
const usedSignatures = new Set();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/verify' && request.method === 'POST') {
      return handleVerify(request, env, corsHeaders);
    }

    if (url.pathname === '/debug' && request.method === 'GET') {
      return handleDebug(request, env, corsHeaders);
    }

    if (url.pathname === '/download' && request.method === 'GET') {
      return handleDownload(url, env);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function handleDebug(_request, env, corsHeaders) {
  const headers = { ...corsHeaders, 'Content-Type': 'application/json' };
  const rpcUrl = env.RPC_URL || 'https://api.mainnet-beta.solana.com';
  const walletAddress = env.WALLET_ADDRESS;

  try {
    const sigResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'getSignaturesForAddress',
        params: [walletAddress, { limit: 5, commitment: 'confirmed' }]
      })
    });
    const sigData = await sigResponse.json();
    const signatures = (sigData.result || []).slice(0, 3);

    const txDetails = [];
    for (const sig of signatures) {
      const txResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'getTransaction',
          params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }]
        })
      });
      const txData = await txResponse.json();
      const tx = txData.result;
      let balanceChange = null;
      if (tx && tx.meta) {
        const keys = tx.transaction.message.accountKeys;
        const idx = keys.findIndex(k => (typeof k === 'string' ? k : k.pubkey) === walletAddress);
        if (idx !== -1) {
          balanceChange = (tx.meta.postBalances[idx] - tx.meta.preBalances[idx]) / 1e9;
        }
      }
      txDetails.push({ signature: sig.signature, err: sig.err, txNull: !tx, balanceChange });
    }

    return new Response(JSON.stringify({
      rpcUrl, walletAddress,
      signaturesRaw: sigData,
      txDetails
    }, null, 2), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

async function handleVerify(request, env, corsHeaders) {
  const headers = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const { token, amount, reference } = await request.json();
    const walletAddress = env.WALLET_ADDRESS;
    const rpcUrl = env.RPC_URL || 'https://api.mainnet-beta.solana.com';

    const hasReference = reference && typeof reference === 'string'
      && reference.length >= 32 && reference.length <= 44;

    if (hasReference) {
      // Primary path: buyer scanned the QR code — reference key is embedded in the tx.
      // Query by reference so we only see this buyer's transaction (no cross-buyer collision).
      const sigResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'getSignaturesForAddress',
          params: [reference, { limit: 5, commitment: 'confirmed' }]
        })
      });
      const sigs = (await sigResponse.json()).result || [];

      if (sigs.length > 0) {
        const result = await checkTransactions(sigs, token, amount, walletAddress, rpcUrl, env);
        if (result) return new Response(JSON.stringify({ status: 'verified', downloadUrl: result }), { headers });
        return new Response(JSON.stringify({ status: 'pending' }), { headers });
      }
      // Reference returned nothing — fall through to wallet scan (buyer sent manually)
    }

    // Fallback path: buyer sent manually (typed the wallet address + amount).
    // Scan recent wallet transactions and match by amount. Acceptable at low sales volume.
    const sigResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'getSignaturesForAddress',
        params: [walletAddress, { limit: 20, commitment: 'confirmed' }]
      })
    });
    const sigs = (await sigResponse.json()).result || [];

    const result = await checkTransactions(sigs, token, amount, walletAddress, rpcUrl, env);
    if (result) return new Response(JSON.stringify({ status: 'verified', downloadUrl: result }), { headers });

    return new Response(JSON.stringify({ status: 'pending' }), { headers });

  } catch (e) {
    return new Response(JSON.stringify({ status: 'error', message: e.message }), {
      status: 500, headers
    });
  }
}

// Shared tx-checking logic used by both the reference and fallback paths
async function checkTransactions(signatures, token, amount, walletAddress, rpcUrl, env) {
  for (const sig of signatures) {
    if (usedSignatures.has(sig.signature)) continue;
    if (sig.err) continue;

    const txResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'getTransaction',
        params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }]
      })
    });

    const tx = (await txResponse.json()).result;
    if (!tx || !tx.meta) continue;

    if (token === 'USDC') {
      const pre = tx.meta.preTokenBalances || [];
      const post = tx.meta.postTokenBalances || [];
      for (const postBal of post) {
        if (postBal.mint !== USDC_MINT) continue;
        const preBal = pre.find(p => p.accountIndex === postBal.accountIndex) || { uiTokenAmount: { uiAmount: 0 } };
        const received = (postBal.uiTokenAmount?.uiAmount || 0) - (preBal.uiTokenAmount?.uiAmount || 0);
        if (received > 0 && Math.abs(received - amount) / amount <= SLIPPAGE) {
          usedSignatures.add(sig.signature);
          return generateDownloadToken(env);
        }
      }
    } else {
      const accountKeys = tx.transaction.message.accountKeys;
      const walletIndex = accountKeys.findIndex(k =>
        (typeof k === 'string' ? k : k.pubkey) === walletAddress
      );
      if (walletIndex === -1) continue;
      const receivedSol = (tx.meta.postBalances[walletIndex] - tx.meta.preBalances[walletIndex]) / 1e9;
      if (receivedSol > 0 && Math.abs(receivedSol - amount) / amount <= SLIPPAGE) {
        usedSignatures.add(sig.signature);
        return generateDownloadToken(env);
      }
    }
  }
  return null;
}

async function generateDownloadToken(env) {
  const expires = Date.now() + TOKEN_EXPIRY_MS;
  const data = `download:${expires}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.HMAC_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const token = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const baseUrl = 'https://solana-pay.jan-nennin.workers.dev';
  return `${baseUrl}/download?token=${token}&expires=${expires}`;
}

async function handleDownload(url, env) {
  const token = url.searchParams.get('token');
  const expires = parseInt(url.searchParams.get('expires') || '0');

  if (!token || !expires) {
    return new Response('Missing token', { status: 400 });
  }

  if (Date.now() > expires) {
    return new Response('Download link expired', { status: 410 });
  }

  // Verify HMAC
  const data = `download:${expires}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.HMAC_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const expectedSig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const expectedToken = btoa(String.fromCharCode(...new Uint8Array(expectedSig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  if (token !== expectedToken) {
    return new Response('Invalid token', { status: 403 });
  }

  // Fetch from private R2 bucket — file has no public URL
  const object = await env.EBOOK_BUCKET.get('intuitive-workout.pdf');
  if (!object) {
    return new Response('File unavailable', { status: 502 });
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="intuitive-workout.pdf"',
      'Cache-Control': 'no-store',
    }
  });
}
