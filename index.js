const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')));

let players = {};
let bullets = [];
let food_squares = [];
let food_tri = [];
let cors_taken = [];

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
function between(x, min, max) {
  return x >= min && x <= max;
}

for (let i = 0; i < getRandomInt(300,400); i++) {
  var x = getRandomInt(-3500,3500);
  var y = getRandomInt(-3500,3500);
  for (let i = 0; i < cors_taken.length; i++) {
    if (between(x, cors_taken[i].x - 50, cors_taken[i].x + 50) && between(y, cors_taken[i].y - 50, cors_taken[i].y + 50)) {
      x = getRandomInt(-3500, 3500);
      y = getRandomInt(-3500, 3500);
    }
  }
  cors_taken.push({x:x,y:y})
  let valueOp = (getRandomInt(0,2) === 1)
  var type = valueOp ? "triangle" : "square" 
  var color = valueOp ? "Darkred" : "Gold" 
  var health_max = valueOp ? 15 : 10 
  let fooditem = {
    type: type,
    health: health_max,
    maxhealth: health_max,
    size: 50,
    angle: getRandomInt(0,360),
    x: x,
    y: y,
    color:color,
    score_add: health_max,
    randomID: (Math.random()*i*Date.now())
  }
  food_squares.push(fooditem)
}

function hasDuplicates(array) {
    var valuesSoFar = [];
    for (var i = 0; i < array.length; ++i) {
        var value = array[i];
        if (valuesSoFar.indexOf(value) !== -1) {
            return true;
        }
        valuesSoFar.push(value);
    }
    return false;
}
console.log(hasDuplicates(food_squares))

function rotatePoint(x, y, cx, cy, angle) {
  const radians = angle * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const nx = cos * (x - cx) - sin * (y - cy) + cx;
  const ny = sin * (x - cx) + cos * (y - cy) + cy;

  return { x: nx, y: ny };
}


function RectCircleColliding(circle,rect){
    var distX = Math.abs(circle.x - rect.x-rect.size/2);
    var distY = Math.abs(circle.y - rect.y-rect.size/2);

    if (distX > (rect.size/2 + circle.size)) { return false; }
    if (distY > (rect.size/2 + circle.size)) { return false; }

    if (distX <= (rect.size/2)) { return true; } 
    if (distY <= (rect.size/2)) { return true; }

    var dx=distX-rect.size/2;
    var dy=distY-rect.size/2;
    return (dx*dx+dy*dy<=(circle.size*circle.size));
}

function removeItemOnce(arr, id) {
  return arr.filter(obj => obj.randomID !== id);
}



//console.log(array);

