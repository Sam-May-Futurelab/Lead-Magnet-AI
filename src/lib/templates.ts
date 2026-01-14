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
}> = {
  checklist: {
    label: 'Checklist',
    description: 'Step-by-step actionable items your audience can check off',
    icon: '✅',
    defaultItemCount: 10,
    examples: [
      'Product Launch Checklist',
      'Website Audit Checklist',
      'Morning Routine Checklist',
    ],
  },
  cheatsheet: {
    label: 'Cheat Sheet',
    description: 'Quick reference guide with key information at a glance',
    icon: '📋',
    examples: [
      'Facebook Ads Cheat Sheet',
      'SEO Quick Reference',
      'Keyboard Shortcuts Guide',
    ],
  },
  guide: {
    label: 'Quick Guide',
    description: 'Short educational content teaching a specific skill',
    icon: '📖',
    examples: [
      '5-Minute Guide to Email Marketing',
      'Beginner\'s Guide to Meal Prep',
      'Quick Start Guide to Podcasting',
    ],
  },
  template: {
    label: 'Template',
    description: 'Fill-in-the-blank templates your audience can customize',
    icon: '📝',
    examples: [
      'Email Sequence Template',
      'Social Media Calendar Template',
      'Business Plan Template',
    ],
  },
  swipefile: {
    label: 'Swipe File',
    description: 'Copy-and-paste examples they can use immediately',
    icon: '📂',
    examples: [
      '50 Email Subject Lines',
      'Instagram Caption Templates',
      'Sales Page Headlines',
    ],
  },
  resourcelist: {
    label: 'Resource List',
    description: 'Curated list of tools, apps, or resources',
    icon: '🔗',
    defaultItemCount: 20,
    examples: [
      'Top 50 Marketing Tools',
      'Best Free Stock Photo Sites',
      'Essential Apps for Freelancers',
    ],
  },
  worksheet: {
    label: 'Worksheet',
    description: 'Interactive worksheet with questions and exercises',
    icon: '📊',
    examples: [
      'Goal Setting Worksheet',
      'Brand Voice Worksheet',
      'Budget Planning Worksheet',
    ],
  },
};

/**
 * Pre-built Templates
 */
