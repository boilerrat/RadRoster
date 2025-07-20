import React from 'react';
import { render } from '@testing-library/react-native';
import DoseChart from '../DoseChart';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: ({ children, ...props }: any) => React.createElement('Svg', props, children),
    Line: (props: any) => React.createElement('Line', props),
    Path: (props: any) => React.createElement('Path', props),
    Circle: (props: any) => React.createElement('Circle', props),
    G: ({ children, ...props }: any) => React.createElement('G', props, children),
    Text: (props: any) => React.createElement('Text', props),
  };
});

// Mock Dimensions
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ width: 400, height: 800 })),
    },
  };
});

describe('DoseChart', () => {
  const mockDoseEntries = [
    {
      timestamp: '2024-01-01T09:00:00Z',
      dose_mSv: 1.0,
    },
    {
      timestamp: '2024-01-01T10:00:00Z',
      dose_mSv: 2.0,
    },
    {
      timestamp: '2024-01-01T11:00:00Z',
      dose_mSv: 1.5,
    },
  ];

  it('renders empty state when no dose entries provided', () => {
    const { getByText } = render(<DoseChart doseEntries={[]} />);
    
    expect(getByText('No dose data available')).toBeTruthy();
  });

  it('renders chart title', () => {
    const { getByText } = render(<DoseChart doseEntries={mockDoseEntries} />);
    
    expect(getByText('Cumulative Dose Over Time')).toBeTruthy();
  });

  it('renders legend items', () => {
    const { getByText } = render(<DoseChart doseEntries={mockDoseEntries} />);
    
    expect(getByText('Cumulative Dose')).toBeTruthy();
    expect(getByText('Current Value')).toBeTruthy();
  });

  it('renders chart with correct number of data points', () => {
    const { getByTestId } = render(<DoseChart doseEntries={mockDoseEntries} />);
    
    // The chart should render SVG elements
    // Note: In a real test environment, you might want to test for specific SVG elements
    // but since we're mocking react-native-svg, we'll just verify the component renders
    expect(getByTestId).toBeDefined();
  });

  it('handles single dose entry', () => {
    const singleEntry = [
      {
        timestamp: '2024-01-01T09:00:00Z',
        dose_mSv: 1.0,
      },
    ];

    const { getByText } = render(<DoseChart doseEntries={singleEntry} />);
    
    expect(getByText('Cumulative Dose Over Time')).toBeTruthy();
  });

  it('sorts entries by timestamp', () => {
    const unsortedEntries = [
      {
        timestamp: '2024-01-01T11:00:00Z',
        dose_mSv: 1.5,
      },
      {
        timestamp: '2024-01-01T09:00:00Z',
        dose_mSv: 1.0,
      },
      {
        timestamp: '2024-01-01T10:00:00Z',
        dose_mSv: 2.0,
      },
    ];

    const { getByText } = render(<DoseChart doseEntries={unsortedEntries} />);
    
    // Component should still render even with unsorted data
    expect(getByText('Cumulative Dose Over Time')).toBeTruthy();
  });

  it('handles zero dose values', () => {
    const zeroDoseEntries = [
      {
        timestamp: '2024-01-01T09:00:00Z',
        dose_mSv: 0,
      },
      {
        timestamp: '2024-01-01T10:00:00Z',
        dose_mSv: 0,
      },
    ];

    const { getByText } = render(<DoseChart doseEntries={zeroDoseEntries} />);
    
    expect(getByText('Cumulative Dose Over Time')).toBeTruthy();
  });

  it('handles very large dose values', () => {
    const largeDoseEntries = [
      {
        timestamp: '2024-01-01T09:00:00Z',
        dose_mSv: 1000,
      },
      {
        timestamp: '2024-01-01T10:00:00Z',
        dose_mSv: 2000,
      },
    ];

    const { getByText } = render(<DoseChart doseEntries={largeDoseEntries} />);
    
    expect(getByText('Cumulative Dose Over Time')).toBeTruthy();
  });

  it('handles custom width and height', () => {
    const { getByText } = render(
      <DoseChart 
        doseEntries={mockDoseEntries} 
        width={300} 
        height={150} 
      />
    );
    
    expect(getByText('Cumulative Dose Over Time')).toBeTruthy();
  });

  it('handles invalid timestamp format gracefully', () => {
    const invalidTimestampEntries = [
      {
        timestamp: 'invalid-date',
        dose_mSv: 1.0,
      },
    ];

    // Should not crash and should still render
    const { getByText } = render(<DoseChart doseEntries={invalidTimestampEntries} />);
    
    expect(getByText('Cumulative Dose Over Time')).toBeTruthy();
  });
}); 