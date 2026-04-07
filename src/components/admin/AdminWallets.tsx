import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Copy, Check, Edit2, Save, X } from 'lucide-react';

interface AdminWallet {
  id: number;
  crypto_symbol: string;
  wallet_address: string;
  network: string;
  is_active: boolean;
  updated_at: string;
}

export function AdminWallets() {
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_wallets')
        .select('*')
        .order('crypto_symbol');

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWallet = async (id: number, cryptoSymbol: string, newAddress: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_wallets')
        .update({
          wallet_address: newAddress,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`${cryptoSymbol} wallet address updated`);
      setEditingId(null);
      fetchWallets();
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error('Failed to update wallet');
    }
  };

  const copyToClipboard = (address: string, id: number) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Address copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Admin Wallets</h2>
        <p className="text-sm text-muted-foreground">Manage deposit addresses for all cryptocurrencies</p>
      </div>

      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cryptocurrency</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Wallet Address</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Network</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Updated</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => (
                <tr key={wallet.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="p-4">
                    <span className="font-semibold text-foreground">{wallet.crypto_symbol}</span>
                  </td>
                  <td className="p-4">
                    {editingId === wallet.id ? (
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                        placeholder="Enter wallet address"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-secondary px-2 py-1 rounded font-mono break-all">
                          {wallet.wallet_address}
                        </code>
                        <button
                          onClick={() => copyToClipboard(wallet.wallet_address, wallet.id)}
                          className="p-1 hover:bg-secondary rounded transition-colors"
                          title="Copy address"
                        >
                          {copiedId === wallet.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{wallet.network}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(wallet.updated_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    {editingId === wallet.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateWallet(wallet.id, wallet.crypto_symbol, editAddress)}
                          className="p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(wallet.id);
                          setEditAddress(wallet.wallet_address);
                        }}
                        className="p-1.5 hover:bg-secondary rounded transition-colors"
                        title="Edit address"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-secondary/30 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">⚠️ Important Notes</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Changes to wallet addresses will affect ALL new deposits immediately</li>
          <li>• Existing pending deposits will still use the old address</li>
          <li>• Always double-check addresses before saving</li>
          <li>• Only send the correct cryptocurrency to each address</li>
        </ul>
      </div>
    </div>
  );
}