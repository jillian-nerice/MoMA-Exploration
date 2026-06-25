async function loadTimeline() {

  const container = document.getElementById("timeline");
  container.innerHTML = "";

  try {
    const res = await fetch("data/Artists_clean.json");
    const artists = await res.json();

    const decades = {};

    // ✅ GROUP BY DECADE ONLY
    artists.forEach(artist => {
      const year = Number(artist.BeginDate);
      if (!year || year === 0) return;

      const decade = Math.floor(year / 10) * 10;

      if (!decades[decade]) {
        decades[decade] = [];
      }

      decades[decade].push(artist);
    });

    const sortedDecades = Object.keys(decades)
      .map(Number)
      .sort((a, b) => a - b);

    sortedDecades.forEach(decade => {

      const section = document.createElement("div");

      // ✅ DECADE BUTTON
      const button = document.createElement("button");
      button.className = "decade-button";
      button.innerText = `${decade}s ▼`;

      // ✅ HIDDEN ARTIST LIST
      const artistList = document.createElement("div");
      artistList.style.display = "none";

      decades[decade].forEach(artist => {
        const item = document.createElement("div");

        item.className = "artist-list-item";
        item.innerText =
          `${artist.DisplayName} (${artist.BeginDate})`;

        item.onclick = () => {
          window.location.href =
            `artist.html?id=${artist.ConstituentID}&from=timeline`;
        };

        artistList.appendChild(item);
      });

      // ✅ TOGGLE SHOW/HIDE
      button.onclick = () => {
        const isHidden = artistList.style.display === "none";

        artistList.style.display = isHidden ? "block" : "none";
        button.innerText = isHidden
          ? `${decade}s ▲`
          : `${decade}s ▼`;
      };

      section.appendChild(button);
      section.appendChild(artistList);

      container.appendChild(section);
    });

  } catch (error) {
    console.error("ERROR:", error);
    container.innerText = "Something went wrong loading the timeline.";
  }
}

window.onload = loadTimeline;