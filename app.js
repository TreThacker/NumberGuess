/* <------------------------------------------------
      TITLE: Number Guessing Game
      CREATOR: Tre Thacker
      YEAR: 2026
      VERSION: 1.00
      DEDICATION:
   -------------------------------------------------> */

/* <------------------------------------------------
      APP INFORMATION CONSTANTS
   -------------------------------------------------> */
const APP_INFO = {
  title: "Number Guessing Game",
  creator: "Tre Thacker",
  year: "2026",
  version: "1.00",
  dedication: ""
};

/* <------------------------------------------------
      GAME CONFIGURATION AND STATE
   -------------------------------------------------> */
const difficultyRules = [
  {name:"easy",min:1,max:50,attempts:10},
  {name:"medium",min:1,max:100,attempts:7},
  {name:"hard",min:1,max:500,attempts:5}
];

let randomNumber;
let attemptsRemaining;
let totalAllowedAttempts;
let currentDifficultyCategory = "medium";
let currentMinBoundary;
let currentMaxBoundary;

let coinBank = parseInt(localStorage.getItem("coin_bank")) || 0;
let ownedIcons = JSON.parse(localStorage.getItem("owned_icons")) || ["🎯"];
let activeIcon = localStorage.getItem("active_icon") || "🎯";

/* <------------------------------------------------
      DOM ELEMENT REFERENCES
   -------------------------------------------------> */

const feedback = document.querySelector("#feedback");
const attemptsLeftDisplay = document.querySelector("#attemptsLeft");
const gameInstructions = document.querySelector("#gameInstructions");
const inputField = document.querySelector("#guessInput");
const submitBtn = document.querySelector("#submitBtn");
const restartBtn = document.querySelector("#restartBtn");
const hintBtn = document.querySelector("#hintBtn");
const hintBox = document.querySelector("#hintBox");
const minRangeInput = document.querySelector("#minRangeInput");
const maxRangeInput = document.querySelector("#maxRangeInput");
const attemptsInput = document.querySelector("#attemptsInput");
const currentDiffLabel = document.querySelector("#currentDiffLabel");
const highScoreDisplay = document.querySelector("#highScoreDisplay");
const coinBankDisplay = document.querySelector("#coinBankDisplay");
const activeIconDisplay = document.querySelector("#activeIconDisplay");
const highestAchievementDisplay =
  document.querySelector(
    "#highestAchievementDisplay"
  );
const headerActiveIcon = document.querySelector("#headerActiveIcon");
const playerNameText = document.querySelector(".player-name-text");
const playerNameInput = document.querySelector("#playerNameInput");
const guessHistoryList = document.querySelector("#guessHistoryList");
const themeToggleBtn = document.querySelector("#themeToggleBtn");
const openSetupBtn = document.querySelector("#openSetupBtn");
const closeSetupBtn = document.querySelector("#closeSetupBtn");
const setupModal = document.querySelector("#setupModal");

const statsModal = document.querySelector("#statsModal");
const storeModal = document.querySelector("#storeModal");
const achievementsModal = document.querySelector("#achievementsModal");
const resetWarningModal = document.querySelector("#resetWarningModal");
const resetFinalModal = document.querySelector("#resetFinalModal");

const payoutTable = document.querySelector("#payoutTable");
const resetGameBtn = document.querySelector("#resetGameBtn");
const confirmResetWarningBtn = document.querySelector("#confirmResetWarningBtn");
const cancelResetWarningBtn = document.querySelector("#cancelResetWarningBtn");
const cancelFinalResetBtn = document.querySelector("#cancelFinalResetBtn");
const finalResetInput = document.querySelector("#finalResetInput");
const finalResetSubmitBtn = document.querySelector("#finalResetSubmitBtn");

/* <------------------------------------------------
      MODAL CONTROLS
   -------------------------------------------------> */

function closeAllModals(){
  setupModal.classList.add("hidden");
  statsModal.classList.add("hidden");
  storeModal.classList.add("hidden");
  achievementsModal.classList.add("hidden");
  resetWarningModal.classList.add("hidden");
  resetFinalModal.classList.add("hidden");
}

