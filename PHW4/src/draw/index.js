/**
 * @author Yoel Ivan (yivan3@gatech.edu)
 * @version 0.0a
 * @flow
 */

export { DataEvent } from "./const";

import bar from "./bar";
import scatter from "./scatter";

export const drawBarGraph = bar;
export const drawScatterPlot = scatter;
export default {
    drawBarGraph,
    drawScatterPlot
};
