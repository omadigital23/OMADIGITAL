/**
 * API Route for Chat with Vertex AI using REST API
 * 
 * This implementation uses the REST API approach for better error handling
 * and clearer debugging information.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleAuth } from 'google-auth-library';

// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'omadigital23';
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const MODEL_ID = process.env.GEMINI_MODEL_ID || 'gemini-pro';

async function getAccessToken() {
  try {
    // Try service account authentication first
    if (process.env.GOOGLE_CLOUD_CLIENT_EMAIL && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
      console.log('🔐 Using service account authentication');
      const { JWT } = require('google-auth-library');
      
      const auth = new JWT({
        email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
      
      const accessToken = await auth.getAccessToken();
      return accessToken.token;
    } else {
      // Fallback to default authentication
      console.log('🔐 Using default authentication');
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
      
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();
      return accessToken.token;
    }
  } catch (authError) {
    console.error('Authentication error:', authError);
    throw new Error('Failed to authenticate with Google Cloud: ' + (authError instanceof Error ? authError.message : 'Unknown error'));
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    // Get access token
    const token = await getAccessToken();
    if (!token) {
      return res.status(500).json({ error: 'Failed to obtain access token' });
    }

    // Build the API URL
    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;
    
    console.log(`📡 Calling Vertex AI API: ${url}`);

    // Prepare the request body
    const requestBody = {
      instances: [{ content: query, context: context || '' }],
      parameters: { 
        temperature: 0.2,
        maxOutputTokens: 1024,
        topP: 0.8,
        topK: 40
      }
    };

    // Make the API call
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      // Add timeout
    });

    console.log(`📊 API Response Status: ${response.status}`);

    // Handle non-success responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vertex AI API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // Provide specific error messages based on status code
      switch (response.status) {
        case 401:
          return res.status(401).json({ 
            error: 'Unauthorized', 
            details: 'Invalid or missing authentication credentials',
            suggestion: 'Check your service account credentials and permissions'
          });
        case 403:
          return res.status(403).json({ 
            error: 'Forbidden', 
            details: 'Insufficient permissions to access the model',
            suggestion: 'Ensure your service account has the "Vertex AI User" role'
          });
        case 404:
          return res.status(404).json({ 
            error: 'Model Not Found', 
            details: 'The specified model could not be found',
            suggestion: 'Enable the model in Google Cloud Console Model Garden'
          });
        default:
          return res.status(502).json({ 
            error: 'Vertex AI Request Failed', 
            details: errorText,
            status: response.status
          });
      }
    }

    // Parse the response
    const jsonResponse = await response.json();
    console.log('✅ API Response received');
    
    // Extract the answer from the response
    const answer = jsonResponse.predictions?.[0]?.content || 
                  jsonResponse.predictions?.[0]?.candidates?.[0]?.content ||
                  JSON.stringify(jsonResponse);
    
    // Return the response
    return res.status(200).json({ answer });

  } catch (error) {
    console.error('💥 Unhandled error in /api/chat/vertex-ai-rest:', error);
    
    // Return a user-friendly error message
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : String(error))
        : 'An unexpected error occurred while processing your request'
    });
  }
}