import type { ReactNode } from 'react';
import { Menu } from '@base-ui/react/menu';
import { Check, ChevronDown } from 'lucide-react';

export type MenuOption = { label: string; icon?: ReactNode; disabled?: boolean; group?: string };

export function WorkbenchMenu({ label, children, options, value, onSelect, className = '', side = 'bottom', chevron = true }: {
  label: string; children: ReactNode; options: MenuOption[]; value?: string;
  onSelect: (value: string) => void; className?: string; side?: 'top' | 'bottom'; chevron?: boolean;
}) {
  return <Menu.Root>
    <Menu.Trigger aria-label={label} className={`beacon-menu-trigger ${className}`}>
      {children}{chevron && <ChevronDown className="beacon-chevron" aria-hidden="true" />}
    </Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner side={side} align="start" sideOffset={6} className="beacon-menu-positioner">
        <Menu.Popup className="beacon-menu" aria-label={label}>
          {options.map((option, index) => <div key={option.label}>
            {option.group && option.group !== options[index - 1]?.group && <div className="beacon-menu-group">{option.group}</div>}
            <Menu.Item disabled={option.disabled} className="beacon-menu-item" onClick={() => onSelect(option.label)}>
              {option.icon}<span>{option.label}</span>{value === option.label && <Check className="beacon-menu-check" />}
            </Menu.Item>
          </div>)}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>;
}
