

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

    if (numSides === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500">Sem dados para exibir.</div>;
    }

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
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: '#f97316'}}></span>Discordo P.</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: '#eab308'}}></span>Neutro</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: '#84cc16'}}></span>Concordo P.</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-1.5" style={{backgroundColor: '#22c55e'}}></span>Concordo T.</div>
            </div>
        </div>
    );
};

// --- Line Chart (Multi & Single Line compatible) ---
type SingleLineChartData = { labels: string[]; data: (number | null)[] };
type MultiLineChartData = {
    labels: string[];
    datasets: {
        label: string;
        data: (number | null)[];
        color: string;
    }[];
};
type LineChartProps = {
    chartData: SingleLineChartData | MultiLineChartData;
    yMin?: number;
    yMax?: number;
    yAxisLabels?: number[];
};

const createPathWithGaps = (
    data: (number | null)[],
    xPoint: (i: number) => number,
    yPoint: (value: number) => number
): string => {
    let path = '';
    let currentSegment = '';
    data.forEach((d, i) => {
        if (d !== null) {
            if (currentSegment === '') {
                currentSegment += `M ${xPoint(i)} ${yPoint(d)}`;
            } else {
                currentSegment += ` L ${xPoint(i)} ${yPoint(d)}`;
            }
        } else {
            if (currentSegment !== '') {
                path += currentSegment;
                currentSegment = '';
            }
        }
    });
    if (currentSegment !== '') path += currentSegment;
    return path;
};

export const LineChart: React.FC<LineChartProps> = ({ chartData, yMin: yMinProp, yMax: yMaxProp, yAxisLabels: yAxisLabelsProp }) => {
    const width = 600;
    const height = 300;
    const padding = 40;
    
    const isMulti = 'datasets' in chartData;
    const datasets = isMulti ? chartData.datasets : [{ label: '', data: chartData.data, color: '#3b82f6' }];
    const labels = chartData.labels;

    if (!labels || labels.length < 2 || datasets.every(ds => ds.data.filter(d => d !== null).length < 2)) {
        return <div className="text-center text-slate-500 h-[300px] flex items-center justify-center">Dados insuficientes para exibir a evolução.</div>;
    }
    
    const allDataPoints = datasets.flatMap(ds => ds.data).filter((d): d is number => d !== null);
    const dataMax = allDataPoints.length > 0 ? Math.max(...allDataPoints) : 100;
    const dataMin = allDataPoints.length > 0 ? Math.min(...allDataPoints) : 0;

    const yMax = yMaxProp ?? dataMax;
    const yMin = yMinProp ?? (dataMin >= 0 ? 0 : dataMin);
    const yAxisLabels = yAxisLabelsProp ?? [0, 25, 50, 75, 100];
    
    const xPoint = (i: number) => padding + (i / (labels.length - 1)) * (width - 2 * padding);
    const yPoint = (value: number) => height - padding - ((value - yMin) / (yMax - yMin)) * (height - 2 * padding);
    
    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[600px]">
                    {/* Y-axis lines and labels */}
                    {yAxisLabels.map(val => (
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

                    {/* Data Lines and Points */}
                    {datasets.map((dataset) => {
                        const path = createPathWithGaps(dataset.data, xPoint, yPoint);
                        return (
                            <g key={dataset.label}>
                                <path d={path} fill="none" stroke={dataset.color} strokeWidth="2" />
                                {dataset.data.map((d, i) => (
                                    d !== null && <circle key={i} cx={xPoint(i)} cy={yPoint(d)} r="4" fill={dataset.color} />
                                ))}
                            </g>
                        );
                    })}
                </svg>
            </div>
            
            {isMulti && datasets.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-4 text-sm">
                    {datasets.map(ds => (
                        <div key={ds.label} className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: ds.color }}></span>
                            <span className="text-slate-600">{ds.label}</span>
                        </div>
                    ))}
                </div>
            )}
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

// --- Maturity Progress Bar ---
export const MaturityProgressBar: React.FC<{ level: string }> = ({ level }) => {
    const levels = ['M1', 'M2', 'M3', 'M4', 'M5'];
    const currentIndex = levels.indexOf(level);
    const progress = currentIndex >= 0 ? ((currentIndex + 1) / levels.length) * 100 : 0;
  
    return (
      <div className="w-full mt-2">
        <div className="relative h-2 bg-slate-200 rounded-full">
          <div
            className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full"
            style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          {levels.map((l) => (
            <span key={l} className={l === level ? 'font-bold text-blue-600' : ''}>
              {l}
            </span>
          ))}
        </div>
      </div>
    );
  };
  
  // --- Stacked Bar Chart ---
  type StackedBarData = {
    label: string;
    values: { value: number; color: string; tooltip: string }[];
  };
  
  export const StackedBarChart: React.FC<{ data: StackedBarData[] }> = ({ data }) => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="text-sm font-medium text-slate-700 mb-1">{item.label}</div>
          <div className="w-full flex h-6 rounded-md overflow-hidden bg-slate-200">
            {item.values.map((segment, segIndex) => (
              <div
                key={segIndex}
                className="h-full"
                style={{ width: `${segment.value}%`, backgroundColor: segment.color }}
                title={segment.tooltip}
              ></div>
            ))}
          </div>
        </div>
      ))}
       <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2 text-xs text-slate-600">
          <div className="flex items-center"><span className="w-3 h-3 rounded-sm mr-1.5 bg-red-500"></span>Risco Alto</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-sm mr-1.5 bg-yellow-500"></span>Risco Moderado</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-sm mr-1.5 bg-green-500"></span>Risco Baixo</div>
      </div>
    </div>
  );
  
// --- Thermometer Chart ---
export const ThermometerChart: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = (value / max) * 100;
    const getColor = (p: number) => {
        if (p > 70) return 'bg-green-500'; // > 3.5
        if (p > 50) return 'bg-yellow-500'; // > 2.5
        return 'bg-red-500'; // <= 2.5
    };

    return (
        <div className="flex items-center justify-center h-28">
            <div className="relative w-6 h-full bg-slate-200 rounded-full border-2 border-slate-300">
                <div 
                    className={`absolute bottom-0 left-0 w-full rounded-full ${getColor(percentage)}`}
                    style={{ height: `${percentage}%`, transition: 'height 0.5s ease-in-out' }}
                />
            </div>
             <div className="ml-2 text-center">
                <div className="text-2xl font-bold text-slate-800">{value.toFixed(1)}</div>
                <div className="text-sm text-slate-500">/ {max.toFixed(1)}</div>
            </div>
        </div>
    );
};

// --- Donut Chart ---
export const DonutChart: React.FC<{ value: number; color: string }> = ({ value, color }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * (radius - 10);
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-slate-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                />
                <circle
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke={color}
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            <span className="absolute text-2xl font-bold text-slate-800">{value}%</span>
        </div>
    );
};