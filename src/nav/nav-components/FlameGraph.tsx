// import React, { useEffect, useRef } from 'react';
// import * as d3 from 'd3';


// interface FlameGraphProps {
//   data: { name: string; value: number }[];
// }

// const FlameGraph: React.FC<FlameGraphProps> = ({ data }) => {
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   useEffect(() => {
//     if (!svgRef.current) return;

//     // Dimensions
//     const width = 800;
//     const height = 300;
//     const barHeight = 40;

//     // Remove any previous SVG elements
//     d3.select(svgRef.current).selectAll('*').remove();

//     // Create the SVG canvas
//     const svg = d3
//       .select(svgRef.current)
//       .attr('width', width)
//       .attr('height', height);

//     // Create a scale for the x-axis
//     const xScale = d3
//       .scaleLinear()
//       .domain([0, 100]) // Percentages from 0 to 100
//       .range([0, width]);

//     // Append groups for each bar
//     const groups = svg
//       .selectAll('g')
//       .data(data)
//       .enter()
//       .append('g')
//       .attr('transform', (_: any, i: number) => `translate(0, ${i * barHeight})`);

//     // Add rectangles for each bar
//     groups
//       .append('rect')
//       .attr('x', 0)
//       .attr('y', 0)
//       .attr('width', (d: { value: any; }) => xScale(d.value))
//       .attr('height', barHeight - 5)
//       .attr(
//         'fill',
//         (d: { value: number; }) => d3.interpolateWarm(d.value / 100) // Gradient based on value
//       );

//     // Add text labels for each bar
//     groups
//       .append('text')
//       .attr('x', 5)
//       .attr('y', barHeight / 2)
//       .attr('dy', '0.35em')
//       .attr('fill', '#fff')
//       .attr('font-size', '14px')
//       .text((d: { name: any; value: number; }) => `${d.name}: ${d.value.toFixed(1)}%`);
//   }, [data]);

//   return <svg ref={svgRef} />;
// };

// export default FlameGraph;