export const TEMPLATES: LeadMagnetTemplate[] = [
  // CHECKLISTS
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

  // CHEAT SHEETS
  {
    id: 'social-media-sizes',
    name: 'Social Media Image Sizes',
    description: 'All the dimensions you need in one place',
    type: 'cheatsheet',
    category: 'Social Media',
    thumbnail: '/templates/social-sizes.png',
    defaultTitle: 'Social Media Image Size Cheat Sheet 2026',
    defaultPrompt: 'Create a comprehensive cheat sheet with all current social media image dimensions for Instagram, Facebook, Twitter/X, LinkedIn, TikTok, YouTube, and Pinterest including profile photos, cover images, posts, stories, and ads.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#EC4899',
      template: 'grid-cheatsheet',
    },
    popular: true,
    isPremium: false,
  },
  {
    id: 'copywriting-formulas',
    name: 'Copywriting Formulas',
    description: 'AIDA, PAS, and more in one reference',
    type: 'cheatsheet',
    category: 'Copywriting',
    thumbnail: '/templates/copywriting.png',
    defaultTitle: 'Essential Copywriting Formulas Cheat Sheet',
    defaultPrompt: 'Create a copywriting formulas cheat sheet including AIDA, PAS, BAB, 4Ps, ACCA, and other proven frameworks with brief explanations and examples for each.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#F59E0B',
      template: 'modern-cheatsheet',
    },
    popular: false,
    isPremium: false,
  },

  // GUIDES
  {
    id: 'email-marketing-guide',
    name: '5-Minute Email Marketing Guide',
    description: 'Quick start guide to email success',
    type: 'guide',
    category: 'Marketing',
    thumbnail: '/templates/email-guide.png',
    defaultTitle: 'The 5-Minute Guide to Email Marketing',
    defaultPrompt: 'Create a quick-start guide to email marketing covering list building, email types, subject line tips, best sending times, and key metrics to track. Keep it actionable and beginner-friendly.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#10B981',
      template: 'minimal-guide',
    },
    popular: true,
    isPremium: false,
  },

  // TEMPLATES
  {
    id: 'email-sequence-template',
    name: 'Welcome Email Sequence',
    description: '5-email sequence template for new subscribers',
    type: 'template',
    category: 'Email Marketing',
    thumbnail: '/templates/email-sequence.png',
    defaultTitle: 'Welcome Email Sequence Template',
    defaultPrompt: 'Create a 5-email welcome sequence template for new subscribers including: Email 1 (Welcome + free resource delivery), Email 2 (Your story + value), Email 3 (Best content/tips), Email 4 (Social proof + case study), Email 5 (Soft pitch + CTA). Include subject lines and fill-in-the-blank sections.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#6366F1',
      template: 'template-blocks',
    },
    popular: true,
    isPremium: false,
  },

  // SWIPE FILES
  {
    id: 'email-subject-lines',
    name: '50 Email Subject Lines',
    description: 'Proven subject lines that get opens',
    type: 'swipefile',
    category: 'Email Marketing',
    thumbnail: '/templates/subject-lines.png',
    defaultTitle: '50 High-Converting Email Subject Lines',
    defaultPrompt: 'Create 50 email subject lines organized by category: curiosity-driven (10), urgency/scarcity (10), personalized (10), benefit-focused (10), and question-based (10). Make them customizable with [BRACKETS] for personalization.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#EF4444',
      template: 'list-swipefile',
    },
    popular: true,
    isPremium: false,
  },

  // RESOURCE LISTS
  {
    id: 'free-marketing-tools',
    name: 'Free Marketing Tools',
    description: '30+ free tools for marketers',
    type: 'resourcelist',
    category: 'Marketing',
    thumbnail: '/templates/marketing-tools.png',
    defaultTitle: '30+ Free Marketing Tools You Need',
    defaultPrompt: 'Create a curated list of 30+ free marketing tools organized by category: email marketing, social media management, graphic design, SEO, analytics, and productivity. Include tool name, what it does, and why it\'s valuable.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#8B5CF6',
      template: 'resource-grid',
    },
    popular: false,
    isPremium: false,
  },

  // WORKSHEETS
  {
    id: 'ideal-customer-worksheet',
    name: 'Ideal Customer Avatar',
    description: 'Define your perfect customer',
    type: 'worksheet',
    category: 'Business',
    thumbnail: '/templates/customer-avatar.png',
    defaultTitle: 'Ideal Customer Avatar Worksheet',
    defaultPrompt: 'Create an ideal customer avatar worksheet with sections for: Demographics (age, location, job, income), Psychographics (values, fears, desires), Pain Points (top 5 problems), Goals (what success looks like), Where They Hang Out (online and offline), and Buying Triggers. Include guiding questions for each section.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#14B8A6',
      template: 'worksheet-sections',
    },
    popular: true,
    isPremium: false,
  },

  // PREMIUM TEMPLATES
  {
    id: 'content-calendar-template',
    name: '30-Day Content Calendar',
    description: 'Complete month of content planned',
    type: 'template',
    category: 'Content Marketing',
    thumbnail: '/templates/content-calendar.png',
    defaultTitle: '30-Day Content Calendar Template',
    defaultPrompt: 'Create a 30-day content calendar template with daily content ideas for social media, organized by week with themes. Include content pillars, post types (educational, entertaining, promotional), and optimal posting times.',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#F97316',
      template: 'calendar-template',
    },
    popular: true,
    isPremium: true,
  },
  {
    id: 'sales-page-swipefile',
    name: 'Sales Page Copy Swipe File',
    description: 'Headlines, bullets, and CTAs that convert',
    type: 'swipefile',
    category: 'Copywriting',
    thumbnail: '/templates/sales-copy.png',
    defaultTitle: 'High-Converting Sales Page Swipe File',
    defaultPrompt: 'Create a sales page swipe file with: 20 headline formulas, 15 subheadline templates, 20 bullet point frameworks, 10 CTA button texts, 10 guarantee statements, and 10 urgency/scarcity phrases. Make each customizable with [BRACKETS].',
    exampleContent: '',
    defaultDesign: {
      primaryColor: '#DC2626',
      template: 'premium-swipefile',
    },
    popular: false,
    isPremium: true,
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
