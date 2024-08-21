
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TimeBasedNetworkView = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    svg.attr('width', width).attr('height', height);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.timestamp)))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.links.length)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(d => x(new Date(d.timestamp)))
        .y(d => y(d.links.length))
      );
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default TimeBasedNetworkView;
