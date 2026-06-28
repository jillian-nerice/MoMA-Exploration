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

  // CLEAR EVERYTHING FIRST
  nameContainer.innerHTML = "";
  detailsContainer.innerHTML = "";
  worksContainer.innerHTML = "";
  worksCount.innerHTML = "";

  //  BACK BUTTON
  if (selectedNationality && selectedCountry) {
    backButton.innerText = `← Back to ${selectedNationality}`;

    backButton.onclick = () => {
      window.location.href =
        `country.html?country=${encodeURIComponent(selectedCountry)}&nationality=${encodeURIComponent(selectedNationality)}`;
    };

  } else if (selectedCountry) {
    backButton.innerText = `← Back to ${getDisplayCountryName(selectedCountry)}`;

    backButton.onclick = () => {
      window.location.href =
        `country.html?country=${encodeURIComponent(selectedCountry)}`;
    };

  } else if (from === "timeline") {

    backButton.innerText = "← Back to Timeline";

    backButton.onclick = () => {
      window.location.href = "timeline.html";
    };

  } else {

    backButton.innerText = "← Back to Map";

    backButton.onclick = () => {
      window.location.href = "map.html";
    };
  }

  //  CHECK ID
  if (!artistId) {
    nameContainer.innerText = "Artist not found";
    return;
  }

  //  LOAD ARTISTS
  const artistRes = await fetch("data/Artists_clean.json");
  const artists = await artistRes.json();

  const artist = artists.find(a =>
    String(a.ConstituentID) === String(artistId)
  );

  if (!artist) {
    nameContainer.innerText = "Artist not found";
    return;
  }

  //  NAME
  nameContainer.innerText = artist.DisplayName;

  //  DETAILS
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

  //  LOAD ARTWORKS
  const worksRes = await fetch("data/Artworks_clean.json");
  const artworks = await worksRes.json();

  const numericArtistId = parseInt(artistId);

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

  //  DISPLAY
  visibleWorks.forEach(work => {
    const card = document.createElement("div");
    card.className = "art-card";

    //  IMAGE OR FALLBACK
    let imgElement;

    function createFallback() {
      const fallback = document.createElement("div");
      fallback.className = "image-fallback";
      fallback.innerText = "Image unavailable";
      return fallback;
    }

    if (work.ImageURL && work.ImageURL.trim() !== "") {
      const img = document.createElement("img");
      img.src = work.ImageURL;

      img.onerror = () => {
        const fallback = createFallback();
        card.replaceChild(fallback, img);
      };

      img.alt = work.Title ? `Artwork: ${work.Title}` : "Artwork";

      img.onclick = () => {
        const modal = document.getElementById("image-modal");
        const modalImg = document.getElementById("modal-image");

        modal.style.display = "flex";
        modalImg.src = img.src;
      };

      imgElement = img;
    } else {
      imgElement = createFallback();
    }

    // TITLE
    const title = document.createElement("p");
    title.innerText = work.Title || "Untitled";

    // DATE
    const date = document.createElement("p");
    date.innerText = work.Date || "";

    // LINK
    let link;

    if (work.URL && work.URL.trim() !== "") {
      link = document.createElement("a");
      link.href = work.URL;
      link.target = "_blank";
      link.innerText = "View on MoMA";
    } else {
      link = document.createElement("span");
      link.innerText = "No link available";
      link.className = "disabled-link";
    }

    // BUILD CARD
    card.appendChild(imgElement);
    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(link);

    worksContainer.appendChild(card);
  });

  //  MODAL CLOSE LOGIC
  const modal = document.getElementById("image-modal");
  const closeBtn = document.querySelector(".close-modal");

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
}

window.onload = loadArtist;