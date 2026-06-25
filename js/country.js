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

  const filtered = artists.filter(artist => {
    return cleanNationality(artist.Nationality) === selectedNationality;
  });

  const countText = document.createElement("p");
  countText.innerText =
    `${filtered.length} artist${filtered.length === 1 ? "" : "s"} found.`;
  container.appendChild(countText);

  filtered.forEach(artist => {
    const div = document.createElement("div");

    div.className = "artist-list-item";
    div.innerText = artist.DisplayName;
    div.style.cursor = "pointer";

        div.onclick = () => {
        let url = `artist.html?id=${artist.ConstituentID}&country=${encodeURIComponent(selectedCountry)}`;

        if (selectedNationality) {
            url += `&nationality=${encodeURIComponent(selectedNationality)}`;
        }

        window.location.href = url;
        };


    container.appendChild(div);
  });
}


window.onload = loadCountry;

