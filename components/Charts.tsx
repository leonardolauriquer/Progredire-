
import React from 'react';

// --- Gauge Chart ---
export const GaugeChart: React.FC<{ score: number }> = ({ score }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const arcLength = (score / 100) * circumference;
  
    const getScoreColor = (s: number) => {
        if (s >= 75) return '#22c55e'; // green-500
        if (s >= 50) return '#eab308'; // yellow-500
        if (s >= 25) return '#f97316'; // orange-500
        return '#ef4444'; // red-500
    };
  
    const color = getScoreColor(score);
  
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <svg viewBox="0 0 200 120" className="w-full h-auto max-h-48">
          {/* Background Arc */}
          <path
            d={`M 20 100 A ${radius} ${radius} 0 0 1 180 100`}
            fill="none"
            stroke="#e2e8f0" // slate-200
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Foreground Arc */}
          <path
            d={`M 20 100 A ${radius} ${radius} 0 0 1 180 100`}
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
          />
          {/* Text */}
          <text
            x="100"
            y="90"
            textAnchor="middle"
            fontSize="36"
            fontWeight="bold"
            fill="#1e293b" // slate-800
          >
            {score}
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            fontSize="14"
            fill="#64748b" // slate-500
          >
            / 100
          </text>
        </svg>
      </div>
    );
  };
  
// --- Radar Chart ---
interface RadarChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
    }[];
}

export const RadarChart: React.FC<{ data: RadarChartData }> = ({ data }) => {
    const size = 250;
    const center = size / 2;
    const numSides = data.labels.length;

    const points = (values: number[]) => {
        return values.map((value, i) => {
            const angle = (Math.PI * 2 * i) / numSides - Math.PI / 2;
            const r = (value / 100) * (center * 0.8);
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        }).join(' ');
    };

    const axisPoints = Array.from({ length: numSides }, (_, i) => {
        const angle = (Math.PI * 2 * i) / numSides - Math.PI / 2;
        const r = center * 0.8;
        return {
            x2: center + r * Math.cos(angle),
            y2: center + r * Math.sin(angle),
        };
    });

    const labelPoints = Array.from({ length: numSides }, (_, i) => {
        const angle = (Math.PI * 2 * i) / numSides - Math.PI / 2;
        const r = center * 0.95;
        const cosAngle = Math.cos(angle);
        
        let textAnchor: 'start' | 'middle' | 'end';

        // Fix: Correctly determine text-anchor based on the label's position.
        // This resolves the TypeScript error by providing a specific type and improves UX by correctly aligning labels.
        // Use a small epsilon to check for vertical alignment (top/bottom).
        if (Math.abs(cosAngle) < 1e-9) {
            textAnchor = 'middle';
        } else if (cosAngle > 0) { // Right side of the chart
            textAnchor = 'start';
        } else { // Left side of the chart
            textAnchor = 'end';
        }
        
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
            textAnchor: textAnchor,
        };
    });

    const webLines = [25, 50, 75, 100];

    return (
        <div className="flex flex-col items-center h-full">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-h-64">
                {/* Web Lines */}
                {webLines.map(value => (
                    <polygon
                        key={value}
                        points={points(Array(numSides).fill(value))}
                        fill="none"
                        stroke="#cbd5e1" // slate-300
                        strokeWidth="0.5"
                    />
                ))}
                
                {/* Axes */}
                {axisPoints.map((p, i) => (
                    <line key={i} x1={center} y1={center} x2={p.x2} y2={p.y2} stroke="#e2e8f0" strokeWidth="0.5" />
                ))}

                {/* Data Polygons */}
                {data.datasets.map((dataset, i) => (
                    <polygon
                        key={i}
                        points={points(dataset.data)}
                        fill={dataset.backgroundColor}
                        stroke={dataset.borderColor}
                        strokeWidth="2"
                    />
                ))}
                
                 {/* Labels */}
                {labelPoints.map((p, i) => (
                    <text key={i} x={p.x} y={p.y} textAnchor={p.textAnchor} fontSize="8" fill="#475569">
                        {data.labels[i]}
                    </text>
                ))}
            </svg>
            <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
                {data.datasets.map(ds => (
                    <div key={ds.label} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: ds.borderColor }}></span>
                        <span>{ds.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Distribution Chart ---
interface DistributionData {
    name: string;
    value: number;
    color: string;
}

export const DistributionChart: React.FC<{ data: DistributionData[] }> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="text-center text-slate-500 py-8">Sem dados de distribuição para este fator.</div>;
    }
    return (
        <div className="space-y-4">
            <div className="w-full flex h-8 rounded-full overflow-hidden bg-slate-200">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="h-full"
                        style={{ width: `${item.value}%`, backgroundColor: item.color, transition: 'width 0.5s ease-in-out' }}
                        title={`${item.name}: ${item.value.toFixed(1)}%`}
                    ></div>
                ))}
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-600">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: '#ef4444'}}></span>Discordo T.</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: '#f97316'}}></span>Discordo</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: '#eab308'}}></span>Neutro</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: '#84cc16'}}></span>Concordo</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: '#22c55e'}}></span>Concordo T.</div>
            </div>
        </div>
    );
};

// --- Line Chart ---
interface LineChartData {
    labels: string[];
    data: number[];
}

export const LineChart: React.FC<{ chartData: LineChartData }> = ({ chartData }) => {
    const width = 600;
    const height = 300;
    const padding = 40;

    if (!chartData || chartData.data.length < 2) {
        return <div className="text-center text-slate-500 h-[300px] flex items-center justify-center">Dados insuficientes para exibir a evolução.</div>;
    }

    const data = chartData.data;
    const labels = chartData.labels;

    const yMax = 100;
    const yMin = 0;
    
    const xPoint = (i: number) => padding + (i / (data.length - 1)) * (width - 2 * padding);
    const yPoint = (value: number) => height - padding - ((value - yMin) / (yMax - yMin)) * (height - 2 * padding);
    
    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPoint(i)} ${yPoint(d)}`).join(' ');

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[600px]">
                {/* Y-axis lines and labels */}
                {[0, 25, 50, 75, 100].map(val => (
                    <g key={val}>
                        <line
                            x1={padding}
                            y1={yPoint(val)}
                            x2={width - padding}
                            y2={yPoint(val)}
                            stroke="#e2e8f0"
                            strokeDasharray="2,4"
                        />
                        <text x={padding - 10} y={yPoint(val) + 5} textAnchor="end" fontSize="10" fill="#64748b">
                            {val}
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                {labels.map((label, i) => (
                    <text key={i} x={xPoint(i)} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#64748b">
                        {label}
                    </text>
                ))}

                {/* Line */}
                <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" />
                
                {/* Points */}
                {data.map((d, i) => (
                    <circle key={i} cx={xPoint(i)} cy={yPoint(d)} r="4" fill="#3b82f6" />
                ))}
            </svg>
        </div>
    );
};

// --- Sparkline Chart ---
export const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const width = 100;
    const height = 25;
    const padding = 2;

    if (!data || data.length < 2) {
        return <div className="w-[100px] h-[25px]" />;
    }

    const yMax = 100;
    const yMin = 0;
    
    const xPoint = (i: number) => (i / (data.length - 1)) * (width - 2 * padding) + padding;
    const yPoint = (value: number) => height - padding - ((value - yMin) / (yMax - yMin)) * (height - 2 * padding);
    
    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPoint(i)} ${yPoint(d)}`).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-[100px] h-[25px]">
            <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
    );
};
