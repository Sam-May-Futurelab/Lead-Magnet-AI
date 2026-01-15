import type { VercelRequest, VercelResponse } from '@vercel/node';

// Types (duplicated for serverless - these should match src/lib/types.ts)
type LeadMagnetType = 'checklist' | 'cheatsheet' | 'guide' | 'template' | 'swipefile' | 'resourcelist' | 'worksheet';
type Tone = 'professional' | 'friendly' | 'educational' | 'persuasive';
type Length = 'short' | 'standard' | 'detailed';

interface GenerationRequest {
  type: LeadMagnetType;
  title: string;
  prompt: string;
  targetAudience?: string;
  niche?: string;
  tone: Tone;
  length: Length;
  itemCount?: number;
}

const LEAD_MAGNET_TYPES: Record<LeadMagnetType, { label: string; description: string }> = {
  checklist: { label: 'Checklist', description: 'Step-by-step actionable items' },
  cheatsheet: { label: 'Cheat Sheet', description: 'Quick reference guide' },
  guide: { label: 'Quick Guide', description: 'Short educational content' },
  template: { label: 'Template', description: 'Fill-in-the-blank template' },
  swipefile: { label: 'Swipe File', description: 'Copy-and-paste examples' },
  resourcelist: { label: 'Resource List', description: 'Curated list of tools/resources' },
  worksheet: { label: 'Worksheet', description: 'Interactive worksheet' },
};

function buildSystemPrompt(type: LeadMagnetType, tone: Tone): string {
  const typeInfo = LEAD_MAGNET_TYPES[type];

  const toneInstructions = {
    professional: 'Use a polished, authoritative tone. Sound confident and expert.',
    friendly: 'Use a warm, conversational tone. Be approachable and relatable.',
    educational: 'Use a clear, instructive tone. Focus on teaching and explaining.',
    persuasive: 'Use compelling, action-oriented language. Focus on benefits and outcomes.',
  };

  return `You are an expert copywriter specializing in high-converting lead magnets.

You are creating a ${typeInfo.label}: ${typeInfo.description}

TONE: ${toneInstructions[tone]}

FORMAT GUIDELINES:
- Use clear, scannable formatting
- Include actionable, specific content
- Make it immediately valuable
- Keep paragraphs short (2-3 sentences max)
- Use bullet points and numbered lists where appropriate
- Include a compelling introduction
- End with a clear next step or CTA

OUTPUT FORMAT:
Return well-structured HTML content with appropriate headings (h2, h3), paragraphs, lists (ul/ol), and emphasis (strong, em) tags.
Do not include <html>, <head>, or <body> tags - just the content HTML.
Do not wrap in code blocks or markdown.`;
}

function buildUserPrompt(request: GenerationRequest): string {
  const lengthGuide = {
    short: '500-800 words, focused and concise',
    standard: '1000-1500 words, comprehensive and detailed',
    detailed: '2000-3000 words, thorough and in-depth',
  };

  let prompt = `Create a ${LEAD_MAGNET_TYPES[request.type].label} about: ${request.title}

${request.prompt}

TARGET LENGTH: ${lengthGuide[request.length]}`;

  if (request.targetAudience) {
    prompt += `\n\nTARGET AUDIENCE: ${request.targetAudience}`;
  }

  if (request.niche) {
    prompt += `\n\nNICHE/INDUSTRY: ${request.niche}`;
  }

  if (request.itemCount && (request.type === 'checklist' || request.type === 'resourcelist')) {
    prompt += `\n\nNUMBER OF ITEMS: ${request.itemCount}`;
  }

  return prompt;
}

function countWords(text: string): number {
  return text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

function countItems(html: string): number {
  const liMatches = html.match(/<li[^>]*>/gi);
  return liMatches ? liMatches.length : 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const request = req.body as GenerationRequest;

    // Validate request
    if (!request.type || !request.title || !request.prompt) {
      return res.status(400).json({
        error: 'Missing required fields: type, title, prompt'
      });
    }

    const systemPrompt = buildSystemPrompt(request.type, request.tone || 'friendly');
    const userPrompt = buildUserPrompt(request);

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: request.length === 'detailed' ? 6000 : request.length === 'standard' ? 3000 : 1500,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API error:', error);
      return res.status(500).json({
        error: 'AI generation failed',
        details: error.error?.message
      });
    }

    const data = await openaiResponse.json();
    const content = data.choices[0]?.message?.content || '';

    // Strip any markdown code blocks if present
    const cleanContent = content
      .replace(/^```html\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    const wordCount = countWords(cleanContent);
    const itemCount = countItems(cleanContent);

    return res.status(200).json({
      success: true,
      content: cleanContent,
      rawContent: cleanContent.replace(/<[^>]*>/g, ' ').trim(),
      wordCount,
      itemCount: itemCount > 0 ? itemCount : undefined,
    });

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
