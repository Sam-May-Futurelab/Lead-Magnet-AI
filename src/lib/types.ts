// ============================================
// LEAD MAGNET DATA MODELS
// ============================================

/**
 * Lead Magnet Types - The different formats users can create
 */
export type LeadMagnetType = 
  | 'checklist'      // Step-by-step actionable list
  | 'cheatsheet'     // Quick reference guide
  | 'guide'          // Short educational guide
  | 'template'       // Fill-in-the-blank template
  | 'swipefile'      // Copy/paste examples
  | 'resourcelist'   // Curated list of tools/resources
  | 'worksheet';     // Interactive worksheet

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
  plan: 'free' | 'pro' | 'premium';
  subscriptionStatus?: 'active' | 'cancelled' | 'expired';
  subscriptionEndDate?: Date;
  
  // Usage
  leadMagnetsCreated: number;
  dailyGenerationsUsed: number;
  lastGenerationDate?: string;
  
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
  dailyGenerations: number;
  maxLeadMagnets: number;
  exportFormats: ('pdf' | 'png' | 'html')[];
  premiumTemplates: boolean;
  customBranding: boolean;
  removeWatermark: boolean;
}

export const PLAN_LIMITS: Record<UserProfile['plan'], UsageLimits> = {
  free: {
    dailyGenerations: 3,
    maxLeadMagnets: 5,
    exportFormats: ['pdf'],
    premiumTemplates: false,
    customBranding: false,
    removeWatermark: false,
  },
  pro: {
    dailyGenerations: 15,
    maxLeadMagnets: 50,
    exportFormats: ['pdf', 'png'],
    premiumTemplates: true,
    customBranding: true,
    removeWatermark: true,
  },
  premium: {
    dailyGenerations: 50,
    maxLeadMagnets: -1, // Unlimited
    exportFormats: ['pdf', 'png', 'html'],
    premiumTemplates: true,
    customBranding: true,
    removeWatermark: true,
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
