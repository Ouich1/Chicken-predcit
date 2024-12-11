document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("grid");
  const status = document.getElementById("status");
  const predictButton = document.getElementById("predict");

  const gridSize = 5; // Grid size: 5x5
  const totalTiles = gridSize * gridSize;
  const tiles = Array(totalTiles).fill(null); // Initialize tiles array
  const revealedTiles = [];

  // Fetch predictions from the API
  async function fetchStepResponse() {
    try {
      const response = await fetch("https://games.upgaming.com/games/api/games/step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://games.upgaming.com",
          "Referer": "https://games.upgaming.com/...", // Add full Referer URL here
        },
        body: JSON.stringify({
          // Add required payload here, if needed (based on the request payload from the game)
        }),
      });

      const stepData = await response.json();
      const tilesData = JSON.parse(stepData.Data.Bets[0].CurrentStateJson).bn;

      // Process API data to update the tiles array
      const chickens = tilesData.filter((tile) => !tile.m).map((tile) => tile.n - 1); // Chicken indices
      const bones = tilesData.filter((tile) => tile.m).map((tile) => tile.n - 1); // Bone indices

      chickens.forEach((index) => (tiles[index] = "chicken"));
      bones.forEach((index) => (tiles[index] = "bone"));

      // Debug logs for testing
      console.log("Chickens:", chickens);
      console.log("Bones:", bones);
      console.log("Tiles Array:", tiles);

      status.textContent = "Predictions updated!";
    } catch (error) {
      console.error("Error fetching step response:", error);
      status.textContent = "Failed to fetch predictions. Using fallback.";

      // Fallback: Random placement if API fails
      for (let i = 0; i < 20; i++) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * totalTiles);
        } while (tiles[randomIndex] !== null);
        tiles[randomIndex] = "chicken";
      }

      for (let i = 0; i < totalTiles; i++) {
        if (tiles[i] === null) tiles[i] = "bone";
      }
    }
  }

  // Create grid tiles
  for (let i = 0; i < totalTiles; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.textContent = "?";
    tile.addEventListener("click", () => revealTile(i, tile));
    grid.appendChild(tile);
  }

  // Reveal tile logic
  function revealTile(index, tileElement) {
    if (revealedTiles.includes(index)) return;

    revealedTiles.push(index);

    if (tiles[index] === "chicken") {
      tileElement.textContent = "🐔";
      tileElement.classList.add("revealed", "chicken");
      status.textContent = "You found a chicken!";
    } else if (tiles[index] === "bone") {
      tileElement.textContent = "💀";
      tileElement.classList.add("revealed", "bone");
      status.textContent = "You hit a bone!";
    }
  }

  // Predict and reveal all tiles
  predictButton.addEventListener("click", async () => {
    await fetchStepResponse(); // Fetch predictions from the API

    const tileElements = document.querySelectorAll(".tile");

    for (let i = 0; i < totalTiles; i++) {
      const tile = tileElements[i];

      if (tiles[i] === "chicken") {
        tile.textContent = "🐔";
        tile.classList.add("revealed", "chicken");
      } else if (tiles[i] === "bone") {
        tile.textContent = "💀";
        tile.classList.add("revealed", "bone");
      }
    }
    status.textContent = "Predictions revealed!";
  });
});