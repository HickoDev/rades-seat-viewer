import { radesStadiumConfig } from './config/radesStadiumConfig';
import { MatchPlayers } from '../people/MatchPlayers';
import { StadiumCrowd } from '../people/StadiumCrowd';
import { TechnicalAreaPeople } from '../people/TechnicalAreaPeople';
import { VirageCrowd } from '../people/VirageCrowd';
import { SeatInstances } from '../seats/SeatInstances';
import { AccessRamps } from './exterior/AccessRamps';
import { ExteriorColumns } from './exterior/ExteriorColumns';
import { EntrancePlaza } from './exterior/EntrancePlaza';
import { Facade } from './exterior/Facade';
import { StadiumSite } from './exterior/StadiumSite';
import { StadiumBowl } from './bowl/StadiumBowl';
import { FootballPitch } from './pitch/FootballPitch';
import { PlayerEntranceTunnel } from './pitch/PlayerEntranceTunnel';
import { AthleticsTrack } from './track/AthleticsTrack';
import { AthleticsEventAprons } from './track/AthleticsEventAprons';
import { StadiumApron } from './track/StadiumApron';
import { TracksideSafetyRail } from './track/TracksideSafetyRail';
import { LightingStructures } from './roof/LightingStructures';
import { RoofTrusses } from './roof/RoofTrusses';
import { RoofMembraneDetails } from './roof/RoofMembraneDetails';
import { RoofCatwalk } from './roof/RoofCatwalk';
import { Scoreboards } from './roof/Scoreboards';
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
      <StadiumSite />
      <StadiumApron />
      <AthleticsEventAprons />
      <AthleticsTrack />
      <TracksideSafetyRail />
      <FootballPitch />
      <PlayerEntranceTunnel />
      <MatchPlayers />
      <TechnicalAreaPeople />
      <StadiumBowl />
      <SeatInstances />
      <StadiumCrowd />
      <VirageCrowd />
      <StadiumRoof />
      <RoofMembraneDetails />
      <RoofTrusses />
      <RoofCatwalk />
      <StructuralFrames />
      <Scoreboards />
      <Facade />
      <ExteriorColumns />
      <AccessRamps />
      <EntrancePlaza />
      <LightingStructures />
    </group>
  );
}
