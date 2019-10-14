const SessionService = require('../services/session-service');
let relay = require('../services/websocket-relay');

module.exports = class StreamController
{
    constructor(server)
    {
        this._server = server;

        this._sessionService = new SessionService();

        this._server.post('/session/:id/stream', (req, res) => this.stream(req, res));
    }

    stream(req, res)
    {
        req.on('data', (data) => {
            this._sessionService.sendBySession(req.params.id, data);
        });

    }


    // createStream(req, res) {

    //     console.log('creating stream for session ' + req.params.id);
        
    //     let portIn = 8081,
    //         portOut = 8082;
    
    //     relay(req.params.id, 8081, 8082);
        
    //     const hostName = req.get('host').split(':')[0];
        
    //     res.send({
    //         in: req.protocol + '://' + hostName + ':' + portIn + '/' + req.params.id,
    //         out: 'ws://' + hostName + ':' + portOut
    //     })
    
    // }
}