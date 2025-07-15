let lives = 5;
let score = 0;
let gameDiv = document.getElementById("game");
let statusP = document.getElementById("status");
let playerName = "";

let basket;
let basketX = 360;
let appleInterval;
let difficultyLevel = "easy";
function registerPlayer() {
  const nameInput = document.getElementById("playerName").value.trim();
  if (!nameInput) {
    alert("Введіть ім'я гравця!");
    return;
  }

  let players = JSON.parse(localStorage.getItem("players")) || [];
  if (players.includes(nameInput)) {
    alert("Такий гравець вже існує! Оберіть у списку.");
    return;
  }

  players.push(nameInput);
  localStorage.setItem("players", JSON.stringify(players));

  startSession(nameInput);
  refreshPlayerList();
}

function selectExistingPlayer() {
  const selectedName = document.getElementById("existingPlayers").value;
  if (!selectedName) {
    alert("Оберіть гравця!");
    return;
  }
  startSession(selectedName);
}

function deleteSelectedPlayer() {
  const selectedName = document.getElementById("existingPlayers").value;
  if (!selectedName) {
    alert("Оберіть гравця для видалення.");
    return;
  }
  if (!confirm(`Ви впевнені, що хочете видалити профіль "${selectedName}"?`)) return;

  let players = JSON.parse(localStorage.getItem("players")) || [];
  players = players.filter(name => name !== selectedName);
  localStorage.setItem("players", JSON.stringify(players));

  // Видаляємо рекорд
  localStorage.removeItem(`bestScore_${selectedName}`);

  refreshPlayerList();
  updateLeaderboard();
}

function startSession(name) {
  playerName = name;
  const best = parseInt(localStorage.getItem(`bestScore_${playerName}`)) || 0;

  document.getElementById("player-registration").style.display = "none";
  document.getElementById("game-controls").style.display = "block";
  document.getElementById("welcome").textContent = `Вітаємо, ${playerName}! Ваш рекорд: ${best}`;

  updateLeaderboard();
}

function startGame() {
  lives = parseInt(document.getElementById("lives").value);
  difficultyLevel = document.getElementById("difficulty").value;
  score = 0;
  basketX = 360;

  gameDiv.innerHTML = "";
  updateStatus();

  basket = document.createElement("div");
  basket.className = "basket";
  basket.style.left = basketX + "px";
  gameDiv.appendChild(basket);

  document.addEventListener("keydown", handleKeyDown);

  clearInterval(appleInterval);
  appleInterval = setInterval(spawnApple, getSpawnInterval());
}

function spawnApple() {
  const apple = document.createElement("div");
  apple.className = "apple";
  apple.textContent = "🍎";
  apple.style.left = Math.random() * (gameDiv.clientWidth - 40) + "px";
  apple.style.top = "0px";
  gameDiv.appendChild(apple);

  let fallInterval = setInterval(() => {
    let top = parseInt(apple.style.top);
    top += getFallSpeed();
    apple.style.top = top + "px";

    const appleRect = apple.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    if (
      appleRect.bottom >= basketRect.top &&
      appleRect.left < basketRect.right &&
      appleRect.right > basketRect.left
    ) {
      apple.remove();
      clearInterval(fallInterval);
      score++;
      updateStatus();
      return;
    }

    if (top > gameDiv.clientHeight) {
      apple.remove();
      clearInterval(fallInterval);
      lives--;
      updateStatus();
      if (lives <= 0) {
        clearInterval(appleInterval);
        document.removeEventListener("keydown", handleKeyDown);
        endGame();
      }
    }
  }, 30);
}

function getSpawnInterval() {
  switch (difficultyLevel) {
    case "easy":
      return 1500;
    case "medium":
      return 1000;
    case "hard":
      return 600;
    default:
      return 1500;
  }
}

function handleKeyDown(e) {
  if (e.key === "ArrowLeft") {
    basketX -= 20;
    if (basketX < 0) basketX = 0;
    basket.style.left = basketX + "px";
  }
  if (e.key === "ArrowRight") {
    basketX += 20;
    if (basketX > gameDiv.clientWidth - 80) basketX = gameDiv.clientWidth - 80;
    basket.style.left = basketX + "px";
  }
}

function updateStatus() {
  statusP.textContent = `Життя: ${lives} |Зловил: ${score}`;
}

function endGame() {
  statusP.textContent = `Гру завершено!Зловил: ${score}`;

  const prevBest = parseInt(localStorage.getItem(`bestScore_${playerName}`)) || 0;
  if (score > prevBest) {
    localStorage.setItem(`bestScore_${playerName}`, score);
    alert(`Новий рекорд для ${playerName}: ${score}!`);
  }

  updateLeaderboard();
}

function updateLeaderboard() {
  const tbody = document.querySelector("#leaderboard tbody");
  tbody.innerHTML = "";

  let players = JSON.parse(localStorage.getItem("players")) || [];
  let records = players.map(name => {
    const score = parseInt(localStorage.getItem(`bestScore_${name}`)) || 0;
    return { name, score };
  });

  records.sort((a, b) => b.score - a.score);

  records.forEach(record => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${record.name}</td><td>${record.score}</td>`;
    tbody.appendChild(row);
  });
}

function refreshPlayerList() {
  const players = JSON.parse(localStorage.getItem("players")) || [];
  const select = document.getElementById("existingPlayers");
  select.innerHTML = '<option value="">--Обрати гравця--</option>';
  players.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

function getFallSpeed() {
  switch (difficultyLevel) {
    case "easy":
      return 3;
    case "medium":
      return 6;
    case "hard":
      return 10;
    default:
      return 3;
  }
}

window.onload = function() {
  refreshPlayerList();
  updateLeaderboard();
};