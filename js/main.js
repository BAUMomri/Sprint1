'use strict'
var gameOn = false;
var activeHint = false;
var gameOver = false;
var gameWon = false;
var firstClick = true;
var gBoard;
var gLevel;
var gGame;
var curTimer;
var curLevel = 'easy';
var hintCnt = 0;
var levels = {
    easy: {
        mines: 2,
        size: 4
    },

    medium: {
        mines: 16,
        size: 8
    },
    hard: {
        mines: 36,
        size: 12
    }
};



function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
}


function buildBoard() {
    var board = [];

    for (var i = 0; i < levels[curLevel].size; i++) {
        board[i] = [];
        for (var j = 0; j < levels[curLevel].size; j++) {
            board[i][j] = {
                i: i,
                j: j,
                isShown: false,
                isMarked: false,
                isMine: false,
                minesAroundCount: 0
            };
        }
    }

    return board;
}

function resetGame() {
    gameOn = false
    activeHint = true;
    gameOver = false;
    gameWon = false;
    firstClick = true;
    gBoard;
    gLevel;
    gGame;
    curTimer;
    curLevel = 'easy';
    clearInterval(curTimer);
    document.querySelector('.task-bar-buttons').classList.remove('hide');
    document.querySelector('#reset').classList.add('hide');
    document.querySelector('#hint').classList.add('hide');
    document.getElementById("minutes").innerText = '00';
    document.getElementById("seconds").innerText = '00';
    initGame();

}


function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr class=\'row\'>\n';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            strHTML += `\t<td class="cell ${cell.isShown?'show':''} ${cell.isMarked && !cell.isShown ? 'marked':''}"
            oncontextmenu="cellMarked(${cell.i}, ${cell.j})"
            id="cell-${i}-${j}"
            onclick="cellClicked(${cell.minesAroundCount}, ${cell.i}, ${cell.j}, ${cell.isShown}, ${cell.isMarked}, ${cell.isMine})">
            </td>`
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;

    document.querySelector('.task-bar-buttons').innerHTML = '<button class="game" onclick="EasyLevel()">Easy</button> <button class="game" onclick="MediumLevel()">Medium</button> <button class="game" onclick="HardLevel()">Hard</button>';
    var taskBar = document.querySelector('.task-bar');
    if (!document.querySelector('#reset'))
        taskBar.innerHTML = `<button id="reset" class="hide" onClick="resetGame();" data-state="idle" ></button>` + taskBar.innerHTML;
    if (!document.querySelector('#hint'))
        taskBar.innerHTML = `<button id="hint" class="hide" onClick="toggleHint();" data-hint="off" ><span class="cnt">3</span></button>` + taskBar.innerHTML;
}

function toggleHint() {
    if (!gameOver && hintCnt<3 ) {
        var hint = document.querySelector('#hint');
        hint.dataset.hint = hint.dataset.hint == 'off' ? 'on' : 'off';
    }
}

function EasyLevel(e) {
    curLevel = 'easy';
    initGame();
}

function MediumLevel() {
    curLevel = 'medium';
    initGame();
}

function HardLevel() {
    curLevel = 'hard';
    initGame();
}

function timeCounter() {
    curTimer = setInterval(setTime, 1000);
    var minutesLabel = document.getElementById("minutes");
    var secondsLabel = document.getElementById("seconds");
    var totalSeconds = 0;


    function setTime() {
        ++totalSeconds;
        secondsLabel.innerHTML = pad(totalSeconds % 60);
        minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
    }

    function pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }

}

function setResetBtn() {
    document.querySelector('.task-bar-buttons').classList.add('hide');
    document.querySelector('#reset').classList.remove('hide');
    document.querySelector('#hint').classList.remove('hide');
}

function cellClicked(minesAroundCount, i, j) {

    var selectedCell = gBoard[i][j];
    if (gameOver) return;
    if (selectedCell.isMarked === true) return;
    if (selectedCell.isShown === true) return;
    if (gameOn === false) {
        gameOn = true;
        createMines(i, j)
        setMinesNegsCount(gBoard)
        openNeighbors(i, j, gBoard,true)
        setResetBtn()
        timeCounter();
    } else {
        if (hintCnt < 3 && !gameOver && document.querySelector('#hint').dataset.hint == 'on') {
            hintCnt++;
            var cur = event.currentTarget;
            cur.classList.add('show')
            cur.innerHTML = gBoard[i][j].minesAroundCount
            openNeighbors(i, j, gBoard,true)
           
            document.querySelector('#hint span').innerText = 3- hintCnt;
            setTimeout(function () {
                openNeighbors(i, j, gBoard, false)
                document.querySelector('#hint').dataset.hint = 'off'
            }, 1000);
            
            return;
        }
        if (selectedCell.isMine === true) {
            selectedCell.isShown = true;
            addBombImg(i, j);
            clearInterval(curTimer);
            document.querySelector('#reset').dataset.state = 'lose';
            gameOver = true;
            setTimeout(function () {
                alert('THE GAME IS OVER! You stepped on a mine... \nclick on the soldier to play again!')
            }, 100);
            return;
        }
        if (minesAroundCount == 0) {
            openNeighbors(i, j, gBoard,true);
        }
    }

    selectedCell.isShown = true;
    checkGameOver(i, j);
}

