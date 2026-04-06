import { useState } from 'react';
import { formatUSD } from '@/lib/utils';

interface UserCardProps {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    totalBalance: number;
    status: 'active' | 'suspended';
  };
  onViewDetails: (user: any) => void;
}

export function UserCard({ user, onViewDetails }: UserCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-background-primary)',
        border: '1px solid var(--color-border-tertiary)',
        borderRadius: 16,
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onClick={() => onViewDetails(user)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `linear-gradient(135deg, var(--brand), var(--color-text-info))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 600,
            color: '#fff',
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {user.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{user.email}</div>
        </div>
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            background: user.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: user.status === 'active' ? 'var(--color-text-success)' : 'var(--color-text-danger)',
          }}
        >
          {user.status}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-border-tertiary)' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Total Balance</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {formatUSD(user.totalBalance)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Joined</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}