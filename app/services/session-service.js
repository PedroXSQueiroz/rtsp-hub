WebSocket = require('ws');

const SESSIONS = new Map();

module.exports = class SessionService {

    startWSStreamServer(wsPort) {
        
        var socketServer = new WebSocket.Server({ port: wsPort, perMessageDeflate: false });
        socketServer.connectionCount = 0;

        socketServer.on('connection', function (socket, upgradeReq) {

            socketServer.connectionCount++;

            //ATTACH SOCKET TO CAM SESSION
            let sessionId = (upgradeReq || socket.upgradeReq).url.split('session/')[1];
            SESSIONS.set(sessionId, { client: socket });

            console.log(`client attached to session: ${sessionId}`);

            console.log('New WebSocket Connection: ', (upgradeReq || socket.upgradeReq).socket.remoteAddress, (upgradeReq || socket.upgradeReq).headers['user-agent'], '(' + socketServer.connectionCount + ' total)');

            socket.on('close', function (code, message) {
                socketServer.connectionCount--;
                console.log('Disconnected WebSocket (' + socketServer.connectionCount + ' total)');
            });

        });
    }

    sendBySession(idSession, data)
    {
        let session = SESSIONS.get(idSession);

        if(!session)
        {
            session = {}
            SESSIONS.set(idSession, session);
        }
        
        if(!session.client)  
        {
            console.log(`client not attached to session: ${idSession} yet`);
            return;
        }
        
        session.client.send(data);
    }

}