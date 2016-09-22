/**
 * @author Yoel Ivan (yivan3@gatech.edu)
 * @version 0.0a
 * @flow
 */

"use strict";

// tell webpack to copy static html and css to build folder
require.context("../public/", true, /^\.\/.*\.(html|css|csv)/);

import { csv, select, scaleOrdinal, schemeCategory10 } from "d3";
import { DataEvent, drawBarGraph, drawScatterPlot } from "./draw";

const drawLegend = (data, label) => {
    const legend = select("#scatter-plot-legend");
    const colorScale = scaleOrdinal(schemeCategory10);
    legend.selectAll("p").data(data).enter().append("p")
          .style("color", d => colorScale(label.color(d)))
          .html(d => `&bull; ${label.color(d)}`);
};

const tooltip = select("#tooltip");
csv("data/Cereal.csv")
    .row(data => ({
        name             : data["Cereal Name"].trim(),
        manufacturer     : data.Manufacturer.trim(),
        type             : data.Type.trim(),
        calories         : parseFloat(data.Calories),
        protein          : parseFloat(data["Protein (g)"]),
        fat              : parseFloat(data.Fat),
        sodium           : parseFloat(data.Sodium),
        dietaryFiber     : parseFloat(data["Dietary Fiber"]),
        carbs            : parseFloat(data.Carbs),
        sugars           : parseFloat(data.Sugars),
        displayShelf     : parseFloat(data["Display Shelf"]),
        potassium        : parseFloat(data.Potassium),
        vitaminMinerals  : parseFloat(data["Vitamins and Minerals"]),
        servingSizeWeight: parseFloat(data["Serving Size Weight"]),
        cupsPerServing   : parseFloat(data["Cups per Serving"])
    }))
    .get(
        parsedData => {
            // remove all invalid data
            parsedData = parsedData.filter(
                e => Object.keys(e).every(
                    key => typeof e[key] === "string" || e[key] >= 0
                )
            );

            // create set of unique manufacturer
            let bardata = parsedData.reduce(
                (prev, curr) => {
                    if (prev[curr.manufacturer]) {
                        prev[curr.manufacturer].averageCalories =
                            (prev[curr.manufacturer].averageCalories
                            * prev[curr.manufacturer].productCount++
                            + curr.calories)
                            / prev[curr.manufacturer].productCount;
                    } else {
                        prev[curr.manufacturer] = {
                            manufacturer   : curr.manufacturer,
                            averageCalories: curr.calories,
                            productCount   : 1
                        };
                    }
                    return prev;
                }, {}
            );

            // transform set into array
            bardata = Object.keys(bardata).map(k => bardata[k]);
            const scatterPlot = drawScatterPlot(
                parsedData,
                {
                    x    : d => d.sugars,
                    y    : d => d.calories,
                    size : d => d.servingSizeWeight,
                    color: d => d.manufacturer
                }
            );
            const barGraph = drawBarGraph(
                bardata,
                {
                    x: d => d.manufacturer,
                    y: d => d.averageCalories
                }
            );

            barGraph.on(DataEvent.SELECTED, selectedData =>
                scatterPlot.highlight(
                    d => d.manufacturer === selectedData.manufacturer));
            scatterPlot.on(DataEvent.SELECTED, selectedData =>
                barGraph.highlight(
                    d => d.averageCalories > selectedData.calories));
            scatterPlot.on(
                DataEvent.MOUSE_ENTER,
                (d, e) =>
                    tooltip.style("opacity", .85)
                           .style("left", `${e.x - 10 }px`)
                           .style("top", `${e.y - 10}px`)
                           .html(
                               `<div class="content">
                                      <div class="header">${d.name}</div>
                                    </div>
                                    <div class="content">
                                        <div class="ui mini statistics">
                                            <div class="statistic">
                                                <div class="value">${d.calories}</div>
                                                <div class="label">Calories</div>
                                            </div>
                                            <div class="statistic">
                                                <div class="value">${d.sugars}</div>
                                                <div class="label">Sugars (g)</div>
                                            </div>
                                        </div>
                                    </div>`
                           )
            );
            scatterPlot.on(DataEvent.MOUSE_LEAVE,
                           () => tooltip.style("opacity", 0)
                                        .style("left", "0")
                                        .style("top", "0"));

            drawLegend(bardata, {color: d => d.manufacturer});
        }
    );
