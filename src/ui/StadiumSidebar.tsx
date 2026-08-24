import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';
import { SectionSelector } from './SectionSelector';
import { SeatInformation } from './SeatInformation';
import { SeatSelector } from './SeatSelector';
import { MatchTimeControls } from './MatchTimeControls';
import { SunExposureTimeline } from './SunExposureTimeline';

export function StadiumSidebar() {
  const cameraMode = useStadiumStore((state) => state.cameraMode);
  const showDebugGuides = useStadiumStore((state) => state.showDebugGuides);
  const toggleDebugGuides = useStadiumStore((state) => state.toggleDebugGuides);
  const returnToOverview = useStadiumStore((state) => state.returnToOverview);

  return (
    <aside className="stadium-sidebar" aria-label="Stadium controls">
      <header className="brand">
        <div className="brand__mark" aria-hidden="true">
          RV
        </div>
        <div>
          <p className="brand__eyebrow">Radès, Tunisia</p>
          <h1>Radès View</h1>
        </div>
      </header>

      <section className="intro-card" aria-labelledby="stadium-title">
        <div className="intro-card__tag">
          <span className="status-dot" aria-hidden="true" />
          Procedural model · Sun simulation online
        </div>
        <h2 id="stadium-title">{radesStadiumConfig.identity.name}</h2>
        <p>
          An interactive seat-view and sunlight simulator, beginning with a
          calibrated procedural stadium model.
        </p>
      </section>

      <section className="control-section" aria-labelledby="explore-title">
        <div className="section-heading">
          <span>01</span>
          <h2 id="explore-title">Explore</h2>
        </div>
        <button className="mode-button mode-button--active" type="button">
          <span>
            <strong>Stadium overview</strong>
            <small>Orbit the future stadium model</small>
          </span>
          <span className="mode-pill">{cameraMode}</span>
        </button>
        <SectionSelector />
        <SeatSelector />
        <SeatInformation />
        {cameraMode !== 'overview' && (
          <button
            className="back-button"
            type="button"
            onClick={returnToOverview}
          >
            <span aria-hidden="true">←</span>
            Back to stadium
          </button>
        )}
        <button
          className="mode-button"
          type="button"
          onClick={toggleDebugGuides}
        >
          <span>
            <strong>Debug guides</strong>
            <small>Scene axes and geographic orientation</small>
          </span>
          <span className={showDebugGuides ? 'mode-pill' : 'mode-state'}>
            {showDebugGuides ? 'On' : 'Off'}
          </span>
        </button>
      </section>

      <section className="control-section" aria-labelledby="simulation-title">
        <div className="section-heading">
          <span>02</span>
          <h2 id="simulation-title">Match conditions</h2>
        </div>
        <MatchTimeControls />
        <SunExposureTimeline />
      </section>

      <footer className="sidebar-footer">
        <div>
          <span>Model status</span>
          <strong>Config estimates</strong>
        </div>
        <p>
          Pitch 105 × 68 m · 64 structural frames
          <br />
          Track, bowl, roof, coordinates, and north rotation require
          calibration.
        </p>
      </footer>
    </aside>
  );
}
