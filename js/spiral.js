//TODO: make init the world
updateCountryInfo(12);
updateCountrySpiral('Algeria',12);

// Define a function to update the country information and display the spiral plot
function updateCountrySpiral(countryName, countryID) {
    // Read the data
    d3.csv("https://raw.githubusercontent.com/lsps9150125/MIS588_Data_Visualize/main/GlobalLandTemperaturesByCountry.csv").then(function(data) {
        // Filter the data based on the selected country
        var filteredData = data.filter(function(d) {
            return d.id === countryID;
        });

        var sYear = 1700;
        var eYear = 1920;
        filteredData = filteredData.filter(function(d) {
            var year = parseInt(d.dt.split('-')[0]);
            return (year > sYear && year < eYear);
        });

        var pointCount = filteredData.length;
        var i, r;

        var x = [];
        var y = [];
        var z = [];
        var c = [];

        for(i = 0; i < pointCount; i++) {
            // Encode temperature values
            r = filteredData[i].AverageTemperature + 1;
            if (r === '')
                continue;
            c.push(r);

            var mon = parseInt(filteredData[i].dt.split('-')[1]);
            var year = parseInt(filteredData[i].dt.split('-')[0]);
            // Encode coordinates
            x.push(r * Math.cos(mon / 6 * Math.PI));
            y.push(r * Math.sin(mon / 6 * Math.PI));
            z.push((year - 1755 + mon / 12) / 2);
        }

        var layout = {
            title: {
                text: countryID,
                font: {
                    family: 'Courier New, monospace',
                    size: 70
                },
                yref: 'paper',
                automargin: true,
            },
            showlegend: false,
            //plot_bgcolor: "rgba(0, 0, 0, 0)", // Set the plot background color to transparent
            //paper_bgcolor: "rgba(0, 0, 0, 0)" // Set the paper background color to transparent

        };

        // Clear existing spiral plot
        Plotly.purge('mySpiral');

        // Update the spiral plot with the new data
        Plotly.newPlot('mySpiral', [{
            type: 'scatter3d',
            mode: 'lines',
            x: x,
            y: y,
            z: z,
            opacity: 0.7,
            line: {
                width: 10,
                color: c,
                colorscale: 'Inferno'
            } // Color scale
        }], layout);
    });
}
