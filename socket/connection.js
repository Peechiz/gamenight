
module.exports = function(io){


  io.on('connection', function(socket){
    console.log('user connected');

    // do stuff

    // recieve search games request
    let search = require('./search')(socket);
    socket.on('search', search);

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  })
}
