import { StadiumCanvas } from '../scene/StadiumCanvas';
import { MobileBottomSheet } from '../ui/MobileBottomSheet';
import { StadiumSidebar } from '../ui/StadiumSidebar';

/**
 * The complete 3D experience is a deferred route-sized bundle. Keeping it out
 * of the first match-setup render prevents Three.js, geometry generation, and
 * crowd metadata from competing with the user's first interaction.
 */
export function StadiumExperience() {
  return (
    <>
      <MobileBottomSheet>
        <StadiumSidebar />
      </MobileBottomSheet>
      <StadiumCanvas />
    </>
  );
}
