module.exports = function Config() {
  var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require("socket.io").listen(server)
  , npid = require("npid")
  , uuid = require('node-uuid')
  , Room = require('../models/room.js')
  , _ = require('underscore')._;

  app.configure(function() {
    app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
      app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/../web/public'));
    app.use('/components', express.static(__dirname + '/../../components'));
    app.set('views', __dirname + '/../web/views');
    app.engine('html', require('ejs').renderFile);

    /* Store process-id (as priviledged user) */
    try {
        npid.create('/var/run/advanced-chat.pid', true);
    } catch (err) {
        console.log(err);
        //process.exit(1);
    }

  });
  this.app = app;
  this.server= server;
  this.io = io;
  this.npid = npid;
};