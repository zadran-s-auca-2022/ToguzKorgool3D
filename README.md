# Toguz Korgool 3D Web Game

A web-based 3D implementation of the traditional Kyrgyz board game **Toguz Korgool**, developed as a Senior Project.

Live game:  
https://zadran-s-auca-2022.github.io/ToguzKorgool3D/

---

## Project Overview

This project implements Toguz Korgool as an interactive browser-based application using modern web technologies and 3D visualization.

The game is played by **You (bottom row)** against the **Computer (top row)**.  
Each player has 9 pits and one kazan (store) for captured stones.

The goal is to collect **at least 82 stones**.

This project was developed as part of **COM-433 (Senior Project / Thesis)** at the American University of Central Asia.

---

## Main Features

- Human vs Computer gameplay  
- Complete implementation of official Toguz Korgool rules  
- Tuz (special pit) rule with correct constraints  
- Heuristic AI opponent (capture-based decision making)  
- 3D board visualization using Three.js  
- Real-time synchronization between game logic and rendering  
- Interactive 3D board (clickable pits using raycasting)  
- Move history panel with detailed logs  
- Score display and game status updates  
- Splash screen and settings menu  
- Optional sound effects (sowing and capture)  
- Clean and responsive interface  

---

## Game Rules (Simplified)

- 18 pits total (9 per player)
- Each pit starts with 9 stones

### Turn Mechanics
1. Select one of your pits
2. If it has 1 stone → move it to the next pit  
3. If it has more:
   - Leave 1 stone
   - Distribute the rest counterclockwise

### Capturing
- If the last stone lands in an opponent’s pit and makes it even  
  → all stones are captured to your kazan

### Tuz Rule
- If the last stone makes an opponent pit contain exactly 3 stones  
  → it becomes a **tuz**
- Stones landing in a tuz go directly to the owner’s kazan  
- Only one tuz per player  
- Opponent’s 9th pit cannot become a tuz  

### Game End
- A player reaches **82 stones**, or  
- One side becomes empty  

Remaining stones are collected and the higher score wins.

---

## Technologies Used

- HTML5  
- CSS3  
- JavaScript (ES6)  
- Three.js (WebGL-based 3D rendering)  
- Git & GitHub  
- GitHub Pages  

---

## System Architecture

The project follows a modular design:

- **gameLogic.js** → core rules, AI, game state  
- **board3d.js** → 3D rendering (Three.js)  
- **index.html / style.css** → interface and layout  

Game logic and rendering are separated to improve maintainability and scalability.

---

## How to Play Online

1. Open:  
   https://zadran-s-auca-2022.github.io/ToguzKorgool3D/
2. Click **Start Game**
3. Click any bottom pit (1–9) to make a move
4. Use **New Game** to restart

---

## How to Run Locally

1. Clone the repository:

       git clone https://github.com/zadran-s-auca-2022/ToguzKorgoolProject.git

2. Go into the folder:

       cd ToguzKorgoolProject

3. Open `index.html` in a browser:

   - Double-click `index.html` in your file manager, or  
   - From the terminal:

         start index.html

No extra tools or servers are required.

---

## Project Structure

    ToguzKorgoolProject/
    ├── index.html   # UI layout
    ├── style.css    # Styling
    ├── gameLogic.js # Game rules, AI, state
    ├── board3d.js   # 3D rendering (Three.js)
    └── README.md    # Documentation


---

## Future Work

- Stronger AI (Minimax, Alpha-Beta pruning)  
- Multiplayer (online or local)  
- Mobile optimization  
- Additional languages (Kyrgyz, Russian)  
- Improved animations and visual effects  

---

## Author

Saima Zadran  
Software Engineering Program  
American University of Central Asia  

Senior Project (COM-433), 2026
