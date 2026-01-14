import { getApiUrl } from './api';
import type { GenerationRequest, GenerationResponse, LeadMagnetType, Tone, Length } from './types';
import { LEAD_MAGNET_TYPES } from './templates';

/**
 * Format AI-generated content (markdown) into proper HTML
 * Based on Inkfluence's formatGeneratedContent function
 */
function formatContentToHtml(text: string): string {
  if (!text || !text.trim()) return '';

  let formatted = text.trim();

  // Remove em dashes - replace with regular hyphens
  formatted = formatted.replace(/\u2014/g, ' - ');
  formatted = formatted.replace(/&mdash;/g, ' - ');
  formatted = formatted.replace(/&#8212;/g, ' - ');

  // Handle fenced code blocks first
  formatted = formatted.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = code.trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const langClass = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${langClass}>${escaped}</code></pre>`;
  });

  // Handle inline code
  formatted = formatted.replace(/`([^`]+)`/g, (_match, code) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<code>${escaped}</code>`;
  });

  // Convert markdown headings (process from most specific to least)
  formatted = formatted.replace(/^######\s*(.+)$/gm, '<h6>$1</h6>');
  formatted = formatted.replace(/^#####\s*(.+)$/gm, '<h5>$1</h5>');
  formatted = formatted.replace(/^####\s*(.+)$/gm, '<h4>$1</h4>');
  formatted = formatted.replace(/^###\s*(.+)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^##\s*(.+)$/gm, '<h2>$1</h2>');
  formatted = formatted.replace(/^#\s*(.+)$/gm, '<h1>$1</h1>');

  // Bold
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  formatted = formatted.replace(/^>\s*(.+)$/gm, '<blockquote><p>$1</p></blockquote>');
  // Merge consecutive blockquotes
  formatted = formatted.replace(/<\/blockquote>\s*<blockquote>/g, '');

  // Unordered lists
  const ulMatches = formatted.match(/^[-*]\s+.+$/gm);
  if (ulMatches) {
    formatted = formatted.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    // Wrap consecutive li elements in ul
    formatted = formatted.replace(/(<li>.*?<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`);
  }

  // Ordered lists
  const olMatches = formatted.match(/^\d+\.\s+.+$/gm);
  if (olMatches) {
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  }

  // Horizontal rules
  formatted = formatted.replace(/^---+$/gm, '<hr />');

  // Tables (basic markdown tables)
  if (formatted.includes('|')) {
    const lines = formatted.split('\n');
    let inTable = false;
    let tableHtml = '';
    const result: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (trimmed.includes('---')) {
          // Header separator row - skip but mark we're in table
          continue;
        }
        if (!inTable) {
          inTable = true;
          tableHtml = '<table><thead><tr>';
          const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
          tableHtml += cells.map(c => `<th>${c}</th>`).join('');
          tableHtml += '</tr></thead><tbody>';
        } else {
          const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
          tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        }
      } else {
        if (inTable) {
          tableHtml += '</tbody></table>';
          result.push(tableHtml);
          tableHtml = '';
          inTable = false;
        }
        result.push(line);
      }
    }
    if (inTable) {
      tableHtml += '</tbody></table>';
      result.push(tableHtml);
    }
    formatted = result.join('\n');
  }

  // Convert remaining paragraphs (double newlines)
  formatted = formatted.split(/\n\n+/).map(para => {
    para = para.trim();
    if (!para) return '';
    // Skip if already wrapped in HTML tags
    if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<ol') ||
      para.startsWith('<blockquote') || para.startsWith('<pre') || para.startsWith('<table') ||
      para.startsWith('<hr')) {
      return para;
    }
    // Handle single line breaks within paragraphs
    para = para.replace(/\n/g, '<br />');
    return `<p>${para}</p>`;
  }).join('\n');

  // Clean up empty paragraphs
  formatted = formatted.replace(/<p>\s*<\/p>/g, '');
  formatted = formatted.replace(/<p><br \/><\/p>/g, '');

  return formatted.trim();
}

/**
 * Generate lead magnet content via dedicated Lead Magnet API
 * Uses the new /api/lead-magnet endpoint on Inkfluence backend
 */
export async function generateLeadMagnetContent(
  request: GenerationRequest
): Promise<GenerationResponse> {
  // Use the dedicated lead magnet endpoint
  const endpoint = getApiUrl('/api/lead-magnet');

  console.log('[AI Service] Generating lead magnet via:', endpoint);

  try {
    // Build the request in the format the new lead-magnet API expects
    const requestBody = {
      userId: request.userId || 'lead-magnet-guest',
      topic: `${request.title}: ${request.prompt}`,
      targetAudience: request.targetAudience || 'general audience',
      tone: mapTone(request.tone),
      format: request.type || 'checklist',
    };

    console.log('[AI Service] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    console.log('[AI Service] Response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Generation failed';
      try {
        const error = await response.json();
        console.error('[AI Service] Error response:', JSON.stringify(error));
        // Check error.error first (API returns {error: "message"}), then error.message
        errorMessage = error.error || error.message || errorMessage;

        // Add status code context for rate limiting
        if (response.status === 429) {
          errorMessage = 'AI generation limit reached. Please try again tomorrow or upgrade your plan.';
        }
      } catch {
        errorMessage = `Generation failed with status ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[AI Service] Got response data:', data.success);

    // Get the raw content and format it to HTML
    const rawContent = data.content || data.html || data.result || '';
    const htmlContent = formatContentToHtml(rawContent);

    // Map the response to our expected format
    return {
      success: true,
      content: htmlContent,
      rawContent: rawContent,
      wordCount: data.wordCount || countWords(rawContent),
      itemCount: data.itemCount,
    };
  } catch (error) {
    console.error('[AI Service] Generation error:', error);
    throw error;
  }
}

/**
 * Map our tone values to the API's expected tones
 */
function mapTone(tone: Tone): string {
  const toneMap: Record<Tone, string> = {
    professional: 'professional',
    friendly: 'friendly',
    educational: 'educational',
    persuasive: 'persuasive',
  };
  return toneMap[tone] || 'friendly';
}

/**
 * Count words in HTML content
 */
function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
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

  if (request.itemCount && (request.type === 'checklist' || request.type === 'toolkit')) {
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
