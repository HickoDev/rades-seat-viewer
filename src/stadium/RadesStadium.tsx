import { radesStadiumConfig } from './config/radesStadiumConfig';

/**
 * Milestone 1 scene boundary. Procedural pitch, track, bowl, roof, exterior,
 * and seat modules will be composed inside this stable group in later work.
 */
export function RadesStadium() {
  return (
    <group
      name="rades-stadium"
      userData={{
        configVersion: radesStadiumConfig.version,
        implementationStatus: 'foundation',
      }}
    />
  );
}
