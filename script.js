$(document).ready(function () {
    initializeBoard();
    initializeGame();
});

function toggleGameBlocks() {
    if (blocksEnabled) {
        
        blocksEnabled = false;

        var visibleBlocks = $("div.game-block:visible");
        
        visibleBlocks.css({ opacity: 0.8 });
        visibleBlocks.fadeOut();

        var message = "You are currently playing <b>without</b> blocks<br />";
        message += "<a href=\"\" onclick=\"toggleGameBlocks(); return false;\">Turn blocks on</a>";
        $("#blocks-status").html(message);
    } else {
        
        blocksEnabled = true;

        var message = "You are currently playing <b>with</b> blocks<br />";
        message += "<a href=\"\" onclick=\"toggleGameBlocks(); return false;\">Turn blocks off</a>";
        $("#blocks-status").html(message);
    }
}

function initializeBoard() {
    
    gameBoard = $("#game-area");
    ballTrace = $("#ball-trace");
    playerArea = $("#player-area");
    gameBall = $("#game-ball");
    opponentArea = $("#opponent-area");

    
    gameStarted = false;

    
    blocksEnabled = true;  
    toggleGameBlocks();

    
    boardWidth = gameBoard.width();
    boardHeight = gameBoard.height();

    
    playerScore = 0;
    opponentScore = 0;

    
    lineCount = 3;
    opponentFieldSize = 150;  
    sideFieldSize = (boardWidth - opponentFieldSize) / 2;
    drawGameBoard();

    
    if ($.browser.mozilla) {
        gameBoard.mouseover(function () {
            $(this).css({ cursor: 'none' });
        });
    }
}

function drawGameBoard() {
    
    var lineSpacing = sideFieldSize / (lineCount + 1);

    
    gameBoard.drawLine(0, 0, sideFieldSize, sideFieldSize);
    gameBoard.drawLine(0, boardHeight, sideFieldSize, boardHeight - sideFieldSize);
    gameBoard.drawLine(boardWidth, boardHeight, boardWidth - sideFieldSize, boardHeight - sideFieldSize);
    gameBoard.drawLine(boardWidth, 0, boardWidth - sideFieldSize, sideFieldSize);

    
    for (let i = 0; i <= lineCount + 1; i++) {
        var start = i * lineSpacing;
        var end = boardHeight - i * lineSpacing;

        var offset = i * lineSpacing;
        gameBoard.drawLine(offset, start, offset, end);   
        gameBoard.drawLine(start, offset, end, offset);   

        var offsetRight = boardWidth - offset;
        gameBoard.drawLine(offsetRight, start, offsetRight, end);   
        gameBoard.drawLine(start, offsetRight, end, offsetRight);   
    }
}

function initializeGame() {
    
    tracerLeft = 0;
    tracerTop = 0;
    tracerHeight = boardHeight;
    tracerWidth = boardWidth;

    
    ballLeft = 47.5;
    ballTop = 47.5;
    ballVerticalSpeed = 0;     
    ballHorizontalSpeed = 0;   

    
    spinHorizontal = 0;
    spinVertical = 0;

    
    gameSpeed = 1;
    
    ballDirection = 1;

    
    $("#pong-game").mousemove(function (e) {
        playerX = e.clientX - gameBoard.offset().left - 50;
        if (playerX < 0) {
            playerX = 0;
        } else if (playerX > boardWidth - 100) {
            playerX = boardWidth - 100;
        }

        playerY = e.clientY + $(window).scrollTop() - gameBoard.offset().top - 50;
        if (playerY < 0) {
            playerY = 0;
        } else if (playerY > boardHeight - 100) {
            playerY = boardHeight - 100;
        }

        playerArea.css({ left: playerX, top: playerY });
    });

    
    $("#pong-game").click(startPongGame);
}

function startPongGame() {
    
    
    if (playerArea.collidesWith(gameBall).length == 1 && !gameStarted) {
        
        playerArea.css({ opacity: 0.9 });
        playerArea.animate({ opacity: 0.5 }, 300);

        
        ballHorizontalSpeed = (Math.random() - 0.5);
        ballVerticalSpeed = (Math.random() - 0.5);
        ballXPosition = parseInt(gameBall.css("left"));
        ballYPosition = parseInt(gameBall.css("top"));

        
        gameStarted = true;
        gameLoop();
    }
}

