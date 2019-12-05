const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view_engine', 'html');

var fila = [];
var player1 = {id: -1, nome: "Not Yet Connected", symbol: 'X'};
var player2 = {id: -1, nome: "Not Yet Connected", symbol: 'O'};
var players = 0;
const p1_symbol = 'X';
const p2_symbol = 'O';

const winningCombos = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,4,8],
  [2,4,6],
  [0,3,6],
  [1,4,7],
  [2,5,8]
];

var win = function(plays){
  for(var i = 0; i < winningCombos.length; i++){
    if( plays.includes(winningCombos[i][0]) && plays.includes(winningCombos[i][1]) && plays.includes(winningCombos[i][2])){
      return true;
    }
  }
  return false;
}

var board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
var p1_plays = [];
var p2_plays = [];

var CurrentPlayer = 1;
var currentPlayerId = -1;

app.use('/', (req, res) => {
  res.render('index.html');
})

io.on('connection', socket => {
  socket.emit('new-p1', player1);
  console.log("sent1");
  socket.emit('new-p2', player2);
  socket.emit('new-fila', fila);
  socket.emit('set-id', socket.id);
  socket.emit('fill-board', board);

  socket.on('play', data => {
    console.log('play-received', data);
    board[data.pos] = data.symbol;
    console.log(board);
    if(data.id == player1.id)
    {
      data.id = player2.id;
      socket.broadcast.emit('new-play', data);
      p1_plays.push(data.pos);
      if(p1_plays.length + p2_plays.length == 9 && !win(p1_plays)){
        socket.broadcast.emit('draw', data);
        socket.emit('draw', data);

        p1_plays = []
        p2_plays = []
        board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];

        socket.emit('empty-board', board);
        socket.broadcast.emit('empty-board', board);

        socket.broadcast.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
        socket.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
      }
      if(win(p1_plays)){
        socket.broadcast.emit('p1-win', data);
        socket.emit('p1-win', data);
        board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
        p1_plays = []
        p2_plays = []
        //se tem fila, coloca p2 fim da fila e desce 1 da fila
        if(fila.length == 0){
          socket.emit('empty-board', board);
          socket.broadcast.emit('empty-board', board);
          socket.broadcast.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
          socket.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
        }
        else{
          fila.push(player2);
          player2 = fila.shift();
          socket.broadcast.emit('new-p2', player2);
          socket.emit('new-p2', player2);
          socket.broadcast.emit('new-fila', fila);
          socket.emit('new-fila', fila);

          socket.emit('empty-board', board);
          socket.broadcast.emit('empty-board', board);

          socket.broadcast.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
          socket.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
        }
      }
      else
      {
        data.id = player2.id;
        socket.broadcast.emit('new-play', data);
      }
    }
    else if(data.id == player2.id)
    {
      p2_plays.push(data.pos);
      if(p1_plays.length + p2_plays.length == 9 && !win(p2_plays)){
        p1_plays = []
        p2_plays = []
        board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
        socket.broadcast.emit('draw', data);
        socket.emit('draw', data);

        socket.emit('empty-board', board);
        socket.broadcast.emit('empty-board', board);

        socket.broadcast.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
        socket.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
      }
      if(win(p2_plays))
      {
        data.id = player1.id;
        socket.broadcast.emit('new-play', data);
        socket.broadcast.emit('p2-win', data);
        board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
        p1_plays = []
        p2_plays = []
        //se tem fila, coloca p1 fim da fila e desce 1 da fila
        if(fila.length == 0){
          socket.emit('empty-board', board);
          socket.broadcast.emit('empty-board', board);
          socket.broadcast.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
          socket.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
        }
        else{
          fila.push(player1);
          player1 = fila.shift();
          socket.broadcast.emit('new-p1', player1);
          socket.emit('new-p1', player1);
          socket.broadcast.emit('new-fila', fila);
          socket.emit('new-fila', fila);

          socket.emit('empty-board', board);
          socket.broadcast.emit('empty-board', board);

          socket.broadcast.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
          socket.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
        }
      }
      else
      {
        data.id = player1.id;
        socket.broadcast.emit('new-play', data);
      }
    }
  });

  socket.on('new-user', nome =>
  {
    players += 1;
    console.log("adding_players");
    if(player1.id == -1){
      player1.id = socket.id;
      player1.nome = nome;
      socket.broadcast.emit('new-p1', player1);
      socket.emit('new-p1', player1);
      console.log("sent new player1");
    }
    else if(player2.id == -1){
      player2.id = socket.id;
      player2.nome = nome;
      socket.broadcast.emit('new-p2', player2);
      socket.emit('new-p2', player2);
      console.log("sent new player2");
    }
    else{
      fila.push({id: socket.id, nome: nome})
      socket.broadcast.emit('new-fila', fila);
      socket.emit('new-fila', fila);
      console.log("sent new fila");
    }

    if(players == 2)
    {
      socket.broadcast.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
      socket.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
      currentPlayerId = player1.id;
    }

    console.log(`players now: ${players}`);
  })

  socket.on('disconnect', () =>{
    console.log("a");
    if(players > 0)
      players -= 1;

    if(player1.id == socket.id)
    {
      if(fila.length == 0){
        player1.id = -1;
        player1.nome = "Not Yet Connected"
        socket.broadcast.emit('new-p1', player1);
        socket.emit('new-p1', player1);

        board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
        socket.emit('empty-board', board);
      }
      else{
        player1 = fila.shift();
        socket.broadcast.emit('new-p1', player1);
        socket.emit('new-p1', player1);
        socket.broadcast.emit('new-fila', fila);
        socket.emit('new-fila', fila);
        socket.broadcast.emit('reset-game-p1', player1);

        board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
        socket.emit('empty-board', board);

        socket.broadcast.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
        socket.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
      }
    }
    else if(player2.id == socket.id)
    {
      if(fila.length == 0){
        player2.id = -1;
        player2.nome = "Not Yet Connected"
        socket.broadcast.emit('new-p2', player2);
        socket.emit('new-p2', player2)

        board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
        socket.broadcast.emit('empty-board', board);
      }
      else{
        player2 = fila.shift();
        player2.symbol = p2_symbol;
        socket.broadcast.emit('new-p2', player2);
        socket.emit('new-p2', player2);
        socket.broadcast.emit('new-fila', fila);
        socket.emit('new-fila', fila);

        board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
        socket.broadcast.emit('empty-board', board);

        socket.broadcast.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
        socket.emit('start-game', {p1: player1.id, p2: player2.id, p1_symbol: p1_symbol, p2_symbol: p2_symbol});
      }
    }
    else{
      console.log(fila);
      console.log(socket.id)
      fila = fila.filter(element => element.id !== socket.id);
      console.log(fila);
      socket.broadcast.emit('new-fila', fila);
    }
  })
});

server.listen(3000);