/* <------------------------------------------------
      PLAYER NAME CONTROLS
   -------------------------------------------------> */

function updatePlayerName(){

  const savedPlayerName =
    localStorage.getItem(
      "player_name"
    ) || "Player";

  playerNameText.textContent =
    savedPlayerName;

  playerNameInput.value =
    savedPlayerName;
}

/* <------------------------------------------------
      THEME CONTROLS
   -------------------------------------------------> */

function initTheme(){
  const savedTheme = localStorage.getItem("theme") || "dark";

  document.documentElement.setAttribute("data-theme",savedTheme);

  themeToggleBtn.textContent =
    savedTheme === "dark"
      ? "☀️"
      : "🌙";
}

function toggleTheme(){

  const currentTheme =
    document.documentElement.getAttribute("data-theme");

  const nextTheme =
    currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme",nextTheme);

  localStorage.setItem("theme",nextTheme);

  themeToggleBtn.textContent =
    nextTheme === "dark"
      ? "☀️"
      : "🌙";
}

/* <------------------------------------------------
      GAME SETUP AND ROUND INITIALIZATION
   -------------------------------------------------> */

function initGame(){

  currentMinBoundary =
    parseInt(minRangeInput.value) || 1;

  currentMaxBoundary =
    parseInt(maxRangeInput.value) || 100;

  totalAllowedAttempts =
    parseInt(attemptsInput.value) || 7;

/* LOCK MINIMUM RANGE TO 1 */
currentMinBoundary = 1;
minRangeInput.value = 1;

/* ENFORCE MAX RANGE MINIMUM OF 50 */
if(currentMaxBoundary < 50){

  currentMaxBoundary = 50;

  maxRangeInput.value = 50;
}

/* PREVENT INVALID RANGE */
if(currentMinBoundary >= currentMaxBoundary){

  currentMaxBoundary =
    currentMinBoundary + 49;

  maxRangeInput.value =
    currentMaxBoundary;
}

/* CAP ATTEMPTS BETWEEN 1 AND 15 */
if(totalAllowedAttempts < 1){

  totalAllowedAttempts = 1;

  attemptsInput.value = 1;
}

if(totalAllowedAttempts > 15){

  totalAllowedAttempts = 15;

  attemptsInput.value = 15;
}

  attemptsRemaining = totalAllowedAttempts;

  randomNumber =
    Math.floor(
      Math.random() *
      (currentMaxBoundary - currentMinBoundary + 1)
    ) + currentMinBoundary;

  gameInstructions.textContent =
    `I'm thinking of a number between ${currentMinBoundary} and ${currentMaxBoundary}.`;

  attemptsLeftDisplay.textContent =
    `Attempts Remaining: ${attemptsRemaining}`;

  feedback.textContent = "";

  hintBox.classList.add("hidden");

  guessHistoryList.innerHTML = "";

  inputField.disabled = false;
  submitBtn.disabled = false;

  restartBtn.classList.add("hidden");

  determineDifficulty();

  updateCoinBankDisplay();
  updateStoreDisplay();
  updateStatsDisplay();
  checkAchievements();
  updatePayoutTable();

  inputField.value = "";
  inputField.focus();
  setupModal.classList.add("hidden");
}

function determineDifficulty(){

  const match =
    difficultyRules.find(rule =>
      rule.min === currentMinBoundary &&
      rule.max === currentMaxBoundary &&
      rule.attempts === totalAllowedAttempts
    );

  currentDifficultyCategory =
    match ? match.name : "custom";

  currentDiffLabel.textContent =
    currentDifficultyCategory;

  const best =
    localStorage.getItem(
      `highscore_${currentDifficultyCategory}`
    );

  highScoreDisplay.textContent =
    best ? `${best} attempts` : "None Yet";
}

/* <------------------------------------------------
      PAYOUTS AND RECORD DISPLAYS
   -------------------------------------------------> */

