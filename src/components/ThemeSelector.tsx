
// Only display "Light Mode" (non-interactive)
import { Sun } from 'lucide-react';

export function ThemeSelector() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#264E46]">
      <Sun className="h-5 w-5" />
      <span>Light Mode</span>
    </div>
  );
}
