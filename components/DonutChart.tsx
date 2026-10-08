import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';

export interface ChartSegment {
  key: string;
  name: string;
  value: number; // in paise or percentage
  color: string;
}

interface Props {
  segments: ChartSegment[];
  totalAmountPaise: number;
  formattedTotal: string;
  size?: number;
}

export const DonutChart: React.FC<Props> = ({
  segments,
  formattedTotal,
  size = 200,
}) => {
  const radius = size / 2;
  const strokeWidth = 32;
  const innerRadius = radius - strokeWidth;

  const totalValue = segments.reduce((sum, s) => sum + s.value, 0);

  if (totalValue <= 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={radius}
            cy={radius}
            r={innerRadius + strokeWidth / 2}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="none"
          />
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={styles.totalValue}>{formattedTotal}</Text>
          <Text style={styles.totalSubtext}>Total Spent</Text>
        </View>
      </View>
    );
  }

  let cumulativeAngle = -Math.PI / 2; // Start from top

  const paths = segments.map((segment) => {
    const angle = (segment.value / totalValue) * (2 * Math.PI);

    // Coordinate math for arc
    const x1 = radius + (innerRadius + strokeWidth / 2) * Math.cos(cumulativeAngle);
    const y1 = radius + (innerRadius + strokeWidth / 2) * Math.sin(cumulativeAngle);

    cumulativeAngle += angle;

    const x2 = radius + (innerRadius + strokeWidth / 2) * Math.cos(cumulativeAngle);
    const y2 = radius + (innerRadius + strokeWidth / 2) * Math.sin(cumulativeAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const d = `
      M ${x1} ${y1}
      A ${innerRadius + strokeWidth / 2} ${innerRadius + strokeWidth / 2} 0 ${largeArcFlag} 1 ${x2} ${y2}
    `;

    return {
      key: segment.key,
      color: segment.color,
      d,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G>
          {paths.map((path) => (
            <Path
              key={path.key}
              d={path.d}
              stroke={path.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </G>
      </Svg>

      <View style={styles.centerLabel}>
        <Text style={styles.totalValue}>{formattedTotal}</Text>
        <Text style={styles.totalSubtext}>Total Spent</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 16,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
});
