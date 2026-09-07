import React from 'react';

export default function RadarChart({ competencies }) {
  const size = 560;
  const height = 480;
  const cx = size / 2;
  const cy = height / 2 - 10;
  const radius = 150;
  const numAxes = competencies.length;

  // Helper to calculate coordinates
  const getCoordinates = (index, valuePercent, customRadius = radius) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / numAxes;
    const r = (valuePercent / 100) * customRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric octagonal web grid rings (25%, 50%, 75%, 100%)
  const gridRings = [0.25, 0.5, 0.75, 1.0];

  // Polygon points for User Profile
  const profilePoints = competencies
    .map((c, i) => {
      const { x, y } = getCoordinates(i, c.profile);
      return `${x},${y}`;
    })
    .join(' ');

  // Polygon points for Benchmark
  const benchmarkPoints = competencies
    .map((c, i) => {
      const { x, y } = getCoordinates(i, c.benchmark);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="radar-chart-container">
      <svg
        viewBox={`0 0 ${size} ${height}`}
        className="radar-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle gradient fill for your profile */}
          <radialGradient id="radarProfileGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.15" />
          </radialGradient>
        </defs>

        {/* 1. Concentric Guide Rings */}
        {gridRings.map((fraction, idx) => {
          const points = Array.from({ length: numAxes })
            .map((_, i) => {
              const { x, y } = getCoordinates(i, 100, radius * fraction);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={`ring-${idx}`}
              points={points}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="1"
              strokeDasharray={idx < 3 ? '2 2' : 'none'}
            />
          );
        })}

        {/* 2. Radial Axis Lines */}
        {competencies.map((_, i) => {
          const outer = getCoordinates(i, 100, radius);
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--border-subtle)"
              strokeWidth="1"
            />
          );
        })}

        {/* 3. Role Benchmark Polygon (Dashed outline) */}
        <polygon
          points={benchmarkPoints}
          fill="none"
          stroke="#475569"
          strokeWidth="1.75"
          strokeDasharray="4 4"
          className="benchmark-polygon"
        />

        {/* 4. User Profile Polygon (Translucent mint fill + solid stroke) */}
        <polygon
          points={profilePoints}
          fill="url(#radarProfileGrad)"
          stroke="#0d9488"
          strokeWidth="2.2"
          className="profile-polygon"
        />

        {/* 5. Data Points for Profile */}
        {competencies.map((c, i) => {
          const { x, y } = getCoordinates(i, c.profile);
          return (
            <circle
              key={`profile-pt-${i}`}
              cx={x}
              cy={y}
              r="3.5"
              fill="#0d9488"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* 6. Axis Labels */}
        {competencies.map((c, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
          // Offset text based on position
          const labelDist = radius + 34;
          const lx = cx + labelDist * Math.cos(angle);
          const ly = cy + labelDist * Math.sin(angle);

          let anchor = 'middle';
          if (Math.cos(angle) > 0.3) anchor = 'start';
          else if (Math.cos(angle) < -0.3) anchor = 'end';

          const lines = c.name.split('\n');

          return (
            <text
              key={`label-${i}`}
              x={lx}
              y={ly - (lines.length - 1) * 6}
              textAnchor={anchor}
              className="radar-label"
            >
              {lines.map((line, lIdx) => (
                <tspan
                  key={lIdx}
                  x={lx}
                  dy={lIdx === 0 ? 0 : 13}
                  textAnchor={anchor}
                >
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="radar-legend">
        <div className="legend-item">
          <span className="legend-line profile-line"></span>
          <span className="legend-text">Your Profile</span>
        </div>
        <div className="legend-item">
          <span className="legend-line benchmark-line"></span>
          <span className="legend-text">Role Benchmark</span>
        </div>
      </div>
    </div>
  );
}
