import { useStadiumStore } from '../state/useStadiumStore';
import { CreatorLinks } from './CreatorLinks';
import { InteriorViewSelector } from './InteriorViewSelector';
import { MatchTimeControls } from './MatchTimeControls';
import { QualityControls } from './QualityControls';
import { SeatInformation } from './SeatInformation';
import { SeatSelector } from './SeatSelector';
import { SectionSelector } from './SectionSelector';
import { SunExposureTimeline } from './SunExposureTimeline';
import { SunHeatmapPanel } from './SunHeatmapPanel';
import { WeatherPanel } from './WeatherPanel';

export function StadiumSidebar() {
  const cameraMode = useStadiumStore((state) => state.cameraMode);
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const showDebugGuides = useStadiumStore((state) => state.showDebugGuides);
  const toggleDebugGuides = useStadiumStore((state) => state.toggleDebugGuides);
  const returnToOverview = useStadiumStore((state) => state.returnToOverview);

  return (
    <aside className="stadium-sidebar" aria-label="Stadium controls">
      <header className="brand">
        <div className="brand__mark" aria-hidden="true">
          R
        </div>
        <div>
          <h1>Radès View</h1>
          <p className="brand__eyebrow">Hammadi-Agrebi Stadium</p>
        </div>
        <span className="brand__status">Preview model</span>
      </header>

      <nav className="journey-progress" aria-label="Seat view steps">
        <div
          className={
            matchStartIso ? 'journey-step journey-step--done' : 'journey-step'
          }
        >
          <span>1</span>
          <div>
            <strong>Match</strong>
            <small>{matchStartIso ? 'Time selected' : 'Choose time'}</small>
          </div>
        </div>
        <i />
        <div
          className={
            selectedSectionId
              ? 'journey-step journey-step--done'
              : 'journey-step journey-step--active'
          }
        >
          <span>2</span>
          <div>
            <strong>View</strong>
            <small>
              {selectedSectionId ? 'Place selected' : 'Choose a place'}
            </small>
          </div>
        </div>
      </nav>

      <MatchTimeControls />

      <section className="control-section" aria-labelledby="explore-title">
        <div className="section-heading">
          <div>
            <span>Step 2</span>
            <h2 id="explore-title">Choose your place</h2>
          </div>
          <p>Pick a stand, then refine the row and seat.</p>
        </div>
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
            Back to stadium overview
          </button>
        )}
      </section>

      <section
        className="control-section conditions-section"
        aria-labelledby="conditions-title"
      >
        <div className="section-heading">
          <div>
            <span>Automatic</span>
            <h2 id="conditions-title">Match conditions</h2>
          </div>
          <p>Weather and sunlight update from the selected time.</p>
        </div>
        <WeatherPanel />
        <SunExposureTimeline />
        <SunHeatmapPanel />
      </section>

      <details className="advanced-controls">
        <summary>View and performance settings</summary>
        <div>
          <InteriorViewSelector />
          <QualityControls />
          <button
            className="mode-button"
            type="button"
            onClick={toggleDebugGuides}
          >
            <span>
              <strong>Technical guides</strong>
              <small>Axes and geographic orientation</small>
            </span>
            <span className="mode-state">{showDebugGuides ? 'On' : 'Off'}</span>
          </button>
        </div>
      </details>

      <footer className="sidebar-footer">
        <CreatorLinks />
        <strong>Procedural approximation</strong>
        <p>
          Sun position is geographic. Stadium dimensions and shadow boundaries
          remain calibrated estimates until surveyed measurements are available.
        </p>
      </footer>
    </aside>
  );
}
