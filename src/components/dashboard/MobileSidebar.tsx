import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';

interface MobileSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  user: any;
  onSignOut: () => void;
}

export function MobileSidebar({ activeNav, onNavChange, user, onSignOut }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleNavClick = (id: string) => {
    onNavChange(id);
    closeSidebar();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const meta = user?.user_metadata || {};
    const firstName = meta.first_name || meta.firstName || '';
    const lastName = meta.last_name || meta.lastName || '';
    const fullName = meta.full_name || meta.fullName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (fullName) {
      const parts = fullName.split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return fullName.slice(0, 2).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getUserName = () => {
    const meta = user?.user_metadata || {};
    const firstName = meta.first_name || meta.firstName || '';
    const fullName = meta.full_name || meta.fullName || '';
    return firstName || (fullName ? fullName.split(' ')[0] : '') || user?.email?.split('@')[0] || 'User';
  };

  return (
    <>
      {/* Menu Button - Left side, rectangular */}
      <button
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: 12,
          left: 16,
          width: 40,
          height: 40,
          borderRadius: 8,
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 50,
        }}
      >
        <Menu size={20} color="var(--color-text-primary)" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 51,
          }}
        />
      )}

      {/* Sidebar Panel - Slides from Left */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          background: 'var(--color-background-primary)',
          borderRight: '1px solid var(--color-border-tertiary)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 52,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 16px',
        }}
      >
        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button
            onClick={closeSidebar}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} color="var(--color-text-primary)" />
          </button>
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border-tertiary)' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand), var(--color-text-info))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            {getUserInitials()}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{getUserName()}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{user?.email}</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 12,
                border: 'none',
                background: activeNav === id ? 'var(--brand-bg)' : 'transparent',
                color: activeNav === id ? 'var(--brand)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontSize: 14,
                fontWeight: activeNav === id ? 600 : 500,
              }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Sign Out Button */}
        <button
          onClick={() => {
            onSignOut();
            closeSidebar();
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            marginTop: 20,
            borderRadius: 12,
            border: '1px solid var(--color-border-tertiary)',
            background: 'var(--color-background-secondary)',
            color: 'var(--color-text-danger)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}