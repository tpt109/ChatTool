Room = require('../models/room.js')

module.exports = function ChatController(appConfig) {

	appConfig.io.set("log level", 1);
	var chat = appConfig.io.of('/chat');
	
	var people = {};
	var roomList = {};
	var sockets = [];
	var chatHistorys = {};

	var AdminRoom = "AdminRoom";

	chat.on("connection", function (socket) {
		console.log("have a connection to server");

		socket.on("disconnect", function() {

			if (typeof roomList[socket.room] !== "undefined") {

				console.log("remove this people out room");
				//roomList[socket.room].removePerson[socket.id];
				
				var personIndex = roomList[socket.room].people.indexOf(socket.id);
  				
  				roomList[socket.room].people.splice(personIndex, 1);

				console.log("size people current:" + roomList[socket.room].people.length);	
				if(roomList[socket.room].people.length == 0){
					//remove room
					delete roomList[socket.room];
					//send msg to admin
					for (var key in roomList) {
  						if(key.localeCompare(AdminRoom)){
							chat.in(AdminRoom).emit("UpdateRoomNotification", {roomList: roomList});
							break;
						}
					}
				}
			}
		});


		socket.on("AdminJoinserver", function(userName, device) {
			socket.userName = userName;
			socket.device = device;


			socket.room  = AdminRoom; 

			if (typeof roomList[socket.room] === "undefined") {
				
				var room = new Room(socket.room);
				roomList[socket.room] = room;

				//send msg to admin
				for (var key in roomList) {
  					if(key.localeCompare(AdminRoom)){
						chat.in(AdminRoom).emit("UpdateRoomNotification", {roomList: roomList});
						break;
					}
				}
			}

			socket.join(socket.room);
			roomList[socket.room].addPerson(socket.id);

			socket.emit("joined");
			socket.emit("UpdateRoomNotification", {roomList: roomList});




		});

		//Create new Room for a customer with unique id

		socket.on("CreateOrjoinCustomerRoom", function(name) {
			
			socket.room  = name; 

			if (typeof roomList[socket.room] === "undefined") {
				
				var room = new Room(socket.room);
				roomList[socket.room] = room;
				chatHistorys[socket.room] = [];

				//send msg to admin
				for (var key in roomList) {
  					if(key.localeCompare(AdminRoom)){
  						console.log("already send new update");
						chat.in(AdminRoom).emit("UpdateRoomNotification", {roomList: roomList});
						break;
					}
				}
			}

			socket.join(socket.room);
			roomList[socket.room].addPerson(socket.id);
			socket.emit("join room success", {roomName: socket.room});

		});


		//start chat with customer
		socket.on("StartChatWithCustomer", function(roomName) {
			
			if (typeof roomList[roomName] !== "undefined") {
				socket.join(roomName);
				var chatHistoryTest = [{msg:"test1",msTime:"14h",displayName :"userChat"},{msg:"test2",msTime:"14h",displayName :"userChat"}];
				socket.emit("joinedCustomerRoom", {chatHistory: chatHistorys[roomName]});
				
			}

		});

		socket.on("customerChat", function(data) {
				

				console.log("msg chat:" + data.msg + "from room :" + socket.room);
				//send msg to admin
				for (var key in roomList) {
  					if(key.localeCompare(AdminRoom)){
						chat.in(AdminRoom).emit("CustomerMsgToAdmin", {msg: data.msg,displayName:socket.room,msTime:data.msTime});
					}
				}
			chat.in(socket.room).emit("ChatToCustomer", {msg: data.msg,displayName:socket.room,msTime:data.msTime});
			chatHistorys[socket.room].push({msg:data.msg,msTime:data.msTime,displayName :socket.room});

		});

		socket.on("SendMsgToRoom", function(data) {
			chat.in(data.room).emit("ChatToCustomer", {msg: data.msg,displayName:socket.room,msTime:data.msTime});
			chatHistorys[data.room].push({msg:data.msg,msTime:data.msTime,displayName :socket.room});

		});
	});
};
