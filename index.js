const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')));

let players = {};
let bullets = [];



io.on('connection', (socket) => {
  socket.on('newPlayer', (data) => {
    players[socket.id] = data;
    // Send initial positions of all players to the new player
    console.log(players)
    socket.emit('playerJoined', data)
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
    console.log("other", players[data.id_other].health, "self", players[data.id_self].health)
    players[data.id_other].health -= data.damagegiven;
    players[data.id_self].health -= data.damagetaken;
    console.log(data.damagegiven, data.damagetaken)
    console.log("other", players[data.id_other].health, "self", players[data.id_self].health)

    io.emit('playerDamaged', {
      player1: players[data.id_other], ID1: data.id_other,
      player2: players[data.id_self], ID2: data.id_self
    })
  });
  socket.on("damageTaken", (data) => {
    socket.broadcast.emit("updateHealth", data);
  });
  socket.on('bulletFired', (data) => {
    bullets.push(data);
    socket.broadcast.emit('bulletUpdate', bullets); // Broadcast to all clients
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

    socket.broadcast.emit('bulletUpdate', bullets);

    try {
      bullets.forEach((bullet) => {
        for (const playerId in players) {
          const player = players[playerId];
          const distanceX = Math.abs(player.x - bullet.x);
          const distanceY = Math.abs(player.y - bullet.y);

          if (distanceX < (player.size * 40 + bullet.size) &&
            distanceY < (player.size * 40 + bullet.size) &&
            bullet.id !== player.id) {

            player.health -= bullet.bullet_damage / (player.size / bullet.speed);
            bullet.bullet_distance -= (player.width / (bullet.speed + bullet.bullet_penetration)) - 30;

            console.log(player.health);
            socket.broadcast.emit('bulletDamage', { playerID: player.id, playerHealth: player.health, BULLETS: bullets });
          }
        }
      });
    } catch (error) {
      console.log(error);
    }

    for (const key in players) {
      if (!players[key].hasOwnProperty('id')) {
        delete players[key];
      }
    }
  }, 50);



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