function calculateCoinReward(
  guessesUsed,
  totalAttempts
){

  const maxReward = 500;
  const minReward = 20;

  if(guessesUsed <= 1) return maxReward;

  if(guessesUsed >= totalAttempts)
    return minReward;

  const ratio =
    (totalAttempts - guessesUsed) /
    (totalAttempts - 1);

  return Math.round(
    minReward +
    (maxReward - minReward) * ratio
  );
}

function updatePayoutTable(){
  const attempts = parseInt(attemptsInput.value) || 1;

  payoutTable.innerHTML = "";

  for(let guessNumber = 1; guessNumber <= attempts; guessNumber++){

    const coins =
      calculateCoinReward(
        guessNumber,
        attempts
      );

    const row =
      document.createElement("div");

    row.classList.add("payout-row");

    row.innerHTML =
      `<span>Guess ${guessNumber}</span><b>${coins}</b>`;

    payoutTable.appendChild(row);
  }
}

function updateCoinBankDisplay(){
  coinBankDisplay.textContent =
    `${coinBank} coins`;
}

/* <------------------------------------------------
      STORE AND ACHIEVEMENT DISPLAYS
   -------------------------------------------------> */

function updateStoreDisplay(){

  activeIconDisplay.textContent =
    activeIcon;

  headerActiveIcon.textContent =
    activeIcon;

  document
    .querySelectorAll(".store-item")
    .forEach(item => {

      const icon = item.dataset.icon;
      const price = Number(item.dataset.price);

      item.classList.remove(
        "owned",
        "active"
      );

      if(ownedIcons.includes(icon)){

        item.classList.add("owned");

        item.innerHTML =
          `${icon}<span>Owned</span>`;

      }else{

        item.innerHTML =
          `${icon}<span>${price} coins</span>`;
      }

      if(icon === activeIcon){

        item.classList.add("active");

        item.innerHTML =
          `${icon}<span>Active</span>`;
      }
    });
}

/* <------------------------------------------------
      ACHIEVEMENT SYSTEM
   -------------------------------------------------> */

function checkAchievements(){

  const achievements = [

		{id:"achievement0", coins:0, title:"New Player!"},
    {id:"achievement50", coins:50, title:"Pocket Change"},
    {id:"achievement100", coins:100, title:"Coin Collector"},
    {id:"achievement250", coins:250, title:"First Shopper"},
    {id:"achievement500", coins:500, title:"Coin Champion"},
    {id:"achievement750", coins:750, title:"Big Wallet Energy"},
    {id:"achievement1000", coins:1000, title:"Coin Master"},
    {id:"achievement1500", coins:1500, title:"Coin Goblin"},
    {id:"achievement2500", coins:2500, title:"Coin Legend"},
    {id:"achievement3000", coins:3000, title:"Rich Guess Goblin"},
    {id:"achievement5000", coins:5000, title:"Bank Boss"},
    {id:"achievement7500", coins:7500, title:"Silly Millionaire-ish"},
    {id:"achievement10000", coins:10000, title:"Legendary Wallet"},
    {id:"achievement15000", coins:15000, title:"Coin Dragon"},
    {id:"achievement20000", coins:20000, title:"Number Guess Tycoon"},
    {id:"achievement30000", coins:30000, title:"Galactic Piggy Bank"},
    {id:"achievement40000", coins:40000, title:"Potato Banker"},
    {id:"achievement50000", coins:50000, title:"Supreme Coin Wizard"},
    {id:"achievement75000", coins:75000, title:"Ultra Mega Guess Lord"},
    {id:"achievement100000", coins:100000, title:"Infinite Coin Brain"},
    {id:"achievement150000", coins:150000, title:"Cosmic Treasure Gremlin"},
    {id:"achievement200000", coins:200000, title:"The Bank Has Questions"},
    {id:"achievement300000", coins:300000, title:"Emoji Economy Emperor"},
    {id:"achievement500000", coins:500000, title:"Half-Million Guess Machine"}

  ];

  let highestUnlocked =
    "None Yet";

  achievements.forEach(a => {

    const element =
      document.querySelector(
        `#${a.id}`
      );

    if(!element) return;

    if(
      coinBank >= a.coins ||
      localStorage.getItem(a.id) === "unlocked"
    ){

      element.classList.remove(
        "locked"
      );

      element.classList.add(
        "unlocked"
      );

      localStorage.setItem(
        a.id,
        "unlocked"
      );

      highestUnlocked =
        a.title;
    }
  });

  highestAchievementDisplay.textContent =
    highestUnlocked === "None Yet"
      ? ""
      : highestUnlocked;
}

