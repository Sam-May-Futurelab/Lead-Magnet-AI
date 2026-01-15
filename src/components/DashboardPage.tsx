import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash,
  Download,
  Sparkle,
  FolderOpen,
  X,
  Warning,
  CircleNotch,
  FileText,
  ChartPieSlice,
  Crown,
  ListChecks,
  PencilSimple,
  FloppyDisk,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { leadMagnets, setLeadMagnets, removeLeadMagnet, updateLeadMagnet } = useLeadMagnetStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<LeadMagnet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState('Preparing export...');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
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
    setExportProgress('Preparing export...');
    triggerImpactHaptic('medium');

    try {
      setExportProgress('Generating PDF...');
      const result = await exportLeadMagnet({
        format: 'pdf',
        leadMagnet: magnet,
        userPlan: plan,
        contentElement: contentRef.current!,
      });

      if (result.success && result.blob && result.filename) {
        setExportProgress('Finalizing...');
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
    if (selectedMagnet) {
      setEditedContent(htmlToText(selectedMagnet.content));
      setIsEditing(true);
      triggerImpactHaptic('light');
    }
  };

  const handleSaveEdit = () => {
    if (selectedMagnet) {
      const newHtml = textToHtml(editedContent);
      updateLeadMagnet(selectedMagnet.id, { content: newHtml });
      setSelectedMagnet({ ...selectedMagnet, content: newHtml });
      setIsEditing(false);
      triggerNotificationHaptic('success');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
    triggerImpactHaptic('light');
  };

  const handleCloseModal = () => {
    setSelectedMagnet(null);
    setIsEditing(false);
    setEditedContent('');
  };

  const limits = userProfile ? PLAN_LIMITS[userProfile.plan] : PLAN_LIMITS.free;
  // Only count lead magnets belonging to current user
  const userLeadMagnets = user ? leadMagnets.filter(m => m.userId === user.uid) : [];
  const leadMagnetCount = userProfile?.leadMagnetsCreated || userLeadMagnets.length;
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
    <div className="min-h-screen py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track your lead magnets
            </p>
          </div>

          <Button
            size="default"
            onClick={() => {
              triggerImpactHaptic('medium');
              navigate('/create');
            }}
            className="gap-2 shadow-sm"
          >
            <Plus size={18} weight="bold" />
            Create Lead Magnet
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Usage</CardTitle>
              <ChartPieSlice size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leadMagnetCount} / {limits.maxLeadMagnets === -1 ? '∞' : limits.maxLeadMagnets}
              </div>
              <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <Crown size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{userProfile?.plan || 'Free'}</div>
              {userProfile?.plan === 'free' && (
                <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground mt-1" onClick={() => navigate('/paywall')}>
                  Upgrade to Pro &rarr;
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lead Magnets Grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Recent Projects</h2>
          {userLeadMagnets.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <FolderOpen size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No lead magnets yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Create your first lead magnet to start growing your email list with AI-generated content.
              </p>
              <Button
                onClick={() => navigate('/create')}
                className="gap-2"
              >
                <Sparkle size={16} weight="fill" />
                Create Your First
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userLeadMagnets.map((magnet, index) => (
                <motion.div
                  key={magnet.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base font-semibold line-clamp-2 leading-tight">
                            {magnet.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(magnet.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText size={14} />
                          <span>{magnet.wordCount} words</span>
                        </div>
                        {magnet.itemCount && (
                          <div className="flex items-center gap-1">
                            <ListChecks size={14} />
                            <span>{magnet.itemCount} items</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0 mt-auto flex items-center justify-between border-t border-border/40 pt-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            triggerImpactHaptic('light');
                            setSelectedMagnet(magnet);
                          }}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          disabled={exportingId === magnet.id}
                          onClick={() => handleExportPDF(magnet)}
                        >
                          {exportingId === magnet.id ? (
                            <>
                              <CircleNotch size={12} className="animate-spin" />
                              <span className="text-[10px]">{exportProgress.split(' ')[0]}</span>
                            </>
                          ) : (
                            <Download size={12} />
                          )}
                          PDF
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(magnet)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>


        {/* Preview Modal */}
        <AnimatePresence>
          {selectedMagnet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b shrink-0 bg-background/95 backdrop-blur z-10">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold leading-tight">{selectedMagnet.title}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="-mt-1 -mr-2 text-muted-foreground hover:text-foreground shrink-0"
                      onClick={handleCloseModal}
                    >
                      <X size={20} />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 justify-center"
                          onClick={handleCancelEdit}
                        >
                          <X size={16} className="mr-2" />
                          Cancel
                        </Button>
                        <Button
                          variant="gradient"
                          className="flex-1 justify-center"
                          onClick={handleSaveEdit}
                        >
                          <FloppyDisk size={16} className="mr-2" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 justify-center"
                          onClick={handleStartEdit}
                        >
                          <PencilSimple size={16} className="mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 justify-center"
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
                      </>
                    )}
                  </div>
                </div>
                <div className="p-6 overflow-y-auto min-h-0">
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
                    .edit-textarea {
                      width: 100%;
                      min-height: 300px;
                      padding: 1rem;
                      font-family: inherit;
                      font-size: 1rem;
                      line-height: 1.6;
                      background: hsl(var(--background));
                      color: hsl(var(--foreground));
                      border: 1px solid hsl(var(--border));
                      border-radius: 8px;
                      resize: vertical;
                    }
                    .edit-textarea:focus {
                      outline: none;
                      border-color: hsl(var(--primary));
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
                      className="preview-content"
                      dangerouslySetInnerHTML={{ __html: selectedMagnet.content }}
                    />
                  )}
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
