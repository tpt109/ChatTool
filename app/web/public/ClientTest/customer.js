
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
  var socket = io.connect("127.0.0.1:3000/chat");

  var fingerprint = new Fingerprint().get();
  var roomName = fingerprint;

  $("form").submit(function(event) {
    event.preventDefault();
  });

  $("#conversation").bind("DOMSubtreeModified",function() {
    $("#conversation").animate({
        scrollTop: $("#conversation")[0].scrollHeight
      });
  });
  
  socket.emit("CreateOrjoinCustomerRoom", roomName);

  socket.on("join room success", function(data) {
    //already join 
  });

  //main chat screen
  $("#chatForm").submit(function() {
    var msg = $("#msg").val();

    if (msg !== "") {
      socket.emit("customerChat", {msg: msg,msTime:new Date().getTime()});
      $("#msg").val("");
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
});
