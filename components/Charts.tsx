import React, { useState } from 'react';
import type { PotentialAnalysisData } from '../services/dataService';

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
                            <text x={padding - 10} y={yPoint(val) + 5} textAnchor="end" fontSize="11" fill="#475569" fontWeight="500">
                                {val}
                            </text>
                        </g>
                    ))}

                    {/* X-axis labels */}
                    {labels.map((label, i) => (
                        <text key={i} x={xPoint(i)} y={height - padding + 20} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="500">
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
                                    d !== null && (
                                        <g key={i}>
                                            <title>{`${dataset.label ? `${dataset.label} - ` : ''}${labels[i]}: ${d.toFixed(1)}`}</title>
                                            <circle cx={xPoint(i)} cy={yPoint(d)} r="4" fill={dataset.color} />
                                        </g>
                                    )
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

// --- Column Chart ---
type ColumnChartData = {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string | string[];
    }[];
};

export const ColumnChart: React.FC<{ data: ColumnChartData, yAxisLabel?: string }> = ({ data, yAxisLabel }) => {
    const width = 500, height = 300;
    const padding = { top: 30, right: 20, bottom: 40, left: 65 }; 
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const allData = data.datasets.flatMap(ds => ds.data);
    const maxValue = allData.length > 0 ? Math.max(...allData, 0) * 1.15 : 1;
    const yAxisValues = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];
    
    const yPoint = (value: number) => padding.top + chartHeight - Math.max(0, (value / maxValue) * chartHeight);

    return (
        <div className="w-full h-full">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                {/* Y-Axis */}
                <g>
                    {yAxisValues.map((val, i) => (
                        <g key={i}>
                            <text x={padding.left - 8} y={yPoint(val)} textAnchor="end" fontSize="11" fill="#475569" fontWeight="500" dy="3">
                                {val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' })}
                            </text>
                            <line x1={padding.left} y1={yPoint(val)} x2={width - padding.right} y2={yPoint(val)} stroke="#e2e8f0" strokeDasharray="2" />
                        </g>
                    ))}
                    {yAxisLabel && (
                        <text x="15" y={padding.top + chartHeight / 2} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="500" transform={`rotate(-90 15 ${padding.top + chartHeight / 2})`}>{yAxisLabel}</text>
                    )}
                </g>
                
                {/* X-Axis */}
                <g>
                    {data.labels.map((label, i) => (
                        <text key={i} x={padding.left + (chartWidth / data.labels.length) * (i + 0.5)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="500">{label}</text>
                    ))}
                </g>
                
                {/* Bars */}
                {data.datasets.map(dataset => 
                    dataset.data.map((value, i) => {
                        const barHeight = Math.max(0, (value / maxValue) * chartHeight);
                        const barWidth = Math.min(50, (chartWidth / data.labels.length) * 0.6);
                        const x = padding.left + (chartWidth / data.labels.length) * (i + 0.5) - (barWidth / 2);
                        const y = yPoint(value);
                        const barColor = Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[i] || '#3b82f6' : dataset.backgroundColor;
                        return (
                             <g key={i}>
                                <title>{`${dataset.label} - ${data.labels[i]}: ${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</title>
                                <rect x={x} y={y} width={barWidth} height={barHeight} fill={barColor} rx="4" />
                                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">
                                    {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' })}
                                </text>
                             </g>
                        );
                    })
                )}
            </svg>
        </div>
    );
};

// --- Bubble Scatter Chart ---
type BubbleData = { x: number; y: number; z: number; label: string; };
export const BubbleScatterChart: React.FC<{ data: BubbleData[], xAxisLabel: string; yAxisLabel: string; }> = ({ data, xAxisLabel, yAxisLabel }) => {
    const [hoveredBubble, setHoveredBubble] = useState<BubbleData | null>(null);

    const width = 500, height = 300, paddingX = 50, paddingY = 40;
    const xMax = Math.max(...data.map(d => d.x), 0) * 1.15;
    const yMax = Math.max(...data.map(d => d.y), 0) * 1.15;
    const zMax = Math.max(...data.map(d => d.z), 1);

    const x = (val: number) => paddingX + (val / xMax) * (width - paddingX * 2);
    const y = (val: number) => height - paddingY - (val / yMax) * (height - paddingY * 2);
    const r = (val: number) => 5 + (val / zMax) * 20;

    const tooltipPosition = (d: BubbleData) => {
        let tx = x(d.x);
        let ty = y(d.y) - r(d.z) - 10;
        
        if (ty < 10) ty = y(d.y) + r(d.z) + 10;
        if (tx > width - 100) tx = width - 100;
        if (tx < 10) tx = 10;

        return { x: tx, y: ty };
    }

    return (
        <div className="w-full relative" style={{ height: '300px' }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <linearGradient id="bubbleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'rgba(96, 165, 250, 1)' }} />
                        <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 1)' }} />
                    </linearGradient>
                    <filter id="bubbleShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.2" />
                    </filter>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                </defs>

                {Array.from({length: 5}).map((_, i) => (
                    <line key={`h-${i}`} x1={paddingX} y1={paddingY + i * ((height - 2*paddingY)/4)} x2={width - paddingX} y2={paddingY + i * ((height - 2*paddingY)/4)} stroke="#f1f5f9" strokeDasharray="3,5" />
                ))}
                {Array.from({length: 5}).map((_, i) => (
                    <line key={`v-${i}`} x1={paddingX + i * ((width - 2*paddingX)/4)} y1={paddingY} x2={paddingX + i * ((width - 2*paddingX)/4)} y2={height - paddingY} stroke="#f1f5f9" strokeDasharray="3,5" />
                ))}

                <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#94a3b8" markerEnd="url(#arrowhead)" />
                <line x1={paddingX} y1={height - paddingY} x2={paddingX} y2={paddingY} stroke="#94a3b8" markerEnd="url(#arrowhead)" />
                <text x={width/2} y={height-10} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="500">{xAxisLabel}</text>
                <text x={15} y={height/2} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="500" transform={`rotate(-90 15 ${height/2})`}>{yAxisLabel}</text>

                <g>
                    {data.map((d, i) => {
                        const abbreviatedLabel = d.label.length > 10 ? d.label.substring(0, 9) + '…' : d.label;
                        const isHovered = hoveredBubble?.label === d.label;
                        return (
                        <g 
                            key={i} 
                            onMouseEnter={() => setHoveredBubble(d)}
                            onMouseLeave={() => setHoveredBubble(null)}
                            style={{ 
                                transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
                                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                transformOrigin: `${x(d.x)}px ${y(d.y)}px`,
                                opacity: hoveredBubble && !isHovered ? 0.4 : 1,
                                cursor: 'pointer'
                             }}
                        >
                            <circle 
                                cx={x(d.x)} 
                                cy={y(d.y)} 
                                r={r(d.z)} 
                                fill="url(#bubbleGradient)" 
                                stroke="rgba(37, 99, 235, 1)" 
                                filter={isHovered ? "url(#bubbleShadow)" : ""}
                            />
                            <text
                                x={x(d.x)}
                                y={y(d.y)}
                                textAnchor="middle"
                                fontSize="9"
                                stroke="#ffffff"
                                strokeWidth="0.5em"
                                paintOrder="stroke"
                                dy=".3em"
                                className="pointer-events-none font-semibold"
                            >
                                {abbreviatedLabel}
                            </text>
                            <text 
                                x={x(d.x)} 
                                y={y(d.y)} 
                                textAnchor="middle" 
                                fontSize="9"
                                fill="#ffffff" 
                                dy=".3em" 
                                className="pointer-events-none font-semibold"
                            >
                                {abbreviatedLabel}
                            </text>
                        </g>
                    )})}
                </g>

                {hoveredBubble && (() => {
                    const pos = tooltipPosition(hoveredBubble);
                    const tooltipLines = [
                        hoveredBubble.label,
                        `${xAxisLabel}: ${hoveredBubble.x.toFixed(1)}`,
                        `${yAxisLabel}: ${hoveredBubble.y.toFixed(1)}`,
                        `Progresso: ${hoveredBubble.z}%`
                    ];
                    const tooltipWidth = Math.max(...tooltipLines.map(l => l.length)) * 6 + 20;
                    
                    return (
                        <g transform={`translate(${pos.x - tooltipWidth / 2}, ${pos.y - 70})`} style={{ pointerEvents: 'none', transition: 'opacity 0.2s', opacity: 1 }}>
                            <rect
                                x="0"
                                y="0"
                                width={tooltipWidth}
                                height="65"
                                rx="5"
                                fill="rgba(15, 23, 42, 0.85)"
                                stroke="rgba(255, 255, 255, 0.2)"
                            />
                            <text x={10} y="18" fontSize="11" fontWeight="bold" fill="#ffffff">{tooltipLines[0]}</text>
                            <text x={10} y="34" fontSize="10" fill="#cbd5e1">{tooltipLines[1]}</text>
                            <text x={10} y="47" fontSize="10" fill="#cbd5e1">{tooltipLines[2]}</text>
                            <text x={10} y="60" fontSize="10" fill="#cbd5e1">{tooltipLines[3]}</text>
                        </g>
                    );
                })()}
            </svg>
        </div>
    );
};

// --- Horizontal Bar Chart with Color Scale ---
type HorizontalBarData = {
    label: string;
    value: number;
    colorValue: number;
    sizeValue: number;
};

export const HorizontalBarChartWithColorScale: React.FC<{ 
    data: HorizontalBarData[]; 
    valueLabel: string; 
    colorValueLabel: string;
    colorScale: (value: number) => string;
}> = ({ data, valueLabel, colorValueLabel, colorScale }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500">Sem dados para exibir.</div>;
    }
    const width = 500, barHeight = 30, padding = { top: 30, right: 30, bottom: 40, left: 100 };
    const height = data.length * (barHeight + 10) + padding.top + padding.bottom;
    const xMax = Math.max(...data.map(d => d.value), 0) * 1.1 || 10;

    const x = (val: number) => padding.left + (val / xMax) * (width - padding.left - padding.right);
    const y = (i: number) => padding.top + i * (barHeight + 10);
    
    const legendItems = [
        { color: colorScale(1.5), label: 'Ruim (<2.5)' },
        { color: colorScale(3.0), label: 'Médio (2.5-3.4)' },
        { color: colorScale(4.5), label: 'Bom (>=3.5)' },
    ];

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="min-w-[500px]">
                    {/* X-axis */}
                    <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#94a3b8" />
                    {Array.from({length: 5}).map((_, i) => {
                        const val = (xMax / 4) * i;
                        return (
                            <g key={i}>
                                <text x={x(val)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="#475569">{val.toFixed(0)}%</text>
                            </g>
                        )
                    })}
                    <text x={padding.left + (width - padding.left - padding.right)/2} y={height-5} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="500">{valueLabel}</text>
                    
                    {/* Bars */}
                    {data.map((d, i) => (
                        <g key={d.label}>
                            <title>{`${d.label} | ${valueLabel}: ${d.value.toFixed(1)}% | ${colorValueLabel}: ${d.colorValue.toFixed(1)}/5.0 | Colaboradores: ${d.sizeValue}`}</title>
                            <text x={padding.left - 10} y={y(i) + barHeight / 2} textAnchor="end" fontSize="11" fill="#334155" dy="3" fontWeight="600">{d.label}</text>
                            <rect 
                                x={padding.left} 
                                y={y(i)} 
                                width={x(d.value) - padding.left} 
                                height={barHeight} 
                                fill={colorScale(d.colorValue)} 
                                rx="4"
                            />
                            <text 
                                x={x(d.value) - 8} 
                                y={y(i) + barHeight / 2} 
                                textAnchor="end" 
                                fontSize="11" 
                                fill="white" 
                                dy="4"
                                fontWeight="bold"
                                className="pointer-events-none"
                            >
                                {d.value.toFixed(1)}%
                            </text>
                            <text 
                                x={padding.left + 8} 
                                y={y(i) + barHeight / 2} 
                                textAnchor="start" 
                                fontSize="11" 
                                fill="white" 
                                dy="4"
                                className="pointer-events-none"
                            >
                                <tspan alignmentBaseline="middle" role="img" aria-label="Colaboradores">👥</tspan>
                                <tspan alignmentBaseline="middle"> {d.sizeValue}</tspan>
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
            <div className="flex justify-center flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-2">
                <span className="font-semibold text-slate-600">{colorValueLabel}:</span>
                {legendItems.map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm" style={{backgroundColor: item.color}}></span>
                        <span className="text-slate-500">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Heatmap Chart ---
type HeatmapData = { yLabels: string[]; xLabels: string[]; data: number[][]; };
export const HeatmapChart: React.FC<{ data: HeatmapData }> = ({ data }) => {
    const { yLabels, xLabels, data: matrix } = data;
    const cols = xLabels.length, rows = yLabels.length;
    const cellWidth = 90, cellHeight = 40, xOffset = 120, yOffset = 80;

    const getColor = (value: number) => { // score from 1 to 5
        if (value >= 4.0) return '#16a34a'; // green-700
        if (value >= 3.5) return '#22c55e'; // green-500
        if (value >= 2.5) return '#f59e0b'; // yellow-500
        if (value >= 1.5) return '#f97316'; // orange-500
        return '#ef4444'; // red-500
    };
    
    const legendItems = [
      { color: '#ef4444', label: '1.0-2.4 (Crítico)' },
      { color: '#f97316', label: '2.5-3.4 (Atenção)' },
      { color: '#f59e0b', label: '3.5-3.9 (Moderado)' },
      { color: '#22c55e', label: '4.0-5.0 (Saudável)' },
    ];

    return (
        <div>
            <div className="overflow-x-auto pb-4">
                <svg width={xOffset + cols * cellWidth} height={yOffset + rows * cellHeight}>
                    {/* X-Axis Labels (rotated) */}
                    {xLabels.map((label, i) => (
                        <text key={i} x={xOffset + i * cellWidth + cellWidth / 2} y={yOffset - 10} textAnchor="start" fontSize="11" fill="#475569" fontWeight="500" transform={`rotate(-45 ${xOffset + i * cellWidth + cellWidth / 2},${yOffset - 10})`}>
                            {label}
                        </text>
                    ))}
                    {/* Y-Axis Labels */}
                    {yLabels.map((label, i) => (
                        <text key={i} x={xOffset - 10} y={yOffset + i * cellHeight + cellHeight / 2} textAnchor="end" fontSize="11" fill="#475569" dy="3" fontWeight="500">
                            {label}
                        </text>
                    ))}
                    {/* Cells */}
                    {matrix.map((row, i) => 
                        row.map((value, j) => (
                            <g key={`${i}-${j}`}>
                                <title>{`${yLabels[i]} - ${xLabels[j]}: ${value.toFixed(1)}`}</title>
                                <rect
                                    x={xOffset + j * cellWidth}
                                    y={yOffset + i * cellHeight}
                                    width={cellWidth}
                                    height={cellHeight}
                                    fill={getColor(value)}
                                    stroke="#fff"
                                    strokeWidth="2"
                                    rx="4"
                                />
                                <text
                                    x={xOffset + j * cellWidth + cellWidth / 2}
                                    y={yOffset + i * cellHeight + cellHeight / 2}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill="#fff"
                                    dy="4"
                                    fontWeight="bold"
                                    className="pointer-events-none"
                                >
                                    {value.toFixed(1)}
                                </text>
                            </g>
                        ))
                    )}
                </svg>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2 text-xs text-slate-600">
                {legendItems.map(item => (
                    <div key={item.label} className="flex items-center">
                        <span className="w-3 h-3 rounded-sm mr-1.5" style={{backgroundColor: item.color}}></span>{item.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Potential Analysis Chart ---
export const PotentialAnalysisChart: React.FC<{ data: PotentialAnalysisData }> = ({ data }) => {
    const { totalCost, scenarios } = data;

    const chartData: ColumnChartData = {
        labels: ['Custo Total', ...scenarios.map(s => s.label.replace('Economia com redução de ', 'Redução de '))],
        datasets: [{
            label: 'Valor (R$)',
            data: [totalCost, ...scenarios.map(s => s.value)],
            backgroundColor: ['#ef4444', ...scenarios.map(() => '#22c55e')],
        }]
    };

    return <ColumnChart data={chartData} />;
};

// --- Actions Impact Chart ---
const interpolateColor = (value: number, min: number, max: number, startColor: [number, number, number], endColor: [number, number, number]): string => {
    if (value < min) value = min;
    if (value > max) value = max;
    const ratio = (value - min) / (max - min);
    const r = Math.round(startColor[0] + ratio * (endColor[0] - startColor[0]));
    const g = Math.round(startColor[1] + ratio * (endColor[1] - startColor[1]));
    const b = Math.round(startColor[2] + ratio * (endColor[2] - startColor[2]));
    return `rgb(${r}, ${g}, ${b})`;
};

type ActionImpactData = { x: number; y: number; z: number; label: string; };
export const ActionsImpactChart: React.FC<{ data: ActionImpactData[], yAxisLabel: string; }> = ({ data, yAxisLabel }) => {
    const [hoveredBar, setHoveredBar] = useState<ActionImpactData | null>(null);

    const width = 500, height = 300;
    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const labels = data.map(d => d.label);
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.x), 0) * 1.15 : 1;
    const yAxisValues = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];
    
    const yPoint = (value: number) => padding.top + chartHeight - Math.max(0, (value / maxValue) * chartHeight);

    const startColor: [number, number, number] = [148, 163, 184]; // slate-400
    const endColor: [number, number, number] = [37, 99, 235];   // blue-700
    const lightStartColor: [number, number, number] = [203, 213, 225]; // slate-300
    const lightEndColor: [number, number, number] = [96, 165, 250];   // blue-400

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-grow">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                    <defs>
                        {data.map((d, i) => (
                            <linearGradient key={i} id={`barGradient-${i}`} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor={interpolateColor(d.z, 0, 100, lightStartColor, lightEndColor)} />
                                <stop offset="100%" stopColor={interpolateColor(d.z, 0, 100, startColor, endColor)} />
                            </linearGradient>
                        ))}
                    </defs>

                    <g>
                        {yAxisValues.map((val, i) => (
                            <g key={i}>
                                <text x={padding.left - 8} y={yPoint(val)} textAnchor="end" fontSize="11" fill="#475569" dy="3">
                                    {val.toFixed(0)}
                                </text>
                                <line x1={padding.left} y1={yPoint(val)} x2={width - padding.right} y2={yPoint(val)} stroke="#e2e8f0" strokeDasharray="2" />
                            </g>
                        ))}
                        <text x="15" y={padding.top + chartHeight / 2} textAnchor="middle" fontSize="11" fill="#475569" transform={`rotate(-90 15 ${padding.top + chartHeight / 2})`}>{yAxisLabel}</text>
                    </g>
                    
                    <g>
                        {labels.map((label, i) => (
                            <text key={i} x={padding.left + (chartWidth / labels.length) * (i + 0.5)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="11" fill="#475569">{label}</text>
                        ))}
                    </g>
                    
                    {data.map((d, i) => {
                        const barHeight = Math.max(0, (d.x / maxValue) * chartHeight);
                        const barWidth = Math.min(60, (chartWidth / labels.length) * 0.7);
                        const x = padding.left + (chartWidth / labels.length) * (i + 0.5) - (barWidth / 2);
                        const y = yPoint(d.x);
                        const isHovered = hoveredBar?.label === d.label;
                        
                        return (
                            <g 
                                key={i}
                                onMouseEnter={() => setHoveredBar(d)}
                                onMouseLeave={() => setHoveredBar(null)}
                            >
                                <rect 
                                    x={x} 
                                    y={y} 
                                    width={barWidth} 
                                    height={barHeight} 
                                    fill={`url(#barGradient-${i})`}
                                    rx="3"
                                    style={{
                                        transition: 'all 0.2s ease',
                                        opacity: hoveredBar && !isHovered ? 0.6 : 1,
                                        cursor: 'pointer'
                                    }}
                                />
                                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="10" fill="#1e293b" fontWeight="bold">
                                    {d.x.toFixed(1)}
                                </text>
                            </g>
                        );
                    })}
                
                    {hoveredBar && (() => {
                        const barIndex = data.findIndex(d => d.label === hoveredBar.label);
                        let tx = padding.left + (chartWidth / labels.length) * (barIndex + 0.5);
                        let ty = yPoint(hoveredBar.x) - 15;
                        
                        const tooltipLines = [
                            hoveredBar.label,
                            `${yAxisLabel}: ${hoveredBar.x.toFixed(1)}`,
                            `Nº de Ações: ${hoveredBar.y}`,
                            `Progresso: ${hoveredBar.z}%`
                        ];
                        const tooltipWidth = 150;
                        const tooltipHeight = 75;

                        if (tx + tooltipWidth/2 > width) tx = width - tooltipWidth/2;
                        if (tx - tooltipWidth/2 < 0) tx = tooltipWidth/2;
                        if (ty - tooltipHeight < 0) ty = yPoint(hoveredBar.x) + 20;


                        return (
                            <g transform={`translate(${tx - tooltipWidth / 2}, ${ty - tooltipHeight})`} style={{ pointerEvents: 'none' }}>
                                <rect
                                    x="0"
                                    y="0"
                                    width={tooltipWidth}
                                    height={tooltipHeight}
                                    rx="5"
                                    fill="rgba(15, 23, 42, 0.9)"
                                    stroke="rgba(255,255,255,0.1)"
                                />
                                 <text x={10} y="18" fontSize="11" fontWeight="bold" fill="#f8fafc">{tooltipLines[0]}</text>
                                 <text x={10} y="34" fontSize="10" fill="#cbd5e1">{tooltipLines[1]}</text>
                                 <text x={10} y="47" fontSize="10" fill="#cbd5e1">{tooltipLines[2]}</text>
                                 <text x={10} y="60" fontSize="10" fill="#cbd5e1">{tooltipLines[3]}</text>
                            </g>
                        );
                    })()}
                </svg>
            </div>
             <div className="flex-shrink-0 flex justify-center items-center gap-x-4 gap-y-1 pt-2 text-xs text-slate-600">
                <span>Progresso do Plano:</span>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm" style={{backgroundColor: `rgb(${startColor.join(',')})`}}></span>
                    <span>0%</span>
                </div>
                <div className="w-24 h-2 rounded-full" style={{background: `linear-gradient(to right, rgb(${startColor.join(',')}), rgb(${endColor.join(',')}))`}}></div>
                 <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm" style={{backgroundColor: `rgb(${endColor.join(',')})`}}></span>
                    <span>100%</span>
                </div>
            </div>
        </div>
    );
};

// --- Simple Horizontal Bar Chart ---
export const SimpleHorizontalBarChart: React.FC<{ data: { label: string; value: number }[], color: string }> = ({ data, color }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-slate-500 py-8">
                Nenhum dado de afastamento para o período selecionado.
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 0);

    return (
        <div className="space-y-4 pt-2">
            {data.map(({ label, value }) => {
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                return (
                    <div key={label} className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                        <div className="text-sm font-medium text-slate-700 w-full sm:w-1/3 sm:text-right flex-shrink-0" title={label}>
                            {label}
                        </div>
                        <div className="w-full sm:w-2/3">
                            <div
                                className="h-6 flex items-center justify-end pr-2 rounded-md text-white text-xs font-bold transition-all duration-500"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: color,
                                    minWidth: '2rem' // Ensure value is visible even for small bars
                                }}
                            >
                                {value}
                            </div>
                        </div>
                    </div>
                );
            })}
             <div className="text-center text-xs text-slate-500 pt-2 sm:pl-[33.333%]">
                Nº de Afastamentos
            </div>
        </div>
    );
};