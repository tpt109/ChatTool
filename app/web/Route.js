
module.exports = function Routes(appConfig) {

	appConfig.app.get('/', function(req, res) {
			res.render('index.html');
	});


	appConfig.server.listen(appConfig.app.get('port'), appConfig.app.get('ipaddr'), function(){
		console.log('Express server listening on  IP: ' + appConfig.app.get('ipaddr') + ' and port ' + appConfig.app.get('port'));
	});
};
