class Match3Game {
    constructor() {
        this.boardSize = 8;
        this.cellTypes = ['🍎', '🍊', '🍇', '🍓', '🍋', '💎'];
        this.board = [];
        this.selectedCell = null;
        this.score = 0;
        this.moves = 0;
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.render();
    }

    createBoard() {
        this.board = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                let cellType;
                do {
                    cellType = this.getRandomType();
                } while (this.wouldMatch(row, col, cellType));
                this.board[row][col] = cellType;
            }
        }
    }

    getRandomType() {
        return this.cellTypes[Math.floor(Math.random() * this.cellTypes.length)];
    }

    wouldMatch(row, col, type) {
        // 检查水平方向
        if (col >= 2) {
            if (this.board[row][col-1] === type && 
                this.board[row][col-2] === type) {
                return true;
            }
        }
        // 检查垂直方向
        if (row >= 2) {
            if (this.board[row-1][col] === type && 
                this.board[row-2][col] === type) {
                return true;
            }
        }
        return false;
    }

    render() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = this.board[row][col];
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.handleClick(row, col));
                boardElement.appendChild(cell);
            }
        }

        this.updateScoreBoard();
    }

    updateScoreBoard() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
    }

    handleClick(row, col) {
        if (this.isAnimating) return;

        const clickedCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        if (!this.selectedCell) {
            // 选择第一个方块
            this.selectedCell = { row, col, element: clickedCell };
            clickedCell.classList.add('selected');
        } else {
            const { row: prevRow, col: prevCol, element: prevElement } = this.selectedCell;
            
            if (row === prevRow && col === prevCol) {
                // 点击同一个方块，取消选择
                prevElement.classList.remove('selected');
                this.selectedCell = null;
            } else if (this.isAdjacent(prevRow, prevCol, row, col)) {
                // 交换相邻方块
                prevElement.classList.remove('selected');
                this.swapCells(prevRow, prevCol, row, col);
                this.selectedCell = null;
            } else {
                // 选择新方块
                prevElement.classList.remove('selected');
                this.selectedCell = { row, col, element: clickedCell };
                clickedCell.classList.add('selected');
            }
        }
    }

    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    async swapCells(row1, col1, row2, col2) {
        this.isAnimating = true;
        
        // 交换
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;

        this.render();
        await this.delay(100);

        // 检查是否有匹配
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            this.moves++;
            await this.processMatches(matches);
        } else {
            // 交换回来
            const temp = this.board[row1][col1];
            this.board[row1][col1] = this.board[row2][col2];
            this.board[row2][col2] = temp;
            this.showMessage('无效的移动！', 'error');
            this.render();
            await this.delay(500);
        }

        this.isAnimating = false;
        this.updateScoreBoard();
    }

    findMatches() {
        const matches = new Set();

        // 检查水平匹配
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize - 2; col++) {
                const type = this.board[row][col];
                if (type && this.board[row][col+1] === type && 
                    this.board[row][col+2] === type) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row},${col+1}`);
                    matches.add(`${row},${col+2}`);
                }
            }
        }

        // 检查垂直匹配
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize - 2; row++) {
                const type = this.board[row][col];
                if (type && this.board[row+1][col] === type && 
                    this.board[row+2][col] === type) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row+1},${col}`);
                    matches.add(`${row+2},${col}`);
                }
            }
        }

        return Array.from(matches).map(pos => {
            const [row, col] = pos.split(',').map(Number);
            return { row, col };
        });
    }

    async processMatches(matches) {
        // 标记匹配的方块
        matches.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('matched');
            }
        });

        this.score += matches.length * 10;
        this.showMessage(`太棒了！+${matches.length * 10} 分`, 'success');
        
        await this.delay(300);

        // 移除匹配的方块
        matches.forEach(({ row, col }) => {
            this.board[row][col] = null;
        });

        // 下落填充
        await this.applyGravity();

        // 填充新方块
        await this.fillBoard();

        // 检查是否有新的匹配
        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            await this.delay(300);
            await this.processMatches(newMatches);
        }
    }

    async applyGravity() {
        for (let col = 0; col < this.boardSize; col++) {
            let emptyRow = this.boardSize - 1;
            
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col] !== null) {
                    if (row !== emptyRow) {
                        this.board[emptyRow][col] = this.board[row][col];
                        this.board[row][col] = null;
                    }
                    emptyRow--;
                }
            }
        }
        
        this.render();
        await this.delay(300);
    }

    async fillBoard() {
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize; row++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = this.getRandomType();
                }
            }
        }
        
        this.render();
        await this.delay(300);
    }

    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message show ${type}`;
        
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 2000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    restart() {
        this.score = 0;
        this.moves = 0;
        this.selectedCell = null;
        this.createBoard();
        this.render();
        this.showMessage('游戏已重新开始！', 'success');
    }

    shuffle() {
        if (this.isAnimating) return;
        
        // 收集所有方块
        const allCells = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                allCells.push(this.board[row][col]);
            }
        }

        // 打乱顺序
        for (let i = allCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
        }

        // 重新填充棋盘
        let index = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = allCells[index++];
            }
        }

        this.render();
        this.showMessage('棋盘已打乱！', 'success');
    }
}

// 初始化游戏
const game = new Match3Game();
