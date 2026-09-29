import React, { useState } from 'react';
import { Sidebar, ActiveModule } from './Sidebar';
import { Header } from './Header';
import { storageService } from '../../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
}

export function Layout({
  children,
  activeModule,
  onSelectModule
}: LayoutProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const notifications = storageService.getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={onSelectModule}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main Content Area (Offset by sidebar width on large screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          activeModule={activeModule}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          unreadCount={unreadCount}
          onOpenNotifications={() => onSelectModule('notifications')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
