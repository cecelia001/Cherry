var socket = io();

socket.on('validated', (boardState, turnState) => {
  board = boardState;
  is_being_validated = false;
  if (turnState == my_color)
    can_move = true;
  else
    can_move = false;
});

socket.on('startGame', (color, matchId) =>{
  my_color = color;
  match_id = matchId;
  if(color == 0){
    console.log('I am white');
    can_move = true;
  }
  else
    console.log('I am black');
});

socket.on('auth', resp => {
  console.log('auth back: ' + resp);

  if (resp) {
    let form = document.getElementById('form');
    let successDiv = document.getElementById('auth-success');
    let failDiv = document.getElementById('auth-fail');

    form.classList.add('hide');

    if (failDiv.classList.contains('show')) {
      failDiv.classList.remove('show');
      failDiv.classList.add('hide');
    }

    successDiv.classList.remove('hide');
    successDiv.classList.add('show');
  } else {
    let usernameInput = document.getElementById('username');
    let passwordInput = document.getElementById('password');
    let failDiv = document.getElementById('auth-fail');

    usernameInput.value = "";
    passwordInput.value = "";

    failDiv.classList.remove('hide');
    failDiv.classList.add('show');
  }
});

/* 

  use socket.emit('move', move_string);
  to send move to server

*/