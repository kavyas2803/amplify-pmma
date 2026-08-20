import { Drawer } from 'antd';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/navigation';
import { assets } from '@/config/assets';

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  return (
    <Drawer
      placement="left"
      open={open}
      onClose={onClose}
      closable={false}
      size="default"
      styles={{ body: { padding: 0, background: '#000000' }, section: { width: 240 } }}
    >
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <img src={assets.panasonicWordmark} alt="Panasonic" className="h-5 w-auto" />
      </div>
      <nav className="py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? '!bg-primary !text-white'
                    : '!text-sidebar-text hover:!bg-sidebar-hover hover:!text-white'
                }`
              }
            >
              <Icon size={17} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </Drawer>
  );
}
