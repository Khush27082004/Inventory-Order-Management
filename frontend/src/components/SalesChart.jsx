import React, { useState } from 'react';

export default function SalesChart({ data = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
        No sales transaction data recorded for this window.
      </div>
    );
  }

  const width = 640;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const revenues = data.map((d) => d.revenue);
  const maxRevenue = Math.max(...revenues, 500);
  const minRevenue = 0;

  const getX = (index) => {
    return paddingX + (index * (width - 2 * paddingX)) / (data.length - 1 || 1);
  };

  const getY = (val) => {
    return height - paddingY - ((val - minRevenue) / (maxRevenue - minRevenue || 1)) * (height - 2 * paddingY);
  };

  // Build smooth bezier curve
  let pathD = `M ${getX(0)} ${getY(data[0].revenue)}`;
  for (let i = 0; i < data.length - 1; i++) {
    const x0 = getX(i);
    const y0 = getY(data[i].revenue);
    const x1 = getX(i + 1);
    const y1 = getY(data[i + 1].revenue);
    const mx = (x0 + x1) / 2;
    pathD += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }

  // Gradient fill area
  const areaD = `${pathD} L ${getX(data.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = height - paddingY - pct * (height - 2 * paddingY);
          const val = Math.round(pct * maxRevenue);
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                fill="var(--text-dim)"
                fontSize="10"
                textAnchor="end"
                fontFamily="JetBrains Mono"
              >
                ${val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#salesGrad)" />

        {/* Main Line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.revenue);
          const isHovered = hoveredPoint?.index === i;
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill="#0a0e17"
                stroke="#6366f1"
                strokeWidth={isHovered ? 3 : 2}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredPoint({ ...d, index: i, cx, cy })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Day label */}
              <text
                x={cx}
                y={height - 10}
                fill="var(--text-muted)"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
              >
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredPoint && (
        <div style={{
          position: 'absolute',
          left: `${(hoveredPoint.cx / width) * 100}%`,
          top: `${(hoveredPoint.cy / height) * 100}%`,
          transform: 'translate(-50%, -125%)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          boxShadow: 'var(--shadow-md)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hoveredPoint.date} ({hoveredPoint.day})
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }} className="font-mono">
            ${hoveredPoint.revenue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            {hoveredPoint.orders} {hoveredPoint.orders === 1 ? 'order' : 'orders'}
          </div>
        </div>
      )}
    </div>
  );
}
