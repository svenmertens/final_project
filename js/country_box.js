//todo: add avg per country
// todo: what to add next to this box? add difference in period?
// todo: add capital?
function updateCountryInfo(countryID) {
    d3.dsv(';')("https://raw.githubusercontent.com/sajdoann/HeatMapocalypse/main/data/country_info.csv").then(function (data) {
        console.log(data)
        const country = data.find(row => row.id === countryID.toString());

        if (country) {
            document.getElementById('country-id').textContent = country.name;
        } else {
            document.getElementById('country-id').textContent = "Country not found";
        }

        var imageElement = document.getElementById('flag-id');
        imageElement.src = country.URL;

        document.getElementById('info-id').textContent = country.info;



    });
}



