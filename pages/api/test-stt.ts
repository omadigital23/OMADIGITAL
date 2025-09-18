/**
 * Test API endpoint for STT functionality
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { STTService } from '../../src/lib/apis/stt-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a minimal audio blob for testing
    const audioData = new ArrayBuffer(1024);
    const audioBlob = new Blob([audioData], { type: 'audio/wav' });
    
    console.log('Test STT: Created test audio blob with size:', audioBlob.size);
    
    // Initialize STT service
    const sttService = new STTService();
    
    // Attempt transcription
    const result = await sttService.transcribe(audioBlob);
    
    console.log('Test STT: Transcription result:', result);
    
    res.status(200).json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Test STT Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Unknown error'
    });
  }
}