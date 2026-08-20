import { Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { ChevronDown, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { labels } from '@/constants/labels';

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: labels.actions.logout,
      icon: <LogOut size={14} />,
      onClick: handleLogout,
    },
  ];

  const initials = (user?.displayName ?? 'FU')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-surface border-b border-border shrink-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-page-background"
          onClick={onMobileMenuClick}
          aria-label="Open navigation"
        >
          <MenuIcon size={20} />
        </button>
        <div className="leading-tight">
          <div className="font-semibold text-text text-[15px]">Panasonic</div>
          <div className="text-xs text-text-muted -mt-0.5">GL Tax Classification</div>
        </div>
      </div>

      <Dropdown menu={{ items }} trigger={['click']}>
        <button
          type="button"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-page-background cursor-pointer"
        >
          <Avatar size={28} className="bg-primary text-white text-xs font-semibold">
            {initials}
          </Avatar>
          <span className="text-sm text-text hidden sm:inline">{user?.displayName ?? 'Finance User'}</span>
          <ChevronDown size={14} className="text-text-muted" />
        </button>
      </Dropdown>
    </header>
  );
}
