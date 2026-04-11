'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function Toaster() {
  // Simplified toaster - in production use @radix-ui/react-toast or sonner
  return <div id="toast-container" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" />;
}

export function toast({ title, description, variant = 'default' }: ToastProps) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toastEl = document.createElement('div');
  toastEl.className = cn(
    'rounded-md border p-4 shadow-lg transition-all bg-background text-foreground',
    variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground'
  );
  toastEl.innerHTML = `
    ${title ? `<p class="text-sm font-semibold">${title}</p>` : ''}
    ${description ? `<p class="text-sm opacity-90">${description}</p>` : ''}
  `;
  container.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 5000);
}
