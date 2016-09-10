/**
 * @author Yoel Ivan (yivan3@gatech.edu)
 * @version 0.0a
 */

"use strict";

import * as d3 from "d3";

const drawBarGraph = (bardata, label) => {
    const margin = {
        top   : 30,
        right : 30,
        bottom: 40,
        left  : 50
    };
    const height = 720 - margin.top - margin.bottom;
    const width = 1280 - margin.right - margin.left;
    const colorScale = d => {
        if (d < 1) {
            return "#F44336";
        } else if (d < 2) {
            return "#FF9800";
        } else if (d < 3) {
            return "#FFEB3B";
        } else if (d < 4) {
            return "#3F51B5";
        } else {
            return "#FFC107";
        }
    };
    const colorTextScale = d => {
        if (d < 1) {
            return "#FAFAFA";
        } else if (d < 2) {
            return "#424242";
        } else if (d < 3) {
            return "#424242";
        } else if (d < 4) {
            return "#FFC107";
        } else {
            return "#424242";
        }
    };
    const xScale = d3.scaleBand()
                     .domain(bardata.map(label.x))
                     .range([0, width])
                     .padding(.2);
    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(bardata, label.y)])
                     .range([height, 0]);

    let svg = d3.select('#chart').append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
    let bars = svg.append("g")
                  .attr("class", "bars")
                  .attr("transform",
                        `translate(${margin.left}, ${margin.top})`)
                  .selectAll("rect").data(bardata).enter()
                  .append("g");
    let chart = bars.append("rect")
                    .style("fill", d => colorScale(label.y(d)))
                    .attr("width", xScale.bandwidth())
                    .attr("x", d => xScale(label.x(d)))
                    .attr("height", () => 0)
                    .attr("y", () => height)
                    .on("mouseenter",
                        function (data) {
                            d3.select(this).style("opacity", .5);
                        })
                    .on("mouseleave",
                        function (data) {
                            d3.select(this).style("opacity", 1);
                        });
    let bartext = bars.append("text")
                      .text(label.y)
                      .attr("text-anchor", "middle")
                      .attr("fill", d => colorTextScale(label.y(d)))
                      .attr("x",
                            d => xScale(label.x(d)) + xScale.bandwidth() / 2)
                      .attr("y", height)
                      .style("opacity", 0);

    chart.transition()
         .delay((d, i) => i * 20)
         .duration(2000)
         .attr("height", d => height - yScale(label.y(d)))
         .attr("y", d => yScale(label.y(d)))
         .ease(d3.easeElastic);
    bartext.transition()
           .delay((d, i) => i * 20)
           .duration(2000)
           .attr("y", d => yScale(label.y(d)) + 15)
           .style("opacity", 1)
           .ease(d3.easeElastic);

    svg.append("g")
       .attr("transform",
             `translate(${margin.left}, ${margin.top})`)
       .call(d3.axisLeft(yScale));
    svg.append("g")
       .attr("transform",
             `translate(${margin.left}, ${height + margin.top})`)
       .call(d3.axisBottom(xScale));
};

d3.csv("data/Courses.csv")
  .row(data => ({
      department: data["Department"].trim(),
      course    : data["Course Number"].trim(),
      gpa       : Number.parseFloat(data["GPA"])
  })).get(parsedData => {
    parsedData = parsedData.filter(
        d => !Number.isNaN(d) && d.gpa >= 0 && d.gpa <= 4
        && d.department.length > 0
        && d.course.length > 0
    );
    console.log(parsedData);
    drawBarGraph(parsedData, {
        x: d => `${d.department} ${d.course}`,
        y: d => d.gpa
    });
});
