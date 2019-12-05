const socket = io('http://localhost:3000')

p1Doc = document.getElementById('p1');
p2Doc = document.getElementById('p2');

const grid = () => Array.from(document.getElementsByClassName('q'));
const qNumId = (qE1) => Number.parseInt(qE1.id.replace('q', ''));
const emptyQs = () => grid().filter(_qE1 => _qE1.innerText === '' );
const allSame = (arr) => arr.every(_qE1 => _qE1.innerText === arr[0].innerText && _qE1.innerText !== '');

const takeTurn = (index, letter) => grid()[index].innerText = letter;

const clickFn = (event) => {
  console.log('click');
  disableListeners();
  takeTurn(qNumId(event.target), playerSymbol);
  data = {}
  data.pos = qNumId(event.target);
  console.log(data.pos);
  data.id = playerId;
  data.symbol = playerSymbol;
  socket.emit('play', data);
}

const enableListeners = () => emptyQs().forEach(_qE1 => _qE1.addEventListener('click', clickFn));
const disableListeners = () => grid().forEach(_qE1 => _qE1.removeEventListener('click', clickFn));

var playerId = -1;
var playerSymbol;

socket.on('new-p1', data => {
  p1Doc.innerHTML = data.nome;
});

socket.on('new-p2', data => {
  p2Doc.innerHTML = data.nome;
});

socket.on('p1-win', data => {
  alert("Player1 Wins!");
});

socket.on('p2-win', data => {
  alert("Player2 Wins!");
});

socket.on('draw', data => {
  alert("Draw!");
});

socket.on('new-p1', data => {
  p1Doc.innerHTML = data.nome;
});

socket.on('new-play', data => {
  takeTurn(data.pos, data.symbol);
  if(data.id == playerId)
    enableListeners();
});

socket.on('new-fila', data => {
  createFila(data);
});

socket.on('start-game', player => {
  console.log(player)
  if(playerId == player.p1){
    alert("game starting");
    enableListeners();
    playerSymbol = player.p1_symbol;
  }
  else if(playerId == player.p2){
    alert("game starting");
    playerSymbol = player.p2_symbol;
  }
})

socket.on('set-id', id => {
  console.log(`new id: ${id}`);
  playerId = id;
})

socket.on('fill-board', board => {
  board.forEach( (el, index) => {
    if(el != -1)
      takeTurn(index, el);
  });
})

socket.on('empty-board', board => {
  grid().forEach( (el, index) => {
      takeTurn(index, '');
  });
})

setTimeout( () => {
  const nome = prompt('What is your name?');
  socket.emit('new-user', nome);
}, 0);

function createFila(fila) {
  const fila_doc = document.getElementById('fila');
  fila_doc.innerHTML = fila.map( fila =>{
    return fila.nome;
    }).join(',');
}
