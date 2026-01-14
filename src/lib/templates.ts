import type { LeadMagnetTemplate, LeadMagnetType } from './types';

/**
 * Lead Magnet Type Metadata
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
    description: 'Calculated steps to achieve a goal',
    icon: 'CheckSquare',
    defaultItemCount: 10,
    examples: [
      'Product Launch Checklist',
      'Morning Routine Checklist',
      'Website Audit Checklist',
    ],
    structureHint: `Create a professional, high-value lead magnet with:
1. **Compelling Introduction** - Hook the reader
2. **Clear Sections** - Organize content
3. **Actionable Items** - Specific tasks`,
  },
  cheatsheet: {
    label: 'Cheat Sheet',
    description: 'Quick reference guide',
    icon: 'List',
    examples: ['React Hooks Cheat Sheet', 'Keto Diet Cheat Sheet'],
    structureHint: `Create a concise reference guide.`,
  },
  guide: {
    label: 'Mini-Guide',
    description: 'Short educational content relative to a specific topic',
    icon: 'Book',
    examples: ['Beginners Guide to SEO', 'First Time Homebuyer Guide'],
    structureHint: `Create an educational guide.`,
  },
  template: {
    label: 'Template',
    description: 'Fill-in-the-blank template',
    icon: 'Copy',
    examples: ['Email Marketing Templates', 'Social Media Caption Templates'],
    structureHint: `Create a usable template structure.`,
  },
  swipefile: {
    label: 'Swipe File',
    description: 'Copy-and-paste examples',
    icon: 'Files',
    examples: ['High Converting Headlines', 'Sales Email Swipe File'],
    structureHint: `Create a collection of proven examples.`,
  },
  resourcelist: {
    label: 'Resource List',
    description: 'Curated list of tools/resources',
    icon: 'ListBullets',
    examples: ['Best AI Tools for 2024', 'Remote Work Tools'],
    structureHint: `Create a curated list of valuable resources.`,
  },
  worksheet: {
    label: 'Worksheet',
    description: 'Interactive worksheet',
    icon: 'Pencil',
    examples: ['Goal Setting Worksheet', 'Budget Planner Worksheet'],
    structureHint: `Create an interactive worksheet.`,
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
