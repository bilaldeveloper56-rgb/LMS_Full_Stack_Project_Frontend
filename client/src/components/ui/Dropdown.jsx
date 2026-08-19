import React, { useState, useRef, useEffect, forwardRef, cloneElement } from 'react';
import { cn } from '@/lib/utils';

const DropdownBase = ({ trigger, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const triggerElement = trigger ? cloneElement(trigger, {
    onClick: (e) => {
      if (trigger.props.onClick) trigger.props.onClick(e);
      toggleDropdown();
    },
    'aria-haspopup': 'true',
    'aria-expanded': isOpen,
  }) : null;

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {triggerElement}
      
      {isOpen && (
        <div 
          className={cn(
            'absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-surface shadow-lg ring-1 ring-black/5 focus:outline-none z-[var(--z-dropdown)]',
            className
          )}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return cloneElement(child, {
                  onClick: (e) => {
                    if (child.props.onClick) child.props.onClick(e);
                    setIsOpen(false);
                  }
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = forwardRef(({ className, children, icon: Icon, ...rest }, ref) => {
  return (
    <button
      ref={ref}
      role="menuitem"
      className={cn(
        'w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors duration-100 flex items-center',
        className
      )}
      {...rest}
    >
      {Icon && <Icon className="mr-2 h-4 w-4 text-text-muted" />}
      {children}
    </button>
  );
});
DropdownItem.displayName = 'Dropdown.Item';

export const Dropdown = Object.assign(DropdownBase, {
  Item: DropdownItem,
});

export default Dropdown;