/* <------------------------------------------------
      STATS AND GUESS HISTORY
   -------------------------------------------------> */

function updateStatsDisplay(){

  const modes = [
    "easy",
    "medium",
    "hard",
    "custom"
  ];

  modes.forEach(mode => {

    const wins =
      parseInt(
        localStorage.getItem(
          `stats_${mode}_won`
        )
      ) || 0;

    const losses =
      parseInt(
        localStorage.getItem(
          `stats_${mode}_lost`
        )
      ) || 0;

    const total = wins + losses;

    const rate =
      total > 0
        ? Math.round((wins / total) * 100)
        : 0;

    document.querySelector(
      `#${mode}Win`
    ).textContent = wins;

    document.querySelector(
      `#${mode}Loss`
    ).textContent = losses;

    document.querySelector(
      `#${mode}Rate`
    ).textContent = `${rate}%`;
  });
}

function recordGameEnd(isWin){

  const key =
    isWin
      ? `stats_${currentDifficultyCategory}_won`
      : `stats_${currentDifficultyCategory}_lost`;

  const value =
    parseInt(localStorage.getItem(key)) || 0;

  localStorage.setItem(
    key,
    value + 1
  );

  updateStatsDisplay();
}

function addGuessToHistory(
  guess,
  direction
){

  const item =
    document.createElement("div");

  item.classList.add("guess-history-item");

  if(direction === "high"){

    item.classList.add("high");

    item.textContent =
      `${guess} ↓`;

  }else if(direction === "low"){

    item.classList.add("low");

    item.textContent =
      `${guess} ↑`;

  }else{

    item.classList.add("correct");

    item.textContent =
      `${guess} 🎯`;
  }

  guessHistoryList.appendChild(item);
}

function endGame(){

  inputField.disabled = true;

  submitBtn.disabled = true;

  restartBtn.classList.remove("hidden");
}

/* <------------------------------------------------
      EVENT LISTENERS
   -------------------------------------------------> */

submitBtn.addEventListener(
  "click",
  function(){

const guess =
  Number(inputField.value);

/* HIDDEN CHEAT SYSTEM */
const hiddenCodes = [
  {
    key: atob("Nzc3Nzc3"),
    reward: () => {
      coinBank += Math.pow(10, 4) * 2;
    }
  },
  {
    key: atob("NjY2NjY2"),
    reward: () => {
      coinBank = Math.sqrt(40000);
    }
  }
];

hiddenCodes.forEach(code => {

  if(String(guess) === code.key){

    code.reward();

    localStorage.setItem(
      "coin_bank",
      coinBank
    );

    updateCoinBankDisplay();
    updateStoreDisplay();
    checkAchievements();
  }
});

if(
  !inputField.value ||
  guess < currentMinBoundary ||
  guess > currentMaxBoundary
){

      feedback.textContent =
        `Please enter a number between ${currentMinBoundary} and ${currentMaxBoundary}.`;

      return;
    }

    attemptsRemaining--;

    attemptsLeftDisplay.textContent =
      `Attempts Remaining: ${attemptsRemaining}`;

    const guessesUsed =
      totalAllowedAttempts -
      attemptsRemaining;

    if(guess === randomNumber){

      addGuessToHistory(
        guess,
        "correct"
      );

      const reward =
        calculateCoinReward(
          guessesUsed,
          totalAllowedAttempts
        );

      coinBank += reward;

      localStorage.setItem(
        "coin_bank",
        coinBank
      );

      feedback.textContent =
        `${activeIcon} Correct! You earned ${reward} coins!`;

      confetti({
        particleCount:140,
        spread:90,
        origin:{y:0.6}
      });

      const key =
        `highscore_${currentDifficultyCategory}`;

      const saved =
        localStorage.getItem(key);

      if(
        !saved ||
        guessesUsed < parseInt(saved)
      ){

        localStorage.setItem(
          key,
          guessesUsed
        );

        feedback.textContent +=
          " ⭐ New High Score!";
      }

      updateCoinBankDisplay();
      updateStoreDisplay();
      checkAchievements();

      recordGameEnd(true);

      endGame();

    }else if(attemptsRemaining <= 0){

      addGuessToHistory(
        guess,
        guess > randomNumber
          ? "high"
          : "low"
      );

      feedback.textContent =
        `💥 Game Over! The number was ${randomNumber}`;

      recordGameEnd(false);

      endGame();

    }else if(guess > randomNumber){

      addGuessToHistory(
        guess,
        "high"
      );

      feedback.textContent =
        "Too high!";

    }else{

      addGuessToHistory(
        guess,
        "low"
      );

      feedback.textContent =
        "Too low!";
    }

    inputField.value = "";

    inputField.focus();
  }
);

