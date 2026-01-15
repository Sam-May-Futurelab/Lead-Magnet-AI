import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkle,
  ArrowRight,
  DownloadSimple,
  Lock,
  PencilSimple,
  FloppyDisk,
  X,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AILoading } from '@/components/ui/ai-loading';
import { useAuth } from '@/hooks/use-auth';
import { useLeadMagnetStore } from '@/stores/lead-magnet-store';
import { generateLeadMagnetContent } from '@/lib/ai-service';
import { createLeadMagnet, checkAndIncrementUsage } from '@/lib/firebase';
import { exportLeadMagnet, shareExport, canExportFormat } from '@/lib/export-service';
import { PLAN_LIMITS } from '@/lib/types';
import type { LeadMagnetType, Tone, Length, LeadMagnet } from '@/lib/types';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';
import { triggerCelebration } from '@/lib/confetti';

type Step = 'details' | 'generating' | 'preview';

export function CreatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userProfile, refreshProfile } = useAuth();

  const {
    updateCurrent,
    setGenerating,
    addLeadMagnet,
    updateLeadMagnet,
  } = useLeadMagnetStore();

  const selectedType: LeadMagnetType = 'checklist';

  const [step, setStep] = useState<Step>('details');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  // Simplified state
  const [targetAudience] = useState('');
  const [tone] = useState<Tone>('friendly');
  const [length, setLength] = useState<Length>('short');
  const [generatedContent, setGeneratedContent] = useState('');
  const [currentLeadMagnetId, setCurrentLeadMagnetId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('Preparing export...');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Check usage limit on mount - redirect to paywall if at limit
  useEffect(() => {
    const plan = userProfile?.plan || 'free';
    const limits = PLAN_LIMITS[plan];
    const currentCount = userProfile?.leadMagnetsCreated || 0;

    if (limits.maxLeadMagnets !== -1 && currentCount >= limits.maxLeadMagnets) {
      navigate('/paywall?trigger=limit');
    }
  }, [userProfile, navigate]);

  // Check for template param (pre-fill form)
  useEffect(() => {
    const titleParam = searchParams.get('title');
    const promptParam = searchParams.get('prompt');

    if (titleParam) setTitle(titleParam);
    if (promptParam) setPrompt(promptParam);
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!title || !prompt) {
      alert('Please fill in the title and description');
      return;
    }

    if (!user) {
      alert('Please sign in to generate');
      return;
    }

    setStep('generating');
    setGenerating(true, 'Preparing your checklist...');
    triggerImpactHaptic('medium');

    try {
      const response = await generateLeadMagnetContent({
        type: selectedType,
        title,
        prompt,
        targetAudience,
        tone,
        length,
        userId: user.uid,
      });

      if (response.success) {
        setGeneratedContent(response.content);

        // Try to save to Firestore (may fail due to permissions, but that's okay)
        let id = `local-${Date.now()}`;
        try {
          id = await createLeadMagnet(user.uid, {
            userId: user.uid,
            title,
            type: selectedType,
            content: response.content,
            rawContent: response.rawContent,
            targetAudience,
            prompt,
            tone,
            length,
            status: 'complete',
            wordCount: response.wordCount,
            itemCount: response.itemCount,
            downloadCount: 0,
            design: {
              primaryColor: '#8B5CF6',
              secondaryColor: '#A78BFA',
              backgroundColor: '#FFFFFF',
              textColor: '#1F2937',
              fontFamily: 'Inter',
              titleSize: 'large',
              template: 'modern',
              showLogo: false,
            },
          });
        } catch (firestoreError) {
          console.log('Could not save to Firestore (permissions), using local ID:', firestoreError);
        }

        triggerNotificationHaptic('success');
        triggerCelebration(); // 🎉 Celebration animation!
        setStep('preview');

        // Increment usage count in Firestore
        const plan = userProfile?.plan || 'free';
        const limits = PLAN_LIMITS[plan];
        try {
          await checkAndIncrementUsage(user.uid, limits.maxLeadMagnets);
          // Refresh profile to update usage count in UI
          await refreshProfile();
        } catch (e) {
          console.log('Could not increment usage count:', e);
        }

        // Create the full lead magnet object
        const newLeadMagnet: LeadMagnet = {
          id,
          userId: user.uid,
          title,
          type: selectedType,
          content: response.content,
          rawContent: response.rawContent,
          targetAudience,
          prompt,
          tone,
          length,
          status: 'complete' as const,
          wordCount: response.wordCount,
          itemCount: response.itemCount,
          downloadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          design: {
            primaryColor: '#8B5CF6',
            secondaryColor: '#A78BFA',
            backgroundColor: '#FFFFFF',
            textColor: '#1F2937',
            fontFamily: 'Inter',
            titleSize: 'large' as const,
            template: 'modern' as const,
            showLogo: false,
          },
        };

        // Save to local store (persisted to localStorage)
        addLeadMagnet(newLeadMagnet);
        setCurrentLeadMagnetId(id);

        updateCurrent({ id, content: response.content });
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      triggerNotificationHaptic('error');

      // Show error message to user
      const errorMessage = error?.message || error?.error || String(error) || 'Generation failed. Please try again.';
      if (errorMessage.includes('limit') || errorMessage.includes('429') || errorMessage.includes('try again tomorrow')) {
        alert('You\'ve reached your daily generation limit. Please try again tomorrow or upgrade your plan.');
      } else {
        alert(errorMessage);
      }

      setStep('details');
    } finally {
      setGenerating(false);
    }
  };

  const renderDetailsForm = () => (
    <div className="max-w-3xl mx-auto py-4">
      <div className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Create Your Lead Magnet</h1>
        <p className="text-sm text-muted-foreground">Tell us what you want to create and we'll make a lead magnet that converts.</p>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardContent className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title</Label>
            <Input
              id="title"
              placeholder="e.g., The Ultimate Product Launch Checklist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">What should it cover?</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the content, key points, or topics you want covered (e.g., for entrepreneurs...)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Length */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Length</Label>
            <Select
              value={length}
              onValueChange={(v) => {
                const plan = userProfile?.plan || 'free';
                if ((v === 'standard' || v === 'detailed') && plan === 'free') {
                  navigate('/paywall?trigger=length');
                  return;
                }
                setLength(v as Length);
              }}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (500-800 words)</SelectItem>
                <SelectItem value="standard">
                  <span className="flex items-center gap-2">
                    Standard (1000-1500 words)
                    {(userProfile?.plan || 'free') === 'free' && <Lock size={14} className="text-muted-foreground" />}
                  </span>
                </SelectItem>
                <SelectItem value="detailed">
                  <span className="flex items-center gap-2">
                    Detailed (2000-3000 words)
                    {(userProfile?.plan || 'free') === 'free' && <Lock size={14} className="text-muted-foreground" />}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            size="default"
            variant="gradient"
            className="w-full gap-2 shadow-lg shadow-primary/20"
            onClick={handleGenerate}
            disabled={!title || !prompt}
          >
            <Sparkle size={18} weight="fill" />
            Generate Lead Magnet
            <ArrowRight size={18} />
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderGenerating = () => {
    // Estimate duration based on length setting
    const durationByLength: Record<Length, number> = {
      short: 30,      // ~30 seconds for short
      standard: 60,   // ~1 minute for standard
      detailed: 120,  // ~2 minutes for detailed
    };

    return (
      <div className="max-w-md mx-auto py-12">
        <AILoading
          variant="magic"
          expectedDuration={durationByLength[length]}
          messages={[
            'Analyzing your topic...',
            'Researching best practices...',
            'Crafting actionable items...',
            'Writing detailed content...',
            'Polishing for maximum impact...',
            'Adding finishing touches...',
          ]}
          currentOperation="Creating your lead magnet"
        />
      </div>
    );
  };

  const handleExport = async (format: 'pdf' | 'html') => {
    if (!generatedContent) return;

    const plan = userProfile?.plan || 'free';

    // Check if user can export in this format
    if (!canExportFormat(format, plan)) {
      triggerNotificationHaptic('warning');
      navigate('/paywall?trigger=export');
      return;
    }

    setIsExporting(true);
    setExportProgress('Preparing export...');
    triggerImpactHaptic('medium');

    try {
      const leadMagnet: LeadMagnet = {
        id: currentLeadMagnetId || `local-${Date.now()}`,
        userId: user?.uid || '',
        title,
        type: selectedType,
        content: generatedContent,
        targetAudience,
        prompt,
        tone,
        length,
        status: 'complete',
        downloadCount: 0,
        wordCount: generatedContent.split(/\s+/).length,
        createdAt: new Date(),
        updatedAt: new Date(),
        design: {
          primaryColor: '#8B5CF6',
          secondaryColor: '#A78BFA',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          fontFamily: 'Inter',
          titleSize: 'large',
          template: 'modern',
          showLogo: false,
        },
      };

      setExportProgress('Generating PDF...');
      const result = await exportLeadMagnet({
        format,
        leadMagnet,
        userPlan: plan,
        contentElement: contentRef.current!,
      });

      if (result.success && result.blob && result.filename) {
        // Try to share on iOS, fallback to download
        await shareExport(result.blob, result.filename);
        triggerNotificationHaptic('success');
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      triggerNotificationHaptic('error');
    } finally {
      setIsExporting(false);
    }
  };

  // Convert HTML to plain text for editing
  const htmlToText = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    // Replace <br> and block elements with newlines
    temp.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    temp.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li').forEach(el => {
      el.prepend(document.createTextNode('\n'));
    });
    return temp.textContent || temp.innerText || '';
  };

  // Convert plain text back to HTML
  const textToHtml = (text: string): string => {
    return text
      .split('\n\n')
      .map(para => para.trim())
      .filter(para => para)
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('\n');
  };

  const handleStartEdit = () => {
    setEditedContent(htmlToText(generatedContent));
    setIsEditing(true);
    triggerImpactHaptic('light');
  };

  const handleSaveEdit = () => {
    const newHtml = textToHtml(editedContent);
    setGeneratedContent(newHtml);
    setIsEditing(false);
    // Update in store if we have an ID
    if (currentLeadMagnetId) {
      updateLeadMagnet(currentLeadMagnetId, { content: newHtml });
    }
    triggerNotificationHaptic('success');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
    triggerImpactHaptic('light');
  };

  const renderPreview = () => (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex-1 min-w-[100px]"
          >
            View All
          </Button>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="flex-1 min-w-[100px]"
              >
                <X size={18} className="mr-2" />
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleSaveEdit}
                className="flex-1 min-w-[100px]"
              >
                <FloppyDisk size={18} className="mr-2" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleStartEdit}
                className="flex-1 min-w-[100px]"
              >
                <PencilSimple size={18} className="mr-2" />
                Edit
              </Button>
              <Button
                variant="gradient"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="flex-1 min-w-[140px]"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {exportProgress}
                  </>
                ) : (
                  <>
                    <DownloadSimple size={18} className="mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Styled Content Preview */}
          <style>{`
            .lead-magnet-content {
              font-size: 1rem;
              line-height: 1.8;
              color: hsl(var(--foreground));
              padding: 2rem;
            }
            .lead-magnet-content h1 {
              font-size: 1.75em;
              font-weight: 700;
              color: hsl(var(--foreground));
              margin-top: 1.5em;
              margin-bottom: 0.75em;
              line-height: 1.3;
              border-bottom: 2px solid hsl(var(--primary) / 0.3);
              padding-bottom: 0.5em;
            }
            .lead-magnet-content h2 {
              font-size: 1.4em;
              font-weight: 700;
              color: hsl(var(--foreground));
              margin-top: 1.5em;
              margin-bottom: 0.75em;
              line-height: 1.3;
            }
            .lead-magnet-content h3 {
              font-size: 1.15em;
              font-weight: 600;
              color: hsl(var(--foreground));
              margin-top: 1.25em;
              margin-bottom: 0.5em;
            }
            .lead-magnet-content h4,
            .lead-magnet-content h5,
            .lead-magnet-content h6 {
              font-size: 1em;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: hsl(var(--muted-foreground));
              margin-top: 1em;
              margin-bottom: 0.5em;
            }
            .lead-magnet-content p {
              margin: 0 0 1em 0;
              color: hsl(var(--muted-foreground));
            }
            .lead-magnet-content ul,
            .lead-magnet-content ol {
              margin: 1em 0 1.5em 1.5em;
              padding-left: 0;
            }
            .lead-magnet-content li {
              margin-bottom: 0.5em;
              line-height: 1.6;
              color: hsl(var(--muted-foreground));
            }
            .lead-magnet-content li::marker {
              color: hsl(var(--primary));
            }
            .lead-magnet-content strong {
              font-weight: 600;
              color: hsl(var(--foreground));
            }
            .lead-magnet-content em {
              font-style: italic;
            }
            .lead-magnet-content blockquote {
              margin: 1.5em 0;
              padding: 1em 1.25em;
              border-left: 4px solid hsl(var(--primary));
              background: hsl(var(--primary) / 0.05);
              border-radius: 0 8px 8px 0;
              font-style: italic;
              color: hsl(var(--foreground));
            }
            .lead-magnet-content blockquote p {
              margin: 0;
              color: inherit;
            }
            .lead-magnet-content code {
              font-family: 'SF Mono', Monaco, monospace;
              font-size: 0.9em;
              background: hsl(var(--muted));
              color: hsl(var(--foreground));
              padding: 0.2em 0.4em;
              border-radius: 4px;
            }
            .lead-magnet-content pre {
              margin: 1.5em 0;
              padding: 1em;
              background: hsl(var(--muted));
              border-radius: 8px;
              overflow-x: auto;
            }
            .lead-magnet-content pre code {
              background: transparent;
              padding: 0;
            }
            .lead-magnet-content table {
              width: 100%;
              border-collapse: collapse;
              margin: 1.5em 0;
            }
            .lead-magnet-content th,
            .lead-magnet-content td {
              border: 1px solid hsl(var(--border));
              padding: 0.75em;
              text-align: left;
            }
            .lead-magnet-content th {
              background: hsl(var(--primary) / 0.1);
              font-weight: 600;
              color: hsl(var(--primary));
            }
            .lead-magnet-content tr:nth-child(even) {
              background: hsl(var(--muted) / 0.5);
            }
            .lead-magnet-content a {
              color: hsl(var(--primary));
              text-decoration: underline;
            }
            .lead-magnet-content hr {
              margin: 2em 0;
              border: none;
              border-top: 1px solid hsl(var(--border));
            }
            /* Tip boxes */
            .lead-magnet-content .tip-box {
              margin: 1.5em 0;
              padding: 1em 1.25em;
              background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05));
              border-radius: 12px;
              border-left: 4px solid hsl(var(--primary));
            }
            .edit-textarea {
              width: 100%;
              min-height: 400px;
              padding: 1.5rem;
              font-family: inherit;
              font-size: 1rem;
              line-height: 1.6;
              background: hsl(var(--background));
              color: hsl(var(--foreground));
              border: none;
              resize: vertical;
            }
            .edit-textarea:focus {
              outline: none;
            }
          `}</style>
          {isEditing ? (
            <textarea
              className="edit-textarea"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Edit your lead magnet content..."
            />
          ) : (
            <div
              ref={contentRef}
              className="lead-magnet-content"
              dangerouslySetInnerHTML={{ __html: generatedContent }}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => {
            setStep('details');
            setTitle('');
            setPrompt('');
            setGeneratedContent('');
            setCurrentLeadMagnetId(null);
            triggerImpactHaptic('light');
          }}
          className="gap-2"
        >
          <Sparkle size={16} />
          Create Another
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'details' && renderDetailsForm()}
          {step === 'generating' && renderGenerating()}
          {step === 'preview' && renderPreview()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
