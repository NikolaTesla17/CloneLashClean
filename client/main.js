$('#main-container').hide();
$('#main-container').fadeOut();
$('#controls').hide();
$('#controls').fadeOut();
$('#copy-tooltip').hide();
$('#name').focus();

var gameSong = new Audio('songs/lolipops&roses.mp3');
var voteSong = new Audio('songs/route101.mp3');
var lobbySong = new Audio('songs/fandango.mp3');
var turnTaken = false;
var voted = false;
var secondsLeft = 45;
var afk = false;
var winDisplay = false;
var name;
var game;
var voteRound = false;
var playersHave = [];
var monitoring = false;
var lobbying = true;

var time;
var newQuestFinal;
function monitor(){
  $('#monitor').fadeOut();
  $('#menuButton').fadeOut(400);
  $('#prompt').fadeOut(400);
    $('#menu').fadeOut(400);
  sleep(500).then(() => {
  document.getElementById("monitor").style.visibility = "visible";
    $('#monitor').fadeIn(500);
  })
}

function closeMonitor(){
  	$('#name-info').fadeOut(500);
    $('#monitor').fadeOut(500);
  sleep(500).then(() => {
    $('#name-info').show();
      document.getElementById("monitor").style.visibility = "hidden";
  $('#menuButton').fadeIn(400);
  $('#prompt').fadeIn(400);
  })
}

$('#monitorGame').keypress(e => {
	var code = e.keyCode || e.which;
	if (code == 13) {
		monitorGameSet();
	}
});

function openMenu(){
  $('#menuButton').fadeOut(400);
  $('#menu').fadeOut();
  $('#prompt').fadeOut(400);
  sleep(500).then(() => {
  document.getElementById("menu").style.visibility = "visible";
    $('#menu').fadeIn(500);
  })
}
function closeMenu(){
      $('#menuButton').fadeIn(400);
  $('#menu').fadeOut(400);

  sleep(500).then(() => {
  document.getElementById("menu").style.visibility = "hidden";
    $('#prompt').fadeIn(500);
  })
}

function monitorGameSet() {
  $('#backButton').fadeOut(400);
  monitoring = true;
  game = $('#monitorGame').val();
  if (isEmpty(game)) game = 'default';
  $('#monitorGame').val('');
	socket.emit('monitor', game);
  document.getElementById("monitorTitle").innerHTML = "Game Code: " + game;
    $('#monitorControls').fadeOut(400);
      sleep(400).then(() => {
      document.getElementById("monitorControls").innerHTML = "";
      [].forEach.call(document.querySelectorAll('.monitorText'), function (el) {
  el.style.visibility = 'visible';
});
      $('#monitorText').fadeIn(500);
      })
}

function rename() {
    $('#menuButton').fadeOut(100);
  game = $('#game').val();
  if (isEmpty(game)) game = 'default';
	socket.emit('game', game);

	name = $('#name').val();
	if (isEmpty(name)) name = 'Guest';
	socket.emit('name', name);
	$('#prompt').fadeOut(200);
	$('#name-info').hide();
	$('#controls').animate({opacity: 'toggle'}, 500);
	$("#main-container").animate({ height: 'toggle', opacity: 'toggle' }, 500);
	$('#message').focus();
}
var socket = io();
socket.on('chats', data => {
  if(data.length != 0){
    gameSong.pause();
    lobbySong.pause();
    voteSong.play();
  }
 
	var reachedEnd = false;
	if (
		Math.abs(
			$('#chats')[0].scrollHeight -
				$('#chats').scrollTop() -
				$('#chats').outerHeight()
		) < 1
	) {
		reachedEnd = true;
	}

	var html = "";
  var toWrite = "";
	for(var d of data){
    timeStr = d.points;
    if(!monitoring){
    if(d.room == game){
    if(d.username == name){
	  var htmlToAdd = '<div class="message">' + d.message + ' <span class="time">'+timeStr+' votes</span></div>';
    } else {
    var htmlToAdd = '<div class="message">' + d.message + ' <span class="time">'+timeStr+' votes</span>' + (d.id? '<button class="vote" id="'+d.id+'">Vote</button>': "") + '</div>';
    }
    html += htmlToAdd;
    }
    }else{
    toWrite += '<div class="message">' + d.message + ' <span class="boardPoints">'+timeStr+' votes</span></div>'
    }
	}
  if(monitoring){
  document.getElementById("answersMonitor").innerHTML = toWrite;
  }

  $('#chats').html(html);
	if (reachedEnd){
		$('#chats').scrollTop(
			$('#chats')[0].scrollHeight - $('#chats')[0].clientHeight
		);
	}
	if (data.length == 0) {
		$('#chats').html('<div style="text-align: center" class="red">Loading Question.</div>');
	}


});

