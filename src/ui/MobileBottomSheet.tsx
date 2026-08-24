import type { PropsWithChildren } from 'react';

/**
 * Keeps the control surface in the desktop grid and turns it into a scrollable
 * bottom sheet at the compact breakpoint without duplicating any controls.
 */
export function MobileBottomSheet({ children }: PropsWithChildren) {
  return <div className="mobile-bottom-sheet">{children}</div>;
}
