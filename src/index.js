import { fileURLToPath } from 'url';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { chessMoveValidate } from './helpers/validator.js';
import { match } from 'assert';

const PORT = process.env.PORT || 5500;
const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static(path.dirname(__filename) + '/public'));
app.set('view engine', 'ejs');
app.set('views', path.dirname(__filename) + '/views');

/*
  match{
    matchId,
    player1Socket,
    player2Socket,
    boardState,
    turnState
  }
*/
let matches = [];
let users = [];
const initBoardState = [[12, 14, 13, 11, 10, 13, 14, 12],
                    [9, 9, 9, 9, 9, 9, 9, 9],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1, 1, 1, 1],
                    [4, 6, 5, 3, 2, 5, 6, 4]];

function initMatch(id, playerSocket){
  return {
    matchId : id,
    player1Socket : playerSocket,
    player2Socket : null,
    boardState : JSON.parse(JSON.stringify(initBoardState)),
    turnState : 0
  }
}

function findMatch(playerSocket){
  for(let i = 0; i < matches.length; i++){
    if (matches[i].player2Socket == null){
      matches[i].player2Socket = playerSocket;
      startMatch(i);
      return i;
    } 
  }
  matches.push(initMatch(matches.length, playerSocket));
  return matches.length - 1;
}

function startMatch(i){
  matches[i].player1Socket.emit('startGame', 0);
  matches[i].player2Socket.emit('startGame', 1);
}

function authenticateUser(username, password){
  for (let user of users){
    if (user.username == username && user.password == password){
      return true;
    }
  }
  return false;
}

app.get('/', (req, res) => {
  res.render('index');
});

io.on('connection', socket => {
  console.log(`User[${socket.id}]: connected`);
  let matchId = findMatch(socket);
  socket.on('move', (fromCoords, toCoords) => {
    console.log(`User[${socket.id}]: sent: ${fromCoords.x} ${fromCoords.y} || ${toCoords.x} ${toCoords.y}`);

    // console.log('turn ::: ' + turnState);
    console.log('Validating: ' + matches[matchId].boardState[fromCoords.y][fromCoords.x]);

    let valid = chessMoveValidate(matches[matchId].boardState, fromCoords, toCoords, matches[matchId].turnState);
    console.log(matches[matchId].turnState + ': Move validated to be:: ' + valid);

    if (valid) {
      matches[matchId].boardState[toCoords.y][toCoords.x] = matches[matchId].boardState[fromCoords.y][fromCoords.x];
      matches[matchId].boardState[fromCoords.y][fromCoords.x] = 0;
      matches[matchId].turnState = 1 - matches[matchId].turnState;
      
    }
    matches[matchId].player1Socket.emit('validated', matches[matchId].boardState, matches[matchId].turnState);
    matches[matchId].player2Socket.emit('validated', matches[matchId].boardState, matches[matchId].turnState);

  });

  socket.on('auth', ({ username, password }) => {
    console.log(`User[${socket.id}]: auth with [${username}, ${password}]`);

    if (authenticateUser(username, password)) {
      socket.emit('auth', 1);
    } else {
      socket.emit('auth', 0);
    }
  });

  socket.on('signup', ({ username, password }) => {
    console.log(`User[${socket.id}]: signup with [${username}, ${password}]`);

    // check if user is created
    for(let user of users) {
      if (user.username == username) {
        socket.emit('signup', 0);
        return;
      }
    }

    // check if password is non empty
    if (password.length <= 0) {
        socket.emit('signup', -1);
        return;
    }

    users.push({
      username : username,
      password : password
    });

    // valid sign up
    socket.emit('auth', 1);
  });

  socket.on('disconnect', () => {
    console.log(`User[${socket.id}]: disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Live on ${PORT}`);
});