function roundVote(){
  if(!voteRound){
		socket.emit('roundVote', );
    voteRound = true;
  }
}

function closeWinner(){
  if(monitoring){
      $('#monitor').fadeIn(500);
  }
  voteRound = false;
   $('#controls').fadeIn();
      voteSong.pause();
      lobbySong.pause();
    gameSong.play();
  $("#world").removeClass("open");
  $("#winner").removeClass("open");
  $("#close").removeClass("open");

  question.style.visibility = "hidden";
      question.classList.add('fade');
  sleep(400).then(() => {
        question.style.visibility = "visible";
             question.classList.remove('fade');
             winDisplay = false;
  })
}


socket.on('timeLeft', data => {
if(data.game == game){
secondsLeft = data.secondsLeft;
if(monitoring){
  if(lobbying){
    var toWrite = secondsLeft + " seconds to join";
    document.getElementById("gameTimeLeft").textContent = (toWrite);
  }else{
var toWrite = secondsLeft + " seconds to be witty";
document.getElementById("gameTimeLeft").textContent = (toWrite);
  }
}
}
});
socket.on('newRound', data => {
if(data.game == game){
if(data.message == 0){
newQuestion();
} else {
  document.getElementById("newQuestion").textContent = (data.message);
}
}
});
socket.on('allClosed', data => {
if(data == game){
voteSong.pause();
lobbySong.pause();
closeWinner();
gameSong.play();
}
});
socket.on('waiting', data => {
if(data.game == game){

if(monitoring){
var toWrite = "waiting on: " + data.waiting;
document.getElementById("waitingOn").textContent = (toWrite);
} else {
$('#chats').html('<div style="text-align: center" class="red">Waiting on: ' + data.waiting + '<br> ' + secondsLeft + ' seconds remaining.</div>');
}
}
});
socket.on('voteTime', data => {
if(data.game == game){
if(monitoring){
var toWrite = data.secondsLeft + " seconds left to vote";
document.getElementById("gameTimeLeft").textContent = (toWrite);
}else{
if(document.getElementById("secondsLeft")){
document.getElementById("secondsLeft").innerHTML = ('<div id="secondsLeft" style="text-align: center" class="red">'+  data.secondsLeft + ' seconds left to vote.</div>');
}else{
document.getElementById("chats").innerHTML += ('<div id="secondsLeft" style="text-align: center" class="red">'+  data.secondsLeft + ' seconds left to vote.</div>');
}
}
}
});
socket.on('lobby', data => {
  if(data.game == game){
    if(!document.getElementById("gameCode")){
    $('#newRoundStartLabel').html('<span id="gameCode">Start a new Round once everyone is in.<br>Game Code: ' + game + '</span>');
  }
    if(!document.getElementById("theLobbyer")){
$('#chats').html('<div style="text-align: center" id="theLobbyer" class="red">Current players: ' + data.have + '<br>waiting for more.<br>' + secondsLeft + ' seconds remaining</div>');
lobbySong.currentTime = 0;
gameSong.pause();
voteSong.pause();
lobbySong.play();
    }else{
    $('#chats').html('<div style="text-align: center" id="theLobbyer" class="red">Current players: ' + data.have + '<br>waiting for more.<br>' + secondsLeft + ' seconds remaining</div>');
    }
    if(playersHave.length != data.have.length){
      lobbySong.currentTime = 0;
gameSong.pause();
voteSong.pause();
lobbySong.play();
playersHave = data.have;
    }
  if(monitoring){
var toWrite = "currently in the lobby: " + data.have;
document.getElementById("waitingOn").textContent = (toWrite);
}
  }
});
socket.on('quest', data => {
for(d in data){
if(data.game == game){
  newQuestFinal = data.quest;
  changeQuestion();

   if(monitoring){
var toWrite = "question: " + newQuestFinal;
document.getElementById("questionsMonitor").textContent = (toWrite);
}
}
}
});
socket.on('afk', data => {
  afk = true;
gameSong.pause();
voteSong.pause();
var afk = document.getElementById('afk');
afk.classList.add('visible')
var mainContainer = document.getElementById('main-container'); mainContainer.classList.add('dissapear')
var question = document.getElementById('question'); 
question.classList.add('fade')
});
socket.on('winner', data => {
for(var we in data){
if(data.game == game){
showWin(data.roundWinner);
}
}
});
socket.on('clear', data => {
  var whatever = data;
  changeQuestion();
});
socket.on('time', data => {
  time = data;
})
setInterval(() => {
if(afk){
var question = document.getElementById('question'); 
question.classList.add('fade')
gameSong.pause();
voteSong.pause();
lobbySong.pause();
}
}, 1000);
function send() {
  if(!turnTaken){
  $('#controls').fadeOut();
  gameSong.pause();
  gameSong.currentTime = 0
	var message = $('#message').val();
	if (!isEmpty(message)) {
		socket.emit('message', message);
		$('#message').val('');
	}
    turnTaken = true;
  } else {
    		$('#message').val("Wait for the next question, answer not changed");
  }
}


