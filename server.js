var Config = require("./app/configs/config.js");
var Routes = require("./app/web/Route.js");
var ChatController = require("./app/chat/ChatController.js");

//config for server
var appConfig = new Config();

//create route
var routes = new Routes(appConfig);

//create chat controller
var chatController = new ChatController(appConfig);

