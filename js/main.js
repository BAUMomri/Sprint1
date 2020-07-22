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
                minesAroundCount: setMinesNegsCount()
            };
        }
    }

    return board;
}


// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    board = gBoard;

}


// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr class=\'row\'>\n';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            strHTML += '\t<td class="cell"  onclick="cellClicked(' + cell.minesAroundCount + ',' + cell.i + ',' + cell.j + ',' + cell.isShown + ',' + cell.isMarked + ',' + cell.isMine + ')" >\n';

        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function cellClicked(minesAroundCount, i, j, isShown, isMarked, isMine) {
    if (gameOn === false) {
        createMines();
        gameOn = true;
    }
    setMinesNegsCount();
}

function createMines() {
    for (var i = 0; i < 3; i++) {
        var randomI = Math.floor(Math.random() * 4) + 1;
        var randomJ = Math.floor(Math.random() * 4) + 1;
        var coords = gBoard[randomI][randomJ];
        coords.isMine = true;
    }
}
