// ============================================
// LEAD MAGNET DATA MODELS
// ============================================

/**
 * Lead Magnet Type - Simplified to checklist only
 */
export type LeadMagnetType = 'checklist';

/**
 * Generation tone options
 */
export type Tone = 'professional' | 'friendly' | 'educational' | 'persuasive';

/**
 * Content length options
 */
export type Length = 'short' | 'standard' | 'detailed';

/**
 * Lead Magnet status
 */
export type LeadMagnetStatus = 'draft' | 'generating' | 'complete' | 'error';

/**
 * Core Lead Magnet Entity
 * This is the main data structure (simpler than EbookProject)
 */
export interface LeadMagnet {
  id: string;
  userId: string;

  // Content
  title: string;
  subtitle?: string;
  description?: string;
  type: LeadMagnetType;
  content: string;           // Generated HTML content
  rawContent?: string;       // Plain text version

  // Targeting
  targetAudience?: string;
  problemSolved?: string;
  niche?: string;

  // Generation settings
  tone: Tone;
  length: Length;
  prompt?: string;           // Original user prompt

  // Design
  design: LeadMagnetDesign;

  // Metadata
  status: LeadMagnetStatus;
  wordCount: number;
  itemCount?: number;        // For checklists/lists
  createdAt: Date;
  updatedAt: Date;
  generatedAt?: Date;

  // Export tracking
  exportedFormats?: ('pdf' | 'png' | 'html')[];
  downloadCount: number;
}

/**
 * Lead Magnet Design Settings
 */
export interface LeadMagnetDesign {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;

  // Typography
  fontFamily: string;
  titleSize: 'small' | 'medium' | 'large';

  // Layout
  template: string;          // Template ID
  showLogo: boolean;
  logoUrl?: string;

  // Branding
  companyName?: string;
  websiteUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
}

/**
 * Lead Magnet Template
 */
export interface LeadMagnetTemplate {
  id: string;
  name: string;
  description: string;
  type: LeadMagnetType;
  category: string;
  thumbnail: string;

  // Pre-filled content
  defaultTitle: string;
  defaultPrompt: string;
  exampleContent: string;

  // Design defaults
  defaultDesign: Partial<LeadMagnetDesign>;

  // Metadata
  popular: boolean;
  isPremium: boolean;
}

/**
 * User Profile
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;

  // Subscription
  plan: 'free' | 'pro' | 'unlimited';
  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'lifetime';
  subscriptionEndDate?: Date;
  purchaseDate?: Date;

  // Usage
  leadMagnetsCreated: number;

  // Preferences
  defaultTone?: Tone;
  defaultDesign?: Partial<LeadMagnetDesign>;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Usage Limits by Plan
 */
export interface UsageLimits {
  maxLeadMagnets: number;
  exportFormats: ('pdf' | 'html')[];
  premiumTemplates: boolean;
  customBranding: boolean;
  removeWatermark: boolean;
  priorityGeneration: boolean;
  whiteLabel: boolean;
}

export const PLAN_LIMITS: Record<UserProfile['plan'], UsageLimits> = {
  free: {
    maxLeadMagnets: 1,
    exportFormats: ['pdf'],
    premiumTemplates: false,
    customBranding: false,
    removeWatermark: false,
    priorityGeneration: false,
    whiteLabel: false,
  },
  pro: {
    maxLeadMagnets: 10,
    exportFormats: ['pdf', 'html'],
    premiumTemplates: true,
    customBranding: true,
    removeWatermark: true,
    priorityGeneration: false,
    whiteLabel: false,
  },
  unlimited: {
    maxLeadMagnets: -1, // Unlimited
    exportFormats: ['pdf', 'html'],
    premiumTemplates: true,
    customBranding: true,
    removeWatermark: true,
    priorityGeneration: true,
    whiteLabel: true,
  },
};

/**
 * AI Generation Request
 */
export interface GenerationRequest {
  type: LeadMagnetType;
  title: string;
  prompt: string;
  targetAudience?: string;
  niche?: string;
  tone: Tone;
  length: Length;
  itemCount?: number;        // For checklists
  userId?: string;           // For rate limiting
}

/**
 * AI Generation Response
 */
export interface GenerationResponse {
  success: boolean;
  content: string;
  rawContent: string;
  wordCount: number;
  itemCount?: number;
  error?: string;
}

// ============================================
// COMPARISON: LeadMagnet vs EbookProject
// ============================================
/**
 * EbookProject (Inkfluence) has:
 * - chapters: Chapter[] (array of chapter content)
 * - coverDesign: CoverDesign (complex cover settings)
 * - brandConfig: BrandConfig
 * - category, targetAudience
 * - Multiple export formats
 * - Writing analytics
 * 
 * LeadMagnet (this app) has:
 * - Single content block (no chapters)
 * - Simpler design settings
 * - Type-specific templates
 * - Focus on single-page assets
 * - Quick generation & export
 */
