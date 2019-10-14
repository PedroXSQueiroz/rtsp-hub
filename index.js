let Express = require('express');
let relay = require('./websocket-relay');
const bodyParser = require('body-parser');

let args = require('minimist')(process.argv);

const server = Express();

server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json())

server.post('/session/:id/stream', (req, res) => {

    console.log('creating stream for session ' + req.params.id);
    
    let portIn = 8081,
        portOut = 8082;

    relay(req.params.id, 8081, 8082);
    
    const hostName = req.get('host').split(':')[0];
    
    res.send({
        in: req.protocol + '://' + hostName + ':' + portIn + '/' + req.params.id,
        out: 'ws://' + hostName + ':' + portOut
    })

})

server.listen(args.port, () => {
    
    console.log('hub is up')
});


