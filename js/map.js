async function loadMap() {

  // colour scale
  function getColor(count) {
    if (!count) return "#eeeeee";
    if (count > 1200) return "#3f007d";
    if (count > 600) return "#54278f";
    if (count > 300) return "#6a51a3";
    if (count > 150) return "#807dba";
    if (count > 75) return "#9e9ac8";
    if (count > 25) return "#bcbddc";
    return "#efedf5";
  }

  // create map
  const map = L.map("map");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // load data
  const response = await fetch("data/Artists_clean.json");
  const artists = await response.json();

  const geoRes = await fetch("data/countries.geo.json");
  const geoData = await geoRes.json();

  // count artists per nationality
  const counts = {};

  artists.forEach(artist => {
    const nationality = artist.Nationality;
    if (!nationality) return;

    counts[nationality] = (counts[nationality] || 0) + 1;
  });

  console.log(counts);

  // mapping nationality → country
  const mapping = {
    "American": "United States of America",
    "German": "Germany",
    "British": "United Kingdom",
    "French": "France",
    "Italian": "Italy",
    "Japanese": "Japan",
    "Swiss": "Switzerland",
    "Dutch": "Netherlands",
    "Russian": "Russia",
    "Austrian": "Austria",
    "Canadian": "Canada",
    "Brazilian": "Brazil",
    "Mexican": "Mexico",
    "Spanish": "Spain",
    "Argentine": "Argentina"
  };

  // style function
  function style(feature) {
    const countryName = feature.properties.name;

    let count = 0;

    for (let nationality in counts) {
      if (mapping[nationality] === countryName) {
        count = counts[nationality];
      }
    }

    return {
      fillColor: getColor(count),
      weight: 1,
      color: "white",
      fillOpacity: 0.8
    };
  }

  // add countries
  const geoLayer = L.geoJSON(geoData, { style: style }).addTo(map);

  // fit to data (removes empty space)
  map.fitBounds(geoLayer.getBounds());

  const defaultBounds = geoLayer.getBounds();

  // reset button
  const resetControl = L.control({ position: "topleft" });

  resetControl.onAdd = function () {
    const btn = L.DomUtil.create("button", "reset-btn");
    btn.innerText = "Reset View";

    btn.onclick = function () {
      map.fitBounds(defaultBounds);
    };

    return btn;
  };

  resetControl.addTo(map);

  // legend
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "legend");

    const labels = [
      "No data",
      "1–25",
      "26–75",
      "76–150",
      "151–300",
      "301–600",
      "601–1200",
      "1201+"
    ];

    const values = [0, 1, 26, 76, 151, 301, 601, 1201];

    div.innerHTML += "<strong>Artists represented</strong><br>";

    for (let i = 0; i < labels.length; i++) {
      div.innerHTML += `
        <div>
          <span style="
            display:inline-block;
            width:18px;
            height:18px;
            background:${getColor(values[i])};
            margin-right:8px;
            border:1px solid #999;
          "></span>
          ${labels[i]}
        </div>
      `;
    }

    return div;
  };

  legend.addTo(map);
}

window.onload = loadMap;


// show countries list
async function showCountries() {
  const response = await fetch("data/Artists_clean.json");
  const artists = await response.json();

  const container = document.getElementById("country-list");
  container.innerHTML = "";

  const counts = {};

  artists.forEach(artist => {
    const nationality = artist.Nationality;
    if (!nationality) return;

    counts[nationality] = (counts[nationality] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1]);

  sorted.slice(0, 50).forEach(([country, count]) => {
    const div = document.createElement("div");
    div.innerText = `${country} — ${count}`;
    container.appendChild(div);
  });
}
