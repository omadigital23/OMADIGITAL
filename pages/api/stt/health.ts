/**
 * Health check endpoint for STT service
 */

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        GOOGLE_CLOUD_API_KEY: process.env['GOOGLE_CLOUD_API_KEY'] ? `${process.env['GOOGLE_CLOUD_API_KEY'].substring(0, 10)}...` : 'NOT SET',
        GOOGLE_AI_API_KEY: process.env['GOOGLE_AI_API_KEY'] ? `${process.env['GOOGLE_AI_API_KEY'].substring(0, 10)}...` : 'NOT SET',
        GOOGLE_CLOUD_PROJECT_ID: process.env['GOOGLE_CLOUD_PROJECT_ID'] || 'NOT SET',
        GCP_PROJECT: process.env['GCP_PROJECT'] || 'NOT SET',
      },
      services: {
        googleCloudApiKeyAvailable: !!(process.env['GOOGLE_CLOUD_API_KEY'] || process.env['GOOGLE_AI_API_KEY']),
        serviceAccountAvailable: !!(process.env['GOOGLE_CLOUD_CLIENT_EMAIL'] && process.env['GOOGLE_CLOUD_PRIVATE_KEY'])
      }
    };

    // Try to import the service
    let serviceStatus = 'unknown';
    try {
      const { googleCloudSpeechService } = await import('../../../src/lib/google-cloud-speech-service');
      serviceStatus = googleCloudSpeechService.isAvailable() ? 'available' : 'not available';
    } catch (error) {
      serviceStatus = `error: ${(error as Error).message}`;
    }

    diagnostics.services.googleCloudSpeechService = serviceStatus;

    return res.status(200).json({
      status: 'ok',
      diagnostics
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}
