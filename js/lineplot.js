// Info:
// The data we use is the GlobalTemperature.csv, which contains date, value, war.
// The line plot showing the global temperatures monthly from 1750 to 2015.
// The range of temperature change is shown in colors (red to blue).
// There're two main interacitons including zooming and tooltip for showing details.
// Before zooming, you can see that general trend of temperature change is gradually shifting to towards higher temperature.

document.addEventListener("DOMContentLoaded", function() {

    const margin = {top: 50, right: 100, bottom: 50, left: 100},
        width = 800 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

    const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

// Read GlobalTemperature.csv
    d3.csv("https://raw.githubusercontent.com/sajdoann/HeatMapocalypse/main/data/GlobalTemperatures.csv", function (d) {  //https://raw.githubusercontent.com/sajdoann/HeatMapocalypse/main/GlobalTemperatures.csv
        return {date: d3.timeParse("%Y-%m-%d")(d.date), value: d.value, war: d.war}
    }).then(
        function (data) {

            //Check the loaded data
            console.log(data);

            data = data.filter((d, i) => i < 3193)

            const max = d3.max(data, function (d) {
                return +d.value;
            });
            const min = d3.min(data, function (d) {
                return +d.value;
            });
            const xMean = d3.mean(data, function (d) {
                return +d.value;
            });

            // Add X Axis
            const xScale = d3.scaleLinear()
                .domain([min, max])
                .range([0, width]);
            xAxis = svg.append("g")
                .attr("transform", "translate(0, ${margin.top})")
                .call(d3.axisTop(xScale).tickValues([min, ((min + xMean) / 2), xMean, ((max + xMean) / 2), max]).tickFormat(d => `${Math.round(d)} ℃`).tickSizeOuter(0));

            // Add y Axis
            const yScale = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, height])


            // Find the closest X index of the mouse:
            const bisect = d3.bisector(function (d) {
                return d.date;
            }).left;

            // Create the circle that travels along the curve of chart
            var focus = svg
                .append('g')
                .append('circle')
                .style("fill", "none")
                .attr("stroke", "black")
                .attr('r', 5)
                .style("opacity", 0)
            //Tooltip for date, temperature, and war event
            const tooltip = d3.select("#my_dataviz")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("position", "absolute");

            //Group the lines and words
            const group = svg.append("g").attr("class", "group");

            // Set the gradient for line
            svg.append("linearGradient")
                .attr("id", "line-gradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", xScale(min))
                .attr("y1", 0)
                .attr("x2", xScale(max))
                .attr("y2", 0)
                .selectAll("stop")
                .data([
                    {offset: "0%", color: "blue"},
                    {offset: "100%", color: "red"}
                ])
                .enter().append("stop")
                .attr("offset", function (d) {
                    return d.offset;
                })
                .attr("stop-color", function (d) {
                    return d.color;
                });

            //Zoom-In
            // Add a clipPath
            const clip = svg.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", width)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0);
            const brush = d3.brushY()
                .extent([[0, 0], [width, height]])
                .on("end", updateChart)

            const line = group
                .attr("clip-path", "url(#clip)")
            line.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", "url(#line-gradient)")
                .attr("stroke-width", 2)
                .attr("d", d3.line()
                    .x(d => xScale(d.value))
                    .y(d => yScale(d.date))
                )

            // transform Data into timeParse
            const parseDate = d3.timeParse("%Y-%m-%d");
            // counting for average temperature of each year
            const yearlyData = d3.rollup(data,
                values => d3.mean(values, d => d.value),
                d => d3.timeYear(d.date)
            );
            // Turn the "yearlyData" into an array
            const yearlyTemperatures = Array.from(yearlyData, ([date, value]) => ({date, value}));
            // Making second line plot
            const line2 = group
                .attr("clip-path", "url(#clip)")
            line2.append("path")
                .datum(yearlyTemperatures)
                .attr("class", "line2")
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width", 2)
                .attr("d", d3.line()
                    .x(d => xScale(d.value))
                    .y(d => yScale(d.date))
                )


            //five-year tick
            const fiveYearInterval = d3.timeYear.every(10);
            const tickValues = fiveYearInterval.range(yScale.domain()[0], yScale.domain()[1]);
            yAxis = svg.append("g")
                .attr("transform", `translate( ${width / 2},0)`)
                .attr("class", "axis axis-y")
                .call(d3.axisRight(yScale).tickValues(tickValues).tickSizeOuter(0))
                .style("background-color", "white")

            //call brush
            group.append("g")
                .attr("class", "brush")
                .call(brush);

            //Update line chart after zooming
            let idleTimeout

            function idled() {
                idleTimeout = null;
            }

            function updateChart(event, d) {
                extent = event.selection
                if (!extent) {
                    if (!idleTimeout) {
                        return idleTimeout = setTimeout(idled, 100);
                    }
                    yScale.domain([4, 8])

                } else {
                    yScale.domain([yScale.invert(extent[0]), yScale.invert(extent[1])])
                    group
                        .select(".brush").call(brush.move, null)
                }
                yAxis
                    .transition()
                    .duration(1000)
                    .call(d3.axisRight(yScale))

                line
                    .select('.line')
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .x(d => xScale(d.value))
                        .y(d => yScale(d.date))
                    )
                line2
                    .select('.line2')
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .x(d => xScale(d.value))
                        .y(d => yScale(d.date))
                    )
            }

            //Doubleclick to go back from zooming
            svg.on("dblclick", function () {
                yScale.domain(d3.extent(data, d => d.date))
                yAxis.transition().call(d3.axisRight(yScale))
                line
                    .select('.line')
                    .attr("d", d3.line()
                        .x(d => xScale(d.value))
                        .y(d => yScale(d.date))
                    )
                line2
                    .select('.line2')
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .x(d => xScale(d.value))
                        .y(d => yScale(d.date))
                    )
            });

            //Mouseover, Mousemove, and mouseout functions
            var mouseover = function (event, d) {
                console.log("mouse in")
                focus.style("opacity", 1)
                tooltip.style("opacity", 1)
            }
            const formatDate = d3.timeFormat("%Y-%m-%d");
            var mousemove = function (event, d) {
                // recover coordinate
                const y0 = yScale.invert(d3.pointer(event, this)[1]);
                const i = bisect(data, y0, 1);
                selectedData = data[i]

                focus
                    .attr("cx", xScale(selectedData.value))
                    .attr("cy", yScale(selectedData.date))

                tooltip

                    .html("Date: " + formatDate(selectedData.date) + ", Temperature: " + selectedData.value + "℃, Event: " + selectedData.war)
                    .style("left", xScale(selectedData.value) + 2 + "px")
                    .style("top", yScale(selectedData.date) + "px")
                    .style("font-size", "12px")
            }

            var mouseout = function (event, d) {
                console.log("mouse out")
                focus.style("opacity", 0)
                tooltip.style("opacity", 0)
            }

            line
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout);


        });
});