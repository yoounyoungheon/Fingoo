'use client';
import { useState } from 'react';
import IndicatorBoardToolbar from './indicator-board-toolbar';
import { Sidebar } from 'react-pro-sidebar';
import { ChevronDoubleLeftIcon } from '@heroicons/react/solid';
import IconButton from '../../../components/view/atom/icons/icon-button';
import ChatCard from '@/app/ui/components/view/molecule/chat-card';

export default function SideNav() {
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="h-full bg-white">
      <Sidebar collapsedWidth="120px" width="400px" collapsed={collapsed} className="h-full">
        <div className="relative">
          <div className="absolute right-0">
            <IconButton
              data-collapsed={collapsed}
              className="transition-transform duration-200 data-[collapsed=true]:rotate-180"
              color={'gray'}
              icon={ChevronDoubleLeftIcon}
              onClick={handleCollapse}
            />
          </div>
        </div>
        <div className="flex h-full flex-col">
          <SideNavHeader />
          <div className="grow">
            <div className="grid h-full grid-rows-[5fr_7fr] ">
              {!collapsed ? (
                <div>
                  <IndicatorBoardToolbar />
                </div>
              ) : (
                <div></div>
              )}
              <div className="h-full pb-8">
                <ChatCard defaultOpen={true}>
                  <ChatCard.Header title="short chat" />
                  <ChatCard.Content
                    initContent={[
                      { role: 'user', content: 'welcome', isLoading: false },
                      { role: 'assistant', content: 'nicetoMeety', isLoading: false },
                    ]}
                  />
                </ChatCard>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
}

function SideNavHeader() {
  return (
    <div className="ml-8 flex h-32 items-center">
      <div className="mr-8 h-14 w-14 min-w-14 rounded-lg bg-gray-300"></div>
      <p className="truncate text-xl">Fingoo</p>
    </div>
  );
}
