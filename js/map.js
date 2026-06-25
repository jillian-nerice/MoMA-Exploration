async function loadMap() {

  // colour scale
  function getColor(count) {
    if (!count) return "#d7d7d3";
    if (count > 1200) return "#110320";
    if (count > 600) return "#2d0d56";
    if (count > 300) return "#311d60";
    if (count > 150) return "#45418d";
    if (count > 75) return "#6d6aa2";
    if (count > 25) return "#8285bd";
    return "#9ea1cc";
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

  const geoCountryNames = geoData.features.map(feature => feature.properties.name);

  // handles country-name differences between mapping and GeoJSON
  function resolveGeoCountryName(country) {
    const aliases = {
      "Czech Republic": ["Czech Republic", "Czechia"],
      "Ivory Coast": ["Ivory Coast", "Côte d'Ivoire"],
      "Macedonia": ["Macedonia", "North Macedonia"],
      "Bahamas": ["Bahamas", "The Bahamas"],
      "Democratic Republic of the Congo": [
        "Democratic Republic of the Congo",
        "Dem. Rep. Congo",
        "Democratic Republic of Congo"
      ],
      "Palestine": ["Palestine", "West Bank", "Palestinian Territory"],
      "Western Sahara": ["Western Sahara", "W. Sahara"],
      "United States of America": ["United States of America", "United States"],
      "South Korea": ["South Korea", "Republic of Korea"],
      "Russia": ["Russia", "Russian Federation"],
      "Syria": ["Syria", "Syrian Arab Republic"],
      "Tanzania": ["Tanzania", "United Republic of Tanzania"],
      "Iran": ["Iran", "Islamic Republic of Iran"],
      "Vietnam": ["Vietnam", "Viet Nam"],
      "Laos": ["Laos", "Lao PDR"]
    };

    const possibleNames = aliases[country] || [country];

    for (const name of possibleNames) {
      if (geoCountryNames.includes(name)) {
        return name;
      }
    }

    return null;
  }

  // connects GeoJSON country name back to the standard country name used in links
  function getStandardCountryFromGeo(geoCountryName) {
    const allCountries = [...new Set(Object.values(nationalityToCountry))];

    for (const country of allCountries) {
      const resolvedName = resolveGeoCountryName(country);

      if (resolvedName === geoCountryName) {
        return country;
      }
    }

    return geoCountryName;
  }

  // count artists per country
  const countryCounts = {};
  const unmappedNationalities = {};
  const missingGeoCountries = {};

  artists.forEach(artist => {
    const nationality = cleanNationality(artist.Nationality);
    if (!nationality) return;

    const country = nationalityToCountry[nationality];

    if (!country) {
      unmappedNationalities[nationality] =
        (unmappedNationalities[nationality] || 0) + 1;
      return;
    }

    const geoCountryName = resolveGeoCountryName(country);

    if (!geoCountryName) {
      missingGeoCountries[country] =
        (missingGeoCountries[country] || 0) + 1;
      return;
    }

    countryCounts[geoCountryName] =
      (countryCounts[geoCountryName] || 0) + 1;
  });

  console.log("Country counts:", countryCounts);
  console.log("Still unmapped nationalities:", unmappedNationalities);
  console.log("Mapped countries missing from GeoJSON:", missingGeoCountries);

  function getCountryCount(countryName) {
    return countryCounts[countryName] || 0;
  }

  // style each country
  function style(feature) {
    const countryName = feature.properties.name;
    const count = getCountryCount(countryName);

    return {
      fillColor: getColor(count),
      weight: 1,
      color: "white",
      fillOpacity: 0.8
    };
  }

  // hover + click behaviour
  function onEachFeature(feature, layer) {
    const geoCountryName = feature.properties.name;
    const count = getCountryCount(geoCountryName);

    layer.bindTooltip(
      `<strong>${geoCountryName}</strong><br>${count} artists`,
      { sticky: true }
    );

    layer.on("mouseover", function () {
      layer.setStyle({
        weight: 2,
        color: "#222"
      });
    });

    layer.on("mouseout", function () {
      layer.setStyle(style(feature));
    });

    layer.on("click", function () {
      const standardCountryName = getStandardCountryFromGeo(geoCountryName);

      window.location.href =
        `country.html?country=${encodeURIComponent(standardCountryName)}`;
    });
  }

  // add countries
  L.geoJSON(geoData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);

  // default starting view
  const defaultBounds = L.latLngBounds(
    [-55, -170],
    [75, 180]
  );

  map.fitBounds(defaultBounds);

  // stops user from dragging too far into empty space
  map.setMaxBounds([
    [-65, -220],
    [88, 220]
  ]);

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


// show clickable countries and clickable subsections in sidebar
async function showCountries() {
  const response = await fetch("data/Artists_clean.json");
  const artists = await response.json();

  const container = document.getElementById("country-list");
  container.innerHTML = "";

  const sortSelect = document.getElementById("sort-countries");
  const sortType = sortSelect ? sortSelect.value : "count";

  const countryData = {};

  artists.forEach(artist => {
    const nationality = cleanNationality(artist.Nationality);
    if (!nationality) return;

    const country = nationalityToCountry[nationality];
    if (!country) return;

    if (!countryData[country]) {
      countryData[country] = {
        count: 0,
        nationalities: {}
      };
    }

    countryData[country].count++;

    countryData[country].nationalities[nationality] =
      (countryData[country].nationalities[nationality] || 0) + 1;
  });

  let sortedCountries = Object.entries(countryData);

  if (sortType === "alphabetical") {
    sortedCountries.sort((a, b) => a[0].localeCompare(b[0]));
  } else {
    sortedCountries.sort((a, b) => b[1].count - a[1].count);
  }

  sortedCountries.forEach(([country, data]) => {
    const countryBlock = document.createElement("div");
    countryBlock.className = "country-block";

    const countryLink = document.createElement("a");
    countryLink.href = `country.html?country=${encodeURIComponent(country)}`;
    countryLink.className = "country-link";
    countryLink.innerText = `${country} — ${data.count}`;

    countryBlock.appendChild(countryLink);

    const nationalities = Object.entries(data.nationalities)
      .sort((a, b) => b[1] - a[1]);

    if (nationalities.length > 1) {
      const subsectionList = document.createElement("div");
      subsectionList.className = "subsection-list";

      nationalities.forEach(([nationality, count]) => {
        const subsectionLink = document.createElement("a");

        subsectionLink.href =
          `country.html?country=${encodeURIComponent(country)}&nationality=${encodeURIComponent(nationality)}`;

        subsectionLink.className = "subsection-link";
        subsectionLink.innerText = `${nationality} — ${count}`;

        subsectionList.appendChild(subsectionLink);
      });

      countryBlock.appendChild(subsectionList);
    }

    container.appendChild(countryBlock);
  });
}
