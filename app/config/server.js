const Express = require('express');
const bodyParser = require('body-parser');
const SessionService = require('../services/session-service');

const StreamController = require('../controllers/stream-controller');

module.exports = (args) => {
    
    const server = Express();
    
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(bodyParser.json());
    
    new StreamController(server);
    
    server.listen(args.port, () => {
        console.log('hub is up');

        console.log('http resources at : ' + args.port);
        console.log('ws streams at : ' + args.wsPort);
    });

    let sessionService = new SessionService();

    sessionService.startWSStreamServer(args.wsPort);
}
