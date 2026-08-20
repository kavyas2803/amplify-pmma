import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/navigation';
import { assets } from '@/config/assets';

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-56 shrink-0 bg-sidebar h-full">
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <img src={assets.panasonicWordmark} alt="Panasonic" className="h-5 w-auto" />
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.path}
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
    </aside>
  );
}
