$('#main-container').hide();
$('#main-container').fadeOut();
$('#controls').hide();
$('#controls').fadeOut();
// $('#reply-tooltip').hide();
$('#copy-tooltip').hide();
$('#name').focus();


var turnTaken = false;
var voted = false;

var time;
var newQuestFinal;
function rename() {
	var name = $('#name').val();
	if (isEmpty(name)) name = 'Guest';
	socket.emit('name', name);
	$('#prompt').fadeOut(200);
	$('#name-info').hide();
	$('#controls').animate({opacity: 'toggle'}, 500);
	$("#main-container").animate({ height: 'toggle', opacity: 'toggle' }, 500);
	$('#message').focus();

  var game = $('#game').val();
  if (isEmpty(game)) game = 'default';
  	socket.emit('game', game);
  	$('#game-info').hide();
}
var socket = io();
socket.on('chats', data => {
  //console.log(data);
 
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
	$('#main-spinner').hide();
	var html = "";
	for(var d of data){
	  
	  var timeDiff = time - d.time;
	  var timeStr = "";
	  var secDiff = Math.floor(timeDiff / 1000);
	  var minDiff = Math.floor(timeDiff / (60 * 1000));
	  var hourDiff = Math.floor(timeDiff / (60 * 60 * 1000));
	  var dayDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
	  if(minDiff >= 60) minDiff = minDiff % 60;
	  if(hourDiff >= 24) hourDiff = hourDiff % 24;
	  if(secDiff >= 60) secDiff = secDiff % 60;
	  // timeStr = (dayDiff? dayDiff + "d ": "") + (hourDiff? hourDiff + "h ": "") + (minDiff? minDiff + "m ": "") + (!minDiff? secDiff + "s ": "") + "ago";
    timeStr = d.points;
    //console.log(d.id);
	  var htmlToAdd = '<div class="message">' + d.message + ' <span class="time">'+timeStr+' votes</span>' + (d.id? '<button class="vote" id="'+d.id+'">Vote</button>': "") + '</div>';

//'<div class="message">' + d.message + ' <span class="time">'+timeStr+'</span>' + (d.id? '<button class="vote" id="'+d.id+'">Vote</button>': "") + '</div>';

    html += htmlToAdd;
    //console.log("adding" + htmlToAdd);
	}
  $('#chats').html(html);
  //$('.delete').hide();
	if (reachedEnd){
		$('#chats').scrollTop(
			$('#chats')[0].scrollHeight - $('#chats')[0].clientHeight
		);
	}

	if (data.length == 0) {
		$('#chats').html('<div style="text-align: center" class="red">Loading Questions.</div>');
	}

  //console.log("entering voting")

});


socket.on('who', data => {
	$('#who').html('');
	for (var p of data) {
		$('#who').append("<span style='color:" + p.color + "'>" + p.name + '<br>');
	}
});
socket.on('waiting', data => {
$('#chats').html('<div style="text-align: center" class="red">Waiting on: ' + data + '.</div>');
});
socket.on('lobby', data => {
$('#chats').html('<div style="text-align: center" class="red">Current players: ' + data + '<br>waiting for more.</div>');
});
socket.on('quest', data => {
  newQuestFinal = data;
  changeQuestion();
  //console.log("recived" + newQuestFinal);
});
socket.on('winner', data => {
showWin(data);
  //console.log("recived" + newQuestFinal);
});
// socket.on('nextRound', data => {

//   //console.log("recived" + newQuestFinal);
// });
socket.on('clear', data => {
  var whatever = data;
  changeQuestion();
  //console.log("recived" + newQuestFinal);
});
socket.on('time', data => {
  time = data;
})
function reply(name) {
	if (
		$('#message')
			.val()
			.search('@' + name) == -1
	) {
		$('#message').val('@' + name + ' ' + $('#message').val());
	}
}
function send() {
  //console.log(turnTaken);
  if(!turnTaken){
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
$(document).on('click', '.message-content', function(e) {
	var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(this).text()).select();
  document.execCommand("copy");
  $temp.remove();
});
$(document).on('click', '.vote', function(e) {
  //console.log("hey" + $(this).attr('id'));
  var idForChange = $(this).attr('id');
  if(!voted){
  socket.emit('vote', $(this).attr('id'));
  voted = true;
  }else{
    //alert("You can only vote once");
    //$(idForChange).val("Wait you pig");
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
// $(document).on('mouseover', '.message', function(){
//   $(this).find('.delete').show();
// });
// $(document).on('mouseleave', '.message', function(){
//   $(this).find('.delete').hide();
// });
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

// socket.on('quest', data => {
//   newQuestFinal = data;
//   console.log("new quest" + newQuestFinal);
// })


function newQuestion(){
 //await sleep(10);
 		  socket.emit('question', );
         $('#message').val('');

}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function changeQuestion(){
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
      question.classList.remove('fade');
})
}

function showWin(winner){
  var question = document.getElementById('question');

  $('#message').val('');
  
  winner = "🎉congrats" + " " + winner + "🎉";//" + "🐢
  $("#world").addClass("open");
  $("#winner").addClass("open");
  $("#close").addClass("open");
  $("#winner").text(winner);

  
$("#close").click(function() {
  $("#world").removeClass("open");
  $("#winner").removeClass("open");
  // $("#runnerUp").removeClass("open");
  $("#close").removeClass("open");

    //question.classList.add('fade');
  question.style.visibility = "hidden";
      question.classList.add('fade');
  sleep(400).then(() => {
        question.style.visibility = "visible";
             question.classList.remove('fade');
  })


});

// Confetti
(function() {
  var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, confetti, context, drawCircle, i, range, resizeWindow, xpos;

  NUM_CONFETTI = 350;

  COLORS = [[0, 102, 204], [51, 153, 255], [0, 0, 153], [76, 0, 153], [0, 255, 255]];

  PI_2 = 2 * Math.PI;

  canvas = document.getElementById("world");

  context = canvas.getContext("2d");

  window.w = 0;

  window.h = 0;
  
    //window.addEventListener('resize', resizeWindow, false);
    

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
