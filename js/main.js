'use strict'
var gameOn = false;
var activeHint = true;
var gameOver = false;
var gameWon = false;
var firstClick = true;
var gBoard;
var gLevel;
var gGame;
var curTimer;
var curLevel = 'easy';
var levels = {
    easy:{
        MINES:2,
        size:4
    }, 

    medium:{
        MINES:4,
        size:8
    },
    hard:{
        MINES:8,
        size:12
    }
};
var hintCnt = 0;


function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
}

// function setActiveLevel(nameLevel){
//     activeLevel = levels[nameLevel];
// }

function buildBoard() {
    var board = [];
    /// i =>levels[activeLevel].size
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
function resetGame(){
    clearInterval(curTimer);
    gameOn = false;
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
    if(!document.querySelector('#reset'))
        taskBar.innerHTML = `<button id="reset" class="hide" onClick="resetGame();" data-state="idle" ></button>` +taskBar.innerHTML;
    if(!document.querySelector('#hint'))
        taskBar.innerHTML = `<button id="hint" class="hide" onClick="toggleHint();" data-hint="off" ></button>` +taskBar.innerHTML;
}
function toggleHint(){
    var hint  = document.querySelector('#hint');
    hint.dataset.hint = hint.dataset.hint == 'off'? 'on' : 'off';
}
function EasyLevel(){
console.log('EasyLevel')
curLevel = 'easy';
initGame();
}
function MediumLevel(){
console.log('MediumLevel')
curLevel = 'medium';
initGame();
}
function HardLevel(){
console.log('HardLevel')
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
function setResetBtn(){
    document.querySelector('.task-bar-buttons').classList.add('hide');
    document.querySelector('#reset').classList.remove('hide');
    document.querySelector('#hint').classList.remove('hide');
    

}
function cellClicked(minesAroundCount, i, j) {

    var selectedCell = gBoard[i][j];
    if (gameOver) return;
    if (selectedCell.isMarked === true) return;
    if (selectedCell.isShown === true) return;
    if (firstClick === true) {
        createMines(i, j)
        firstClick = false;
    }
    if (gameOn === false) {
        gameOn = true;
        setMinesNegsCount(gBoard)
        openNeighbors(i, j, gBoard)
        setResetBtn()
        timeCounter();
    } else {
        if(hintCnt < 3 && document.querySelector('#hint').dataset.hint == 'on'){
            hintCnt++;
            var cur = event.currentTarget;
            cur.classList.add('show')
            cur.innerHTML = gBoard[i][j].minesAroundCount
            setTimeout(function(){
                cur.innerHTML = '';
                cur.classList.remove('show')
            },1000);
            return;
        }
         if (selectedCell.isMine === true) {
            selectedCell.isShown = true;
            addBombImg(i, j);
            clearInterval(curTimer);
            document.querySelector('.task-bar').dataset.state ='lose';
            gameOver = true;
            return;
        }
        if (minesAroundCount == 0) {
            openNeighbors(i, j, gBoard);
        }
    }

    selectedCell.isShown = true;
    checkGameOver(i, j);

}

function addBombImg(i, j) {
    var cellId = `cell-${i}-${j}`;
    var cellEl = document.getElementById(cellId)
    cellEl.classList.add('bomb');
    cellEl.innerHTML = '<img src="./img/mine.png" width="20" height="20"></img>';
}

function createMines(i, j) {
    var bombCount = 0;
    // 2 => levels[activeLevel].MINES
    while (bombCount < levels[curLevel].MINES) {
        var randomI = Math.floor(Math.random() * 3) + 1;
        var randomJ = Math.floor(Math.random() * 3) + 1;
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

function openNeighbors(cellI, cellJ, board) {
    var clickedCellId = `cell-${cellI}-${cellJ}`;
    var clickedCellEl = document.getElementById(clickedCellId);
    clickedCellEl.classList.add('clicked-cell')
    clickedCellEl.innerHTML = '0';
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (board[i][j] != undefined) {
                if (i === cellI && j === cellJ) continue;
                if (j < 0 || j >= board[i].length) continue;
                if (board[i][j].isMarked === true || board[i][j].isMine === true) continue;

                board[i][j].isShown = true;
                var cellId = `cell-${i}-${j}`;
                var cellEl = document.getElementById(cellId);
                cellEl.classList.add('show');
                cellEl.classList.add('clicked-cell')
                cellEl.innerHTML = board[i][j].minesAroundCount;

            }
        }
    }

}

// Count mines around each cell and set the cell's minesAroundCount.
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
    var cellId = `cell-${i}-${j}`;
    var cellEl = document.getElementById(cellId);
    if (gBoard[i][j].isMarked === true && gameOn) {
        gBoard[i][j].isMarked = false;
        var elements = cellEl.getElementsByTagName('img');
        cellEl.removeChild(elements[0]);
    } else {
        if (!gBoard[i][j].isShown) {
            gBoard[i][j].isMarked = true;
            if (!gameOn) timeCounter();
            cellEl.innerHTML = "<img src=\"./img/flag.png\" width=\"20\" height=\"20\"></img>";
        }
    }
}

// Game ends when all mines are marked, and all the other cells are shown

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
    for (var i = 0; i < gBoard.length; i++){
            for (var j = 0; j < gBoard[0].length; j++)
                if (gBoard[i][j].isMarked || gBoard[i][j].isShown) {
                    continue;
                } else {

                    return;
                }
        }
        document.querySelector('.task-bar').dataset.state = 'win'
        alert('You won!!')
        console.log('WON!!!')
    } 