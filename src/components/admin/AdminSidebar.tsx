import { NAV_ITEMS } from '@/lib/constants';

interface AdminSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

export function AdminSidebar({ activeNav, onNavChange }: AdminSidebarProps) {
  const adminNavItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'transactions', label: 'Transactions', icon: '📋' },
    { id: 'deposits', label: 'Deposits Pending', icon: '💰' },
    { id: 'withdrawals', label: 'Withdrawals Pending', icon: '💸' },
    { id: 'wallets', label: 'Admin Wallets', icon: '🏦' },
  ];

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminEmail');
    window.location.href = '/admin-login';
  };

  return (
    <div className="sidebar">
      <div style={{ padding: '8px 16px 16px', borderBottom: '1px solid var(--color-border-tertiary)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-mark" style={{ background: 'var(--danger)' }}>A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              Admin Panel
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>AnexmintMining</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '4px 0' }}>
        {adminNavItems.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`nav-btn${activeNav === id ? ' active' : ''}`}
            onClick={() => onNavChange(id)}
          >
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border-tertiary)' }}>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            width: '100%',
            padding: '8px',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: 8,
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          ← Back to User Dashboard
        </button>
        
        {/* ADD LOGOUT BUTTON HERE */}
        <button
          onClick={handleAdminLogout}
          style={{
            width: '100%',
            padding: '8px',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            cursor: 'pointer',
            color: '#ef4444',
            fontSize: 12,
          }}
        >
          🚪 Logout Admin
        </button>
      </div>
    </div>
  );
}