import { useEffect, useMemo, useRef, useState } from 'react';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { heatmapColorValues } from '../sunlight/heatmapColors';
import type {
  HeatmapClassification,
  SunHeatmapResult,
} from '../sunlight/sunlightHeatmap.types';
import {
  buildExposureMapSections,
  createEllipticalSegmentPoints,
  type ExposureMapSection,
} from './stadiumExposureMapModel';

const classificationLabels: Record<HeatmapClassification, string> = {
  'mostly-sunny': 'Mostly sunny',
  'partially-sunny': 'Partly sunny',
  'mostly-shaded': 'Mostly shaded',
  'fully-shaded': 'Fully shaded',
};

const mapCenter = { x: 250, y: 170 };
const tierRadii = {
  lower: { innerX: 140, innerY: 76, outerX: 171, outerY: 105 },
  upper: { innerX: 178, innerY: 112, outerX: 216, outerY: 142 },
} as const;

function formatMinutes(minutes: number) {
  return `${Math.round(minutes)} min`;
}

function getSectionDescription(section: ExposureMapSection) {
  if (!section.classification) {
    return section.visitorClosed
      ? `${section.zoneLabel}, ${section.tierName}, section ${section.sectionNumber}: closed to visitors; no public exposure sample.`
      : `${section.zoneLabel}, ${section.tierName}, section ${section.sectionNumber}: no representative exposure sample.`;
  }

  return `${section.zoneLabel}, ${section.tierName}, section ${section.sectionNumber}: ${classificationLabels[section.classification]}, ${Math.round(section.exposedPercent)} percent exposed.`;
}

type StadiumExposureMapProps = {
  open: boolean;
  result: SunHeatmapResult;
  onClose: () => void;
};

