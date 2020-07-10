var gameDoc = "chats.txt";
var games = [];
var rooms = [];
var monitors = [];

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.use('/', express.static(__dirname + '/client/'));

serv.listen(process.env.PORT)
console.log('Server started.');

var chats = [];
var socketList = {};
var guests = 0;
var io = require('socket.io')(serv, {});
var fs = require('fs');
var d = new Date();

const readline = require('readline');

var file = 'prompts.txt';
var linesCount = 0;
var rl = readline.createInterface({
    input: fs.createReadStream(file),
    output: process.stdout,
    terminal: false
});
rl.on('line', function (line) {
    linesCount++;
});
rl.on('close', function () {
});

function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

io.sockets.on('connection', socket => {
  if(!chats.length)
	socket.color = getRandomColor();

  socket.on('question', question => {
  refreshQuest(socketList[socket.id].game);
  });

  socket.on('game', game => {
  socketList[socket.id] = socket;
  socketList[socket.id].game = game;
  socketList[socket.id].monitor = false;

  if(!games.includes(game)){
  games.push(game);
  rooms.push({
    room:game,
    gameFrequency:1,
    votes:0,
    startTime:Date.now(),
    skipped:false,
    voting:false,
    roundVote:0,
    haveAnswers:0,
    players:[],
    playersAnswered:[],
    voteTime:0,
    lobby:true
  });
  }else{
    if(rooms[games.indexOf(game.toString())].voting == false){
    rooms[games.indexOf(game.toString())].gameFrequency +=1;
    }else{
          rooms[games.indexOf(game.toString())].gameFrequency +=1;




        
rooms[games.indexOf(game.toString())].votes = 0;
rooms[games.indexOf(game.toString())].skipped = false;
refreshQuest(game);

  var chatsTotal = chats.length;
  for (var k = (chats.length-1);k>=0;k--) {
if(chats[k].room == game){
  chats.splice(k,1);
}
  }
  rooms[games.indexOf(game.toString())].playersAnswered = [];
  rooms[games.indexOf(game.toString())].haveAnswers = [];
    }
  }
  });

  socket.on('monitor', game => {
  socketList[socket.id] = socket;
  socketList[socket.id].game = game;
  socketList[socket.id].monitor = true;

  monitors.push({
    socketID: socket.id,
    game: game
    })
  });


	socket.on('name', name => {
	  name = encode(name);
		if (name == 'Guest') {
			socket.name = name + ' ' + guests;
			guests++;
		} else socket.name = name;

currentPlayers(socket.game);
rooms[games.indexOf(socket.game.toString())].players.push(socket.name);
socket.lastResponse = Date.now();

rooms[games.indexOf(socket.game.toString())].startTime = Date.now();
	});




	socket.on('message', message => {
	  if(message.length > 100){
      console.log("erorr, message to long")
      return;
    }
	  message = encode(message);
		chats.push({
		  message:
			'<span class="message-content">' +
				message + '</span>',
				time: d.getTime(),
				socketId: socket.id,
				id: Math.random(),
        points: 0,
        username: socket.name,
        room: socketList[socket.id].game
		});

		saveChats();
    rooms[games.indexOf(socketList[socket.id].game.toString())].haveAnswers++;
    rooms[games.indexOf(socketList[socket.id].game.toString())].playersAnswered.push(socket.name);
    answerComplete(socketList[socket.id].game);
    socket.lastResponse = Date.now();
	});
  socket.on('vote', id => {
    for(var i in chats){
      if(chats[i].id == id){
        chats[i].points++;
        rooms[games.indexOf(socketList[socket.id].game.toString())].votes++;
        break;
      }
    }
    voteComplete(socket.id);
    emitChats(socketList[socket.id].game);
  });
    socket.on('close', () => {
    io.sockets.emit('allClosed', socketList[socket.id].game);
  });

	socket.on('disconnect', () => {
if(typeof socketList[socket.id] != "undefined"){

      if(socketList[socket.id].monitor){
        monitorId = [];
        
        for(i in monitors){
          monitorId.push(monitors[i].socketID);
        }
        for(k in monitorId){
          if(monitorId[k] == socket.id){
            monitors.splice(k, 1);
          }
        }

      } else if(!socketList[socket.id].monitor){
  var roomNum = games.indexOf((socketList[socket.id].game).toString());

if(rooms[roomNum].players.includes(socketList[socket.id].name)){
removeA(rooms[roomNum].players, socketList[socket.id].name);
    }
    rooms[roomNum].gameFrequency--;

if(rooms[roomNum].playersAnswered.includes(socketList[socket.id].name)){
removeA(rooms[roomNum].playersAnswered, socketList[socket.id].name);
    }
      }else{
        console.log("person left without selecting an option")
      }

      delete socketList[socket.id];
    }
		saveChats();
	});
  socket.on('roundVote', () => {
      rooms[games.indexOf(socketList[socket.id].game.toString())].roundVote++; 

      newRoundCheck(socket.id);
	});
});

