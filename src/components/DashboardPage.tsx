import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash,
  Download,
  Eye,
  Sparkle,
  FolderOpen,
  X,
  Warning,
  CircleNotch
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useLeadMagnetStore } from '@/stores/lead-magnet-store';
import { getUserLeadMagnets, deleteLeadMagnet } from '@/lib/firebase';
import { exportLeadMagnet, shareExport } from '@/lib/export-service';
import { PLAN_LIMITS } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import type { LeadMagnet } from '@/lib/types';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { leadMagnets, setLeadMagnets, removeLeadMagnet } = useLeadMagnetStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<LeadMagnet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadLeadMagnets = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const firestoreMagnets = await getUserLeadMagnets(user.uid);
        // Merge Firestore data with local store (local takes priority for same IDs)
        const localMagnets = leadMagnets.filter(m => m.id.startsWith('local-'));
        const mergedMagnets = [...firestoreMagnets, ...localMagnets];
        setLeadMagnets(mergedMagnets);
      } catch (error) {
        console.error('Error loading lead magnets from Firestore:', error);
        // Keep using local store data (already persisted)
        console.log('Using locally stored lead magnets instead');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeadMagnets();
  }, [user]);

  const handleDelete = async (magnet: LeadMagnet) => {
    setDeleteConfirm(magnet);
    triggerImpactHaptic('medium');
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    triggerImpactHaptic('heavy');

    try {
      // Try to delete from Firestore (may fail due to permissions)
      await deleteLeadMagnet(deleteConfirm.id);
    } catch (error) {
      // Firestore delete failed - that's OK, we'll still remove from local state
      console.log('Firestore delete skipped (using local storage):', error);
    }

    // Always remove from local state (persisted to localStorage)
    removeLeadMagnet(deleteConfirm.id);
    triggerNotificationHaptic('success');
    setDeleteConfirm(null);
    setIsDeleting(false);
  };

  const handleExportPDF = async (magnet: LeadMagnet) => {
    const plan = userProfile?.plan || 'free';

    setExportingId(magnet.id);
    triggerImpactHaptic('medium');

    try {
      const result = await exportLeadMagnet({
        format: 'pdf',
        leadMagnet: magnet,
        userPlan: plan,
        contentElement: contentRef.current!,
      });

      if (result.success && result.blob && result.filename) {
        await shareExport(result.blob, result.filename);
        triggerNotificationHaptic('success');
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      triggerNotificationHaptic('error');
    } finally {
      setExportingId(null);
    }
  };

  const limits = userProfile ? PLAN_LIMITS[userProfile.plan] : PLAN_LIMITS.free;
  const leadMagnetCount = userProfile?.leadMagnetsCreated || leadMagnets.length;
  const usagePercent = limits.maxLeadMagnets === -1
    ? 0
    : (leadMagnetCount / limits.maxLeadMagnets) * 100;

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
                <p className="text-sm text-muted-foreground">Lead Magnets</p>
                <p className="text-2xl font-bold">
                  {leadMagnetCount} / {limits.maxLeadMagnets === -1 ? '∞' : limits.maxLeadMagnets}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={userProfile?.plan === 'free' ? 'secondary' : 'default'}>
                  {userProfile?.plan?.toUpperCase() || 'FREE'} Plan
                </Badge>
                {userProfile?.plan === 'free' && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-1"
                    onClick={() => navigate('/paywall')}
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
                      <CardTitle className="text-lg line-clamp-2">
                        {magnet.title}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatRelativeTime(magnet.createdAt)}
                      </span>
                    </div>
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
                        disabled={exportingId === magnet.id}
                        onClick={() => handleExportPDF(magnet)}
                      >
                        {exportingId === magnet.id ? (
                          <CircleNotch size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(magnet)}
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
        <AnimatePresence>
          {selectedMagnet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setSelectedMagnet(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedMagnet.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exportingId === selectedMagnet.id}
                      onClick={() => handleExportPDF(selectedMagnet)}
                    >
                      {exportingId === selectedMagnet.id ? (
                        <CircleNotch size={16} className="animate-spin mr-2" />
                      ) : (
                        <Download size={16} className="mr-2" />
                      )}
                      Export PDF
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedMagnet(null)}>
                      <X size={20} />
                    </Button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {/* Styled Content Preview */}
                  <style>{`
                    .preview-content {
                      font-size: 1rem;
                      line-height: 1.8;
                      color: hsl(var(--foreground));
                    }
                    .preview-content h1 {
                      font-size: 1.75em;
                      font-weight: 700;
                      color: hsl(var(--foreground));
                      margin-top: 1.5em;
                      margin-bottom: 0.75em;
                      line-height: 1.3;
                      border-bottom: 2px solid hsl(var(--primary) / 0.3);
                      padding-bottom: 0.5em;
                    }
                    .preview-content h2 {
                      font-size: 1.4em;
                      font-weight: 700;
                      color: hsl(var(--foreground));
                      margin-top: 1.5em;
                      margin-bottom: 0.75em;
                      line-height: 1.3;
                    }
                    .preview-content h3 {
                      font-size: 1.15em;
                      font-weight: 600;
                      color: hsl(var(--foreground));
                      margin-top: 1.25em;
                      margin-bottom: 0.5em;
                    }
                    .preview-content p {
                      margin: 0 0 1em 0;
                      color: hsl(var(--muted-foreground));
                    }
                    .preview-content ul,
                    .preview-content ol {
                      margin: 1em 0 1.5em 1.5em;
                      padding-left: 0;
                    }
                    .preview-content li {
                      margin-bottom: 0.5em;
                      line-height: 1.6;
                      color: hsl(var(--muted-foreground));
                    }
                    .preview-content li::marker {
                      color: hsl(var(--primary));
                    }
                    .preview-content strong {
                      font-weight: 600;
                      color: hsl(var(--foreground));
                    }
                    .preview-content blockquote {
                      margin: 1.5em 0;
                      padding: 1em 1.25em;
                      border-left: 4px solid hsl(var(--primary));
                      background: hsl(var(--primary) / 0.05);
                      border-radius: 0 8px 8px 0;
                      font-style: italic;
                      color: hsl(var(--foreground));
                    }
                    .preview-content table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 1.5em 0;
                    }
                    .preview-content th,
                    .preview-content td {
                      border: 1px solid hsl(var(--border));
                      padding: 0.75em;
                      text-align: left;
                    }
                    .preview-content th {
                      background: hsl(var(--primary) / 0.1);
                      font-weight: 600;
                      color: hsl(var(--primary));
                    }
                  `}</style>
                  <div
                    ref={contentRef}
                    className="preview-content"
                    dangerouslySetInnerHTML={{ __html: selectedMagnet.content }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => !isDeleting && setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Warning size={24} className="text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Delete Lead Magnet?</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={isDeleting}
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={isDeleting}
                    onClick={confirmDelete}
                  >
                    {isDeleting ? (
                      <>
                        <CircleNotch size={16} className="animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash size={16} className="mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