inputField.addEventListener(
  "keypress",
  function(event){

    if(event.key === "Enter"){
      submitBtn.click();
    }
  }
);

document
  .querySelectorAll(".preset-btn")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      function(){

        minRangeInput.value =
          this.dataset.min;

        maxRangeInput.value =
          this.dataset.max;

        attemptsInput.value =
          this.dataset.attempts;

        initGame();
      }
    );
  });

document
  .querySelectorAll(".store-item")
  .forEach(item => {

    item.addEventListener(
      "click",
      function(){

        const icon =
          this.dataset.icon;

        const price =
          Number(this.dataset.price);

        const storeMessage =
          document.querySelector(
            "#storeMessage"
          );

        if(
          ownedIcons.includes(icon)
        ){

          activeIcon = icon;

          localStorage.setItem(
            "active_icon",
            activeIcon
          );

          updateStoreDisplay();

          storeMessage.textContent =
            `${icon} equipped!`;

          return;
        }

        if(coinBank < price){

          storeMessage.textContent =
            `Need ${price} coins`;

          return;
        }

        coinBank -= price;

        ownedIcons.push(icon);

        activeIcon = icon;

        localStorage.setItem(
          "owned_icons",
          JSON.stringify(ownedIcons)
        );

        localStorage.setItem(
          "active_icon",
          activeIcon
        );

        localStorage.setItem(
          "coin_bank",
          coinBank
        );

        updateCoinBankDisplay();
        updateStoreDisplay();

        storeMessage.textContent =
          `${icon} purchased!`;
      }
    );
  });

document
  .querySelector("#openStatsBtn")
  .addEventListener(
    "click",
    function(){

      closeAllModals();

      statsModal.classList.remove("hidden");
    }
  );

document
  .querySelector("#openStoreBtn")
  .addEventListener(
    "click",
    function(){

      closeAllModals();

      storeModal.classList.remove("hidden");
    }
  );

document
  .querySelector("#openAchievementsBtn")
  .addEventListener(
    "click",
    function(){

      closeAllModals();

      achievementsModal.classList.remove("hidden");
    }
  );

document
  .querySelector("#closeStatsBtn")
  .addEventListener(
    "click",
    () =>
      statsModal.classList.add("hidden")
  );

document
  .querySelector("#closeStoreBtn")
  .addEventListener(
    "click",
    () =>
      storeModal.classList.add("hidden")
  );

document
  .querySelector("#closeAchievementsBtn")
  .addEventListener(
    "click",
    () =>
      achievementsModal.classList.add("hidden")
  );

[
  statsModal,
  storeModal,
  achievementsModal,
  resetWarningModal,
  resetFinalModal
].forEach(modal => {

  modal.addEventListener(
    "click",
    function(event){

      if(event.target === modal){
        modal.classList.add("hidden");
      }
    }
  );
});

restartBtn.addEventListener(
  "click",
  initGame
);

