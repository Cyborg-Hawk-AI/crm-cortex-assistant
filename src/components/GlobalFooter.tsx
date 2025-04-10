
import React from 'react';
import { QuickActions } from './QuickActions';

export function GlobalFooter() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#171C24] border-t border-[#3A4D62] shadow-lg">
      <div className="container p-4 max-w-6xl mx-auto">
        <QuickActions />
      </div>
    </div>
  );
}
