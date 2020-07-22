'use strict'


// The model
var gBoard;
// var gBoard = {
//     minesAroundCount: 4,
//     isShown: true,
//     isMine: false,
//     isMarked: true,
//     i: 0,
//     j: 0
// };


// This is an object by which the board
// size is set (in this case: 4x4 board
//     and how many mines to put)
var gLevel;
// var gLevel = {
//     SIZE: 4,
//     MINES: 2
// };

// This is an object in which you can keep and
// update the current game state: isOn: Boolean,
// when true we let the user play shownCount:
// How many cells are shown markedCount:
// How many cells are marked (with a flag)
// secsPassed: How many seconds passed
var gGame;
// var gGame = {
//     isOn: false,
//     shownCount: 0,
//     markedCount: 0,
//     secsPassed: 0
// };

var gameOn = false;

// This is called when page loads
function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
}

// Builds the board Set mines at random locations Call
// setMinesNegsCount() Return the created board
function buildBoard() {
    var board = [];
    for (var i = 0; i < 4; i++) {
        board[i] = [];
        for (var j = 0; j < 4; j++) {
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


// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr class=\'row\'>\n';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            strHTML += `\t<td class="cell ${cell.isShown?'show':''}"  onclick="cellClicked(${cell.minesAroundCount}, ${cell.i}, ${cell.j}, ${cell.isShown}, ${cell.isMarked}, ${cell.isMine})">${cell.isShown?cell.minesAroundCount:''}</td>`
        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function cellClicked(minesAroundCount, i, j, isShown, isMarked, isMine) {
    var selectedCell = gBoard[i][j];
    console.log("cellClicked -> selectedCell", selectedCell)

    if (gameOn === false) {
        createMines(i,j);
        gameOn = true;
        setMinesNegsCount(gBoard)
        openNeighbors(i,j,gBoard)
        renderBoard(gBoard)
    }else {
        if (selectedCell.isMine === true) {
            console.log('boomb')
        }
        
    }
    selectedCell.isShown = true;
}

function createMines(i,j) {
    var bombCount = 0;
    while (bombCount < 2) {
        var randomI = Math.floor(Math.random() * 3) + 1;
        var randomJ = Math.floor(Math.random() * 3) + 1;
        if ((randomI == i && randomJ == j) || 
            (randomI == i-1 && randomJ == j-1) ||
            (randomI == i-1 && randomJ ==j)||
            (randomI == i-1 && randomJ ==j+1) ||
            (randomI == i && randomJ ==j-1) ||
            (randomI ==i && randomJ ==j+1) ||
            (randomI ==i+1  && randomJ ==j-1) ||
            (randomI ==i+1 && randomJ ==j) ||
            (randomI ==i+1 && randomJ ==j+1) &&  !gBoard[randomI][randomJ].isMine){
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
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (board[i][j] != undefined) {
                if (i === cellI && j === cellJ) continue;
                if (j < 0 || j >= board[i].length) continue;
                board[i][j].isShown = true; 
            }
        }
    }

}

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (!board[i][j].isMine){
            board[i][j].minesAroundCount = countNeighbors(i,j,board);
        }
    }
}

}