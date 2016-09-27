 //Map code
var FLOOR = 0;
var WALL = 1;
var DOOR = 2;
var CHEST = 3;
var SWITCH = 4;
var SWITCH_ACTIVATED = 5;
var BARRIER = 6;
var PLAYER = 7;
var MONSTER = 8;

var P = PLAYER;
var M = MONSTER;

//Map (must be a rectangular 2D array)
var map = 	[
				[1,1,1,1,1,1,1,1,1,1],
				[1,4,0,0,0,1,0,0,0,1],
				[1,1,0,1,0,1,0,3,0,1],
				[1,0,0,0,0,1,0,0,0,1],
				[1,0,0,0,1,1,1,0,1,1],
				[1,1,0,1,1,0,0,0,1,1],
				[1,0,0,0,1,6,1,1,1,1],
				[1,0,1,0,0,0,1,0,0,1],
				[1,0,1,0,1,0,0,0,0,1],
				[1,1,1,2,1,1,1,1,1,1]
			];

var gameObjects = [
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,M,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,M,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,M,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,M,0,0],
				[0,M,0,0,0,0,0,0,0,0],
				[0,0,0,P,0,0,0,0,0,0]
			];

//Map visual obfuscation "fog of war"
var mapFog;

//Map data
var ROWS = map.length;
var COLUMNS = map[0].length;

//Controls
var UP = 38;
var DOWN = 40;
var LEFT = 37;
var RIGHT = 39;

//Game variables
var CELL_SIZE = 64;
var GAME_WIDTH = CELL_SIZE * map.length;
var GAME_HEIGHT = CELL_SIZE * map[0].length;
var MSG_LOG_LENGTH = 5; //Total game messages to display at once

playerLocation = []; //row, column
playerHP = 3;

var switchActivated = false;
var treasureObtained = false;
var gameWon = false;

var gameMessageLog = [];

//Game objects
var game = document.querySelector("#game");
var titleScreen = document.querySelector("#titleScreen");
var title = document.querySelector("#title");
var stage = document.querySelector("#stage");
var outputBox = document.querySelector("#outputBox");
var output = document.querySelector("#output");

initializeGame();

function initializeGame(){
	console.log("initializeGame();");
	game.style.width = (CELL_SIZE * ROWS) + "px";
	stage.style.width = (CELL_SIZE * ROWS) + "px";
	stage.style.height = (CELL_SIZE * ROWS) + "px";

	window.addEventListener("keyup", keyupHandler, false);

	for (var row = 0; row < ROWS; row++) {
		for (var column = 0; column < COLUMNS; column++) {
			if(gameObjects[row][column] === PLAYER){
				playerLocation = [row, column];
			}
		}
	}
	createFog();
	render(true);
}

function gameEnd(){
	window.removeEventListener("keyup", keyupHandler, false);

	if(gameWon){
		gameMessageLog.unshift("<br><span>You beat the Dungeon!</span><br>");
	} else {
		gameMessageLog.unshift("<br>You fall to the monster.<br>" +
			"With your dying breath, you curse the day you were born...<br>"+
			"<em>Press any key to try again.</em><br>");

		//Try again??
		window.addEventListener("keydown", keydownHandler, false);
	}
	
}

function keydownHandler(){
	location.reload();
}

