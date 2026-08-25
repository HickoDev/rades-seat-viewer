import { findRepresentativeTerracePosition } from '../seats/viewingPositions';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { getSectionId } from '../stadium/bowl/sectionIds';
import { getInteriorSectionZone } from '../stadium/bowl/sectionZones';
import { useStadiumStore } from '../state/useStadiumStore';

export function SectionSelector() {
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const selectSection = useStadiumStore((state) => state.selectSection);
  const selectTerracePosition = useStadiumStore(
    (state) => state.selectTerracePosition,
  );

  return (
    <label className="section-select">
      <span>Choose a section</span>
      <select
        aria-label="Choose a stadium section"
        value={selectedSectionId ?? ''}
        onChange={(event) => {
          if (event.target.value) {
            const sectionId = event.target.value;
            const terracePosition =
              findRepresentativeTerracePosition(sectionId);
            if (terracePosition) {
              selectTerracePosition(
                sectionId,
                terracePosition.rowNumber,
                terracePosition.seatNumber,
              );
            } else {
              selectSection(sectionId);
            }
          }
        }}
      >
        <option value="">Select a tier and section</option>
        {radesStadiumConfig.tiers.map((tier) => (
          <optgroup key={tier.id} label={tier.name}>
            {Array.from({ length: tier.sectionCount }, (_, sectionIndex) => {
              const sectionId = getSectionId(tier.id, sectionIndex);
              const zone = getInteriorSectionZone(
                tier,
                sectionIndex,
                radesStadiumConfig.grandstand,
              );
              return (
                <option key={sectionId} value={sectionId}>
                  {tier.name} · {zone.label} · Section {sectionIndex + 1}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
