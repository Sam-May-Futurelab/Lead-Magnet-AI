import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkle,
  ArrowLeft,
  ArrowRight
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AILoading } from '@/components/ui/ai-loading';
import { useAuth } from '@/hooks/use-auth';
import { useLeadMagnetStore } from '@/stores/lead-magnet-store';
import { LEAD_MAGNET_TYPES, TEMPLATES } from '@/lib/templates';
import { generateLeadMagnetContent } from '@/lib/ai-service';
import { createLeadMagnet, checkAndIncrementUsage } from '@/lib/firebase';
import { PLAN_LIMITS } from '@/lib/types';
import type { LeadMagnetType, Tone, Length } from '@/lib/types';
import { toast } from 'sonner';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';

type Step = 'type' | 'details' | 'generating' | 'preview';

export function CreatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const {
    updateCurrent,
    setGenerating,
  } = useLeadMagnetStore();

  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<LeadMagnetType | null>(null);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState<Tone>('friendly');
  const [length, setLength] = useState<Length>('standard');
  const [generatedContent, setGeneratedContent] = useState('');

  // Check for template param
  useEffect(() => {
    const templateId = searchParams.get('template');
    const typeParam = searchParams.get('type') as LeadMagnetType;

    if (templateId) {
      const template = TEMPLATES.find(t => t.id === templateId);
      if (template) {
        setSelectedType(template.type);
        setTitle(template.defaultTitle);
        setPrompt(template.defaultPrompt);
        setStep('details');
      }
    } else if (typeParam && LEAD_MAGNET_TYPES[typeParam]) {
      setSelectedType(typeParam);
      setStep('details');
    }
  }, [searchParams]);

  const handleTypeSelect = (type: LeadMagnetType) => {
    triggerImpactHaptic('light');
    setSelectedType(type);
    setStep('details');
  };

  const handleGenerate = async () => {
    if (!selectedType || !title || !prompt || !user || !userProfile) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check usage limits
    const limits = PLAN_LIMITS[userProfile.plan];
    const { allowed, remaining } = await checkAndIncrementUsage(
      user.uid,
      limits.dailyGenerations
    );

    if (!allowed) {
      toast.error('Daily generation limit reached. Upgrade for more!');
      return;
    }

    setStep('generating');
    setGenerating(true, 'Preparing your lead magnet...');
    triggerImpactHaptic('medium');

    try {
      const response = await generateLeadMagnetContent({
        type: selectedType,
        title,
        prompt,
        targetAudience,
        tone,
        length,
      });

      if (response.success) {
        setGeneratedContent(response.content);

        // Save to Firestore
        const id = await createLeadMagnet(user.uid, {
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

        triggerNotificationHaptic('success');
        toast.success('Lead magnet created!');
        setStep('preview');

        updateCurrent({ id, content: response.content });

        if (remaining <= 2) {
          toast.info(`${remaining} generations remaining today`);
        }
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      triggerNotificationHaptic('error');
      toast.error('Generation failed. Please try again.');
      setStep('details');
    } finally {
      setGenerating(false);
    }
  };

  const renderTypeSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">What would you like to create?</h1>
        <p className="text-muted-foreground">Choose a lead magnet format</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(Object.entries(LEAD_MAGNET_TYPES) as [LeadMagnetType, typeof LEAD_MAGNET_TYPES[LeadMagnetType]][]).map(([type, info]) => (
          <motion.div
            key={type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all h-full ${selectedType === type
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-primary/50'
                }`}
              onClick={() => handleTypeSelect(type)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-3">{info.icon}</div>
                <h3 className="font-semibold mb-1">{info.label}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {info.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="max-w-2xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => {
          setStep('type');
          triggerImpactHaptic('light');
        }}
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">
          {LEAD_MAGNET_TYPES[selectedType!].icon} {LEAD_MAGNET_TYPES[selectedType!].label}
        </Badge>
        <h1 className="text-3xl font-bold mb-2">Tell us about your lead magnet</h1>
        <p className="text-muted-foreground">The more details, the better the result</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., The Ultimate Product Launch Checklist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">What should it cover? *</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the content, key points, or topics you want covered..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience (optional)</Label>
            <Input
              id="audience"
              placeholder="e.g., Entrepreneurs launching their first product"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          {/* Tone & Length */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (300-500 words)</SelectItem>
                  <SelectItem value="standard">Standard (500-800 words)</SelectItem>
                  <SelectItem value="detailed">Detailed (800-1200 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            size="lg"
            variant="gradient"
            className="w-full gap-2"
            onClick={handleGenerate}
            disabled={!title || !prompt}
          >
            <Sparkle size={20} weight="fill" />
            Generate Lead Magnet
            <ArrowRight size={20} />
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderGenerating = () => (
    <div className="max-w-md mx-auto py-12">
      <AILoading
        variant="magic"
        messages={[
          'Analyzing your topic...',
          'Crafting compelling content...',
          'Structuring for maximum impact...',
          'Adding finishing touches...',
        ]}
        currentOperation={`Creating your ${LEAD_MAGNET_TYPES[selectedType!].label.toLowerCase()}`}
      />
    </div>
  );

  const renderPreview = () => (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <Badge variant="secondary" className="mt-2">
            {LEAD_MAGNET_TYPES[selectedType!].icon} {LEAD_MAGNET_TYPES[selectedType!].label}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            View All
          </Button>
          <Button variant="gradient" onClick={() => {
            // TODO: Implement PDF export
            toast.info('PDF export coming soon!');
          }}>
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: generatedContent }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => {
            setStep('type');
            setSelectedType(null);
            setTitle('');
            setPrompt('');
            setGeneratedContent('');
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
          {step === 'type' && renderTypeSelection()}
          {step === 'details' && renderDetailsForm()}
          {step === 'generating' && renderGenerating()}
          {step === 'preview' && renderPreview()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
