import { getApiUrl } from './utils';
import type { GenerationRequest, GenerationResponse, LeadMagnetType, Tone, Length } from './types';
import { LEAD_MAGNET_TYPES } from './templates';

/**
 * Generate lead magnet content via API
 */
export async function generateLeadMagnetContent(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const endpoint = getApiUrl('/api/generate');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Generation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
}

/**
 * Build system prompt for lead magnet generation
 */
export function buildSystemPrompt(type: LeadMagnetType, tone: Tone): string {
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
Do not include <html>, <head>, or <body> tags - just the content HTML.`;
}

/**
 * Build user prompt for generation
 */
export function buildUserPrompt(request: GenerationRequest): string {
  const lengthGuide = {
    short: '300-500 words, focused and concise',
    standard: '500-800 words, comprehensive but digestible',
    detailed: '800-1200 words, thorough and in-depth',
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

/**
 * Estimate generation time based on length
 */
export function estimateGenerationTime(length: Length): number {
  const times = {
    short: 8,
    standard: 12,
    detailed: 18,
  };
  return times[length];
}

/**
 * Get length word count range
 */
export function getLengthRange(length: Length): { min: number; max: number } {
  const ranges = {
    short: { min: 300, max: 500 },
    standard: { min: 500, max: 800 },
    detailed: { min: 800, max: 1200 },
  };
  return ranges[length];
}