io.on('connection', (socket) => {
  socket.on('newPlayer', (data) => {
    players[socket.id] = data;
    // Send initial positions of all players to the new player
    console.log(players)
    socket.emit('playerJoined', data)
    socket.broadcast.emit('playerJoined', data)
    socket.emit('FoodUpdate', food_squares)
  });

  socket.on('getFood', (data) => {
    io.emit('FoodUpdate', food_squares);
  });

  socket.on('playerMoved', (data) => {
    players[socket.id] = data;
    socket.broadcast.emit('playerMoved', data); // Send to other players
  });

  socket.on('playerCannonMoved', (data) => {
    players[data.id] = data;
    if (data.id != undefined) {
      socket.broadcast.emit('playerCannonUpdated', data);
    }
  });

  socket.on('playerCollided', (data) => {
    try {
      players[data.id_other].health -= data.damagegiven; // Swap damagegiven and damagetaken
      players[data.id_self].health -= data.damagetaken; // Swap damagegiven and damagetaken
      console.log("id_other",players[data.id_other].health, // Swap damagegiven and damagetaken
                 "self",players[data.id_self].health)
    } catch (error) {
      console.log(error);
    }
    

    console.log(data.id_self, data.id_other)
    io.emit('playerDamaged', {
      player1: players[data.id_other],
      ID1: data.id_other,
      player2: players[data.id_self],
      ID2: data.id_self
    });
  });


  socket.on('bulletFired', (data) => {
    bullets.push(data);
    io.emit('bulletUpdate', bullets); // Broadcast to all clients
  });
  // Initialize the bullets array

  setInterval(() => {
    bullets = bullets.filter(bullet => {
      let newX = bullet.x + bullet.speed * Math.cos(bullet.angle);
      let newY = bullet.y + bullet.speed * Math.sin(bullet.angle);
      bullet.distanceTraveled += Math.hypot(newX - bullet.x, newY - bullet.y);
      if (bullet.distanceTraveled < bullet.bullet_distance) {
        bullet.x = newX;
        bullet.y = newY;
        return true;
      } else {
        return false;
      }
    });
    io.emit('bulletUpdate', bullets);
    try {
      bullets.forEach((bullet) => {
        for (const playerId in players) {
          const player = players[playerId];
          const distanceX = Math.abs(player.x - bullet.x);
          const distanceY = Math.abs(player.y - bullet.y);
          if (distanceX < (player.size * 40 + bullet.size) &&
            distanceY < (player.size * 40 + bullet.size) &&
            bullet.id !== player.id) {
            player.health -= (bullet.bullet_damage-0.3) / (player.size / bullet.speed);
            bullet.bullet_distance -= (player.width / (bullet.speed + bullet.bullet_penetration)) - 30;
            io.emit('bulletDamage', { playerID: player.id, playerHealth: player.health, BULLETS: bullets });
          }
        }
        for (let i = 0; i < food_squares.length; i++) {
          const item = food_squares[i];
          if (RectCircleColliding(bullet, item)) {
            var damage = bullet.bullet_damage*4 / (item.size / bullet.speed);
            if (damage > item.health) {
              food_squares = removeItemOnce(food_squares, food_squares[i].randomID)
              console.log("item remove")
              players[bullet.id].score += item.score_add;
              io.emit('playerScore', {bulletId:bullet.id,socrepluse:item.score_add});
              var x = getRandomInt(-3500,3500);
              var y = getRandomInt(-3500,3500);
              for (let i = 0; i < cors_taken.length; i++) {
                if (between(x, cors_taken[i].x - 50, cors_taken[i].x + 50) && between(y, cors_taken[i].y - 50, cors_taken[i].y + 50)) {
                  x = getRandomInt(-3500, 3500);
                  y = getRandomInt(-3500, 3500);
                }
              }
              cors_taken.push({x:x,y:y})
              let fooditem = {
                type: "square",
                health: 10,
                size: 50,
                angle: getRandomInt(0,360),
                x: x,
                y: y,
                color:"Gold",
                randomID: (Math.random()*i*Date.now())
              }
              food_squares.push(fooditem)
            } else {
              item.health -= damage;
              console.log("item damaged",item.health)
            }
            bullet.bullet_distance -= (item.size) - 200;
            io.emit('bulletUpdate', bullets);
            io.emit('FoodUpdate', food_squares);
            console.log("squares hit")
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, 75);
  setInterval(function() {
    for (const key in players) {
      if (!players[key].hasOwnProperty('id')) {
        delete players[key];
      }
    }
  }, 200)
  socket.on('removeBullet', (data) => {
    const bulletIndex = bullets.findIndex(b => b.uniqueid === data.bullet.uniqueid);
    if (bulletIndex !== -1) {
      bullets.splice(bulletIndex, 1);
    }
    io.emit('bulletUpdate', bullets); // Broadcast to all clients
  });
  socket.on("playerDied", (data) => {
    delete players[data.id];
    io.emit('playerLeft', data.id);
  });
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerLeft', socket.id); // Inform everyone of the departure
  });
});

server.listen(3000, function() {
  console.log('Server listening at port %d', 3000);
});
