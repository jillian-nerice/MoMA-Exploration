async function loadArtist() {
  
  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");
  const artistId = params.get("id");
  const selectedCountry = params.get("country");
  const selectedNationality = params.get("nationality");

  const backButton = document.querySelector(".back-link");
  const nameContainer = document.getElementById("name");
  const detailsContainer = document.getElementById("details");
  const worksContainer = document.getElementById("works");
  const worksCount = document.getElementById("works-count");

  // ✅ CLEAR EVERYTHING FIRST
  nameContainer.innerHTML = "";
  detailsContainer.innerHTML = "";
  worksContainer.innerHTML = "";
  worksCount.innerHTML = "";

  // ✅ BACK BUTTON
    if (selectedNationality && selectedCountry) {
    backButton.innerText = `← Back to ${selectedNationality}`;

    backButton.onclick = () => {
        window.location.href =
        `country.html?country=${encodeURIComponent(selectedCountry)}&nationality=${encodeURIComponent(selectedNationality)}`;
    };

    } else if (selectedCountry) {
    backButton.innerText = `← Back to ${selectedCountry}`;

    backButton.onclick = () => {
        window.location.href =
        `country.html?country=${encodeURIComponent(selectedCountry)}`;
    };

    } else if (from === "timeline") {
    // ✅ NEW CASE
    backButton.innerText = "← Back to Timeline";

    backButton.onclick = () => {
        window.location.href = "timeline.html";
    };

    } else {
    // fallback (rare case)
    backButton.innerText = "← Back to Map";

    backButton.onclick = () => {
        window.location.href = "map.html";
    };
    }
  // ✅ CHECK ID
  if (!artistId) {
    nameContainer.innerText = "Artist not found";
    return;
  }

  // ✅ LOAD ARTISTS
  const artistRes = await fetch("data/Artists_clean.json");
  const artists = await artistRes.json();

  const artist = artists.find(a =>
    String(a.ConstituentID) === String(artistId)
  );

  if (!artist) {
    nameContainer.innerText = "Artist not found";
    return;
  }

  // ✅ NAME
  nameContainer.innerText = artist.DisplayName;

  // ✅ DETAILS
  if (artist.ArtistBio) {
    const bio = document.createElement("p");
    bio.innerText = artist.ArtistBio;
    detailsContainer.appendChild(bio);
  }

  if (artist.Nationality) {
    const nat = document.createElement("p");
    nat.innerText = `Nationality: ${artist.Nationality}`;
    detailsContainer.appendChild(nat);
  }

  const dates = document.createElement("p");
  dates.innerText =
    `Born: ${artist.BeginDate || "Unknown"} | ` +
    `Died: ${artist.EndDate || "Unknown"}`;
  detailsContainer.appendChild(dates);

  // ✅ LOAD ARTWORKS
  const worksRes = await fetch("data/Artworks_clean.json");
  const artworks = await worksRes.json();

  const numericArtistId = parseInt(artistId);

  // ✅ FILTER (SAFE VERSION)
  const artistWorks = artworks.filter(work => {
    if (!work.ConstituentID) return false;

    return work.ConstituentID.includes(numericArtistId);
  });

  if (artistWorks.length === 0) {
    worksCount.innerText = "No artworks found for this artist.";
    return;
  }

  worksCount.innerText =
    `${artistWorks.length} artwork${artistWorks.length === 1 ? "" : "s"} found.`;

  const visibleWorks = artistWorks.slice(0, 30);

  // ✅ DISPLAY
  visibleWorks.forEach(work => {
    const card = document.createElement("div");
    card.className = "art-card";

    // IMAGE
    const img = document.createElement("img");

    // ✅ if valid image exists
    if (work.ImageURL && work.ImageURL !== "") {
    img.src = work.ImageURL;
    } else {
    // ✅ fallback box instead of broken image
    img.src = "https://via.placeholder.com/200?text=No+Image";
    }

    img.alt = work.Title || "Artwork";

    card.appendChild(img);


    // TITLE
    const title = document.createElement("p");
    title.innerText = work.Title || "Untitled";

    // DATE
    const date = document.createElement("p");
    date.innerText = work.Date || "";

    // LINK
    const link = document.createElement("a");
    link.href = work.URL;
    link.target = "_blank";
    link.innerText = "View on MoMA";

    // BUILD CARD
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(link);

    worksContainer.appendChild(card);
  });
}

window.onload = loadArtist;