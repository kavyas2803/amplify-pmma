import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_ITEMS } from '@/constants/navigation';
import { assets } from '@/config/assets';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex md:flex-col shrink-0 bg-sidebar h-full relative transition-[width] duration-[250ms] ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      <div className={`${collapsed ? 'h-20 px-5' : 'h-[76px] px-4'} flex items-center border-b border-white/10 overflow-hidden`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            P
          </div>
        ) : (
          <img src={assets.panasonicWordmark} alt="Panasonic" className="w-[208px] h-auto max-w-full object-contain" />
        )}
      </div>

      <nav className="flex-1 py-3 px-3 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? '!bg-primary !text-white'
                    : '!text-sidebar-text hover:!bg-sidebar-hover hover:!text-white'
                }`
              }
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute top-8 -right-3.5 z-50 w-7 h-7 rounded-full bg-[#1f242c] border border-[#3a414d] text-sidebar-text flex items-center justify-center hover:text-white hover:bg-primary transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