function isEmpty(txt) {
	if (txt.replace(/\s/g, '').length) return false;
	else return true;
}
$(document).on('click', '.name', function(e) {
	e.preventDefault();
	reply($(this).text());
	$('#message').focus();
});
$(document).on('click', '.vote', function(e) {
  var idForChange = $(this).attr('id');
  if(!voted){
  socket.emit('vote', $(this).attr('id'));
  voted = true;
  }else{
    document.getElementById(idForChange).innerHTML = "You Can Only Vote Once";
  }
});
$(document).on('mouseover', '.name', function() {
	$('#reply-tooltip').fadeIn(0);
	var offset = $(this).offset();
	var scrollTop = $(window).scrollTop();
	$('#reply-tooltip').css({
		top: offset.top + scrollTop + 30 + 'px',
		left: offset.left + 'px'
	});
});
$(document).on('mouseleave', '.name', function() {
	$('#reply-tooltip').fadeOut(0);
});
$(document).on('mouseover', '.message-content', function() {
	$('#copy-tooltip').fadeIn(0);
	var offset = $(this).offset();
	var scrollTop = $(window).scrollTop();
	$('#copy-tooltip').css({
		top: offset.top + scrollTop + 30 + 'px',
		left: offset.left + 'px'
	});
});
$(document).on('mouseleave', '.message-content', function() {
	$('#copy-tooltip').fadeOut(0);
	
});

$('#message').keypress(e => {
	var code = e.keyCode || e.which;
	if (code == 13) {
		send();
	}
});
$('#name').keypress(e => {
	var code = e.keyCode || e.which;
	if (code == 13) {
		rename();
	}
});
$('#game').keypress(e => {
	var code = e.keyCode || e.which;
	if (code == 13) {
		rename();
	}
});


