// Script to list available models from Google AI Studio
// Uses API key from environment variables for security

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
  console.error('Error: GOOGLE_AI_API_KEY environment variable not set');
  console.error('Please set GOOGLE_AI_API_KEY in your .env.local file');
  process.exit(1);
}

async function listModels() {
  try {
    console.log('Fetching available models with your API key...');
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Available models:');
      console.log('=================');
      
      if (data.models && data.models.length > 0) {
        data.models.forEach(model => {
          console.log(`Model: ${model.name}`);
          console.log(`  Display Name: ${model.displayName || 'N/A'}`);
          console.log(`  Description: ${model.description || 'N/A'}`);
          console.log(`  Version: ${model.version || 'N/A'}`);
          console.log('  ---');
        });
      } else {
        console.log('No models found or empty response');
      }
    } else {
      const errorText = await response.text();
      console.log(`Failed to list models - Status: ${response.status}`);
      console.log(`Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`Error listing models: ${error.message}`);
  }
}

listModels();

async function listAvailableModels() {
  try {
    console.log('Listing available Vertex AI models...');
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID is not set');
    }
    
    console.log('Project ID:', projectId);
    console.log('Location:', location);
    
    // Test authentication
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    if (!accessToken || !accessToken.token) {
      throw new Error('Failed to obtain access token');
    }
    
    console.log('Authentication successful!');
    
    // Try different endpoints to list models
    const endpoints = [
      `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models`,
      `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/models`
    ];
    
    for (const endpoint of endpoints) {
      console.log('Trying endpoint:', endpoint);
      
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Models list:', JSON.stringify(data, null, 2));
          return;
        } else {
          const errorText = await response.text();
          console.log('Failed with status:', response.status);
          console.log('Error response:', errorText);
        }
      } catch (error) {
        console.log('Endpoint failed:', error.message);
      }
    }
    
    console.log('Could not list models using any endpoint');
    
  } catch (error) {
    console.error('Model listing test failed:', error);
  }
}

listAvailableModels();