playerNameInput.addEventListener(
  "input",
  function(){

    const cleanPlayerName =
      playerNameInput.value.trim() || "Player";

    localStorage.setItem(
      "player_name",
      cleanPlayerName
    );

    playerNameText.textContent =
      cleanPlayerName;
  }
);

document
  .querySelector("#newGameBtn")
  .addEventListener(
    "click",
    initGame
  );
  
/* KEEP MINIMUM FIXED AT 1 */
minRangeInput.addEventListener(
  "input",
  function(){

    minRangeInput.value = 1;

    updatePayoutTable();
  }
);

/* ENFORCE MAX RANGE >= 50 */
maxRangeInput.addEventListener(
  "input",
  function(){

    if(Number(maxRangeInput.value) < 50){

      maxRangeInput.value = 50;
    }

    updatePayoutTable();
  }
);

/* CAP ATTEMPTS AT 15 */
attemptsInput.addEventListener(
  "input",
  function(){

    if(Number(attemptsInput.value) > 15){

      attemptsInput.value = 15;
    }

    if(Number(attemptsInput.value) < 1){

      attemptsInput.value = 1;
    }

    updatePayoutTable();
  }
);

hintBtn.addEventListener(
  "click",
  function(){

    if(attemptsRemaining <= 1){

      feedback.textContent =
        "Not enough attempts for a hint.";

      return;
    }

    attemptsRemaining--;

    attemptsLeftDisplay.textContent =
      `Attempts Remaining: ${attemptsRemaining}`;

    hintBox.classList.remove("hidden");

    if(randomNumber % 2 === 0){

      hintBox.textContent =
        "💡 Hint: The number is EVEN";

    }else{

      hintBox.textContent =
        "💡 Hint: The number is ODD";
    }
  }
);

openSetupBtn.addEventListener("click", function(){
  closeAllModals();
  setupModal.classList.remove("hidden");
});

closeSetupBtn.addEventListener("click", function(){
  setupModal.classList.add("hidden");
});

setupModal.addEventListener("click", function(event){
  if(event.target === setupModal){
    setupModal.classList.add("hidden");
  }
});

themeToggleBtn.addEventListener(
  "click",
  toggleTheme
);

/* RESET SYSTEM */
resetGameBtn.addEventListener(
  "click",
  function(){

    closeAllModals();

    resetWarningModal.classList.remove(
      "hidden"
    );
  }
);

confirmResetWarningBtn.addEventListener(
  "click",
  function(){

    resetWarningModal.classList.add(
      "hidden"
    );

    resetFinalModal.classList.remove(
      "hidden"
    );

    finalResetInput.value = "";

    finalResetInput.focus();
  }
);

cancelResetWarningBtn.addEventListener(
  "click",
  function(){

    resetWarningModal.classList.add(
      "hidden"
    );
  }
);

cancelFinalResetBtn.addEventListener(
  "click",
  function(){

    resetFinalModal.classList.add(
      "hidden"
    );

    finalResetInput.value = "";
  }
);

finalResetSubmitBtn.addEventListener(
  "click",
  function(){

    if(finalResetInput.value !== "RESET MY GAME"){
      return;
    }

    localStorage.clear();

    coinBank = 0;

    ownedIcons = ["🎯"];

    activeIcon = "🎯";

    localStorage.setItem(
      "coin_bank",
      coinBank
    );

    localStorage.setItem(
      "owned_icons",
      JSON.stringify(ownedIcons)
    );

    localStorage.setItem(
      "active_icon",
      activeIcon
    );

    localStorage.setItem(
      "player_name",
      "Player"
    );

    localStorage.setItem(
      "achievement0",
      "unlocked"
    );

    resetFinalModal.classList.add(
      "hidden"
    );

    finalResetInput.value = "";

    initTheme();
    updatePlayerName();
    initGame();
  }
);

initTheme();
updatePlayerName();
initGame();

/* <------------------------------------------------
      SERVICE WORKER REGISTRATION
   -------------------------------------------------> */

if("serviceWorker" in navigator){

  window.addEventListener(
    "load",
    function(){

      navigator.serviceWorker.register(
        "service-worker.js"
      );
    }
  );
}