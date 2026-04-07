import { NAV_ITEMS } from '@/lib/constants';

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  user: any; // Add this line
}

export function Sidebar({ activeNav, onNavChange, user }: SidebarProps) {  // Add user parameter
  return (
    <div className="sidebar">
      <div style={{ padding: '8px 16px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-mark">A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              AnexmintMining
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Pro Account</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '4px 0' }}>
        {NAV_ITEMS.map(({ id, label, icon }) => (
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

      <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand), var(--color-text-info))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 500,
              color: '#fff'
            }}
          >
            {user?.user_metadata?.full_name ? (
              (() => {
                const name = user.user_metadata.full_name;
                const parts = name.split(' ');
                if (parts.length >= 2) {
                  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
                }
                return name.slice(0, 2).toUpperCase();
              })()
            ) : (
              user?.email?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {user?.email || 'user@example.com'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}