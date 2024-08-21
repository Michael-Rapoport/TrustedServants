import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BubbleChart = ({ data, onExpandNode, searchTerm }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const tooltip = d3.select(tooltipRef.current);

    svg.attr('width', width).attr('height', height);

    // Clear previous content
    svg.selectAll('*').remove();

    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    const simulation = d3.forceSimulation(data.nodes)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke-width', d => Math.sqrt(d.amount) / 10)
      .attr('stroke', d => {
        switch (d.type) {
          case 'financial': return '#1f77b4';
          case 'ownership': return '#2ca02c';
          case 'collaboration': return '#d62728';
          default: return '#7f7f7f';
        }
      });

    const node = g.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', d => Math.sqrt(d.risk_score * 100) + 5)
      .attr('fill', d => d.type === 'central' ? '#ff7f0e' : '#1f77b4')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => onExpandNode(d.id))
      .on('mouseover', (event, d) => {
        tooltip.style('opacity', 0.9)
          .html(`Name: ${d.name}<br/>Type: ${d.type}<br/>Risk Score: ${d.risk_score}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
    .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

    const label = g.append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter().append('text')
      .text(d => d.name)
      .attr('font-size', '10px')
      .attr('dx', 12)
      .attr('dy', 4);

    // Highlight searched nodes
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      node.attr('fill', d => searchRegex.test(d.name) ? '#e31a1c' : (d.type === 'central' ? '#ff7f0e' : '#1f77b4'))
        .attr('r', d => searchRegex.test(d.name) ? (Math.sqrt(d.risk_score * 100) + 8) : (Math.sqrt(d.risk_score * 100) + 5));
    }

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      svg.selectAll('*').remove();
    };
  }, [data, onExpandNode, searchTerm]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef} style={{
        position: 'absolute',
        opacity: 0,
        backgroundColor: 'white',
        border: 'solid',
        borderWidth: '1px',
        borderRadius: '5px',
        padding: '5px',
        pointerEvents: 'none',
      }}></div>
    </div>
  );
};

export default BubbleChart;
