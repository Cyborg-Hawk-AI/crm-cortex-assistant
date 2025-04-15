
import React, { useEffect, useState, useRef } from 'react';
import { Command } from 'cmdk';
import { blockCommands } from '@/utils/blockCommands';
import { BlockCommand, CommandMenuProps } from '@/types/commands';
import { cn } from '@/lib/utils';

export function CommandMenu({ 
  isOpen, 
  searchQuery, 
  onSelect, 
  onClose,
  anchorPosition 
}: CommandMenuProps) {
  const [filteredCommands, setFilteredCommands] = useState<BlockCommand[]>(blockCommands);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const query = searchQuery.toLowerCase().replace('/', '');
    const filtered = blockCommands.filter(command => {
      return (
        command.title.toLowerCase().includes(query) ||
        command.description.toLowerCase().includes(query) ||
        command.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    });
    setFilteredCommands(filtered);
  }, [searchQuery, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 rounded-md border border-[#3A4D62] bg-[#25384D] shadow-lg"
      style={{
        top: anchorPosition?.y ?? 0,
        left: anchorPosition?.x ?? 0,
      }}
    >
      <Command
        className="rounded-lg border shadow-md"
      >
        <Command.Input 
          value={searchQuery.replace('/', '')}
          className="w-full border-none bg-transparent p-2 text-sm text-white placeholder-gray-400 focus:outline-none"
          placeholder="Type a command..."
          autoFocus
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 && (
            <Command.Empty className="p-2 text-sm text-gray-400">
              No commands found.
            </Command.Empty>
          )}
          {filteredCommands.map((command) => (
            <Command.Item
              key={command.id}
              value={command.title}
              onSelect={() => onSelect(command)}
              className={cn(
                "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-white",
                "cursor-pointer hover:bg-[#3A4D62]",
                "aria-selected:bg-[#3A4D62]"
              )}
            >
              <command.icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{command.title}</span>
                <span className="text-xs text-gray-400">{command.description}</span>
              </div>
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
