import { radesStadiumConfig } from './config/radesStadiumConfig';
import { SeatInstances } from '../seats/SeatInstances';
import { StadiumBowl } from './bowl/StadiumBowl';
import { FootballPitch } from './pitch/FootballPitch';
import { AthleticsTrack } from './track/AthleticsTrack';

/**
 * Stable composition boundary for the independently generated stadium modules.
 */
export function RadesStadium() {
  return (
    <group
      name="rades-stadium"
      userData={{
        configVersion: radesStadiumConfig.version,
        implementationStatus: 'pitch-and-track',
      }}
    >
      <AthleticsTrack />
      <FootballPitch />
      <StadiumBowl />
      <SeatInstances />
    </group>
  );
}
