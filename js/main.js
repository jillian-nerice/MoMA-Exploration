async function loadArtists() {
  const response = await fetch("data/Artists_clean.json");
  const artists = await response.json();

  console.log(artists); // check in console

  const container = document.getElementById("output");

  container.innerHTML = "";

  artists.slice(0, 10).forEach(artist => {
    const div = document.createElement("div");

    div.innerText = artist.DisplayName + " (" + artist.Nationality + ")";

    container.appendChild(div);
  });
}