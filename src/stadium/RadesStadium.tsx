import { radesStadiumConfig } from './config/radesStadiumConfig';
import { StaticCrowd } from '../people/StaticCrowd';
import { StaticPlayers } from '../people/StaticPlayers';
import { SeatInstances } from '../seats/SeatInstances';
import { AccessRamps } from './exterior/AccessRamps';
import { ExteriorColumns } from './exterior/ExteriorColumns';
import { Facade } from './exterior/Facade';
import { StadiumBowl } from './bowl/StadiumBowl';
import { FootballPitch } from './pitch/FootballPitch';
import { AthleticsTrack } from './track/AthleticsTrack';
import { LightingStructures } from './roof/LightingStructures';
import { RoofTrusses } from './roof/RoofTrusses';
import { StadiumRoof } from './roof/StadiumRoof';
import { StructuralFrames } from './roof/StructuralFrames';

/**
 * Stable composition boundary for the independently generated stadium modules.
 */
export function RadesStadium() {
  return (
    <group
      name="rades-stadium"
      userData={{
        configVersion: radesStadiumConfig.version,
        implementationStatus: 'procedural-stadium-complete',
      }}
    >
      <AthleticsTrack />
      <FootballPitch />
      <StaticPlayers />
      <StadiumBowl />
      <SeatInstances />
      <StaticCrowd />
      <StadiumRoof />
      <RoofTrusses />
      <StructuralFrames />
      <Facade />
      <ExteriorColumns />
      <AccessRamps />
      <LightingStructures />
    </group>
  );
}