function newQuestion(){
 		  socket.emit('question', );
         $('#message').val('');
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function changeQuestion(){
  if(!afk){
    lobbying = false;
      voteRound = false;
      document.getElementById("newQuestion").textContent = ("New Round");
      var question = document.getElementById('question');
      question.classList.add('fade');
sleep(600).then(() => {
      $('#question').children("span").remove();
      $('#question').append("<span>" + newQuestFinal + "</span>");
      turnTaken = false;
      voted = false;

      var div = document.getElementById('chats');
while(div.firstChild){
    div.removeChild(div.firstChild);
}
      gameSong.currentTime = 0
      if(!winDisplay){
        lobbySong.pause();
        voteSong.pause();
        gameSong.play();
      }
      question.classList.remove('fade');
      if(document.getElementById(secondsLeft)){
      document.getElementById(chats).removeChild(secondsLeft);
      }
})
}
}

function showWin(winner){
  if(monitoring){
  $('#monitor').fadeOut();
  }

  var question = document.getElementById('question');

  $('#message').val('');
  
  winner = "🎉congrats" + " " + winner + "🎉";
  $("#world").addClass("open");
  $("#winner").addClass("open");
  $("#close").addClass("open");
  $("#winner").text(winner);
  winDisplay = true;

  
$("#close").click(function() {
  	socket.emit('close', );
});

(function() {
  var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, confetti, context, drawCircle, i, range, resizeWindow, xpos;

  NUM_CONFETTI = 350;

  COLORS = [[0, 102, 204], [51, 153, 255], [0, 0, 153], [76, 0, 153], [0, 255, 255]];

  PI_2 = 2 * Math.PI;

  canvas = document.getElementById("world");

  context = canvas.getContext("2d");

  window.w = 0;

  window.h = 0;
  
    

  resizeWindow = function() {
    window.w = canvas.width = window.innerWidth;
    return window.h = canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', resizeWindow, false);

  window.onload = function() {
    return setTimeout(resizeWindow, 0);
  };

  range = function(a, b) {
    return (b - a) * Math.random() + a;
  };

  drawCircle = function(x, y, r, style) {
    context.beginPath();
    context.arc(x, y, r, 0, PI_2, false);
    context.fillStyle = style;
    return context.fill();
  };

  xpos = 0.5;

  document.onmousemove = function(e) {
    return xpos = e.pageX / w;
  };

  window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
  })();

  Confetti = class Confetti {
    constructor() {
      this.style = COLORS[~~range(0, 5)];
      this.rgb = `rgba(${this.style[0]},${this.style[1]},${this.style[2]}`;
      this.r = ~~range(2, 6);
      this.r2 = 2 * this.r;
      this.replace();
    }

    replace() {
      this.opacity = 0;
      this.dop = 0.03 * range(1, 4);
      this.x = range(-this.r2, w - this.r2);
      this.y = range(-20, h - this.r2);
      this.xmax = w - this.r;
      this.ymax = h - this.r;
      this.vx = range(0, 2) + 8 * xpos - 5;
      return this.vy = 0.7 * this.r + range(-1, 1);
    }

    draw() {
      var ref;
      this.x += this.vx;
      this.y += this.vy;
      this.opacity += this.dop;
      if (this.opacity > 1) {
        this.opacity = 1;
        this.dop *= -1;
      }
      if (this.opacity < 0 || this.y > this.ymax) {
        this.replace();
      }
      if (!((0 < (ref = this.x) && ref < this.xmax))) {
        this.x = (this.x + this.xmax) % this.xmax;
      }
      return drawCircle(~~this.x, ~~this.y, this.r, `${this.rgb},${this.opacity})`);
    }

  };

  confetti = (function() {
    var j, ref, results;
    results = [];
    for (i = j = 1, ref = NUM_CONFETTI; (1 <= ref ? j <= ref : j >= ref); i = 1 <= ref ? ++j : --j) {
      results.push(new Confetti);
    }
    return results;
  })();

  window.step = function() {
    var c, j, len, results;
    requestAnimationFrame(step);
    context.clearRect(0, 0, w, h);
    results = [];
    for (j = 0, len = confetti.length; j < len; j++) {
      c = confetti[j];
      results.push(c.draw());
    }
    return results;
  };
  resizeWindow();
  step();

}).call(this);
}
