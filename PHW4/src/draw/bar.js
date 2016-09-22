/**
 * @author Yoel Ivan (yivan3@gatech.edu)
 * @version 0.0a
 * @flow
 */

"use strict";

import * as d3 from "d3";
import { DataEvent } from "./const";

const margin = {
    top   : 30,
    right : 30,
    bottom: 80,
    left  : 50
};
const height = 500 - margin.top - margin.bottom;
const width = 480 - margin.right - margin.left;
const observer = {};

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const xScale = d3.scaleBand()
                 .range([0, width])
                 .padding(.2);
const yScale = d3.scaleLinear()
                 .range([height, 0]);
const svg = d3.select("#bar-chart").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);
const xAxis = svg.append("g")
                 .attr("transform",
                       `translate(${margin.left}, ${height + margin.top})`);
const yAxis = svg.append("g")
                 .attr("transform",
                       `translate(${margin.left}, ${margin.top})`);
const barGraph = svg.append("g")
                    .attr("class", "barGraph")
                    .attr("transform",
                          `translate(${margin.left}, ${margin.top})`);

let _label;

const updateGraph = bardata => {
    xScale.domain(bardata.map(_label.x));
    yScale.domain([0, d3.max(bardata, _label.y)]);
    const joinedBarGraph = barGraph.selectAll(".bar")
                                   .data(bardata, _label.x);
    const oldRects = joinedBarGraph.selectAll("g.bar rect");
    joinedBarGraph.exit()
                  .transition()
                  .duration(300)
                  .attr("y", yScale(0))
                  .attr("height", height - yScale(0))
                  .style("fill-opacity", 1e-6)
                  .remove();
    const bars = joinedBarGraph.enter()
                               .append("g")
                               .attr("class", "bar");
    const newRects = bars.append("rect")
                         .style("fill", d => colorScale(_label.y(d)))
                         .attr("height", () => 0)
                         .attr("y", height)
                         .attr("width", xScale.bandwidth())
                         .attr("x", d => xScale(_label.x(d)))
                         .style("opacity", .85)
                         .on("click",
                             function (d) {
                                 newRects.style("outline", "none");
                                 d3.select(this)
                                   .style("outline", "2px solid #424242");
                                 observer[DataEvent.SELECTED](d, d3.event);
                             })
                         .on("mouseenter",
                             function (d) {
                                 d3.select(this).style("opacity", 1);
                             })
                         .on("mouseleave",
                             function (d) {
                                 d3.select(this).style("opacity", .85);
                             });
    newRects.transition()
            .delay((d, i) => i * 20)
            .duration(2000)
            .attr("height", d => height - yScale(_label.y(d)))
            .attr("y", d => yScale(_label.y(d)))
            .ease(d3.easeElastic);
    oldRects.transition()
            .delay((d, i) => i * 20)
            .duration(1000)
            .attr("height", d => height - yScale(_label.y(d)))
            .attr("y", d => yScale(_label.y(d)))
            .attr("width", xScale.bandwidth())
            .attr("x", d => xScale(_label.x(d)));
    xAxis.transition()
         .duration(300)
         .call(d3.axisBottom(xScale))
         .selectAll("g g.tick > text")
         .attr("text-anchor", "end")
         .attr("transform", "rotate(-20) translate(0, 0)");
    yAxis.transition()
         .duration(300)
         .call(d3.axisLeft(yScale));
};

const highlightRect = criteria => {
    const rects = svg.selectAll("rect");
    rects.filter(d => !criteria(d))
         .transition()
         .duration(2000)
         .style("fill", d => colorScale(_label.y(d)));
    rects.filter(d => criteria(d))
         .transition()
         .duration(2000)
         .style("fill", "#000");
};

export default (bardata, label) => {
    _label = label;
    updateGraph(bardata);
    return {
        update   : updateGraph,
        highlight: highlightRect,
        on       : (event, cb) => observer[event] = cb
    };
};
