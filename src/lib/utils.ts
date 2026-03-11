import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortIndicators<T extends { order?: string | number }>(indicators: T[]): T[] {
  return [...indicators].sort((a, b) => {
    const orderA = a.order?.toString() || '';
    const orderB = b.order?.toString() || '';
    
    const partsA = orderA.split('.').map(p => parseInt(p, 10) || 0);
    const partsB = orderB.split('.').map(p => parseInt(p, 10) || 0);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const pA = partsA[i] || 0;
      const pB = partsB[i] || 0;
      if (pA !== pB) {
        return pA - pB;
      }
    }
    
    return orderA.localeCompare(orderB, undefined, { numeric: true, sensitivity: 'base' });
  });
}
