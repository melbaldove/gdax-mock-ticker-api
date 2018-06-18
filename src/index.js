'use strict'
const WebSocket = require('ws');
const channels = {
    "BTC-USD": [],
    "ETH-USD": []
}
const wss = new WebSocket.Server({
    port: 8080,
    clientTracking: true
});

wss.on('connection', function connection(ws, request) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        const jsonMessage = JSON.parse(message)
        switch (jsonMessage.type) {
            case "subscribe": {
                jsonMessage.product_ids.forEach(tradingPair => {
                    if (tradingPair in channels) {
                        channels[tradingPair].push(ws)
                        console.log(channels)
                    }
                })
            }
                break;
            case "unsubscribe": {
                Object.keys(channels).forEach(tradingPair => {
                    const index = channels[tradingPair].indexOf(ws)
                    delete channels[tradingPair][index]
                    console.log(channels)
                })
            }
                break;
        }
    });

    console.log("connected")

});

Object.keys(channels).forEach(channel => {
    setInterval(() => {
        const someRandomValue = Math.random()
        channels[channel].forEach(client => {
            const tradingPair = {
                type: "ticker",
                product_id: channel,
                price: someRandomValue
            }
            client.send(JSON.stringify(tradingPair))
        })
    }, 1000)
})
wss.on('error', function (error) {
    console.log(error)
})
