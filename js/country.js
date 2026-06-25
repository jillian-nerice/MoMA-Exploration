async function loadCountry() {
  const params = new URLSearchParams(window.location.search);
  const selectedCountry = params.get("country");
  const selectedNationality = params.get("nationality");

  const res = await fetch("data/Artists_clean.json");
  const artists = await res.json();

  const title = document.getElementById("title");
  const container = document.getElementById("artists");
  const backButton = document.querySelector(".back-link");

  container.innerHTML = "";

  if (!selectedCountry) {
    title.innerText = "No country selected";
    container.innerText = "Please go back to the map and choose a country.";
    return;
  }

  // Make the back button behave differently depending on where we are
  if (selectedNationality) {
    backButton.innerText = `← Back to ${selectedCountry}`;
    backButton.onclick = function () {
      window.location.href = `country.html?country=${encodeURIComponent(selectedCountry)}`;
    };
  } else {
    backButton.innerText = "← Back to map";
    backButton.onclick = function () {
      window.location.href = "map.html";
    };
  }

  // Find all nationality labels that belong to this country
  const nationalitiesForCountry = Object.entries(nationalityToCountry)
    .filter(([nationality, country]) => country === selectedCountry)
    .map(([nationality]) => nationality);

  // Count artists by nationality within this country
  const nationalityCounts = {};

  artists.forEach(artist => {
    const nationality = cleanNationality(artist.Nationality);

    if (nationalitiesForCountry.includes(nationality)) {
      nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1;
    }
  });

  const availableNationalities = Object.entries(nationalityCounts)
    .filter(([nationality, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  // CASE 1:
  // If a subgroup/nationality was clicked, show only that subgroup's artists
  if (selectedNationality) {
    showArtistsByNationality(
      selectedCountry,
      selectedNationality,
      artists,
      title,
      container
    );

    return;
  }

  // CASE 2:
  // If country has multiple subgroup categories, show the subgroup choice page
  if (availableNationalities.length > 1) {
    title.innerText = `Artists from ${selectedCountry}`;

    const intro = document.createElement("p");
    intro.innerText =
      "This country has multiple nationality categories in the MoMA dataset. Choose one to explore its artists.";
    container.appendChild(intro);

    const subgroupContainer = document.createElement("div");
    subgroupContainer.className = "subgroup-container";

    availableNationalities.forEach(([nationality, count]) => {
      const link = document.createElement("a");

      link.href =
        `country.html?country=${encodeURIComponent(selectedCountry)}&nationality=${encodeURIComponent(nationality)}`;

      link.className = "subgroup-card";
      link.innerText = `${nationality} — ${count} artist${count === 1 ? "" : "s"}`;

      subgroupContainer.appendChild(link);
    });

    container.appendChild(subgroupContainer);
    return;
  }

  // CASE 3:
  // If country only has one nationality category, show artists directly
  if (availableNationalities.length === 1) {
    const onlyNationality = availableNationalities[0][0];

    showArtistsByNationality(
      selectedCountry,
      onlyNationality,
      artists,
      title,
      container
    );

    return;
  }

  // CASE 4:
  // No artists found
  title.innerText = `Artists from ${selectedCountry}`;
  container.innerText = "No artists found for this country.";
}


function showArtistsByNationality(
  selectedCountry,
  selectedNationality,
  artists,
  title,
  container
) {
  title.innerText = `${selectedNationality} artists`;

  // first, only keep artists from this nationality group
  const baseFiltered = artists.filter(artist => {
    return cleanNationality(artist.Nationality) === selectedNationality;
  });

  // create filter area
  const filterContainer = document.createElement("div");
  filterContainer.className = "filter-container";

  // gender filter
  const genderLabel = document.createElement("label");
  genderLabel.innerText = "Filter by gender: ";

  const genderSelect = document.createElement("select");
  genderSelect.id = "gender-filter";

  const genderOptions = [
    "All",
    "male",
    "female",
    "non-binary",
    "Unknown"
  ];

  genderOptions.forEach(gender => {
    const option = document.createElement("option");
    option.value = gender;
    option.innerText = gender;
    genderSelect.appendChild(option);
  });

  // time period filter
  const timeLabel = document.createElement("label");
  timeLabel.innerText = " Filter by time period: ";

  const timeSelect = document.createElement("select");
  timeSelect.id = "time-filter";

  const timeOptions = [
    { label: "All", value: "All" },
    { label: "Before 1800", value: "before-1800" },
    { label: "1800s", value: "1800s" },
    { label: "1900s", value: "1900s" },
    { label: "2000s", value: "2000s" },
    { label: "Unknown date", value: "Unknown" }
  ];

  timeOptions.forEach(period => {
    const option = document.createElement("option");
    option.value = period.value;
    option.innerText = period.label;
    timeSelect.appendChild(option);
  });

  filterContainer.appendChild(genderLabel);
  filterContainer.appendChild(genderSelect);
  filterContainer.appendChild(timeLabel);
  filterContainer.appendChild(timeSelect);

  container.appendChild(filterContainer);

  // count text
  const countText = document.createElement("p");
  container.appendChild(countText);

  // artist list container
  const artistList = document.createElement("div");
  artistList.id = "filtered-artist-list";
  container.appendChild(artistList);

  function renderArtists() {
    artistList.innerHTML = "";

    const selectedGender = genderSelect.value;
    const selectedTime = timeSelect.value;

    let filtered = baseFiltered.filter(artist => {
      // gender filtering
      const artistGender = artist.Gender || "Unknown";

      if (selectedGender !== "All") {
        if (selectedGender === "Unknown") {
          if (artist.Gender) return false;
        } else {
          if (artistGender !== selectedGender) return false;
        }
      }

      // time filtering
      const beginDate = Number(artist.BeginDate);

      if (selectedTime !== "All") {
        if (selectedTime === "Unknown") {
          if (beginDate) return false;
        }

        if (selectedTime === "before-1800") {
          if (!beginDate || beginDate >= 1800) return false;
        }

        if (selectedTime === "1800s") {
          if (!beginDate || beginDate < 1800 || beginDate > 1899) return false;
        }

        if (selectedTime === "1900s") {
          if (!beginDate || beginDate < 1900 || beginDate > 1999) return false;
        }

        if (selectedTime === "2000s") {
          if (!beginDate || beginDate < 2000 || beginDate > 2099) return false;
        }
      }

      return true;
    });

    countText.innerText =
      `${filtered.length} artist${filtered.length === 1 ? "" : "s"} found.`;

    if (filtered.length === 0) {
      artistList.innerText = "No artists match these filters.";
      return;
    }

    filtered.forEach(artist => {
      const div = document.createElement("div");

      div.className = "artist-list-item";

      const birthYear = artist.BeginDate ? ` (${artist.BeginDate})` : "";
      div.innerText = `${artist.DisplayName}${birthYear}`;

      div.style.cursor = "pointer";

      div.onclick = () => {
        let url = `artist.html?id=${artist.ConstituentID}&country=${encodeURIComponent(selectedCountry)}`;

        if (selectedNationality) {
          url += `&nationality=${encodeURIComponent(selectedNationality)}`;
        }

        window.location.href = url;
      };

      artistList.appendChild(div);
    });
  }

  // update list when filters change
  genderSelect.onchange = renderArtists;
  timeSelect.onchange = renderArtists;

  // initial render
  renderArtists();
}

window.onload = loadCountry;

