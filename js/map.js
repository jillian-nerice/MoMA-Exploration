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

  // mapping nationality → country name
  const nationalityToCountry = {
    "Afghan": "Afghanistan",
    "Albanian": "Albania",
    "Algerian": "Algeria",
    "American": "United States of America",
    "Angolan": "Angola",
    "Anmatyerr [Australian]": "Australia",
    "Argentine": "Argentina",
    "Australian": "Australia",
    "Austrian": "Austria",
    "Azerbaijani": "Azerbaijan",
    "Bahamian": "Bahamas",
    "Bangladeshi": "Bangladesh",
    "Belgian": "Belgium",
    "Beninese": "Benin",
    "Bolivian": "Bolivia",
    "Bosnian": "Bosnia and Herzegovina",
    "Brazilian": "Brazil",
    "British": "United Kingdom",
    "Bulgarian": "Bulgaria",
    "Burkinabé": "Burkina Faso",
    "Cambodian": "Cambodia",
    "Cameroonian": "Cameroon",
    "Canadian": "Canada",
    "Canadian Inuit": "Canada",
    "Catalan": "Spain",
    "Central African": "Central African Republic",
    "Chilean": "Chile",
    "Chinese": "China",
    "Colombian": "Colombia",
    "Congolese": "Democratic Republic of the Congo",
    "Coptic": "Egypt",
    "Costa Rican": "Costa Rica",
    "Croatian": "Croatia",
    "Cuban": "Cuba",
    "Cypriot": "Cyprus",
    "Czech": "Czech Republic",
    "Czechoslovakian": "Czech Republic",
    "Danish": "Denmark",
    "Dominican": "Dominican Republic",
    "Dutch": "Netherlands",
    "Ecuadorian": "Ecuador",
    "Egyptian": "Egypt",
    "Emirati": "United Arab Emirates",
    "English": "United Kingdom",
    "Estonian": "Estonia",
    "Ethiopian": "Ethiopia",
    "Filipino": "Philippines",
    "Finnish": "Finland",
    "French": "France",
    "French-Ivorian": "Ivory Coast",
    "Georgian": "Georgia",
    "German": "Germany",
    "Ghanaian": "Ghana",
    "Greek": "Greece",
    "Guatemalan": "Guatemala",
    "Haitian": "Haiti",
    "Hungarian": "Hungary",
    "Icelandic": "Iceland",
    "Indian": "India",
    "Indonesian": "Indonesia",
    "Iranian": "Iran",
    "Iraqi": "Iraq",
    "Irish": "Ireland",
    "Israeli": "Israel",
    "Italian": "Italy",
    "Ivatan": "Philippines",
    "Ivorian": "Ivory Coast",
    "Jamaican": "Jamaica",
    "Japanese": "Japan",
    "Kalaaleq": "Greenland",
    "Kenyan": "Kenya",
    "Korean": "South Korea",
    "South Korean": "South Korea",
    "Kuwaiti": "Kuwait",
    "Kyrgyz": "Kyrgyzstan",
    "Latvian": "Latvia",
    "Lebanese": "Lebanon",
    "Lithuanian": "Lithuania",
    "Luxembourger": "Luxembourg",
    "Macedonian": "Macedonia",
    "Malaysian": "Malaysia",
    "Malian": "Mali",
    "Mexican": "Mexico",
    "Moroccan": "Morocco",
    "Mozambican": "Mozambique",
    "Namibian": "Namibia",
    "Native American": "United States of America",
    "Nepali": "Nepal",
    "New Zealander": "New Zealand",
    "Nicaraguan": "Nicaragua",
    "Nigerian": "Nigeria",
    "Norwegian": "Norway",
    "Ojibwe": "United States of America",
    "Okinawan": "Japan",
    "Oneida": "United States of America",
    "Pakistani": "Pakistan",
    "Palestinian": "Palestine",
    "Panamanian": "Panama",
    "Paraguayan": "Paraguay",
    "Persian": "Iran",
    "Peruvian": "Peru",
    "Polish": "Poland",
    "Portuguese": "Portugal",
    "Puerto Rican": "Puerto Rico",
    "Romanian": "Romania",
    "Russian": "Russia",
    "Sahrawi": "Western Sahara",
    "Salvadoran": "El Salvador",
    "Scottish": "United Kingdom",
    "Senegalese": "Senegal",
    "Serbian": "Serbia",
    "Sierra Leonean": "Sierra Leone",
    "Singaporean": "Singapore",
    "Slovak": "Slovakia",
    "Slovenian": "Slovenia",
    "South African": "South Africa",
    "Spanish": "Spain",
    "Spirit Lake Dakota/Cheyenne River Lakota": "United States of America",
    "Sri Lankan": "Sri Lanka",
    "Sudanese": "Sudan",
    "Swedish": "Sweden",
    "Swiss": "Switzerland",
    "Syrian": "Syria",
    "Taiwanese": "Taiwan",
    "Tanzanian": "Tanzania",
    "Thai": "Thailand",
    "Tlingit": "United States of America",
    "Trinidad and Tobagonian": "Trinidad and Tobago",
    "Tunisian": "Tunisia",
    "Turkish": "Turkey",
    "Ugandan": "Uganda",
    "Ukrainian": "Ukraine",
    "Uruguayan": "Uruguay",
    "Uzbekistani": "Uzbekistan",
    "Venezuelan": "Venezuela",
    "Vietnamese": "Vietnam",
    "Welsh": "United Kingdom",
    "Yugoslavian": "Serbia",
    "Zimbabwean": "Zimbabwe"
  };

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

  // get all country names that exist in the GeoJSON
  const geoCountryNames = geoData.features.map(feature => feature.properties.name);
  console.log("GeoJSON country names:", geoCountryNames.sort());

  // helper: handles cases where your mapping name might be slightly different from the GeoJSON name
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
      "Laos": ["Laos", "Lao PDR"],
      "Moldova": ["Moldova", "Republic of Moldova"]
    };

    const possibleNames = aliases[country] || [country];

    for (const name of possibleNames) {
      if (geoCountryNames.includes(name)) {
        return name;
      }
    }

    return null;
  }

  // count artists per country
  const countryCounts = {};
  const unmappedNationalities = {};
  const missingGeoCountries = {};

  artists.forEach(artist => {
    const nationality = artist.Nationality;

    if (!nationality) return;

    const cleanNationality = nationality.trim();
    const country = nationalityToCountry[cleanNationality];

    // if the nationality does not exist in nationalityToCountry
    if (!country) {
      unmappedNationalities[cleanNationality] =
        (unmappedNationalities[cleanNationality] || 0) + 1;
      return;
    }

    const geoCountryName = resolveGeoCountryName(country);

    // if we mapped the nationality, but the country name does not match the GeoJSON
    if (!geoCountryName) {
      missingGeoCountries[country] =
        (missingGeoCountries[country] || 0) + 1;
      return;
    }

    countryCounts[geoCountryName] = (countryCounts[geoCountryName] || 0) + 1;
  });

  console.log("Country counts:", countryCounts);
  console.log("Still unmapped nationalities:", unmappedNationalities);
  console.log("Mapped countries missing from GeoJSON:", missingGeoCountries);

  // get count for a GeoJSON country
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

  // hover tooltip
  function onEachFeature(feature, layer) {
    const countryName = feature.properties.name;
    const count = getCountryCount(countryName);

    layer.bindTooltip(
      `<strong>${countryName}</strong><br>${count} artists`,
      { sticky: true }
    );
  }

  // add countries
  L.geoJSON(geoData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);

  // default starting view: less Antarctica, more useful world view
  const defaultBounds = L.latLngBounds(
    [-55, -170],
    [75, 180]
  );

  map.fitBounds(defaultBounds);

  // prevents dragging too far into empty map space
  map.setMaxBounds([
    [-65, -220],
    [85, 220]
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


// show countries list
async function showCountries() {
  const response = await fetch("data/Artists_clean.json");
  const artists = await response.json();

  const container = document.getElementById("country-list");
  container.innerHTML = "";

  const sortSelect = document.getElementById("sort-countries");
  const sortType = sortSelect ? sortSelect.value : "count";

  const nationalityCounts = {};

  artists.forEach(artist => {
    const nationality = artist.Nationality;
    if (!nationality) return;

    const cleanNationality = nationality.trim();

    nationalityCounts[cleanNationality] =
      (nationalityCounts[cleanNationality] || 0) + 1;
  });

  let sorted = Object.entries(nationalityCounts);

  if (sortType === "alphabetical") {
    sorted.sort((a, b) => a[0].localeCompare(b[0]));
  } else {
    sorted.sort((a, b) => b[1] - a[1]);
  }

  sorted.forEach(([nationality, count]) => {
    const div = document.createElement("div");
    div.innerText = `${nationality} — ${count}`;
    container.appendChild(div);
  });
}