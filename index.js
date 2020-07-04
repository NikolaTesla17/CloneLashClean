var gameDoc = "default.txt";
var names = ['default val'];
var votes = 0;
var excpected = [];
var have = [];
// var rooms = ['default.txt'];

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


    rmDir = function(dirPath, removeSelf) {
      if (removeSelf === undefined)
        removeSelf = true;
      try { var files = fs.readdirSync(dirPath); }
      catch(e) { return; }
      if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
          else
            rmDir(filePath);
        }
      if (removeSelf)
        fs.rmdirSync(dirPath);
    };
rmDir('rooms', false)

const readline = require('readline');
//const fs = require('fs');

var file = 'prompts.txt';
var linesCount = 0;
var rl = readline.createInterface({
    input: fs.createReadStream(file),
    output: process.stdout,
    terminal: false
});
rl.on('line', function (line) {
    linesCount++; // on each linebreak, add +1 to 'linesCount'
});
rl.on('close', function () {
});

io.sockets.on('connection', socket => {
  //emitChats();
  if(!chats.length)
  //  getChats();
	//emitChats();
	socket.color = getRandomColor();

  socket.on('question', question => {
  //getQuestion();
  refreshQuest();
  });

	socket.on('name', name => {
	  name = encode(name);
		socketList[socket.id] = socket;
		if (name == 'Guest') {
			socket.name = name + ' ' + guests;
			guests++;
		} else socket.name = name;

currentPlayers();
	});

// 	socket.on('game', game => {
//     //gameDoc = "/tmp/" + game + ".txt";
//     refreshQuest();

//     if(game=='default'){
//     gameDoc = 'default.txt';
//     } else {
//     gameDoc = "rooms/" + game + ".txt";
//     }
    
  socket.on('players', players => {
  //getQuestion();
  console.log(have);
currentPlayers()
  });




//   //peopleInRoom++;
// //     const testFolder = 'rooms';
// //     //const fs = require('fs');

// // fs.readdir(testFolder, (err, files) => {
// //   files.forEach(file => {
// //     console.log(file);
// //     rooms.push(file)
// //   });
// //   console.log(rooms);
// // });



// // var fs = require('fs');

// // fs.writeFile(gameDoc, 'Hello All', function (err) {
// //   if (err) throw err;
// //   console.log('Saved!');
// // });

// 		saveChats();
//     getChats();
// 		emitChats();
// 		// emitWho();
// 		saveChats();
// 		});

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
	});
  socket.on('vote', id => {
    for(var i in chats){
      if(chats[i].id == id){
        chats[i].points++;
        votes++;
        //console.log(chats[i].points);
        // chats.splice(i, 1);
        break;
      }
    }
    voteComplete();
    emitChats();
  });
	socket.on('disconnect', () => {
	  // refreshTime();
		// if (socketList[socket.id]) {
		// 	chats.push({
		// 	  message:
		// 		'<span class="name" style="color:' +
		// 			socket.color +
		// 			'">' +
		// 			socket.name +
		// 			'</span> <span class="red"> left.</span>',
		// 		time: d.getTime()
		// 	});
			// emitChats();
			delete socketList[socket.id];
		//}
		saveChats();
		// emitWho();
	});
});
// setInterval(() => {
// //   // refreshTime();
// //   // emitChats();
// }, 500);
// function refreshTime(){
//   d = new Date();
//   io.sockets.emit('time', d.getTime());
// }
// function emitWho() {
// 	for (var j in socketList) {
// 		var pack = [];
// 		for (var i in socketList) {
// 			if (j == i) {
// 				pack.push({
// 					name: socketList[i].name + ' (You)',
// 					color: socketList[i].color
// 				});
// 			} else {
// 				pack.push({ name: socketList[i].name, color: socketList[i].color });
// 			}
// 		}
// 		socketList[j].emit('who', pack);
// 	}
// }
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
  const nthline = require('nthline'),
  filePath = 'prompts.txt',
  rowIndex = getRandomLine();
const finalQuestion = await nthline(rowIndex, filePath)
//var modifiedQuestion = finalQuestion.split("~");
//var finished = (modifiedQuestion[0] + getRandomName() + modifiedQuestion[1]);
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
    emitChats();
    //refreshQuest();
  } else {
    dontHave()

  }
  //voteComplete()
}

function dontHave(){
  updateArrays();
    pack = "";
  for(var z in excpected) {

    if(!(have.includes(excpected[z]))){
      //console.log("dont have" + excpected[z]);
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
      //console.log("list" + excpected)
      pack+=(" " + excpected[z]);
      console.log(pack)
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

function voteComplete(){
var excpectedVotes = 0;
	for (var j in socketList) {
    excpectedVotes++;
	}

if(excpectedVotes == votes){
  pointsArray = [];
  justPoints = [];
  console.log("all votes in")
  for (var j in chats) {
    pointsArray.push({
    score: chats[j].points,
    name: chats[j].username
    })
	}
  for (var k in pointsArray) {
  justPoints.push(pointsArray[k].score);
}
  //console.log(justPoints);
  var roundWinnerPoints = Math.max(...justPoints);
  //console.log(roundWinnerPoints);
    for (var k in pointsArray) {
      if(pointsArray[k].score == roundWinnerPoints){
        var roundWinner = pointsArray[k].name;
          //console.log(roundWinner);
          io.sockets.emit('winner', roundWinner);
        break;
      }
    }



votes = 0;
}
}
