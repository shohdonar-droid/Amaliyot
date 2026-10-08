import React, { useState } from 'react';
import { Sidebar, ActiveModule } from './Sidebar';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { storageService } from '../../services/storageService';
import { UserProfileModal } from '../common/UserProfileModal';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export function Layout({
  children,
  activeModule,
  onSelectModule,
  canGoBack = false,
  onGoBack
}: LayoutProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area (Offset by sidebar width on large screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          activeModule={activeModule}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          unreadCount={unreadCount}
          onOpenNotifications={() => onSelectModule('notifications')}
          canGoBack={canGoBack}
          onGoBack={onGoBack}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        activeModule={activeModule}
        onSelectModule={onSelectModule}
        onOpenMenu={() => setIsOpenMobile(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
