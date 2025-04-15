
import { LucideIcon } from 'lucide-react';

export interface BlockCommand {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  type: string;
}

export interface CommandMenuProps {
  isOpen: boolean;
  searchQuery: string;
  onSelect: (command: BlockCommand) => void;
  onClose: () => void;
  anchorPosition?: { x: number; y: number };
}