export function StadiumExposureMap({
  open,
  result,
  onClose,
}: StadiumExposureMapProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sections = useMemo(
    () => buildExposureMapSections(result.cells, radesStadiumConfig),
    [result.cells],
  );
  const firstMappedSection = sections.find(
    (section) => section.classification !== null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState(
    firstMappedSection?.id ?? sections[0]?.id ?? '',
  );
  const selectedSection =
    sections.find((section) => section.id === selectedSectionId) ??
    firstMappedSection ??
    sections[0];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const northRadians =
    (radesStadiumConfig.identity.northRotationDegrees * Math.PI) / 180;
  const northBase = { x: 54, y: 274 };
  const northEnd = {
    x: northBase.x + Math.sin(northRadians) * 30,
    y: northBase.y + Math.cos(northRadians) * 30,
  };

  return (
    <dialog
      ref={dialogRef}
      className="exposure-map-dialog"
      aria-labelledby="exposure-map-title"
      onCancel={onClose}
      onClose={onClose}
    >
      <div className="exposure-map-dialog__header">
        <div>
          <p>Sun and shade / top view</p>
          <h2 id="exposure-map-title">Stadium exposure plan</h2>
          <span>
            {result.timeMode === 'instant'
              ? 'At the selected preview time'
              : 'Representative exposure across the whole match'}
          </span>
        </div>
        <button type="button" onClick={onClose} aria-label="Close exposure map">
          ×
        </button>
      </div>

      <div className="exposure-map-dialog__body">
        <div className="exposure-map-plan">
          <svg
            viewBox="0 0 500 340"
            role="group"
            aria-labelledby="exposure-map-svg-title exposure-map-svg-description"
          >
            <title id="exposure-map-svg-title">
              Clickable top-view sunlight exposure plan
            </title>
            <desc id="exposure-map-svg-description">
              Two stadium tiers surround the running track and football pitch.
              Select a colored section to read its exposure summary.
            </desc>

            <rect
              className="exposure-map-plan__ground"
              width="500"
              height="340"
            />
            <ellipse
              className="exposure-map-plan__track"
              cx={mapCenter.x}
              cy={mapCenter.y}
              rx="132"
              ry="70"
            />
            <ellipse
              className="exposure-map-plan__track-infield"
              cx={mapCenter.x}
              cy={mapCenter.y}
              rx="117"
              ry="55"
            />
            <rect
              className="exposure-map-plan__pitch"
              x="196"
              y="135"
              width="108"
              height="70"
              rx="1"
            />
            <line
              className="exposure-map-plan__pitch-line"
              x1="250"
              x2="250"
              y1="135"
              y2="205"
            />
            <circle
              className="exposure-map-plan__pitch-line"
              cx="250"
              cy="170"
              r="10"
            />
            <rect
              className="exposure-map-plan__pitch-line"
              x="196"
              y="151"
              width="18"
              height="38"
            />
            <rect
              className="exposure-map-plan__pitch-line"
              x="286"
              y="151"
              width="18"
              height="38"
            />

            {[...sections]
              .sort((left, right) =>
                left.tierId === right.tierId
                  ? 0
                  : left.tierId === 'upper'
                    ? -1
                    : 1,
              )
              .map((section) => {
                const tier = radesStadiumConfig.tiers.find(
                  (candidate) => candidate.id === section.tierId,
                );
                if (!tier) return null;
                const radii =
                  tier.id === 'upper' ? tierRadii.upper : tierRadii.lower;
                const sectionAngle = (Math.PI * 2) / tier.sectionCount;
                const gap = 0.012;
                const startAngle =
                  (section.sectionNumber - 1) * sectionAngle + gap;
                const endAngle = section.sectionNumber * sectionAngle - gap;
                const classification = section.classification;
                const label = getSectionDescription(section);

                return (
                  <polygon
                    key={section.id}
                    data-section-id={section.id}
                    className={`exposure-map-zone${selectedSection?.id === section.id ? ' exposure-map-zone--selected' : ''}${classification ? '' : ' exposure-map-zone--unavailable'}`}
                    points={createEllipticalSegmentPoints({
                      centerX: mapCenter.x,
                      centerY: mapCenter.y,
                      innerRadiusX: radii.innerX,
                      innerRadiusY: radii.innerY,
                      outerRadiusX: radii.outerX,
                      outerRadiusY: radii.outerY,
                      startAngle,
                      endAngle,
                    })}
                    fill={
                      classification
                        ? heatmapColorValues[classification]
                        : undefined
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    aria-pressed={selectedSection?.id === section.id}
                    onClick={() => setSelectedSectionId(section.id)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      setSelectedSectionId(section.id);
                    }}
                  >
                    <title>{label}</title>
                  </polygon>
                );
              })}

            <g className="exposure-map-plan__north" aria-label="True north">
              <line
                x1={northBase.x}
                y1={northBase.y}
                x2={northEnd.x}
                y2={northEnd.y}
              />
              <circle cx={northEnd.x} cy={northEnd.y} r="3" />
              <text x={northEnd.x + 6} y={northEnd.y - 5}>
                N
              </text>
            </g>
          </svg>
          <p>
            Schematic plan aligned to the configured stadium orientation. It is
            an exposure aid, not a surveyed seating chart.
          </p>
        </div>

        <aside className="exposure-map-detail" aria-live="polite">
          {selectedSection && (
            <>
              <p>
                {selectedSection.zoneLabel} · {selectedSection.tierName}
              </p>
              <h3>Section {selectedSection.sectionNumber}</h3>
              {selectedSection.classification ? (
                <>
                  <strong>
                    {classificationLabels[selectedSection.classification]}
                  </strong>
                  <dl>
                    <div>
                      <dt>Exposed</dt>
                      <dd>{Math.round(selectedSection.exposedPercent)}%</dd>
                    </div>
                    <div>
                      <dt>Direct sun</dt>
                      <dd>{formatMinutes(selectedSection.directSunMinutes)}</dd>
                    </div>
                    <div>
                      <dt>Stadium shade</dt>
                      <dd>{formatMinutes(selectedSection.shadedMinutes)}</dd>
                    </div>
                    <div>
                      <dt>Samples</dt>
                      <dd>{selectedSection.samples.length}</dd>
                    </div>
                  </dl>
                  {result.resolution === 'row' && (
                    <div className="exposure-map-detail__rows">
                      <span>Representative rows</span>
                      <div>
                        {selectedSection.samples.map((sample) => (
                          <i
                            key={sample.key}
                            style={{
                              background:
                                heatmapColorValues[sample.classification],
                            }}
                            title={`Row ${sample.rowNumber}: ${classificationLabels[sample.classification]}`}
                          >
                            {sample.rowNumber}
                          </i>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="exposure-map-detail__unavailable">
                  {selectedSection.visitorClosed
                    ? 'Closed to visitors. No public POV or exposure sample is calculated.'
                    : 'No representative sample is available for this section.'}
                </p>
              )}
            </>
          )}
        </aside>
      </div>

      <ul className="exposure-map-legend" aria-label="Exposure map legend">
        {Object.entries(classificationLabels).map(([classification, label]) => (
          <li key={classification}>
            <i
              style={{
                background:
                  heatmapColorValues[classification as HeatmapClassification],
              }}
            />
            {label}
          </li>
        ))}
        <li>
          <i className="exposure-map-legend__unavailable" />
          Unavailable
        </li>
      </ul>
    </dialog>
  );
}
