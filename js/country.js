async function loadCountry() {
  const params = new URLSearchParams(window.location.search);
  const selectedCountry = params.get("country");

  const res = await fetch("data/Artists_clean.json");
  const artists = await res.json();

  document.getElementById("title").innerText =
    `Artists from ${selectedCountry}`;

  const container = document.getElementById("artists");

  const filtered = artists.filter(artist => {
    return artist.Nationality === selectedCountry;
  });

  filtered.slice(0, 50).forEach(artist => {
    const div = document.createElement("div");

    div.innerText = artist.DisplayName;
    div.style.cursor = "pointer";
    div.style.margin = "8px";

    div.onclick = () => {
      window.location.href = `artist.html?id=${artist.ConstituentID}`;
    };

    container.appendChild(div);
  });
}

window.onload = loadCountry;