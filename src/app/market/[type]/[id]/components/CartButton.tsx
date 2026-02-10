'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartButton() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 3000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all',
          clicked
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : 'border-neutral-700 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
        )}
        title="장바구니에 추가"
      >
        {clicked ? (
          <Check className="h-4 w-4" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
        {clicked ? '추가됨' : '장바구니'}
      </button>
      {clicked && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-xs text-neutral-400 shadow-lg">
          장바구니 기능은 추후 업데이트에서 제공됩니다.
        </div>
      )}
    </div>
  );
}
