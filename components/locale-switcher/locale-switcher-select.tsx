'use client';

import { Check, Globe } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import clsx from 'clsx';
import { useTransition } from 'react';
import { Locale } from '@/i18n/config';
import { setUserLocale } from '@/services/locale';

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label
}: Props) {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string | boolean) {
    const locale = (typeof value === 'boolean') ? (value ? 'zh' : 'en') : value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  return (
    <div className="relative">
      {/* Desktop Select */}
      <div className="hidden md:block">
        <Select.Root defaultValue={defaultValue} onValueChange={onChange}>
          <Select.Trigger
            aria-label={label}
            className={clsx(
              'rounded-sm p-2 transition-colors hover:bg-slate-200',
              isPending && 'pointer-events-none opacity-60'
            )}
          >
            <Select.Icon>
              <Globe className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              align="end"
              className="min-w-[8rem] overflow-hidden rounded-sm bg-background border shadow-md dark:bg-slate-900 dark:border-slate-800"
              position="popper"
            >
              <Select.Viewport>
                {items.map((item) => (
                  <Select.Item
                    key={item.value}
                    className="flex items-center px-3 py-2 text-base data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground cursor-pointer"
                    value={item.value}
                  >
                    <div className="mr-2 w-[1rem]">
                      {item.value === defaultValue && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <span className="text-foreground">{item.label}</span>
                  </Select.Item>
                ))}
              </Select.Viewport>
              <Select.Arrow className="fill-background dark:fill-slate-900" />
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Mobile Switch */}
      <div className="md:hidden flex items-center space-x-2" onClick={() => onChange(defaultValue === 'zh' ? 'en' : 'zh')} >
        <Globe 
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer" 
        />
        <span className="text-sm">
          {defaultValue === 'zh' ? 'English' : '中文'}
        </span>
      </div>
    </div>
  );
}