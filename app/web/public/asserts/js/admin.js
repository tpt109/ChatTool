/* HTML5 magic
- GeoLocation
- WebSpeech
*/

//WebSpeech API
var final_transcript = '';
var recognizing = false;
var last10messages = []; //to be populated later

if (!('webkitSpeechRecognition' in window)) {
  console.log("webkitSpeechRecognition is not available");
} else {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        $('#msg').addClass("final");
        $('#msg').removeClass("interim");
      } else {
        interim_transcript += event.results[i][0].transcript;
        $("#msg").val(interim_transcript);
        $('#msg').addClass("interim");
        $('#msg').removeClass("final");
      }
    }
    $("#msg").val(final_transcript);
    };
  }

  function startButton(event) {
    if (recognizing) {
      recognition.stop();
      recognizing = false;
      $("#start_button").prop("value", "Record");
      return;
    }
    final_transcript = '';
    recognition.lang = "en-GB"
    recognition.start();
    $("#start_button").prop("value", "Recording ... Click to stop.");
    $("#msg").val();
  }
//end of WebSpeech

/*
Functions
*/
function toggleNameForm() {
   $("#login-screen").toggle();
}

function toggleChatWindow() {
  $("#main-chat-screen").toggle();
}

// Pad n to specified size by prepending a zeros
function zeroPad(num, size) {
  var s = num + "";
  while (s.length < size)
    s = "0" + s;
  return s;
}

// Format the time specified in ms from 1970 into local HH:MM:SS
function timeFormat(msTime) {
  var d = new Date(msTime);
  return zeroPad(d.getHours(), 2) + ":" +
    zeroPad(d.getMinutes(), 2) + ":" +
    zeroPad(d.getSeconds(), 2) + " ";
}

$(document).ready(function() {

  
  var selectedRoom = "";
  //setup "global" variables first
  var socket = io.connect("127.0.0.1:3000/chat");
  var myRoomID = null;

  $("form").submit(function(event) {
    event.preventDefault();
  });

  $("#conversation").bind("DOMSubtreeModified",function() {
    $("#conversation").animate({
        scrollTop: $("#conversation")[0].scrollHeight
      });
  });

  $("#main-chat-screen").hide();
  $("#errors").hide();
  $("#name").focus();
  $("#join").attr('disabled', 'disabled'); 
  
  if ($("#name").val() === "") {
    $("#join").attr('disabled', 'disabled');
  }

  //enter screen
  $("#nameForm").submit(function() {
    var name = $("#name").val();
    var device = "desktop";
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
      device = "mobile";
    }
    if (name === "" || name.length < 2) {
      $("#errors").empty();
      $("#errors").append("Please enter a name");
      $("#errors").show();
    } else {
      socket.emit("AdminJoinserver", name, device);
      toggleNameForm();
      toggleChatWindow();
      $("#msg").focus();
    }
  });

  $("#name").keypress(function(e){
    var name = $("#name").val();
    if(name.length < 2) {
      $("#join").attr('disabled', 'disabled'); 
    } else {
      $("#errors").empty();
      $("#errors").hide();
      $("#join").removeAttr('disabled');
    }
  });

  //main chat screen
  $("#chatForm").submit(function() {
    var msg = $("#msg").val();
    if(selectedRoom.length == 0){
      alert('please choose customer to chat');
    }else{
    if (msg !== "") {
      socket.emit("SendMsgToRoom", {room:selectedRoom,msg: msg,msTime:new Date().getTime()});
      $("#msg").val("");
    }
  }
  });

  //'is typing' message
  var typing = false;
  var timeout = undefined;

  function timeoutFunction() {
    typing = false;
    socket.emit("typing", false);
  }

  $("#msg").keypress(function(e){
    if (e.which !== 13) {
      if (typing === false && myRoomID !== null && $("#msg").is(":focus")) {
        typing = true;
        socket.emit("typing", true);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 5000);
      }
    }
  });



  $("#rooms").on('click', '.list-group-item', function() {

    var roomID = $(this).attr("id");

    $(".list-group-item").removeAttr("style");

    $(this).css("background-color", "yellow");
    selectedRoom = roomID;

    //send request join room to server
    socket.emit("StartChatWithCustomer",roomID);
  });

  

// chat realtime

socket.on("joined", function() {
  
});


socket.on("UpdateRoomNotification", function(data) {
  
    $("#rooms").text("");
    $("#rooms").append("<li class=\"list-group-item active\">List of rooms <span class=\"badge\">"+Object.keys(data.roomList).length+"</span></li>");
     if (!jQuery.isEmptyObject(data.roomList)) { 
      $.each(data.roomList, function(name) {
        if(selectedRoom == name){
          $('#rooms').append("<li stype='background-color: yellow' id="+name+" class=\"list-group-item\">" + name  + "<span id="+ "bage-" + name +" class=\"badge\">" + 0 + "</span></li>");
        }else{
          $('#rooms').append("<li id="+name+" class=\"list-group-item\">" + name  + "<span id="+ "bage-" + name +" class=\"badge\">" + 0 + "</span></li>");
        }
      });
    } else {
      $("#rooms").append("<li class=\"list-group-item\">There are no rooms yet.</li>");
    }
});

socket.on("CustomerMsgToAdmin", function(data) {
    
    var idBadge = "#bage-" + data.displayName;
   
    var newBadge = parseInt($(idBadge).html()) + 1;

    $(idBadge).html(newBadge);
});

socket.on("joinedCustomerRoom", function(data) {
    
    if (data.chatHistory.length !== 0) {

      $.each(data.chatHistory, function(index,value ) {
        $("#msgs").append("<li><strong><span class='text-success'>" + timeFormat(value.msTime) + value.displayName + "</span></strong>: " + value.msg + "</li>");
      });
    }
});

socket.on("ChatToCustomer", function(data) {
    var nameOfDisplay = data.displayName;

    $("#msgs").append("<li><strong><span class='text-success'>" + timeFormat(data.msTime) + nameOfDisplay + "</span></strong>: " + data.msg + "</li>");
    //clear typing field
     //$("#"+person.name+"").remove();
     clearTimeout(timeout);
     timeout = setTimeout(timeoutFunction, 0);
  });


  socket.on("disconnect", function(){
    $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
    $("#msg").attr("disabled", "disabled");
    $("#send").attr("disabled", "disabled");
  });

});
