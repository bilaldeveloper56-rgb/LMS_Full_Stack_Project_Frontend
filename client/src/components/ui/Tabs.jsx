import React, { createContext, useContext, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const TabsContext = createContext(null);

const TabsBase = forwardRef(({ value, onChange, onValueChange, className, children, ...rest }, ref) => {
  const handleTabChange = onValueChange || onChange;
  return (
    <TabsContext.Provider value={{ value, onChange: handleTabChange }}>
      <div ref={ref} className={cn('w-full', className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});
TabsBase.displayName = 'Tabs';

export const TabsList = forwardRef(({ className, children, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        'flex border-b border-border',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
TabsList.displayName = 'Tabs.List';

export const TabsTab = forwardRef(({ value, className, children, ...rest }, ref) => {
  const { value: selectedValue, onChange } = useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      ref={ref}
      role="tab"
      aria-selected={isSelected}
      onClick={() => onChange && onChange(value)}
      className={cn(
        'px-4 py-2.5 text-sm font-medium border-b-2 transition-base whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset cursor-pointer',
        isSelected
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-muted',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
TabsTab.displayName = 'Tabs.Tab';
export const TabsTrigger = TabsTab;

export const TabsPanel = forwardRef(({ value, className, children, ...rest }, ref) => {
  const { value: selectedValue } = useContext(TabsContext);
  
  if (selectedValue !== value) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn('py-4 outline-none', className)}
      tabIndex={0}
      {...rest}
    >
      {children}
    </div>
  );
});
TabsPanel.displayName = 'Tabs.Panel';
export const TabsContent = TabsPanel;

export const Tabs = Object.assign(TabsBase, {
  List: TabsList,
  Tab: TabsTab,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
  Content: TabsContent,
});

export default Tabs;
