"use strict";

import * as d3 from "d3";

const drawBarGraph = (bardata, labelx, labely) => {
    const margin = {
        top   : 30,
        right : 30,
        bottom: 40,
        left  : 50
    };
    const height = 500 - margin.top - margin.bottom;
    const width = 960 - margin.right - margin.left;
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
    const xLabelScale = d3.scaleBand()
                          .domain(bardata.map(d => d[labelx]))
                          .range([0, width])
                          .padding(.2);
    const yLabelScale = d3.scaleLinear()
                          .domain([0, d3.max(bardata, d => d[labely])])
                          .range([height, 0]);
    const xScale = d3.scaleBand()
                     .domain(d3.range(0, bardata.length))
                     .range([0, width])
                     .padding(.2);
    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(bardata, d => d[labely])])
                     .range([0, height]);
    const xAxis = d3.axisBottom().scale(xLabelScale).ticks(bardata.length);
    const yAxis = d3.axisLeft().scale(yLabelScale).ticks(10);

    let bars = d3.select('#chart').append('svg')
                 .style("border-radius", "10px")
                 .style("background", "#cfcfcf")
                 .attr("width", width + margin.left + margin.right)
                 .attr("height", height + margin.top + margin.bottom)
                 .append("g")
                 .attr("class", "bars")
                 .attr("transform",
                       `translate(${margin.left}, ${margin.top})`)
                 .selectAll("rect").data(bardata)
                 .enter().append("g");
    let chart = bars.append("rect")
                    .style("fill", d => colorScale(d[labely]))
                    .attr("width", xScale.bandwidth())
                    .attr("x", (d, i) => xScale(i))
                    .attr("height", () => 0)
                    .attr("y", () => height)
                    .style("outline", "1px solid #424242")
                    .on("mouseenter", function (data) {
                        d3.select(this).style("opacity", .5);
                    }).on("mouseleave",
                          function (data) {
                              d3.select(this).style("opacity", 1);
                          });
    let bartext = bars.append("text")
                      .text(d => d[labely])
                      .attr("text-anchor", "middle")
                      .attr("fill", d => colorTextScale(d[labely]))
                      .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
                      .attr("y", height)
                      .style("opacity", 0);

    chart.transition()
         .delay((d, i) => i * 20)
         .duration(2000)
         .attr("height", d => yScale(d[labely]))
         .attr("y", d => height - yScale(d[labely]))
         .ease(d3.easeElastic);

    bartext.transition()
           .delay((d, i) => i * 20)
           .duration(2000)
           .attr("y", d => height - yScale(d[labely]) + 15)
           .style("opacity", 1)
           .ease(d3.easeElastic);

    let yGuide = d3.select("section#chart svg").append("g")
                   .attr("transform",
                         `translate(${margin.left}, ${margin.top})`);
    yAxis(yGuide);

    let xGuide = d3.select("section#chart svg").append("g")
                   .attr("transform",
                         `translate(${margin.left}, ${height + margin.top})`);
    xAxis(xGuide);
};

d3.csv("data/gpa.csv")
  .row(data => ({
      state: data.STATE,
      gpa  : Number.parseFloat(data.GPA)
  })).get(parsedData => {
    drawBarGraph(parsedData, "state", "gpa");
});
