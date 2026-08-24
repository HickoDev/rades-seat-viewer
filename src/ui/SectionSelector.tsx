import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { getSectionId } from '../stadium/bowl/sectionIds';
import { useStadiumStore } from '../state/useStadiumStore';

export function SectionSelector() {
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const selectSection = useStadiumStore((state) => state.selectSection);

  return (
    <label className="section-select">
      <span>Choose a section</span>
      <select
        aria-label="Choose a stadium section"
        value={selectedSectionId ?? ''}
        onChange={(event) => {
          if (event.target.value) {
            selectSection(event.target.value);
          }
        }}
      >
        <option value="">Select a tier and section</option>
        {radesStadiumConfig.tiers.map((tier) => (
          <optgroup key={tier.id} label={tier.name}>
            {Array.from({ length: tier.sectionCount }, (_, sectionIndex) => {
              const sectionId = getSectionId(tier.id, sectionIndex);
              const isVirageTerrace =
                tier.seatlessSectionIndices.includes(sectionIndex);
              return (
                <option key={sectionId} value={sectionId}>
                  {tier.name} · Section {sectionIndex + 1}
                  {isVirageTerrace ? ' · Virage terrace' : ''}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
