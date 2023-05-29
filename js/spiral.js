//TODO: make init the world
updateCountryInfo(4);
updateCountrySpiral(4);
//plot_bgcolor: "rgba(0, 0, 0, 0)", // Set the plot background color to transparent
//paper_bgcolor: "rgba(0, 0, 0, 0)" // Set the paper background color to transparent
// Clear existing spiral plot
//Plotly.purge('mySpiral');

// Define a function to update the country information and display the spiral plot
function updateCountrySpiral( countryID) {
    // Read the data
    d3.csv("https://raw.githubusercontent.com/lsps9150125/MIS588_Data_Visualize/main/GlobalLandTemperaturesByCountry.csv").then(function(data) {
        // filter by country
        data = data.filter(function(d) {
            return d.id == countryID;
        })
        var sYear = 1300;
        var eYear = 1900;
        data = data.filter(function(d) {
            y = parseInt(d.dt) ;
            return (y > sYear && y < eYear);
        })

        var pointCount = data.length;
        var i, r;

        var dt = [];
        var txt = [];
        var x = [];
        var y = [];
        var z = [];
        var c = [];

        for(i = 0; i < pointCount; i++)
        {
            // things encode with temperature
            r = data[i].AverageTemperature + 1;
            if(r === '')
                continue;
            c.push(r);

            mon = parseInt(data[i].dt.split('-')[1])
            year = parseInt(data[i].dt.split('-')[0])
            // things endeo with date
            dt.push(data[i].dt.split('-')[0])
            txt.push({dt:data[i].dt.split('-')[0] , tmp:data[i].AverageTemperature})
            x.push(r * Math.cos(mon/6 * Math.PI) );
            y.push(r * Math.sin(mon/6 * Math.PI) );
            z.push((year + mon/12));
        }

        var sliderSteps = [];
        for (i = 0; i < pointCount; i++) {
            sliderSteps.push({
                method: 'animate',
                label: dt[i],
                args: [[dt[i]], {
                    mode: 'immediate',
                    transition: {duration: 100},
                    frame: {duration: 100, redraw: false},
                }]
            });
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
            scene: {
                xaxis:{title: '', visible: false, showgrid: false},
                yaxis:{title: '', visible: false, showgrid: false},
                zaxis:{title: 'Year'},
            },
            // sliders: [{
            //     pad: {t: 35},
            //     currentvalue: {
            //       visible: true,
            //       prefix: 'Year:',
            //       xanchor: 'right',
            //       font: {size: 20, color: '#666'}
            //     },
            //     steps: sliderSteps
            // }],
            showlegend: false,
            paper_bgcolor: "rgba(0, 0, 0, 0)", // Set the paper background color to transparent
            plot_bgcolor: "rgba(0, 0, 0, 0)", // Set the plot background color to transparent

        };

        Plotly.purge('mySpiral');

        Plotly.newPlot('mySpiral', [{
                type: 'scatter3d',
                mode: 'lines',
                x: x,
                y: y,
                z: z,
                text: txt,
                hovertemplate:
                    "<b>Year %{text.dt}</b><br><br>" +
                    "Temperature: %{text.tmp}°C" +
                    "<extra></extra>",
                opacity: 0.7,
                line: {
                    width: 10,
                    color: c,
                    colorscale: 'Inferno'}, //color scale
                transform: {
                    type: 'filter',
                    target: z,
                    operation: '<',
                    value: 0}
            }],
            layout);
    });
}