setInterval(() => {
   for(var i in socketList){
       const millis = Date.now() - socketList[i].lastResponse;
       if(millis > 180000){
         socketList[i].emit('afk', );
if(typeof socketList[i] != "undefined"){

      if(socketList[i].monitor){
        console.log("just a monitor")
      } else if(!socketList[i].monitor){
  var roomNum = games.indexOf((socketList[i].game).toString());

if(rooms[roomNum].players.includes(socketList[i].name)){
removeA(rooms[roomNum].players, socketList[i].name);
    }
    rooms[roomNum].gameFrequency--;

if(rooms[roomNum].playersAnswered.includes(socketList[i].name)){
removeA(rooms[roomNum].playersAnswered, socketList[i].name);
    }
      }else{
        console.log("unreachable state reached")
      }
      delete socketList[i];
    }
		saveChats();
    }
   }
}, 9000);



setInterval(() => {
  for(var we in rooms){
  var timeTaken = ((Date.now() - rooms[we].startTime)/1000);
  var timeRemaining = Math.round(parseFloat(45-timeTaken));
  var secondsLeft = ({
    secondsLeft:timeRemaining,
    game:rooms[we].room
  })
  if(rooms[we].gameFrequency == 0){
    rooms[we].lobby = true;
  }
  if(rooms[we].lobby){
    currentPlayers(rooms[we].room)
    io.sockets.emit('timeLeft', secondsLeft);
  }else if(!answerComplete(rooms[we].room) && (rooms[we].skipped == false)){
  io.sockets.emit('timeLeft', secondsLeft);
  dontHave(rooms[we].room);
  }
  if(secondsLeft.secondsLeft <= 0){
    if(rooms[we].haveAnswers != 0){
      if(rooms[we].skipped == false){
      rooms[we].voteTime = Date.now();
      rooms[we].voting = true;
      rooms[we].skipped = true;
      }
      emitChats(rooms[we].room);
    }else{
      refreshQuest(rooms[we].room);
    }
  }
  if(rooms[we].skipped == true && rooms[we].voting){
  var voteOverun = ((Date.now() - rooms[we].voteTime)/1000);
  var timeRemaining = Math.round(parseFloat(14-voteOverun));
  var secondsLeft = ({
    secondsLeft:timeRemaining,
    game:rooms[we].room
  })
  io.sockets.emit('voteTime', secondsLeft);

  if(voteOverun>=13.5){
      rooms[we].voting = false;
      giveWinner(rooms[we].room);
  }
  }
  }
}, 1000);





function emitChats(roomHere){
  if(monitors.length != 0){
    var monitoringGames = [];
    var monitoringIds = [];
    var socketIds = [];

  for(var o in monitors){
  monitoringGames.push(monitors[o].game);
}
  for(var o in monitors){
  monitoringIds.push(monitors[o].socketID);
}

var idsNeeded = getAllIndexes(monitoringGames, roomHere);


    var pack = chats.map(c => {
      if(c.socketId != i) {
        return {message: c.message, time: c.time, points: c.points, id: c.id, room: c.room, username: c.username};
      }
      else{
        return c;
      }
    });
    for(var i in socketList){
   socketIds.push(socketList[i].id)
    }
    for(i in idsNeeded){
      var socketListsNeeded = getAllIndexes(socketIds, monitoringIds[idsNeeded[i]]);
    if(typeof socketList[monitoringIds[i]] != 'undefined'){
    socketList[monitoringIds[i]].emit('chats', pack);
    }
    }
}

var roomPlayers = rooms[games.indexOf(roomHere.toString())].players;
var socketNames = [];
var socketIds = [];
for(var o in socketList){
  socketNames.push(socketList[o].name);
}
for(var o in socketList){
  socketIds.push(socketList[o].id);
}


 for(var i in roomPlayers){
   var socketNum = (socketNames.indexOf(roomPlayers[i].toString()));
   var socketNumToSend = socketIds[socketNum];
    var pack = chats.map(c => {
      if(c.socketId != i) {
        return {message: c.message, time: c.time, points: c.points, id: c.id, room: c.room, username: c.username};
      }
      else{
        return c;
      }
    });
    for(var o in socketNames){
    if(o == socketNum){
    socketList[socketNumToSend].emit('chats', pack);
    }
    }
  }
}
function saveChats() {
  var chatsStr = chats.map(e => e.message + "\n" + e.time).join("\n\n");
	fs.writeFile(gameDoc, chatsStr, function(err) {
		if (err) {
			return console.log(err);
		}
	});
}
function getChats() {
	fs.readFile(gameDoc, 'utf8', function(err, data) {
		if (err) {
			return console.log(err);
		}
		if (data.length) 
		  chats = data.split('\n\n').map(e => 
		    ({message: e.split("\n")[0], time: e.split("\n")[1]})
		  );
	});
}
function encode(txt) {
	return txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 14)];
	}
	return color;
}

