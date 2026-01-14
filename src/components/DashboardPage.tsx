import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash, 
  Download, 
  Eye,
  Sparkle,
  FolderOpen
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useLeadMagnetStore } from '@/stores/lead-magnet-store';
import { getUserLeadMagnets, deleteLeadMagnet } from '@/lib/firebase';
import { LEAD_MAGNET_TYPES } from '@/lib/templates';
import { PLAN_LIMITS } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import type { LeadMagnet } from '@/lib/types';
import { toast } from 'sonner';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { leadMagnets, setLeadMagnets, removeLeadMagnet } = useLeadMagnetStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null);

  useEffect(() => {
    const loadLeadMagnets = async () => {
      if (!user) return;
      
      try {
        const magnets = await getUserLeadMagnets(user.uid);
        setLeadMagnets(magnets);
      } catch (error) {
        console.error('Error loading lead magnets:', error);
        toast.error('Failed to load your lead magnets');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeadMagnets();
  }, [user, setLeadMagnets]);

  const handleDelete = async (id: string) => {
    triggerImpactHaptic('medium');
    
    try {
      await deleteLeadMagnet(id);
      removeLeadMagnet(id);
      triggerNotificationHaptic('success');
      toast.success('Lead magnet deleted');
    } catch (error) {
      console.error('Delete error:', error);
      triggerNotificationHaptic('error');
      toast.error('Failed to delete');
    }
  };

  const limits = userProfile ? PLAN_LIMITS[userProfile.plan] : PLAN_LIMITS.free;
  const usagePercent = userProfile 
    ? (userProfile.dailyGenerationsUsed / limits.dailyGenerations) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Lead Magnets</h1>
            <p className="text-muted-foreground mt-1">
              {leadMagnets.length} {leadMagnets.length === 1 ? 'magnet' : 'magnets'} created
            </p>
          </div>
          
          <Button 
            variant="gradient" 
            onClick={() => {
              triggerImpactHaptic('medium');
              navigate('/create');
            }}
            className="gap-2"
          >
            <Plus size={18} weight="bold" />
            Create New
          </Button>
        </div>

        {/* Usage Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Generations</p>
                <p className="text-2xl font-bold">
                  {userProfile?.dailyGenerationsUsed || 0} / {limits.dailyGenerations}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={userProfile?.plan === 'free' ? 'secondary' : 'default'}>
                  {userProfile?.plan.toUpperCase() || 'FREE'} Plan
                </Badge>
                {userProfile?.plan === 'free' && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-1"
                    onClick={() => toast.info('Upgrade coming soon!')}
                  >
                    Upgrade for more
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lead Magnets Grid */}
        {leadMagnets.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No lead magnets yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first lead magnet to start growing your email list
              </p>
              <Button 
                variant="gradient"
                onClick={() => navigate('/create')}
                className="gap-2"
              >
                <Sparkle size={18} weight="fill" />
                Create Your First
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leadMagnets.map((magnet, index) => (
              <motion.div
                key={magnet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {LEAD_MAGNET_TYPES[magnet.type].icon} {LEAD_MAGNET_TYPES[magnet.type].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(magnet.createdAt)}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2 line-clamp-2">
                      {magnet.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <span>{magnet.wordCount} words</span>
                      {magnet.itemCount && (
                        <>
                          <span>•</span>
                          <span>{magnet.itemCount} items</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => {
                          triggerImpactHaptic('light');
                          setSelectedMagnet(magnet);
                        }}
                      >
                        <Eye size={14} />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => {
                          triggerImpactHaptic('light');
                          toast.info('PDF export coming soon!');
                        }}
                      >
                        <Download size={14} />
                        PDF
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(magnet.id)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {selectedMagnet && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedMagnet(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedMagnet.title}</h2>
                  <Badge variant="secondary" className="mt-1">
                    {LEAD_MAGNET_TYPES[selectedMagnet.type].label}
                  </Badge>
                </div>
                <Button variant="ghost" onClick={() => setSelectedMagnet(null)}>
                  ✕
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: selectedMagnet.content }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
