import { NextApiRequest, NextApiResponse } from 'next';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

function getGCloudClientOptionsFromEnv() {
  const b64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64 || '';
  if (!b64) throw new Error('Missing credentials env var');
  const json = Buffer.from(b64, 'base64').toString('utf8');
  return { credentials: JSON.parse(json) };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, lang = 'fr-FR', voiceName } = req.body;
    const client = new TextToSpeechClient(getGCloudClientOptionsFromEnv());
    const request = {
      input: { text },
      voice: { 
        languageCode: lang, 
        name: voiceName || undefined, 
        ssmlGender: 'NEUTRAL' 
      },
      audioConfig: { 
        audioEncoding: 'MP3' 
      },
    };
    const [response] = await client.synthesizeSpeech(request);
    
    // Convert audio content to base64 string for JSON response
    const audioContent = Buffer.from(response.audioContent as string).toString('base64');
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ audioContent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
}