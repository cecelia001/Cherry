var socket = io();

// this part is auth
// if a sessionID is present, then use it else null is sent (playing as a guest)
function readCookie(name) {
  return document.cookie.split('; ').find(row => row.split('=')[0] === name);
}

sendCookie = () => {
  let sessionID = readCookie('sessionID');

  if (matchId == "")
    matchId = null;
  else
    matchId = Number(matchId);

  socket.emit('auth', sessionID, matchId);
};

sendCookie();

// return from server on whether a move was validated or not
socket.on('validated', (boardState, turnState) => {
  let changedSquares = 2;
  // for(let i = 0; i < noOfSquares; i++){
  //   for(let j = 0; j < noOfSquares; j++){
  //     if(my_color == 0 && (boardState[i][j] == board[i][j]))
  //       changedSquares++;
  //     if(my_color == 1 && (boardState[i][j] == boardState[noOfSquares - i - 1][noOfSquares - j - 1]))
  //       changedSquares++;
  //   }
  // }
  if(can_move){
    if(my_color == white){
      if (((boardState[from_position.y][from_position.x] & 0b1111) == blank) 
        && (board[to_position.y][to_position.x] & 0b1111) != blank)
        capture_sound.play();
      else if ((boardState[from_position.y][from_position.x] & (0b1111)) == blank)
          move_sound.play();
      else{
        if(changedSquares > 1){
          wrong_move_sound.play();
          document.getElementById('cnv').classList.add("shake");
          setTimeout(()=>{
            document.getElementById('cnv').classList.remove("shake");
          }, 100)
        }
      }
    }
    else{
      if (((boardState[no_of_squares - 1 - from_position.y][no_of_squares - 1 - from_position.x] & 0b1111) == blank) 
        && (board[ no_of_squares - 1 - to_position.y][no_of_squares - 1 - to_position.x] & 0b1111) != blank)
        capture_sound.play();
      else if ((boardState[no_of_squares - 1 - from_position.y][no_of_squares - 1 - from_position.x] & (0b1111)) == blank)
          move_sound.play();
      else{
        if(changedSquares == 0){
          wrong_move_sound.play();
          document.getElementById('cnv').classList.add("shake");
          setTimeout(()=>{
            document.getElementById('cnv').classList.remove("shake");
          }, 100)
        }
      }
    }
  }
  if (my_color == 0)
    board = boardState;
  else {
    for (let i = 0; i < no_of_squares; i++) {
      for (let j = 0; j < no_of_squares; j++) {
        board[i][j] = boardState[no_of_squares - i - 1][no_of_squares - j - 1];
      }
    }
  }
  is_being_validated = false;
  if (turnState == my_color) {
    document.getElementById('status').innerText = 'Your turn';
    can_move = true;
  }
  else {
    document.getElementById('status').innerText = 'Opponent\'s turn';
    can_move = false;
  }
  
});

// the server found a match with matchId=matchId so start the match
socket.on('startGame', (color, matchId) => {
  my_color = color;
  match_id = matchId;
  if (color == 0) {
    document.getElementById('status').innerText = 'Playing as white';
    can_move = true;
  }
  else {
    document.getElementById('status').innerText = 'Playing as black';
    for (let i = 0; i < no_of_squares; i++) {
      for (let j = i; j < no_of_squares; j++) {
        let temp = board[i][j];
        board[i][j] = board[no_of_squares - i - 1][no_of_squares - j - 1];
        board[no_of_squares - i - 1][no_of_squares - j - 1] = temp;
      }
    }
    for (let i = 0; i < no_of_squares / 2; i++) {
      let temp = board[i][i];
      board[i][i] = board[no_of_squares - i - 1][no_of_squares - i - 1];
      board[no_of_squares - i - 1][no_of_squares - i - 1] = temp;
    }
  }
});

// checkmate is reached
socket.on('checkMate', turn => {
  can_move = false;
  if(my_color == turnToColor(turn)){
    document.getElementById('status').innerText = 'Check Mate you lost! 😢';
  }
  else
    document.getElementById('status').innerText = 'Check Mate you Won! 🎉';
});