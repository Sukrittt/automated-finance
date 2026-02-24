import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { BarChart } from '../../src/charts/BarChart';
import { DonutLegend } from '../../src/charts/DonutLegend';
import { LineChart } from '../../src/charts/LineChart';

function extractText(tree: any): string {
  const values = tree.root
    .findAll((node: any) => typeof node.props.children === 'string' || typeof node.props.children === 'number')
    .map((node: any) => String(node.props.children));
  return values.join(' ');
}

describe('visual chart components', () => {
  it('renders donut category visualization with legend rows', async () => {
    let tree: any;

    await act(async () => {
      tree = renderer.create(
        <DonutLegend
          title="Category split"
          slices={[
            { label: 'Food', value: 45 },
            { label: 'Transport', value: 30 },
            { label: 'Bills', value: 25 }
          ]}
        />
      );
    });

    const normalized = extractText(tree!);

    expect(normalized).toContain('Category split');
    expect(normalized).toContain('Food');
    expect(normalized).toContain('Transport');
    expect(normalized).toContain('Bills');
    expect(normalized).toContain('100%');
  });

  it('renders bar chart over period labels', async () => {
    let tree: any;

    await act(async () => {
      tree = renderer.create(
        <BarChart title="Daily spend" values={[1200, 900, 1400, 600]} labels={['24 Feb', '25 Feb', '26 Feb', '27 Feb']} />
      );
    });

    const normalized = extractText(tree!);

    expect(normalized).toContain('Daily spend');
    expect(normalized).toContain('24 Feb');
    expect(normalized).toContain('27 Feb');
  });

  it('renders line trend labels and empty state', async () => {
    let filledTree: any;
    let emptyTree: any;

    await act(async () => {
      filledTree = renderer.create(
        <LineChart title="Spend trend" values={[100, 250, 180, 420]} labels={['Mon', 'Tue', 'Wed', 'Thu']} />
      );
      emptyTree = renderer.create(<LineChart title="Spend trend" values={[]} labels={[]} />);
    });

    const normalizedFilled = extractText(filledTree!);
    const normalizedEmpty = extractText(emptyTree!);

    expect(normalizedFilled).toContain('Spend trend');
    expect(normalizedFilled).toContain('Mon');
    expect(normalizedFilled).toContain('Thu');
    expect(normalizedEmpty).toContain('No trend data available.');
  });
});
