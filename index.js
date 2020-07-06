var gameDoc = "default.txt";
var names = ['default val'];
var votes = 0;
var excpected = [];
var have = [];
var startTime;
var skipped = false;
var roundVote = 0;
var voting = false;

const start = Date.now();

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

io.sockets.on('connection', socket => {
  if(!chats.length)
	socket.color = getRandomColor();

  socket.on('question', question => {
  refreshQuest();
  });

	socket.on('name', name => {
    startTime = Date.now()
	  name = encode(name);
		socketList[socket.id] = socket;
		if (name == 'Guest') {
			socket.name = name + ' ' + guests;
			guests++;
		} else socket.name = name;

currentPlayers();
socket.lastResponse = Date.now();
	});


  socket.on('players', players => {
currentPlayers()
  });

	socket.on('message', message => {
	  if(message.length > 100) return;
	  message = encode(message);
		chats.push({
		  message:
			'<span class="message-content">' +
				message + '</span>',
				time: d.getTime(),
				socketId: socket.id,
				id: Math.random(),
        points: 0,
        username: socket.name
		});

		saveChats();
    answerComplete();
    socket.lastResponse = Date.now();
	});
  socket.on('vote', id => {
    for(var i in chats){
      if(chats[i].id == id){
        chats[i].points++;
        votes++;
        break;
      }
    }
    voteComplete();
    emitChats();
  });
    socket.on('close', () => {
    io.sockets.emit('allClosed', );
  });
	socket.on('disconnect', () => {
			delete socketList[socket.id];
		saveChats();
	});
  socket.on('roundVote', () => {
			//delete socketList[socket.id];
      roundVote++;
      newRoundCheck(socket.id);
	});
});
setInterval(() => {
   for(var i in socketList){
       const millis = Date.now() - socketList[i].lastResponse;
       if(millis > 180000){
         socketList[i].emit('afk', );
        delete socketList[i];
      	saveChats();
       }
   }
}, 9000);

setInterval(() => {
  var timeTaken = ((Date.now() - startTime)/1000);
  var secondsLeft = Math.round(parseFloat(45-timeTaken));
  if(!answerComplete() && (skipped == false)){
  io.sockets.emit('timeLeft', secondsLeft);
  dontHave();
  }
  if(secondsLeft <= 0){
    if(have.length != 0){
      if(skipped == false){
      skipped = true;
      voteTime = Date.now();
      }
      emitChats();

    }else{
      refreshQuest();
    }
  }
  if(skipped == true && voting){
  var voteOverun = ((Date.now() - voteTime)/1000);
  var secondsLeft = Math.round(parseFloat(14-voteOverun));
  io.sockets.emit('voteTime', secondsLeft);

  if(voteOverun>=13.5){
      voting = false;
      pointsArray = [];
  justPoints = [];
  for (var j in chats) {
    pointsArray.push({
    score: chats[j].points,
    name: chats[j].username
    })
	}
  for (var k in pointsArray) {
  justPoints.push(pointsArray[k].score);
}
  var roundWinnerPoints = Math.max(...justPoints);
    for (var k in pointsArray) {
      if(pointsArray[k].score == roundWinnerPoints){
        var roundWinner = pointsArray[k].name;
          io.sockets.emit('winner', roundWinner);
        break;
      }
    }

votes = 0;
refreshQuest();
skipped = false;
  }
  }
}, 1000);

function emitChats(){
 for(var i in socketList){
    var pack = chats.map(c => {
      if(c.socketId != i) {
        return {message: c.message, time: c.time, points: c.points, id: c.id};
      }
      else{
        return c;
      }
    });
    socketList[i].emit('chats', pack);
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

async function getQuestion() {
  voting = false;
  startTime = Date.now()
  const nthline = require('nthline'),
  filePath = 'prompts.txt',
  rowIndex = getRandomLine();
const finalQuestion = await nthline(rowIndex, filePath)
    chats.splice(0, chats.length);
    emitChats();
return(finalQuestion);
}

function getRandomLine() {
  min = Math.ceil(0);
  max = Math.floor(linesCount-1);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

async function refreshQuest(){
  const questToSend = await getQuestion();

  io.sockets.emit('quest', questToSend);
}

function getRandomName(){
  names = [];

	for (var j in socketList) {
    names.push(socketList[j].name)
	}
  var randomName = names[Math.floor(Math.random()*names.length)];
  return randomName;
}

function answerComplete(){
  updateArrays();

  if(have.length == excpected.length){
    voting = true;
    emitChats();
    if(have.length != 0){
          if(skipped == false){
          voteTime = Date.now();
          skipped = true;
          }
    }
    return true;
  } else {
    return false;
  }
}


function dontHave(){
  updateArrays();
    pack = "";
  for(var z in excpected) {

    if(!(have.includes(excpected[z]))){
      pack+=(" " + excpected[z] );
    }

  }
for(var i in socketList){
    socketList[i].emit('waiting', pack);
  }
  return;
}


function currentPlayers(){
  updateArrays();
    pack = "";
  for(var z in excpected) {
      pack+=(" " + excpected[z]);
    }
for(var i in socketList){
    socketList[i].emit('lobby', pack);
  }
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
  updateArrays()
  if(excpected.length == roundVote){
    socketList[i].emit('newRound', 0)
    roundVote = 0;
  }else{
    var toSend = (roundVote + "/" + excpected.length + " votes");
    io.sockets.emit('newRound', toSend);
  }
}

function voteComplete(){
var excpectedVotes = 0;
	for (var j in socketList) {
    excpectedVotes++;
	}

if(excpectedVotes == votes){
  pointsArray = [];
  justPoints = [];
  for (var j in chats) {
    pointsArray.push({
    score: chats[j].points,
    name: chats[j].username
    })
	}
  for (var k in pointsArray) {
  justPoints.push(pointsArray[k].score);
}
  var roundWinnerPoints = Math.max(...justPoints);
    for (var k in pointsArray) {
      if(pointsArray[k].score == roundWinnerPoints){
        var roundWinner = pointsArray[k].name;
          io.sockets.emit('winner', roundWinner);
        break;
      }
    }



votes = 0;
refreshQuest();
skipped = false;
}
}
