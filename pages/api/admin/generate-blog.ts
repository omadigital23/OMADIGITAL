import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

// Initialize Supabase client
const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

import { requireAdminApi } from '../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, language = 'fr' } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Simulate AI blog generation (in a real implementation, you would call an AI service)
    const generatedContent = await generateBlogContent(title, language);
    
    // Save to database
    const { data, error } = await supabase
      .from('blog_articles')
      .insert({
        title,
        content: generatedContent,
        language,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving blog article:', error);
      return res.status(500).json({ error: 'Failed to save blog article' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Blog article generated successfully',
      article: data
    });
  } catch (error) {
    console.error('Blog generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simulate AI blog generation
async function generateBlogContent(title: string, language: string): Promise<string> {
  // In a real implementation, you would call an AI service like OpenAI, Anthropic, etc.
  // For now, we'll generate a sample blog content
  return `# ${title}

## Introduction

Ceci est un article généré automatiquement basé sur le titre "${title}". Dans cet article, nous explorerons les aspects clés de ce sujet important.

## Contenu Principal

Le contenu principal de l'article serait développé ici avec des informations détaillées, des exemples pertinents et des analyses approfondies.

## Conclusion

En conclusion, ${title.toLowerCase()} représente un domaine fascinant qui mérite une attention particulière. Nous espérons que cet article vous a fourni des informations utiles.

---
*Cet article a été généré automatiquement par l'IA d'OMA Digital.*`;
}