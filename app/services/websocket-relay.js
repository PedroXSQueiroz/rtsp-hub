// Use the websocket-relay to serve a raw MPEG-TS over WebSockets. You can use
// ffmpeg to feed the relay. ffmpeg -> websocket-relay -> browser
// Example:
// node websocket-relay yoursecret 8081 8082
// ffmpeg -i <some input> -f mpegts http://localhost:8081/yoursecret

var http = require('http'),
	WebSocket = require('ws');

function startRelay(streamPath, portIn, portOut) {
	
	// Websocket Server
	var socketServer = new WebSocket.Server({ port: portOut, perMessageDeflate: false });
	socketServer.connectionCount = 0;
	
	socketServer.on('connection', function (socket, upgradeReq) {
		
		socketServer.connectionCount++;
		
		console.log('New WebSocket Connection: ', (upgradeReq || socket.upgradeReq).socket.remoteAddress, (upgradeReq || socket.upgradeReq).headers['user-agent'], '(' + socketServer.connectionCount + ' total)');
		
		socket.on('close', function (code, message) {
			socketServer.connectionCount--;
			console.log('Disconnected WebSocket (' + socketServer.connectionCount + ' total)');
		});

	});
	
	socketServer.broadcast = function (data) {
		
		socketServer.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data);
			}
		});

	};
	
	// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
	var streamServer = http.createServer(function (request, response) {
		
		console.log(request.method);
		
		var params = request.url.substr(1).split('/');
		
		if (params[0] !== streamPath) {
			console.log('Failed Stream Connection: ' + request.socket.remoteAddress + ':' +
				request.socket.remotePort + ' - wrong secret.');
			response.end();
		}
		
		response.connection.setTimeout(0);
		
		console.log('Stream Connected: ' +
			request.socket.remoteAddress + ':' +
			request.socket.remotePort);
		
		request.on('data', function (data) {
			socketServer.broadcast(data);
			if (request.socket.recording) {
				request.socket.recording.write(data);
			}
		});
		
		request.on('end', function () {
			console.log('close');
			if (request.socket.recording) {
				request.socket.recording.close();
			}
		});
		
	}).listen(portIn);
	console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:' + portIn + '/<secret>');
	console.log('Awaiting WebSocket connections on ws://127.0.0.1:' + portOut + '/');

}

module.exports = startRelay;
