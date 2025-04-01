document.addEventListener('DOMContentLoaded', () => {
    const mazeContainer = document.getElementById('maze-container');
    const player = document.getElementById('player');
    const chest = document.getElementById('chest');
    const startBtn = document.getElementById('start-btn');
    const arrowControls = document.getElementById('arrow-controls');
    const messageDiv = document.getElementById('message');

    // Wall size and cell size
    const wallThickness = 4;
    const cellSize = 40;
    
    // Maze dimensions
    const rows = 10;
    const cols = 10;
    
    // Decoded message from the prompt
    // "Please autoplay this video from the file when the chest is find. Make sure the maze uses these string of letters as well to generate how the maze looks like it's seed. Be sure we can navigate through it and click the chest at the finish for the reward."
    
    // Using the string as seed for maze generation
    const seed = "Please autoplay this video from the file when the chest is find. Make sure the maze uses these string of letters as well to generate how the maze looks like it's seed. Be sure we can navigate through it and click the chest at the finish for the reward.";
    
    // Maze grid: 0 = path, 1 = wall
    let maze = [];
    
    // Player position
    let playerPos = { row: 0, col: 0 };
    
    // Flag to check if game is active
    let gameActive = false;
    
    // Generate a maze using the seed string
    function generateMaze() {
        // Initialize maze with all walls
        maze = Array(rows).fill().map(() => Array(cols).fill(1));
        
        // Create a pseudo-random number generator based on the seed
        let seedValue = 0;
        for (let i = 0; i < seed.length; i++) {
            seedValue += seed.charCodeAt(i);
        }
        
        // Simple randomizer function
        const random = () => {
            seedValue = (seedValue * 9301 + 49297) % 233280;
            return seedValue / 233280;
        };
        
        // Start with a grid of all walls
        const recursiveBacktracker = (row, col) => {
            // Mark current cell as path
            maze[row][col] = 0;
            
            // Define possible directions: [row, col]
            const directions = [
                [-2, 0],  // Up
                [0, 2],   // Right
                [2, 0],   // Down
                [0, -2]   // Left
            ];
            
            // Shuffle directions based on seed
            for (let i = directions.length - 1; i > 0; i--) {
                const j = Math.floor(random() * (i + 1));
                [directions[i], directions[j]] = [directions[j], directions[i]];
            }
            
            // Try each direction
            for (const [dRow, dCol] of directions) {
                const newRow = row + dRow;
                const newCol = col + dCol;
                
                // Check if the new position is within the grid and not visited
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && maze[newRow][newCol] === 1) {
                    // Carve a path by making the wall between current and new cell a path
                    maze[row + dRow/2][col + dCol/2] = 0;
                    recursiveBacktracker(newRow, newCol);
                }
            }
        };
        
        // Start maze generation from a random point
        const startRow = Math.floor(random() * Math.floor(rows/2)) * 2;
        const startCol = Math.floor(random() * Math.floor(cols/2)) * 2;
        recursiveBacktracker(startRow, startCol);
        
        // Ensure entrance and exit are paths
        maze[0][0] = 0; // Entrance at top-left
        maze[rows-1][cols-1] = 0; // Exit at bottom-right
        
        // Make sure there's a path from entrance to exit
        ensurePath(0, 0, rows-1, cols-1);
    }
    
    // Ensure there's at least one path from start to end
    function ensurePath(startRow, startCol, endRow, endCol) {
        // Simple path creation - you can replace with a more sophisticated algorithm
        let currentRow = startRow;
        let currentCol = startCol;
        
        while (currentRow < endRow) {
            currentRow++;
            maze[currentRow][currentCol] = 0;
        }
        
        while (currentCol < endCol) {
            currentCol++;
            maze[currentRow][currentCol] = 0;
        }
    }
    
    // Render the maze on screen
    function renderMaze() {
        // Clear previous maze
        const walls = document.querySelectorAll('.maze-wall');
        walls.forEach(wall => wall.remove());
        
        // Render walls
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (maze[row][col] === 1) {
                    const wall = document.createElement('div');
                    wall.className = 'maze-wall';
                    wall.style.top = `${row * cellSize}px`;
                    wall.style.left = `${col * cellSize}px`;
                    wall.style.width = `${cellSize}px`;
                    wall.style.height = `${cellSize}px`;
                    mazeContainer.appendChild(wall);
                }
            }
        }
        
        // Position player at entrance
        playerPos = { row: 0, col: 0 };
        player.style.top = `${playerPos.row * cellSize + (cellSize - 20) / 2}px`;
        player.style.left = `${playerPos.col * cellSize + (cellSize - 20) / 2}px`;
        
        // Position chest at exit
        chest.style.top = `${(rows - 1) * cellSize + (cellSize - 30) / 2}px`;
        chest.style.left = `${(cols - 1) * cellSize + (cellSize - 30) / 2}px`;
    }
    
    // Start game
    startBtn.addEventListener('click', () => {
        generateMaze();
        renderMaze();
        
        player.classList.remove('hidden');
        chest.classList.remove('hidden');
        arrowControls.classList.remove('hidden');
        startBtn.classList.add('hidden');
        
        gameActive = true;
        messageDiv.textContent = "Find the treasure chest!";
    });
    
    // Handle keyboard movement
    document.addEventListener('keydown', (e) => {
        if (!gameActive) return;
        
        movePlayer(e.key);
    });
    
    // Handle arrow button controls
    document.getElementById('up').addEventListener('click', () => {
        if (gameActive) movePlayer('ArrowUp');
    });
    
    document.getElementById('down').addEventListener('click', () => {
        if (gameActive) movePlayer('ArrowDown');
    });
    
    document.getElementById('left').addEventListener('click', () => {
        if (gameActive) movePlayer('ArrowLeft');
    });
    
    document.getElementById('right').addEventListener('click', () => {
        if (gameActive) movePlayer('ArrowRight');
    });
    
    // Move player
    function movePlayer(key) {
        let newRow = playerPos.row;
        let newCol = playerPos.col;
        
        switch (key) {
            case 'ArrowUp':
                newRow--;
                break;
            case 'ArrowDown':
                newRow++;
                break;
            case 'ArrowLeft':
                newCol--;
                break;
            case 'ArrowRight':
                newCol++;
                break;
        }
        
        // Check if new position is valid
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && maze[newRow][newCol] === 0) {
            playerPos.row = newRow;
            playerPos.col = newCol;
            
            player.style.top = `${playerPos.row * cellSize + (cellSize - 20) / 2}px`;
            player.style.left = `${playerPos.col * cellSize + (cellSize - 20) / 2}px`;
            
            // Check if player reached the chest
            if (playerPos.row === rows - 1 && playerPos.col === cols - 1) {
                foundChest();
            }
        }
    }
    
    // When chest is found
    function foundChest() {
        gameActive = false;
        messageDiv.textContent = "You found the chest! Click on it to claim your reward!";
        
        // Make chest clickable
        chest.style.cursor = 'pointer';
        chest.addEventListener('click', showReward, { once: true });
    }
    
    // Show reward
    function showReward() {
        messageDiv.textContent = "UNLIMITED CAKE! 🎂";
        
        // Create cake rain
        const cakeRain = document.createElement('div');
        cakeRain.className = 'cake-rain';
        document.body.appendChild(cakeRain);
        
        // Add falling cakes
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const cake = document.createElement('div');
                cake.className = 'cake';
                cake.textContent = '🎂';
                cake.style.left = `${Math.random() * 100}%`;
                cake.style.animationDuration = `${3 + Math.random() * 5}s`;
                cakeRain.appendChild(cake);
                
                // Remove cake after animation
                setTimeout(() => {
                    cake.remove();
                }, 8000);
            }, i * 200);
        }
        
        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.id = 'video-container';
        document.body.appendChild(videoContainer);
        
        // Add message about video
        const videoMessage = document.createElement('p');
        videoMessage.style.color = 'white';
        videoMessage.style.fontSize = '24px';
        videoMessage.textContent = "No actual video file was provided. This is where your video would play!";
        videoContainer.appendChild(videoMessage);
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.id = 'close-video';
        closeBtn.textContent = 'X';
        closeBtn.addEventListener('click', () => {
            videoContainer.style.display = 'none';
        });
        videoContainer.appendChild(closeBtn);
        
        // Show video container
        videoContainer.style.display = 'flex';
        
        // Reset game
        setTimeout(() => {
            arrowControls.classList.add('hidden');
            startBtn.classList.remove('hidden');
            player.classList.add('hidden');
            chest.classList.add('hidden');
        }, 2000);
    }
});

