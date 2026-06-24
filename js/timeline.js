async function loadTimeline() {
  const response = await fetch("data/Artworks_clean.json");
  const artworks = await res.json();

  const container = document.getElementById("timeline");

  artworks.slice(0, 20).forEach(work => {
    const div = document.createElement("div");
    div.innerText = work.Date + " — " + work.Title;
    container.appendChild(div);
  });
}

window.onload = loadTimeline;
