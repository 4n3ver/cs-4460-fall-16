/**
 * @author Yoel Ivan (yivan3@gatech.edu)
 * @version 0.0a
 */

// tell webpack to copy static html and css to build folder
require.context("../public/", true, /^\.\/.*\.(html|css)/);

import * as d3 from "d3";

const drawBarGraph = (bardata, label) => {
    const margin = {
        top   : 30,
        right : 30,
        bottom: 80,
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
    const xScale = d3.scaleBand()
                     .range([0, width])
                     .padding(.2);
    const yScale = d3.scaleLinear()
                     .range([height, 0]);
    let svg = d3.select('#chart').append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
    let xAxis = svg.append("g")
                   .attr("transform",
                         `translate(${margin.left}, ${height + margin.top})`);
    let yAxis = svg.append("g")
                   .attr("transform",
                         `translate(${margin.left}, ${margin.top})`);
    let barGraph = svg.append("g")
                      .attr("class", "barGraph")
                      .attr("transform",
                            `translate(${margin.left}, ${margin.top})`);
    let updateGraph = (bardata) => {
        xScale.domain(bardata.map(label.x));
        yScale.domain([0, d3.max(bardata, label.y)]);
        let joinedBarGraph = barGraph.selectAll(".bar").data(bardata, label.x);
        let oldRects = joinedBarGraph.selectAll("g.bar rect");
        let oldTexts = joinedBarGraph.selectAll("g.bar text");
        joinedBarGraph.exit()
                      .transition()
                      .duration(300)
                      .attr("y", yScale(0))
                      .attr("height", height - yScale(0))
                      .style("fill-opacity", 1e-6)
                      .remove();
        let bars = joinedBarGraph.enter()
                                 .append("g")
                                 .attr("class", "bar");
        let rects = bars.append("rect")
                        .style("fill", d => colorScale(label.y(d)))
                        .on("mouseenter",
                            function (data) {
                                d3.select(this).style("opacity", .5);
                            })
                        .on("mouseleave",
                            function (data) {
                                d3.select(this).style("opacity", 1);
                            })
                        .attr("height", () => 0)
                        .attr("y", () => height)
                        //.merge(oldRects)
                        .attr("width", xScale.bandwidth())
                        .attr("x", d => xScale(label.x(d)));
        let texts = bars.append("text")
                        .attr("text-anchor", "middle")
                        .attr("fill", d => colorTextScale(label.y(d)))
                        .attr("y", height)
                        .text(label.y)
                        .style("opacity", 0)
                        //.merge(oldTexts)
                        .attr("x",
                              d => xScale(label.x(d)) + xScale.bandwidth()
                              / 2);
        rects.transition()
             .delay((d, i) => i * 20)
             .duration(2000)
             .attr("height", d => height - yScale(label.y(d)))
             .attr("y", d => yScale(label.y(d)))
             .ease(d3.easeElastic);
        oldRects.transition()
                .delay((d, i) => i * 20)
                .duration(1000)
                .attr("height", d => height - yScale(label.y(d)))
                .attr("y", d => yScale(label.y(d)))
                .attr("width", xScale.bandwidth())
                .attr("x", d => xScale(label.x(d)));
        texts.transition()
             .delay((d, i) => i * 20)
             .duration(2000)
             .attr("y", d => yScale(label.y(d)) + 15)
             .style("opacity", 1)
             .ease(d3.easeElastic);
        oldTexts.transition()
                .delay((d, i) => i * 20)
                .duration(1000)
                .attr("x",
                      d => xScale(label.x(d)) + xScale.bandwidth() / 2)
                .attr("y", d => yScale(label.y(d)) + 15);
        xAxis.transition()
             .duration(300)
             .call(d3.axisBottom(xScale))
             .selectAll("g g.tick > text")
             .attr("text-anchor", "end")
             .attr("transform",
                   `rotate(-90) translate(${-10}, -10)`);
        yAxis.transition()
             .duration(300)
             .call(d3.axisLeft(yScale));
    };
    updateGraph(bardata);
    return updateGraph;
};

const setFilter = (departments, onFilter) => {
    const filterDepartment = d3.select("#filter-dpt");
    const filterGPA = d3.select("#filter-gpa");
    const filterButton = d3.select("#filter-btn");
    let gpa = 0;
    let dpt = "ALL";
    filterDepartment.on("input", function () {
        dpt = this.value;
    });
    filterGPA.on("input", function () {
        this.value = this.value.length > 0
            ? Number.parseFloat(this.value)
            : null;
        if (this.value && this.value >= 0 && this.value <= 4) {
            filterButton.classed("disabled", false);
            gpa = this.value;
        } else {
            filterButton.classed("disabled", true);
        }
    });
    filterButton.on("click", function () {
        filterButton.classed("disabled", true);
        console.log(dpt, gpa);
        setTimeout(filterButton.classed.bind(filterButton, "disabled", false), 2000);
        onFilter(e => e.gpa >= gpa && (dpt === "ALL" || e.department === dpt));
    });
    departments.forEach(
        e => filterDepartment.append("option")
                             .attr("value", e)
                             .text(e)
    );
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

    // build array of unique department
    const departments = Object.keys(parsedData.reduce(
        (prev, curr) => {
            prev[curr.department.toUpperCase()] = null;
            return prev;
        }, {}
    ));

    const updateBarGraph = drawBarGraph(parsedData, {
        x: d => `${d.department} ${d.course}`,
        y: d => d.gpa
    });
    setFilter(departments, comparator =>
        updateBarGraph(parsedData.filter(comparator)));
});
