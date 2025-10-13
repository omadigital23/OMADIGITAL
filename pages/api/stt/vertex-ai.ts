import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { SpeechClient } from '@google-cloud/speech';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const form = new formidable.IncomingForm();
    const gcloudOpts = getGCloudClientOptionsFromEnv();
    const client = new SpeechClient(gcloudOpts);

    const transcript = await new Promise<string>((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) return reject(err);
        try {
          // @ts-ignore
          const file = files.audio;
          // @ts-ignore
          const data = fs.readFileSync(file.filepath || file.path);
          const audioBytes = data.toString('base64');

          const request = {
            audio: { content: audioBytes },
            config: {
              encoding: 'WEBM_OPUS',
              languageCode: (fields.lang as string) || 'fr-FR',
              enableAutomaticPunctuation: true,
              audioChannelCount: 1,
            },
          };

          const [response] = await client.recognize(request);
          const transcript = response.results
            ?.map((r: any) => r.alternatives[0].transcript)
            .join('\n');
          resolve(transcript);
        } catch (e) {
          reject(e);
        }
      });
    });

    return res.status(200).json({ transcript });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: (err as Error).message || String(err) });
  }
}