async function getQuestion(gameToGive) {
  const nthline = require('nthline'),
  filePath = 'prompts.txt',
  rowIndex = getRandomLine();
const finalQuestion = await nthline(rowIndex, filePath)
var modifiedQuestion = finalQuestion.split("~");
var finished = (modifiedQuestion[0] + getRandomName() + modifiedQuestion[1]);
    emitChats(gameToGive);
return(finished);
}

function getRandomLine() {
  min = Math.ceil(0);
  max = Math.floor(linesCount-1);
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

async function refreshQuest(gameToGive){
  rooms[games.indexOf(gameToGive)].lobby = false;
  rooms[games.indexOf(gameToGive)].voting = false;
  rooms[games.indexOf(gameToGive)].startTime = Date.now()
  const questToSend = await getQuestion(gameToGive);

  var toSend = ({
    game:gameToGive,
    quest:questToSend
})

  io.sockets.emit('quest', toSend);
  return;
}

function getRandomName(){
  names = [];

	for (var j in socketList) {
    names.push(socketList[j].name)
	}
  var randomName = names[Math.floor(Math.random()*names.length)];
  return randomName;
}

function answerComplete(room){
    rooms[games.indexOf(room)].lobby = false;
  if(rooms[games.indexOf(room)].gameFrequency == rooms[games.indexOf(room)].haveAnswers){
rooms[games.indexOf(room)].voting = true;
    emitChats(room);
    if(rooms[games.indexOf(room)].haveAnswers != 0){
          if(rooms[games.indexOf(room)].skipped == false){
          rooms[games.indexOf(room)].voteTime = Date.now();
          rooms[games.indexOf(room)].skipped = true;
          }
    }
    return true;
  } else {
    return false;
  }
  }





function dontHave(roomToCheck){
  const y = rooms[games.indexOf(roomToCheck.toString())].players
  const x = rooms[games.indexOf(roomToCheck.toString())].playersAnswered

var notHave = y.filter(e => !x.includes(e));

  var toSend = ({
    game:roomToCheck,
    waiting:notHave
})

  io.sockets.emit('waiting', toSend);
  return;
}


function currentPlayers(roomToCheck){
  const y = rooms[games.indexOf(roomToCheck.toString())].players

  var toSend = ({
    game:roomToCheck,
    have:y
})

  io.sockets.emit('lobby', toSend);
  return;
}


function updateArrays(){
 excpected = [];
 have = [];
  for (var x in socketList) {
    excpected.push(socketList[x].name);
  }
  for (var y in chats){
    have.push(chats[y].username);
  }
}
function newRoundCheck(i){
  var toSend = [];
  if(rooms[games.indexOf(socketList[i].game)].gameFrequency <= rooms[games.indexOf(socketList[i].game)].roundVote){
    toSend=({
      message:0,
      game:socketList[i].game
    })
    socketList[i].emit('newRound', toSend)
    rooms[games.indexOf(socketList[i].game)].roundVote = 0;
    rooms[games.indexOf(socketList[i].game)].haveAnswers = 0;
  }else{
    toSend=({
      message:rooms[games.indexOf(socketList[i].game)].roundVote + "/" + rooms[games.indexOf(socketList[i].game)].gameFrequency + " votes",
      game:socketList[i].game
    })
     
    io.sockets.emit('newRound', toSend);
  }
}

function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

function giveWinner(gameToGive){
  rooms[games.indexOf(gameToGive)].haveAnswers = 0;
  pointsArray = [];
  justPoints = [];
  chatsGames = [];
  arrayGames = [];
  for (var j in chats) {
    chatsGames.push(chats[j].room)
  }
  arrayGames = getAllIndexes(chatsGames, gameToGive);
  for (var j in arrayGames) {
    pointsArray.push({
    points:chats[arrayGames[j]].points,
    name:chats[arrayGames[j]].username
    })
	}
  for (var k in pointsArray) {
  justPoints.push(pointsArray[k].points);
}
  var roundWinnerPoints = Math.max(...justPoints);
  if(roundWinnerPoints!=0){
    for (var k in pointsArray) {
      if(pointsArray[k].points == roundWinnerPoints){
        var roundWinner = pointsArray[k].name;
        var sendingIt = ({
          roundWinner:roundWinner,
          game:chats[k].room
        })
          io.sockets.emit('winner', sendingIt);
        break;
      }
    }
  } else {
      var sendingIt = ({
          roundWinner:"your answers are all bad",
          game:gameToGive
      })
    io.sockets.emit('winner', sendingIt);
  }

rooms[games.indexOf(gameToGive.toString())].votes = 0;
rooms[games.indexOf(gameToGive.toString())].skipped = false;
refreshQuest(gameToGive);

  var chatsTotal = chats.length;
  for (var k = (chats.length-1);k>=0;k--) {
if(chats[k].room == gameToGive){
  chats.splice(k,1);
}
  }
  rooms[games.indexOf(gameToGive.toString())].playersAnswered = [];
}

function voteComplete(socket){
if(rooms[games.indexOf(socketList[socket].game.toString())].gameFrequency == rooms[games.indexOf(socketList[socket].game.toString())].votes){
giveWinner(socketList[socket].game);
}
}