function addBombImg(i, j ,isRemove) {
    var cellId = `cell-${i}-${j}`;
    var cellEl = document.getElementById(cellId)
    cellEl.classList.add('bomb');
    cellEl.innerHTML = isRemove? '':'<img src="./img/mine.png" width="28" height="28"></img>';
}

function createMines(i, j) {
    var bombCount = 0;
    while (bombCount < levels[curLevel].mines) {
        var randomI = Math.floor(Math.random() * levels[curLevel].size);
        var randomJ = Math.floor(Math.random() * levels[curLevel].size);
        if ((randomI == i && randomJ == j) ||
            (randomI == i - 1 && randomJ == j - 1) ||
            (randomI == i - 1 && randomJ == j) ||
            (randomI == i - 1 && randomJ == j + 1) ||
            (randomI == i && randomJ == j - 1) ||
            (randomI == i && randomJ == j + 1) ||
            (randomI == i + 1 && randomJ == j - 1) ||
            (randomI == i + 1 && randomJ == j) ||
            (randomI == i + 1 && randomJ == j + 1) && !gBoard[randomI][randomJ].isMine) {
            continue;
        }
        bombCount++
        gBoard[randomI][randomJ].isMine = true;
    }
}

function countNeighbors(cellI, cellJ, board) {
    var neighborsSum = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (board[i][j] != undefined) {
                if (i === cellI && j === cellJ) continue;
                if (j < 0 || j >= board[i].length) continue;
                if (board[i][j].isMine) neighborsSum++;
            }
        }
    }
    return neighborsSum;
}

function openNeighbors(cellI, cellJ, board ,isShow) {
    var clickedCellId = `cell-${cellI}-${cellJ}`;
    var clickedCellEl = document.getElementById(clickedCellId);
    var boardCell = board[cellI][cellJ];
    console.log(boardCell.isMine ,  hint.dataset.hint,  false )

    isShow?
        clickedCellEl.classList.add('clicked-cell') :
        clickedCellEl.classList.remove('clicked-cell') 
    // clickedCellEl.innerHTML = isShow? 'F' : '';

    if(boardCell.isMine &&  hint.dataset.hint == "on" && isShow){
        addBombImg(cellI, cellJ);
        return;
    } else if  (boardCell.isMine &&  hint.dataset.hint == "on" && isShow == false){
        console.log('run remove after if')
        addBombImg(cellI, cellJ, true);
        return;
    }
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (board[i][j] != undefined) {
                if (i === cellI && j === cellJ) continue;
                if (j < 0 || j >= board[i].length) continue;
                if (board[i][j].isMarked === true || board[i][j].isMine === true){
                  
                    continue;
                } 

                board[i][j].isShown = isShow;
                var cellId = `cell-${i}-${j}`;
                var cellEl = document.getElementById(cellId);
                if(isShow){
                    cellEl.classList.add('show');
                    cellEl.classList.add('clicked-cell')
                
                }else{
                   
                    cellEl.classList.remove('clicked-cell')
                    cellEl.classList.remove('show')
                }
                    
               
                // if (board[i][j].minesAroundCount != 0){
                cellEl.innerHTML = isShow ?board[i][j].minesAroundCount ==0? '':board[i][j].minesAroundCount :'';
                
            }
        }
    }

}

function setMinesNegsCount(board) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = countNeighbors(i, j, board);
            }
        }
    }

}

function cellMarked(i, j) {
    if (gameOver) return;
    setResetBtn()
    var cellId = `cell-${i}-${j}`;
    var cellEl = document.getElementById(cellId);
    if (gBoard[i][j].isMarked === true && gameOn) {
        gBoard[i][j].isMarked = false;
        var elements = cellEl.getElementsByTagName('img');
        cellEl.removeChild(elements[0]);
    } else {
        if (!gBoard[i][j].isShown) {
            gBoard[i][j].isMarked = true;
            if (!gameOn) {
                gameOn = true;
                createMines(i, j)
                setMinesNegsCount(gBoard)
                setResetBtn()
                timeCounter();
                clearInterval(curTimer);
                }
            cellEl.classList.add('show');
            cellEl.innerHTML = '<img src="./img/flag.png" width="28" height="28"></img>';
            checkGameOver(i, j);
        }
    }
}

function countNeighbors(cellI, cellJ, board) {
    var neighborsSum = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (board[i][j] != undefined) {
                if (i === cellI && j === cellJ) continue;
                if (j < 0 || j >= board[i].length) continue;
                if (board[i][j].isMine) neighborsSum++;
            }
        }
    }
    return neighborsSum;
}


function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++)
            if (gBoard[i][j].isMarked && gBoard[i][j].isMine || gBoard[i][j].isShown) {
                continue;
            } else {
                return;
            }
    }

    if (!activeHint){
    setTimeout(function () {
        clearInterval(curTimer);
        document.querySelector('#reset').dataset.state = 'win'
        alert('YOU WIN! \nclick on the soldier to play again!')
    }, 100);
}
}