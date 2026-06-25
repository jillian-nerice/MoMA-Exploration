async function loadCountry() {
  const params = new URLSearchParams(window.location.search);
  const selectedCountry = params.get("country");
  const selectedNationality = params.get("nationality");

  const res = await fetch("data/Artists_clean.json");
  const artists = await res.json();

  const title = document.getElementById("title");
  const container = document.getElementById("artists");
  const backButton = document.querySelector(".back-link");

  title.innerText = "";
  container.innerHTML = "";

  if (!selectedCountry) {
    title.innerText = "No country selected";
    container.innerText = "Please go back to the map and choose a country.";
    return;
  }

  // BACK BUTTON
  if (selectedNationality) {
    backButton.innerText = `← Back to ${getDisplayCountryName(selectedCountry)}`;

    backButton.onclick = function () {
      window.location.href =
        `country.html?country=${encodeURIComponent(selectedCountry)}`;
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
    if (!artist.Nationality) return;

    const nationality = cleanNationality(artist.Nationality);

    if (nationalitiesForCountry.includes(nationality)) {
      nationalityCounts[nationality] =
        (nationalityCounts[nationality] || 0) + 1;
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
    title.innerText = `Artists from ${getDisplayCountryName(selectedCountry)}`;

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
      link.innerText =
        `${nationality} — ${count} artist${count === 1 ? "" : "s"}`;

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
  title.innerText = `Artists from ${getDisplayCountryName(selectedCountry)}`;
  container.innerText = "No artists found for this country.";
}


function showArtistsByNationality(
  selectedCountry,
  selectedNationality,
  artists,
  title,
  container
) {

    title.innerText =
    `${getDisplayNationalityName(selectedNationality)} artists`;

  // Base list: only artists from this nationality group
  const baseFiltered = artists.filter(artist => {
    if (!artist.Nationality) return false;

    return cleanNationality(artist.Nationality) === selectedNationality;
  });

  // FILTER / SORT AREA
  const filterContainer = document.createElement("div");
  filterContainer.className = "filter-container";

  // GENDER FILTER
  const genderLabel = document.createElement("label");
  genderLabel.innerText = "Filter by gender: ";

  const genderSelect = document.createElement("select");
  genderSelect.id = "gender-filter";

  const genderOptions = [
    { value: "All", label: "All" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "Unknown", label: "Unknown" }
  ];

  genderOptions.forEach(gender => {
    const option = document.createElement("option");
    option.value = gender.value;
    option.innerText = gender.label;
    genderSelect.appendChild(option);
  });

  // ORDER BY DROPDOWN
  const orderLabel = document.createElement("label");
  orderLabel.innerText = " Order by: ";

  const orderSelect = document.createElement("select");
  orderSelect.id = "order-filter";

  const orderOptions = [
    { value: "default", label: "Default" },
    { value: "time-asc", label: "Time: oldest → newest" },
    { value: "time-desc", label: "Time: newest → oldest" },
    { value: "alpha-asc", label: "Alphabetical: A–Z" },
    { value: "alpha-desc", label: "Alphabetical: Z–A" }
  ];

  orderOptions.forEach(order => {
    const option = document.createElement("option");
    option.value = order.value;
    option.innerText = order.label;
    orderSelect.appendChild(option);
  });

  filterContainer.appendChild(genderLabel);
  filterContainer.appendChild(genderSelect);
  filterContainer.appendChild(orderLabel);
  filterContainer.appendChild(orderSelect);

  container.appendChild(filterContainer);

  // COUNT TEXT
  const countText = document.createElement("p");
  container.appendChild(countText);

  // ARTIST LIST
  const artistList = document.createElement("div");
  artistList.id = "filtered-artist-list";
  container.appendChild(artistList);

  function renderArtists() {
    artistList.innerHTML = "";

    const selectedGender = genderSelect.value;
    const selectedOrder = orderSelect.value;

    let filtered = baseFiltered.filter(artist => {
      const artistGender = artist.Gender
        ? String(artist.Gender).toLowerCase()
        : "Unknown";

      // Gender filtering
      if (selectedGender !== "All") {
        if (selectedGender === "Unknown") {
          if (artist.Gender) return false;
        } else {
          if (artistGender !== selectedGender) return false;
        }
      }

      return true;
    });

    // ORDERING / SORTING
    filtered.sort((a, b) => {
      const nameA = a.DisplayName || "";
      const nameB = b.DisplayName || "";

      const yearA = Number(a.BeginDate);
      const yearB = Number(b.BeginDate);

      if (selectedOrder === "time-asc") {
        return (yearA || 9999) - (yearB || 9999);
      }

      if (selectedOrder === "time-desc") {
        return (yearB || 0) - (yearA || 0);
      }

      if (selectedOrder === "alpha-asc") {
        return nameA.localeCompare(nameB);
      }

      if (selectedOrder === "alpha-desc") {
        return nameB.localeCompare(nameA);
      }

      return 0;
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
        let url =
          `artist.html?id=${artist.ConstituentID}&country=${encodeURIComponent(selectedCountry)}`;

        if (selectedNationality) {
          url += `&nationality=${encodeURIComponent(selectedNationality)}`;
        }

        window.location.href = url;
      };

      artistList.appendChild(div);
    });
  }

  // Update list when filter/order changes
  genderSelect.onchange = renderArtists;
  orderSelect.onchange = renderArtists;

  // Initial render
  renderArtists();
}

window.onload = loadCountry;