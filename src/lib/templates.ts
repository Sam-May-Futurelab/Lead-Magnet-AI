import type { LeadMagnetTemplate, LeadMagnetType } from './types';

/**
 * Lead Magnet Type Metadata - Checklist only
 */
export const LEAD_MAGNET_TYPES: Record<LeadMagnetType, {
  label: string;
  description: string;
  icon: string;
  defaultItemCount?: number;
  examples: string[];
  structureHint: string;
}> = {
  checklist: {
    label: 'Checklist',
    description: 'A valuable lead magnet your audience will love',
    icon: '',
    defaultItemCount: 10,
    examples: [
      'Product Launch Checklist',
      'Morning Routine Checklist',
      'Website Audit Checklist',
    ],
    structureHint: `Create a professional, high-value lead magnet with:

1. **Compelling Introduction** - Hook the reader, explain why this matters, and what they'll achieve

2. **Clear Sections** - Organize content into logical sections with descriptive headings

3. **Actionable Items** - Each point should be specific, practical, and immediately usable

4. **Pro Tips** - Include expert insights, common mistakes to avoid, or bonus strategies

5. **Quick Wins** - Highlight items that give immediate results

6. **Summary/Next Steps** - End with key takeaways and a clear call-to-action

Make it feel like a premium resource worth paying for. Use clear formatting, bullet points, and make every item valuable.`,
  },
};

/**
 * Pre-built Templates - Checklist only
 */
export const TEMPLATES: LeadMagnetTemplate[] = [
  {
    id: 'product-launch-checklist',
    name: 'Product Launch Checklist',
    description: 'Everything you need before, during, and after launch',
    type: 'checklist',
    category: 'Marketing',
    thumbnail: '/templates/product-launch.png',
    defaultTitle: 'The Ultimate Product Launch Checklist',
    defaultPrompt: 'Create a comprehensive product launch checklist covering pre-launch preparation, launch day activities, and post-launch follow-up tasks for digital product creators.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#8B5CF6',
      template: 'modern-checklist',
    },
    popular: true,
    isPremium: false,
  },
  {
    id: 'website-audit-checklist',
    name: 'Website Audit Checklist',
    description: 'SEO, performance, and UX audit in one checklist',
    type: 'checklist',
    category: 'Marketing',
    thumbnail: '/templates/website-audit.png',
    defaultTitle: 'Complete Website Audit Checklist',
    defaultPrompt: 'Create a website audit checklist covering SEO fundamentals, page speed optimization, mobile responsiveness, user experience, and conversion optimization.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#0EA5E9',
      template: 'clean-checklist',
    },
    popular: true,
    isPremium: false,
  },
  {
    id: 'morning-routine-checklist',
    name: 'Morning Routine Checklist',
    description: 'Build the perfect productive morning',
    type: 'checklist',
    category: 'Productivity',
    thumbnail: '/templates/morning-routine.png',
    defaultTitle: 'The Perfect Morning Routine Checklist',
    defaultPrompt: 'Create a morning routine checklist for peak productivity covering wake-up rituals, mindfulness, exercise, nutrition, and planning the day ahead.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#F59E0B',
      template: 'clean-checklist',
    },
    popular: true,
    isPremium: false,
  },
];

/**
 * Get templates by type
 */
export const getTemplatesByType = (type: LeadMagnetType): LeadMagnetTemplate[] => {
  return TEMPLATES.filter(t => t.type === type);
};

/**
 * Get popular templates
 */
export const getPopularTemplates = (): LeadMagnetTemplate[] => {
  return TEMPLATES.filter(t => t.popular);
};

/**
 * Get free templates
 */
export const getFreeTemplates = (): LeadMagnetTemplate[] => {
  return TEMPLATES.filter(t => !t.isPremium);
};

/**
 * Template categories
 */
export const TEMPLATE_CATEGORIES = [
  'Marketing',
  'Email Marketing',
  'Social Media',
  'Copywriting',
  'Business',
  'Content Marketing',
  'Productivity',
] as const;
