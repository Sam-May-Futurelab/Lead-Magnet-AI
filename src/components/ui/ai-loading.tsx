import { motion } from 'framer-motion';
import { Sparkle, MagicWand, Brain, BookOpen, Lightbulb } from '@phosphor-icons/react';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

interface AILoadingProps {
  progress?: number;
  currentMessage?: string;
  messages?: string[];
  variant?: 'default' | 'magic' | 'brain' | 'book';
  currentOperation?: string;
}

const variantConfig = {
  default: {
    icon: Sparkle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  magic: {
    icon: MagicWand,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  brain: {
    icon: Brain,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  book: {
    icon: BookOpen,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
};

const defaultMessages = [
  'Analyzing your topic...',
  'Crafting compelling content...',
  'Structuring for maximum impact...',
  'Adding finishing touches...',
  'Almost there...',
];

export function AILoading({
  progress = 0,
  currentMessage,
  messages = defaultMessages,
  variant = 'default',
  currentOperation,
}: AILoadingProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const [fakeProgress, setFakeProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Fake progress animation when no real progress
  useEffect(() => {
    if (progress === 0) {
      const interval = setInterval(() => {
        setFakeProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 3;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setFakeProgress(progress);
    }
  }, [progress]);

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  const displayProgress = Math.round(fakeProgress);
  const displayMessage = currentMessage || messages[messageIndex];

  return (
    <div className="space-y-6">
      {/* Animated Icon */}
      <div className="relative flex items-center justify-center h-32">
        {/* Background glow */}
        <motion.div
          className={`absolute w-24 h-24 rounded-full ${config.bgColor} blur-xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Icon container */}
        <motion.div
          className={`relative z-10 p-6 rounded-2xl ${config.bgColor} border-2 border-primary/20`}
          animate={{
            y: [-5, 5, -5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon size={32} className={config.color} weight="fill" />
        </motion.div>

        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-primary`}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              transformOrigin: '50px 50px',
            }}
          />
        ))}
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <motion.p
          key={displayMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-medium"
        >
          {displayMessage}
        </motion.p>

        {currentOperation && (
          <p className="text-sm text-muted-foreground">
            {currentOperation}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className={config.color}>{displayProgress}%</span>
        </div>
        <Progress value={displayProgress} className="h-2" />
      </div>

      {/* Fun fact */}
      <div className={`text-center p-4 rounded-xl ${config.bgColor} border border-primary/10`}>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Lightbulb size={16} className="text-primary" weight="fill" />
          <span>AI-generated lead magnets convert 2-3x better than generic PDFs</span>
        </p>
      </div>
    </div>
  );
}
