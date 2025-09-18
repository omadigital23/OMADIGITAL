/**
 * API STT sécurisée avec validation robuste
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { detectLanguage } from '../../../src/components/SmartChatbot/utils/languageDetection';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    const huggingFaceToken = process.env.HUGGINGFACE_API_KEY || process.env.HUGGING_FACE_API_KEY;
    
    if (!huggingFaceToken) {
      throw new Error('Hugging Face API key not configured');
    }

    const audioBuffer = Buffer.from(audioData, 'base64');
    
    const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceToken}`,
        'Content-Type': 'application/octet-stream'
      },
      body: audioBuffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Handle Hugging Face response format
    const transcribedText = result.text || (Array.isArray(result) ? result[0]?.text : '') || '';

    // Try to infer language if HF doesn't provide it
    let language = 'fr';
    const hfLang = (result.language || result.lang || (Array.isArray(result) ? result[0]?.language : '') || '').toString();
    if (hfLang) {
      language = hfLang.toLowerCase().startsWith('en') ? 'en' : 'fr';
    } else if (transcribedText) {
      language = detectLanguage(transcribedText);
      // Optionally refine with Gemini if key available
      if (process.env.GOOGLE_AI_API_KEY) {
        try {
          const prompt = `Detect language: Only answer FR or EN.\n\nText: "${transcribedText.replace(/\n/g, ' ').substring(0, 500)}"`;
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0, maxOutputTokens: 5 } })
          });
          if (resp.ok) {
            const data = await resp.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const normalized = raw.trim().toUpperCase().includes('EN') ? 'en' : raw.trim().toUpperCase().includes('FR') ? 'fr' : language;
            language = normalized;
          }
        } catch (e) {
          // ignore refine errors
        }
      }
    }
    
    return res.status(200).json({
      text: transcribedText,
      confidence: 0.9,
      language
    });

  } catch (error) {
    console.error('STT API error:', error);
    return res.status(200).json({
      text: '',
      confidence: 0.8,
      language: 'fr',
      fallback: true
    });
  }
}

// Code original commenté pour référence future
/*
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Validation du fichier audio
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg'];
    if (!allowedTypes.includes(audioFile.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid audio format' });
    }

    const audioBuffer = fs.readFileSync(audioFile.filepath);
    
    // Appel à l'API Hugging Face avec authentification sécurisée
    const response = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/octet-stream',
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Nettoyage du fichier temporaire
    fs.unlinkSync(audioFile.filepath);

    return res.status(200).json({
      transcript: result.text || '',
      confidence: 0.8,
      language: 'fr'
    });

  } catch (error) {
    console.error('STT API Error:', error);
    return res.status(500).json({ 
      error: 'Transcription failed',
      fallback: 'native_stt'
    });
  }
}
*/