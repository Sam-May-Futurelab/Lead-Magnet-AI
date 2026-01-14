import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkle,
  ArrowRight,
  Lightning
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { LEAD_MAGNET_TYPES } from '@/lib/templates';
import { getPopularTemplates } from '@/lib/templates';
import type { LeadMagnetType } from '@/lib/types';
import { triggerImpactHaptic } from '@/lib/haptics';

interface HomePageProps {
  onAuthClick: () => void;
}

export function HomePage({ onAuthClick }: HomePageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const popularTemplates = getPopularTemplates().slice(0, 4);

  const handleGetStarted = () => {
    triggerImpactHaptic('medium');
    if (user) {
      navigate('/create');
    } else {
      onAuthClick();
    }
  };

  const handleTypeSelect = (type: LeadMagnetType) => {
    triggerImpactHaptic('light');
    if (user) {
      navigate(`/create?type=${type}`);
    } else {
      onAuthClick();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

        <div className="container relative mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Lightning size={14} className="mr-1" weight="fill" />
              AI-Powered Lead Magnets
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Create High-Converting{' '}
              <span className="gradient-text">Lead Magnets</span>{' '}
              in Seconds
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Turn your expertise into beautiful checklists, guides, and templates
              that grow your email list. No design skills needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                variant="gradient"
                onClick={handleGetStarted}
                className="gap-2"
              >
                <Sparkle size={20} weight="fill" />
                Create Your First Lead Magnet
                <ArrowRight size={20} />
              </Button>

              <p className="text-sm text-muted-foreground">
                Free to start • No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lead Magnet Types */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Lead Magnet Type</h2>
            <p className="text-muted-foreground">
              Select a format that resonates with your audience
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(Object.entries(LEAD_MAGNET_TYPES) as [LeadMagnetType, typeof LEAD_MAGNET_TYPES[LeadMagnetType]][]).map(([type, info]) => {
              return (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer hover:border-primary/50 transition-colors h-full"
                    onClick={() => handleTypeSelect(type)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">{info.icon}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{info.label}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {info.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Templates */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Templates</h2>
            <p className="text-muted-foreground">
              Start with a proven template and customize it
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularTemplates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-colors h-full"
                  onClick={() => {
                    triggerImpactHaptic('light');
                    if (user) {
                      navigate(`/create?template=${template.id}`);
                    } else {
                      onAuthClick();
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-3 text-xs">
                      {LEAD_MAGNET_TYPES[template.type].label}
                    </Badge>
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Lead Magnet AI?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Generate professional lead magnets in under 60 seconds',
              },
              {
                icon: '🎯',
                title: 'High Converting',
                description: 'AI-optimized copy that speaks directly to your audience',
              },
              {
                icon: '📥',
                title: 'Ready to Share',
                description: 'Export as PDF and start collecting emails immediately',
              },
            ].map((feature, i) => (
              <Card key={i} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Grow Your Email List?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of creators using AI to build their audience
          </p>
          <Button
            size="xl"
            variant="gradient"
            onClick={handleGetStarted}
            className="gap-2"
          >
            <Sparkle size={20} weight="fill" />
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
}
