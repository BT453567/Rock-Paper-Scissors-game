// rules popup
const popupOverlay = document.getElementById("popup-overlay");
const rulesOpenButton = document.getElementById("rules-button");
const closeButtons = document.querySelectorAll(".close-button");

// game screens
const game1Screen = document.getElementById("game1");
const game2Screen = document.getElementById("game2");

// hand selection buttons from first screen
const selectButtons = document.querySelectorAll('.game__icon-wrapper');

// game2 screen
const youPickedContainer = document.getElementById("you-picked");
const housePickedContainer = document.getElementById("house-picked");

// all possible hands
const hands = ["rock", "paper", "scissors", "lizard", "spock"];

// who wins
const rules = {
  rock: ["scissors", "lizard"],
  paper: ["rock", "spock"],
  scissors: ["paper", "lizard"],
  lizard: ["spock", "paper"],
  spock: ["scissors", "rock"]
};

// play again button
const playAgain = document.getElementById("play-again-button");

// track score
const scoreValue = document.getElementById("score-value");
let score = 0;

rulesOpenButton.addEventListener("click", () => {
  popupOverlay.classList.add('active');
});

closeButtons.forEach(button => {
  button.addEventListener("click", () => {
    popupOverlay.classList.remove("active");
  });
});

selectButtons.forEach(button => {
  button.addEventListener('click', () => {
    const hand = button.dataset.hand;

    // 1. Create clone of clicked hand
    const rectStart = button.getBoundingClientRect();
    const clone = button.cloneNode(true);
    clone.style.position = "absolute";

    const scrollXstart = window.scrollX || window.pageXOffset;
    const scrollYstart = window.scrollY || window.pageYOffset;

    clone.style.left   = Math.round(rectStart.left + scrollXstart) + "px";
    clone.style.top    = Math.round(rectStart.top  + scrollYstart) + "px";
    clone.style.width  = Math.round(rectStart.width)  + "px";
    clone.style.height = Math.round(rectStart.height) + "px";
    clone.style.transition = "all 0.6s ease-in-out";
    clone.style.zIndex = 1000;
    clone.style.transform = "none";
    
    document.body.appendChild(clone);

    // add clone icon
    const cloneIcon = clone.querySelector(".game__icon > img");
    cloneIcon.style.transition = "all 0.6s ease-in-out";

    game1Screen.classList.add("fade-out");
      
    game1Screen.addEventListener("transitionend", function handler() {

      game1Screen.removeEventListener("transitionend", handler);
      game1Screen.classList.add("hide");
      game1Screen.classList.remove("fade-out");
      game2Screen.classList.remove("hide");

      // insert user selected hand
      youPickedContainer.innerHTML = `
        <div class="game__result-wrapper ${hand}" data-hand="spock">
          <div class="winner-circles"></div>
          <div class="game__icon result grid">
            <img src="./images/icon-${hand}.svg" alt="">
          </div>
          <div class="game__icon-shadow result">
          </div>
        </div>
      `;

      // Animate the clone into its new place
      requestAnimationFrame(() => {
        const target = youPickedContainer.querySelector(".game__result-wrapper");
        const rectEnd = target.getBoundingClientRect();

        const scrollXend = window.scrollX || window.pageXOffset;
        const scrollYend = window.scrollY || window.pageYOffset;

        clone.style.left = rectEnd.left + scrollXend + "px";
        clone.style.top  = rectEnd.top  + scrollYend + "px";
        
        clone.style.width = rectEnd.width + "px";  // should be 14rem
        clone.style.height = rectEnd.height + "px"; // should be 14rem

        const cloneGameIcon = clone.querySelector(".game__icon");
        const cloneGameIconShadow = clone.querySelector(".game__icon-shadow");
        cloneGameIcon.classList.add("result");
        cloneGameIconShadow.classList.add("result", "clone");
      });

      // 3. After transition, remove clone
      clone.addEventListener("transitionend", () => {
        
        game2Screen.classList.remove("visibility-hidden");
        clone.remove();
        
        setTimeout(() => {
          // pick a random hand for house
          const randomIndex = Math.floor(Math.random() * hands.length);
          const houseHand = hands[randomIndex];
    
          // replace pending with real hand
          housePickedContainer.innerHTML = `
            <div class="game__result-wrapper ${houseHand}" data-hand="${houseHand}">
              <div class="winner-circles"></div>
              <div class="game__icon result grid">
                <img src="./images/icon-${houseHand}.svg" alt="">
              </div>
              <div class="game__icon-shadow result"></div>
            </div>
          `;

          const winner = decideWinner(hand, houseHand);
          updateWinScreen(winner);
  
        }, 3000);

      }, { once: true });

    });
  });
});

// decides who wins
function decideWinner(player, house) {
  if (player === house) {
    return "draw";
  } else if (rules[player].includes(house)) {
    return "player";
  } else {
    return "house";
  }
}

// update win screen
function updateWinScreen(winner) {

  const displayWinner = game2Screen.querySelector(".game2__reveal-winner");

  const message = winner === "draw" ? "Draw"
    : winner === "player"
    ? "You Win"
    : "You Lose";

  displayWinner.innerHTML = `
    <div class="winner-reveal-column flex column align-items-center">
      <h2 class="winner-heading">${message}</h2>
      <button id="play-again-button" class="play-again-button">PLAY AGAIN</button>
    </div>
  `;

  // Use requestAnimationFrame to re-add the class on the next paint
  requestAnimationFrame(() => {
    displayWinner.classList.add("expand");
  });

    displayWinner.addEventListener("transitionend", function handler(e) {
    // Ensure we respond only to the transform property
    if (e.propertyName === "max-width") {
      displayWinner.removeEventListener("transitionend", handler);
      console.log("in if === transform");
      displayWinner.classList.remove("visibility-hidden");
      displayWinner.classList.add("reveal");
      updateScore(winner);
      
      // add circles around winner icon
      if (winner === "player") {
        const winningIcon = youPickedContainer.querySelector(".winner-circles");
        winningIcon.classList.add("winner");
      } else if (winner === "house") {
        const winningIcon = housePickedContainer.querySelector(".winner-circles");
        winningIcon.classList.add("winner");
      }
    }
  });

  const playAgainButton = displayWinner.querySelector("#play-again-button");
  if (playAgainButton) {
    playAgainButton.addEventListener("click", () => {
      game1Screen.classList.remove("hide");
      game2Screen.classList.add("hide");
      game2Screen.classList.add("visibility-hidden");
      displayWinner.classList.add("visibility-hidden");
      displayWinner.classList.remove("expand", "reveal");
      displayWinner.innerHTML = ``;
      housePickedContainer.innerHTML = `
        <div class="house-picked__pending">
        </div>`;
    });
  }
}

function updateScore(winner) {

  if (winner === "player") {
    score++;
  } else if (winner === "house") {
    score--;
  }

  scoreValue.textContent = score;
}