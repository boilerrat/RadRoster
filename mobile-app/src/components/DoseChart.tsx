import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Path, Circle, G, Text as SvgText } from 'react-native-svg';

interface DoseEntry {
  timestamp: string;
  dose_mSv: number;
}

interface DoseChartProps {
  doseEntries: DoseEntry[];
  width?: number;
  height?: number;
}

const DoseChart: React.FC<DoseChartProps> = ({ 
  doseEntries, 
  width = Dimensions.get('window').width - 40,
  height = 200 
}) => {
  if (doseEntries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No dose data available</Text>
      </View>
    );
  }

  // Sort entries by timestamp
  const sortedEntries = [...doseEntries].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate cumulative doses
  let cumulative = 0;
  const cumulativeData = sortedEntries.map(entry => {
    cumulative += entry.dose_mSv;
    return {
      timestamp: new Date(entry.timestamp).getTime(),
      cumulative: cumulative,
      dose: entry.dose_mSv,
    };
  });

  // Calculate chart dimensions
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find min/max values for scaling
  const timeRange = {
    min: cumulativeData[0]?.timestamp || 0,
    max: cumulativeData[cumulativeData.length - 1]?.timestamp || 0,
  };

  const doseRange = {
    min: 0,
    max: Math.max(...cumulativeData.map(d => d.cumulative), 0.1), // Ensure max > 0
  };

  // Convert data points to chart coordinates
  const points = cumulativeData.map((point, index) => {
    const x = padding + (point.timestamp - timeRange.min) / (timeRange.max - timeRange.min) * chartWidth;
    const y = height - padding - (point.cumulative / doseRange.max) * chartHeight;
    return { x, y, ...point };
  });

  // Generate path for the line
  const pathData = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `L ${point.x} ${point.y}`;
  }).join(' ');

  // Format time for x-axis labels
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Generate x-axis labels
  const xAxisLabels = [];
  if (points.length > 1) {
    const step = Math.max(1, Math.floor(points.length / 4));
    for (let i = 0; i < points.length; i += step) {
      xAxisLabels.push({
        x: points[i].x,
        label: formatTime(points[i].timestamp),
      });
    }
  }

  // Generate y-axis labels
  const yAxisLabels = [];
  const yStep = doseRange.max / 4;
  for (let i = 0; i <= 4; i++) {
    const dose = i * yStep;
    const y = height - padding - (dose / doseRange.max) * chartHeight;
    yAxisLabels.push({
      y,
      label: dose.toFixed(2),
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cumulative Dose Over Time</Text>
      <Svg width={width} height={height} style={styles.chart}>
        {/* Grid lines */}
        <G stroke="#e2e8f0" strokeWidth="1">
          {yAxisLabels.map((label, index) => (
            <Line
              key={`grid-${index}`}
              x1={padding}
              y1={label.y}
              x2={width - padding}
              y2={label.y}
            />
          ))}
        </G>

        {/* Y-axis labels */}
        {yAxisLabels.map((label, index) => (
          <SvgText
            key={`y-label-${index}`}
            x={padding - 8}
            y={label.y + 4}
            fontSize="12"
            fill="#64748b"
            textAnchor="end"
          >
            {label.label}
          </SvgText>
        ))}

        {/* X-axis labels */}
        {xAxisLabels.map((label, index) => (
          <SvgText
            key={`x-label-${index}`}
            x={label.x}
            y={height - 8}
            fontSize="12"
            fill="#64748b"
            textAnchor="middle"
          >
            {label.label}
          </SvgText>
        ))}

        {/* Chart line */}
        <Path
          d={pathData}
          stroke="#3b82f6"
          strokeWidth="3"
          fill="none"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}

        {/* Current value indicator */}
        {points.length > 0 && (
          <G>
            <Circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="6"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <SvgText
              x={points[points.length - 1].x + 10}
              y={points[points.length - 1].y - 10}
              fontSize="12"
              fill="#10b981"
              fontWeight="bold"
            >
              {points[points.length - 1].cumulative.toFixed(2)} mSv
            </SvgText>
          </G>
        )}
      </Svg>

      {/* Chart legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Cumulative Dose</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Current Value</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    backgroundColor: '#ffffff',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default DoseChart; 