function keyupHandler(event){
	var y = playerLocation[0];
	var x = playerLocation[1];
	var actionTaken = false;

	switch(event.keyCode){
		case UP:
			if(y > 0){
				if(map[y-1][x] !== WALL){
					if(map[y-1][x] !== BARRIER){
						if(gameObjects[y-1][x] !== MONSTER){
							gameObjects[y][x] = 0;
							playerLocation[0]--;
							y = playerLocation[0];
							gameObjects[y][x] = PLAYER;
							actionTaken = true;
						} else {
							fight(UP);
						}
					} else {
						gameMessageLog.unshift("<br>You try to remove the barrier, but to no avail...");
					}
				}
			}
		break;
		case DOWN:
			if(y < ROWS-1){
				if(map[y+1][x] !== WALL){
					if(map[y+1][x] !== BARRIER){
						if(gameObjects[y+1][x] !== MONSTER){
							gameObjects[y][x] = 0;
							playerLocation[0]++;
							y = playerLocation[0];
							gameObjects[y][x] = PLAYER;
							actionTaken = true;
						} else {
							fight(DOWN);
						}
					} else {
						gameMessageLog.unshift("<br>You try to remove the barrier, but to no avail...");
					}
				}
			}
		break;
		case LEFT:
			if(x > 0){
				if(map[y][x-1] !== WALL){
					if(map[y][x-1] !== BARRIER){
						if(gameObjects[y][x-1] !== MONSTER){
							gameObjects[y][x] = 0;
							playerLocation[1]--;
							x = playerLocation[1];
							gameObjects[y][x] = PLAYER;
							actionTaken = true;
						} else {
							fight(LEFT);
						}
					} else {
						gameMessageLog.unshift("<br>You try to remove the barrier, but to no avail...");
					}
				}
			}
		break;
		case RIGHT:
			if(x < COLUMNS-1){
				if(map[y][x+1] !== WALL){
					if(map[y][x+1] !== BARRIER){
						if(gameObjects[y][x+1] !== MONSTER){
							gameObjects[y][x] = 0;
							playerLocation[1]++;
							x = playerLocation[1];
							gameObjects[y][x] = PLAYER;
							actionTaken = true;
						} else {
							fight(RIGHT);
						}
					} else {
						gameMessageLog.unshift("<br>You try to remove the barrier, but to no avail...");
					}
				}
			}
		break;
	}

	if(actionTaken){
		titleScreen.style.display = "none";

		//Displays what the player is standing on
		switch(map[y][x]){

			case FLOOR:
				console.log("floor");
			break;

			case DOOR:
				console.log("door");
				if(treasureObtained){
					gameWon = true;
					gameEnd();
				} else {
					gameMessageLog.unshift("<br>You haven't obtained the treasure yet!");
				}
			break;

			case CHEST:
				console.log("chest");
				map[y][x] = FLOOR;
				treasureObtained = true;
				gameMessageLog.unshift("<br>You open the chest, and obtain the treasure inside!");
			break;

			case SWITCH:
				console.log("switch");
				map[y][x] = SWITCH_ACTIVATED;
				switchActivated = true;
				gameMessageLog.unshift("<br>You activated the switch! You hear a soft rumbling in the distance...");
			break;
		}
	}
	render(actionTaken);
}

function fight(direction){
	//If the player wins the fight with the monster
	//kill it and move into its location
	//Otherwise, lose 1 HP and stay where you are
	if(Math.round(Math.random()) === 1){
		var y = playerLocation[0];
		var x = playerLocation[1];
		gameMessageLog.unshift("<br>You've slain a monster!");

		switch(direction){
			case UP:
				gameObjects[y][x] = 0;
				gameObjects[y-1][x] = PLAYER;
				playerLocation[0]--;
			break;
			case DOWN:
				gameObjects[y][x] = 0;
				gameObjects[y+1][x] = PLAYER;
				playerLocation[0]++;
			break;
			case LEFT:
				gameObjects[y][x] = 0;
				gameObjects[y][x-1] = PLAYER;
				playerLocation[1]--;
			break;
			case RIGHT:
				gameObjects[y][x] = 0;
				gameObjects[y][x+1] = PLAYER;
				playerLocation[1]++;
			break;
		}
		render(true);
	} else {
		playerHP--;
		gameMessageLog.unshift("<br>You fought the monster, and lost..." +
			"<strong> You have " + playerHP + " hp remaining.</strong>");
	}

	if(playerHP <= 0){
		gameEnd();
	}
}

//Create the map of the fog
function createFog(){
	mapFog = [];
	
	for (var row = 0; row < ROWS; row++) {
		mapFog.push([]);
		for (var column = 0; column < COLUMNS; column++) {
			mapFog[row].push(1);
		}
	}
}