function gameLoop() {
    if (tracerWidth < 1) {
        
        return;
    }

    
    if (ballDirection == 1) {
        

        
        tracerLeft += gameSpeed;
        tracerTop += gameSpeed;
        tracerWidth -= gameSpeed * 2;
        tracerHeight -= gameSpeed * 2;

        
        if (tracerLeft >= sideFieldSize) {
            
            if (opponentArea.collidesWith(gameBall).length == 0) {
                
                
                gameStarted = false;

                
                updateTracerAndBall();

                
                playerScore += 1;
                $("#score-display").text(playerScore + " - " + opponentScore);

                
                window.setTimeout(resetPongGame, 2000);
                return;
            } else {
                
                opponentArea.css({ opacity: 1 });
                opponentArea.animate({ opacity: 0.5 }, 200);

                
                ballDirection = -1;
                gameSpeed += 0.5;
            }
        }
    } else {
        

        
        tracerLeft -= gameSpeed;
        tracerTop -= gameSpeed;
        tracerWidth += gameSpeed * 2;
        tracerHeight += gameSpeed * 2;

        
        if (tracerLeft <= 0) {
            
            if (playerArea.collidesWith(gameBall).length == 0) {
                
                var collidingBlocks = gameBall.collidesWith($("div.game-block:visible"));
                if (collidingBlocks.length == 0) {
                    
                    gameStarted = false;

                    
                    opponentScore += 1;
                    $("#score-display").text(playerScore + " - " + opponentScore);

                    
                    window.setTimeout(resetPongGame, 2000);
                    return;
                } else {
                    

                    
                    if (collidingBlocks.length > 1) {
                        collidingBlocks = collidingBlocks.eq(0);
                    }

                    
                    collidingBlocks.css({ opacity: 0.6 });
                    collidingBlocks.fadeOut();

                    
                    ballDirection = 1;
                }
            } else {
                
                playerArea.css({ opacity: 0.9 });
                playerArea.animate({ opacity: 0.5 }, 300);

                
                spinHorizontal = (playerX - previousX) / 20;
                spinVertical = (playerY - previousY) / 20;
                
                ballHorizontalSpeed += spinHorizontal;
                ballVerticalSpeed += spinVertical;

                
                if (playerX - previousX > 5 || playerX - previousX < -5 ||
                    playerY - previousY > 5 || playerY - previousY < -5) {
                    addGameBlock();
                }

                
                ballDirection = 1;
            }
        }
    }

    
    updateTracerAndBall();

    
    
    if (ballLeft < 0 && ballHorizontalSpeed < 0) {
        ballHorizontalSpeed = -ballHorizontalSpeed;
    }
    
    if (gameBall.position().left + gameBall.width() > tracerWidth && ballHorizontalSpeed > 0) {
        ballHorizontalSpeed = -ballHorizontalSpeed;
    }
    
    if (ballTop < 0 && ballVerticalSpeed < 0) {
        ballVerticalSpeed = -ballVerticalSpeed;
    }
    
    if (gameBall.position().top + gameBall.height() > tracerHeight && ballVerticalSpeed > 0) {
        ballVerticalSpeed = -ballVerticalSpeed;
    }

    
    previousX = playerX;
    previousY = playerY;

    
    spinHorizontal *= 0.8;
    spinVertical *= 0.8;
    ballHorizontalSpeed -= spinHorizontal;
    ballVerticalSpeed -= spinVertical;

    
    var currentOpponentLeft = parseInt(opponentArea.css("left"));
    var targetX = ((ballLeft / 100 * tracerWidth) + (gameBall.width() / 2)) / tracerWidth;
    var currentOpponentX = (currentOpponentLeft + 15) / 150;
    var deltaX = (targetX - currentOpponentX) * -150;
    if (deltaX < -1) deltaX = -1;
    if (deltaX > 1) deltaX = 1;
    var newOpponentX = currentOpponentLeft - deltaX;
    if (newOpponentX > 117) newOpponentX = 117;
    if (newOpponentX < 0) newOpponentX = 0;

    var currentOpponentTop = parseInt(opponentArea.css("top"));
    var targetY = ((ballTop / 100 * tracerHeight) + (gameBall.height() / 2)) / tracerHeight;
    var currentOpponentY = (parseInt(opponentArea.css("top")) + 15) / 150;
    var deltaY = (targetY - currentOpponentY) * -150;
    if (deltaY < -1) deltaY = -1;
    if (deltaY > 1) deltaY = 1;
    var newOpponentY = currentOpponentTop - deltaY;
    if (newOpponentY > 117) newOpponentY = 117;
    if (newOpponentY < 0) newOpponentY = 0;

    opponentArea.css({ left: newOpponentX, top: newOpponentY });

    
    if (gameStarted) {
        window.setTimeout(gameLoop, 10);
    }
}

function updateTracerAndBall() {
    
    ballTrace.css({ left: tracerLeft, top: tracerTop, width: tracerWidth, height: tracerHeight });

    
    ballLeft += ballHorizontalSpeed;
    ballTop += ballVerticalSpeed;
    var ballPositionLeft = ballLeft + "%";
    var ballPositionTop = ballTop + "%";
    gameBall.css({ left: ballPositionLeft, top: ballPositionTop });
}

function resetPongGame() {
    
    gameBall.css({ left: "47.5%", top: "47.5%" });
    ballTrace.css({ left: "0px", top: "0px", width: "498px", height: "498px" });
    opponentArea.css({ left: "40%", top: "40%" });

    
    initializeGame();
}

function addGameBlock() {
    
    if (blocksEnabled) {
        
        var hiddenBlocks = $("div.game-block:hidden");
        if (hiddenBlocks.length > 0) {
            var randomIndex = parseInt(Math.random() * hiddenBlocks.length);
            hiddenBlocks = hiddenBlocks.eq(randomIndex);
            hiddenBlocks.show();
            hiddenBlocks.css({ opacity: 0.8 });
            hiddenBlocks.animate({ opacity: 0.25 });
        }
    }
}