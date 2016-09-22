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
const xScale = d3.scaleLinear()
                 .range([0, width]);
const yScale = d3.scaleLinear()
                 .range([height, 0]);
const circleScale = d => d * 10;

const svg = d3.select("#scatter-plot").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);
const xAxis = svg.append("g")
                 .attr("transform",
                       `translate(${margin.left}, ${height + margin.top})`);
const yAxis = svg.append("g")
                 .attr("transform",
                       `translate(${margin.left}, ${margin.top})`);
const tooltip = d3.select("#tooltip");
const scatter = svg.append("g")
                   .attr("class", "scatterPlot")
                   .attr("transform",
                         `translate(${margin.left}, ${margin.top})`);

let _label;

const updateScatter = data => {
    xScale.domain([0, d3.max(data, _label.x)]);
    yScale.domain([0, d3.max(data, _label.y)]);
    const joinedScatter = scatter.selectAll(".dot")
                                 .data(data, _label.x);
    const oldCircles = joinedScatter.selectAll("g.dot circle");
    joinedScatter.exit()
                 .transition()
                 .duration(300)
                 .attr("cy", yScale(0))
                 .attr("r", 0)
                 .style("fill-opacity", 1e-6)
                 .remove();
    const dots = joinedScatter.enter()
                              .append("g")
                              .attr("class", "dot");
    const newCircles = dots.append("circle")
                           .style("opacity", "1")
                           .style("fill", d => colorScale(_label.color(d)))
                           .on("click",
                               function (d) {
                                   newCircles.style("outline", "none");
                                   d3.select(this)
                                     .style("outline",
                                            "2px solid #424242");
                                   observer[DataEvent.SELECTED](d, d3.event);
                               })
                           .on("mouseenter",
                               function (d) {
                                   observer[DataEvent.MOUSE_ENTER](
                                       d, d3.event
                                   );
                               })
                           .on("mouseleave",
                               function (d) {
                                   observer[DataEvent.MOUSE_LEAVE](
                                       d, d3.event
                                   );
                               })
                           .attr("cx", 0)
                           .attr("cy", height)
                           .attr("r", 0);
    newCircles.transition()
              .delay((d, i) => i * 20)
              .duration(2000)
              .attr("cx", d => xScale(_label.x(d)))
              .attr("cy", d => yScale(_label.y(d)))
              .attr("r", d => circleScale(_label.size(d)))
              .ease(d3.easeExpInOut);
    oldCircles.transition()
              .delay((d, i) => i * 20)
              .duration(1000)
              .attr("cx", d => xScale(_label.x(d)))
              .attr("cy", d => yScale(_label.y(d)))
              .attr("r", d => circleScale(_label.size(d)));
    xAxis.transition()
         .duration(300)
         .call(d3.axisBottom(xScale))
         .selectAll("g g.tick > text")
         .attr("text-anchor", "end")
         .attr("transform", `rotate(-90) translate(${-10}, -10)`);
    yAxis.transition()
         .duration(300)
         .call(d3.axisLeft(yScale));
};

const highlightDot = criteria => {
    const circles = svg.selectAll("circle");
    circles.filter(d => !criteria(d))
           .transition()
           .duration(1000)
           .style("opacity", ".25");
    circles.filter(d => criteria(d))
           .transition().delay((d, i) => i * 100)
           .duration(1000)
           .style("opacity", "1")
           .transition().delay((d, i) => i * 10)
           .attr("r", d => circleScale(_label.size(d)) + 10)
           .ease(d3.easeBounce)
           .transition().delay((d, i) => 100 + i * 10)
           .attr("r", d => circleScale(_label.size(d)))
           .ease(d3.easeBounce);
};

export default (data, label) => {
    _label = label;
    updateScatter(data);
    return {
        update   : updateScatter,
        highlight: highlightDot,
        on       : (event, cb) => observer[event] = cb
    };
};