function updateFog(){
	if(playerLocation.length > 0){
		var y = playerLocation[0];
		var x = playerLocation[1];
		
		if(y !== 0){
			mapFog[y-1][x] = 0;//North
		}
		if(y !== ROWS-1){
			mapFog[y+1][x] = 0;//South
		}
		if(x !== COLUMNS){
			mapFog[y][x+1] = 0;//East
		}
		if(x !== 0){
			mapFog[y][x-1] = 0;//West
		}
		mapFog[y][x] = 0;//Center
	}
}

function displayGameMessages(LOG_LENGTH){
	output.innerHTML = "";

	while(gameMessageLog.length > LOG_LENGTH){
		gameMessageLog.pop();
	}
	for (var i = 0; i < gameMessageLog.length; i++) {
		output.innerHTML += gameMessageLog[i]
	}
}

//Requires "true" input to render.
//Otherwise, displays gameMessageLog only
//Ensures messages are displayed even when you havent moved
function render(renderGraphics){
	displayGameMessages(MSG_LOG_LENGTH);

	if(renderGraphics){

		clearStage();
		updateFog();

		for (var row = 0; row < ROWS; row++) {
			for (var column = 0; column < COLUMNS; column++) {

				//Render the map
				var cell = document.createElement("div");
				cell.setAttribute("class", "cell");
				cell.setAttribute("id", ("" + row) + ("" + column));
				cell.style.width = CELL_SIZE + "px";
				cell.style.height = CELL_SIZE + "px";
				cell.style.top = (CELL_SIZE * row) + "px";
				cell.style.left = (CELL_SIZE * column) + "px";
				stage.appendChild(cell);

				switch(map[row][column]){
					case FLOOR:
					cell.style.backgroundImage = "url(images/floor.png)";
					break;

					case WALL:
					cell.style.backgroundImage = "url(images/wall.png)";
					break;

					case DOOR:
					cell.style.backgroundImage = "url(images/door.png)";
					break;

					case CHEST:
					cell.style.backgroundImage = "url(images/chest.png)";
					break;

					case SWITCH:
					cell.style.backgroundImage = "url(images/switch.png)";
					break;

					case SWITCH_ACTIVATED:
					cell.style.backgroundImage = "url(images/switchActivated.png)";
					break;

					case BARRIER:
					if(switchActivated){
						map[row][column] = FLOOR;
						cell.style.backgroundImage = "url(images/floor.png)";
					} else {
						cell.style.backgroundImage = "url(images/barrier.png)";
					}
					
					break;

					default:
					cell.style.backgroundImage = "url(images/error.png)";
					break;
				}

				//Render the game objects
				if(gameObjects[row][column] > 0){
					var target = document.getElementById("" + row + column);
					var gameObject = document.createElement("img");
					target.appendChild(gameObject);

					switch(gameObjects[row][column]){
						case PLAYER:
						gameObject.setAttribute("src","images/player.png");
						gameObject.setAttribute("id","player");
						break;

						case MONSTER:
						gameObject.setAttribute("src","images/monster.png");
						gameObject.setAttribute("id","" + row + column + "monster");
						break;

						default:
						gameObject.setAttribute("src","images/error.png");
						gameObject.setAttribute("id","" + row + column + "error");
						break;
					}
				}

				//Determine player's location
				if(gameObjects[row][column] === PLAYER){
					playerLocation = [row, column];
					//console.log(playerLocation);
				}

				//Render the fog
				if(mapFog[row][column] > 0){
					var target = document.getElementById("" + row + column);
					var fog = document.createElement("img");
					fog.setAttribute("src","images/fog.png");
					fog.setAttribute("id","" + row + column + "fog");
					fog.style.position = "absolute";
					fog.style.top = "0px";
					fog.style.left = "0px";
					target.appendChild(fog);
				}
			}
		}
	}
}

function clearStage(){
	if(stage.hasChildNodes()){
		for (var i = 0; i < ROWS * COLUMNS; i++) {
			stage.removeChild(stage.firstChild);
		}
	}
}