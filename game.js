class LinkGame {
    constructor() {
        this.boardSize = 8;
        this.cellTypes = [
            // 火象星座
            { symbol: '♈', name: '白羊', element: 'fire' },
            { symbol: '♌', name: '狮子', element: 'fire' },
            { symbol: '♐', name: '射手', element: 'fire' },
            // 水象星座
            { symbol: '♋', name: '巨蟹', element: 'water' },
            { symbol: '♏', name: '天蝎', element: 'water' },
            { symbol: '♓', name: '双鱼', element: 'water' },
            // 风象星座
            { symbol: '♊', name: '双子', element: 'air' },
            { symbol: '♎', name: '天秤', element: 'air' },
            { symbol: '♒', name: '水瓶', element: 'air' },
            // 土象星座
            { symbol: '♉', name: '金牛', element: 'earth' },
            { symbol: '♍', name: '处女', element: 'earth' },
            { symbol: '♑', name: '摩羯', element: 'earth' }
        ];
        this.board = [];
        this.selectedCell = null;
        this.score = 0;
        this.level = 1;
        this.isAnimating = false;
        this.boardSizeLevel = 8;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.render();
    }

    createBoard() {
        this.board = [];
        // 根据关卡调整棋盘大小（6x6 到 10x10）
        this.boardSizeLevel = Math.min(10, 6 + Math.floor(this.level / 3));
        
        // 计算方块种类数量（2-12种）
        const typeCount = Math.min(12, 2 + this.level);
        const pairCount = Math.floor((this.boardSizeLevel * this.boardSizeLevel) / 2);
        const totalCells = pairCount * 2;
        
        // 生成配对数组
        let types = [];
        for (let i = 0; i < pairCount; i++) {
            const typeObj = this.cellTypes[i % typeCount];
            types.push(typeObj);
            types.push(typeObj);
        }
        
        // 打乱
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }
        
        // 填充棋盘
        let index = 0;
        for (let row = 0; row < this.boardSizeLevel; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSizeLevel; col++) {
                if (index < types.length) {
                    this.board[row][col] = types[index++];
                } else {
                    this.board[row][col] = null;
                }
            }
        }
        
        this.updateScoreBoard();
    }

    render() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        // 更新网格列数
        boardElement.style.gridTemplateColumns = `repeat(${this.boardSizeLevel}, 1fr)`;

        // 创建星空背景
        this.createStars(boardElement);

        for (let row = 0; row < this.boardSizeLevel; row++) {
            for (let col = 0; col < this.boardSizeLevel; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                if (this.board[row][col]) {
                    cell.textContent = this.board[row][col].symbol;
                    cell.dataset.element = this.board[row][col].element;
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    cell.addEventListener('click', () => this.handleClick(row, col));
                } else {
                    cell.classList.add('empty');
                }

                boardElement.appendChild(cell);
            }
        }
    }

    createStars(boardElement) {
        // 清除旧星星
        const oldStars = boardElement.querySelectorAll('.star');
        oldStars.forEach(star => star.remove());

        // 创建新星星
        const starCount = 120;
        const boardRect = boardElement.getBoundingClientRect();

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            // 随机大小
            const size = Math.random() * 1.8 + 0.4;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            // 随机位置
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            star.style.left = `${x}%`;
            star.style.top = `${y}%`;

            // 部分星星添加十字星光
            if (Math.random() > 0.8) {
                star.classList.add('bright');
            }

            // 随机动画延迟 - 分散
            star.style.animationDelay = `${Math.random() * 8}s`;

            // 随机动画时长 - 慢节奏
            star.style.animationDuration = `${Math.random() * 5 + 4}s`;

            // 随机不透明度
            star.style.opacity = Math.random() * 0.3 + 0.35;

            boardElement.appendChild(star);
        }
    }

    updateScoreBoard() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        
        let remaining = 0;
        for (let row = 0; row < this.boardSizeLevel; row++) {
            for (let col = 0; col < this.boardSizeLevel; col++) {
                if (this.board[row][col]) {
                    remaining++;
                }
            }
        }
        document.getElementById('remaining').textContent = remaining;
    }

    handleClick(row, col) {
        if (this.isAnimating) return;
        if (!this.board[row][col]) return;

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
            } else {
                // 检查是否可以消除
                if (this.canConnect(prevRow, prevCol, row, col)) {
                    prevElement.classList.remove('selected');
                    this.eliminate(prevRow, prevCol, row, col);
                    this.selectedCell = null;
                } else {
                    // 不能消除，选择新方块
                    prevElement.classList.remove('selected');
                    this.selectedCell = { row, col, element: clickedCell };
                    clickedCell.classList.add('selected');
                    this.showMessage('无法连接！', 'error');
                }
            }
        }
    }

    canConnect(row1, col1, row2, col2) {
        // 必须是相同的方块
        if (this.board[row1][col1].symbol !== this.board[row2][col2].symbol) {
            return false;
        }
        
        // 必须不是同一个位置
        if (row1 === row2 && col1 === col2) {
            return false;
        }
        
        // 检查是否可以连接（最多2个拐点）
        return this.checkConnection(row1, col1, row2, col2);
    }

    checkConnection(row1, col1, row2, col2) {
        // 检查直线连接
        if (this.checkLine(row1, col1, row2, col2)) {
            return true;
        }
        
        // 检查一个拐点
        if (this.checkOneTurn(row1, col1, row2, col2)) {
            return true;
        }
        
        // 检查两个拐点
        if (this.checkTwoTurns(row1, col1, row2, col2)) {
            return true;
        }
        
        return false;
    }

    checkLine(row1, col1, row2, col2) {
        // 水平直线
        if (row1 === row2) {
            const minCol = Math.min(col1, col2);
            const maxCol = Math.max(col1, col2);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.board[row1][col]) return false;
            }
            return true;
        }
        
        // 垂直直线
        if (col1 === col2) {
            const minRow = Math.min(row1, row2);
            const maxRow = Math.max(row1, row2);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][col1]) return false;
            }
            return true;
        }
        
        return false;
    }

    checkOneTurn(row1, col1, row2, col2) {
        // 尝试通过拐点 (row1, col2)
        if (!this.board[row1][col2] || (row1 === row2 && col2 === col1)) {
            if (this.checkLine(row1, col1, row1, col2) && this.checkLine(row1, col2, row2, col2)) {
                return true;
            }
        }
        
        // 尝试通过拐点 (row2, col1)
        if (!this.board[row2][col1] || (row2 === row1 && col1 === col2)) {
            if (this.checkLine(row1, col1, row2, col1) && this.checkLine(row2, col1, row2, col2)) {
                return true;
            }
        }
        
        return false;
    }

    checkTwoTurns(row1, col1, row2, col2) {
        // 水平扫描
        for (let col = 0; col < this.boardSizeLevel; col++) {
            if (col !== col1 && col !== col2) {
                if (!this.board[row1][col] || (row1 === row2 && col === col1)) {
                    if (this.checkLine(row1, col1, row1, col) &&
                        this.checkLine(row1, col, row2, col) &&
                        this.checkLine(row2, col, row2, col2)) {
                        return true;
                    }
                }
            }
        }
        
        // 垂直扫描
        for (let row = 0; row < this.boardSizeLevel; row++) {
            if (row !== row1 && row !== row2) {
                if (!this.board[row][col1] || (row === row1 && col1 === col2)) {
                    if (this.checkLine(row1, col1, row, col1) &&
                        this.checkLine(row, col1, row, col2) &&
                        this.checkLine(row, col2, row2, col2)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    async eliminate(row1, col1, row2, col2) {
        this.isAnimating = true;
        
        // 添加消除动画
        const cell1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const cell2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
        
        if (cell1) cell1.classList.add('matched');
        if (cell2) cell2.classList.add('matched');
        
        this.score += 10;
        this.showMessage('消除成功！+10 分', 'success');
        
        await this.delay(300);
        
        // 移除方块
        this.board[row1][col1] = null;
        this.board[row2][col2] = null;
        
        this.render();
        this.updateScoreBoard();
        
        await this.delay(300);
        
        // 检查是否过关
        this.checkLevelComplete();
        
        this.isAnimating = false;
    }

    checkLevelComplete() {
        let remaining = 0;
        for (let row = 0; row < this.boardSizeLevel; row++) {
            for (let col = 0; col < this.boardSizeLevel; col++) {
                if (this.board[row][col]) {
                    remaining++;
                }
            }
        }
        
        if (remaining === 0) {
            document.getElementById('levelMessage').textContent = 
                `恭喜您完成了第 ${this.level} 关！得分：${this.score}`;
            document.getElementById('levelComplete').classList.add('show');
        }
    }

    hint() {
        if (this.isAnimating) return;
        
        // 查找可以消除的一对
        for (let row1 = 0; row1 < this.boardSizeLevel; row1++) {
            for (let col1 = 0; col1 < this.boardSizeLevel; col1++) {
                if (!this.board[row1][col1]) continue;
                
                for (let row2 = 0; row2 < this.boardSizeLevel; row2++) {
                    for (let col2 = 0; col2 < this.boardSizeLevel; col2++) {
                        if (!this.board[row2][col2]) continue;
                        if (row1 === row2 && col1 === col2) continue;
                        if (this.board[row1][col1].symbol !== this.board[row2][col2].symbol) continue;
                        
                        if (this.canConnect(row1, col1, row2, col2)) {
                            // 高亮提示
                            const cell1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
                            const cell2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
                            
                            if (cell1) cell1.classList.add('selected');
                            if (cell2) cell2.classList.add('selected');
                            
                            this.showMessage('提示：找到可以消除的方块！', 'success');
                            
                            setTimeout(() => {
                                if (cell1) cell1.classList.remove('selected');
                                if (cell2) cell2.classList.remove('selected');
                            }, 2000);
                            
                            return;
                        }
                    }
                }
            }
        }
        
        this.showMessage('没有可消除的方块了！', 'error');
    }

    restart() {
        this.score = 0;
        this.level = 1;
        this.selectedCell = null;
        document.getElementById('levelComplete').classList.remove('show');
        this.createBoard();
        this.render();
        this.showMessage('游戏已重新开始！', 'success');
    }

    nextLevel() {
        this.level++;
        document.getElementById('levelComplete').classList.remove('show');
        this.createBoard();
        this.render();
        this.showMessage(`进入第 ${this.level} 关！`, 'success');
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
}

// 初始化游戏
const game = new LinkGame();
