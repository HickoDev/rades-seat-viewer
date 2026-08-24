import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { createTechnicalAreaLayout } from './technicalAreaLayout';

describe('createTechnicalAreaLayout', () => {
  const people = createTechnicalAreaLayout(radesStadiumConfig);

  it('populates both dugouts and their technical areas', () => {
    const expectedPerTeam =
      radesStadiumConfig.occupants.technicalAreaSeatedPerTeam +
      radesStadiumConfig.occupants.technicalAreaStandingPerTeam;

    expect(people.filter((person) => person.team === 'home')).toHaveLength(
      expectedPerTeam,
    );
    expect(people.filter((person) => person.team === 'away')).toHaveLength(
      expectedPerTeam,
    );
    expect(new Set(people.map((person) => person.id)).size).toBe(people.length);
  });

  it('keeps seated occupants inside the shelter run and staff in front', () => {
    const shelterCenterZ =
      radesStadiumConfig.grandstand.side *
      (radesStadiumConfig.pitch.width / 2 +
        radesStadiumConfig.structure.benchSidelineOffset);

    people.forEach((person) => {
      if (person.pose === 'seated') {
        expect(Math.abs(person.position[2] - shelterCenterZ)).toBeLessThan(
          radesStadiumConfig.structure.benchDepth / 2,
        );
      } else {
        expect(Math.abs(person.position[2])).toBeLessThan(
          Math.abs(shelterCenterZ),
        );
      }
    });
  });
});
