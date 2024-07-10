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

function calculateTriangleVertices(x, y, size, angle) {
  const height = (Math.sqrt(3) / 2) * size; // Height of an equilateral triangle
  const halfSize = size / 2;

  // Define vertices relative to the center
  let vertices = [
    { x: -halfSize, y: height / 3 }, // Bottom-left
    { x: halfSize, y: height / 3 }, // Bottom-right
    { x: 0, y: (-2 * height) / 3 }, // Top
  ];

  // Rotate vertices by the given angle
  const angleRad = angle * (Math.PI / 180);
  vertices = vertices.map((vertex) => {
    const rotatedX =
      vertex.x * Math.cos(angleRad) - vertex.y * Math.sin(angleRad);
    const rotatedY =
      vertex.x * Math.sin(angleRad) + vertex.y * Math.cos(angleRad);
    return { x: rotatedX + x, y: rotatedY + y };
  });

  return vertices;
}

// Example usage for the fooditem object:



for (let i = 0; i < getRandomInt(300, 400); i++) {
  var x = getRandomInt(-3500, 3500);
  var y = getRandomInt(-3500, 3500);
  for (let i = 0; i < cors_taken.length; i++) {
    if (between(x, cors_taken[i].x - 50, cors_taken[i].x + 50) && between(y, cors_taken[i].y - 50, cors_taken[i].y + 50)) {
      x = getRandomInt(-3500, 3500);
      y = getRandomInt(-3500, 3500);
    }
  }
  cors_taken.push({ x: x, y: y })
  let valueOp = (getRandomInt(0, 2) === 1)
  var type = valueOp ? "triangle" : "square"
  var color = valueOp ? "red" : "Gold"
  var health_max = valueOp ? 15 : 10
  let fooditem = {
    type: type,
    health: health_max,
    maxhealth: health_max,
    size: 50,
    angle: getRandomInt(0, 180),
    x: x,
    y: y,
    vertices: null,
    color: color,
    score_add: health_max,
    randomID: (Math.random() * i * Date.now())
  }
  if (type === "triangle") {
    rawvertices = calculateTriangleVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle,
    );
    const transformedArray = rawvertices.map(({ x, y }) => [x, y]);
    fooditem.vertices = rawvertices
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


function rotatePoint(px, py, ox, oy, angle) {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  px -= ox;
  py -= oy;
  return {
    x: px * c - py * s + ox,
    y: px * s + py * c + oy
  };
}

function checkCircleSquareCollision(circle, square) {
  const { x: cx, y: cy, size: cr } = circle;
  const { x: sx, y: sy, size: sw, angle: sa } = square;

  const localC = rotatePoint(cx, cy, sx, sy, -sa * (Math.PI / 180));  // Convert angle to radians

  const halfW = sw / 2;
  const halfH = sw / 2;  // Assuming square, so width = height
  const dx = Math.max(Math.abs(localC.x - sx) - halfW, 0);
  const dy = Math.max(Math.abs(localC.y - sy) - halfH, 0);

  return (dx * dx + dy * dy) <= (cr * cr);
}
function rotatePoint(px, py, ox, oy, angle) {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  px -= ox;
  py -= oy;
  return {
    x: px * c - py * s + ox,
    y: px * s + py * c + oy
  };
}

function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const b1 = sign(px, py, ax, ay, bx, by) < 0.0;
  const b2 = sign(px, py, bx, by, cx, cy) < 0.0;
  const b3 = sign(px, py, cx, cy, ax, ay) < 0.0;
  return ((b1 === b2) && (b2 === b3));
}

function sign(px, py, ax, ay, bx, by) {
  return (px - bx) * (ay - by) - (ax - bx) * (py - by);
}

function distanceSquared(x1, y1, x2, y2) {
  return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

function checkCircleTriangleCollision(circle, triangle) {
    const cx = circle.x, cy = circle.y, cr = circle.size*4;
    const tx = triangle.x, ty = triangle.y, ta = triangle.angle * (Math.PI / 180);
    const vertices = triangle.vertices;
    const sin_ta = Math.sin(-ta);
    const cos_ta = Math.cos(-ta);
    const rotatedC = rotatePoint(cx, cy, tx, ty, -ta);
    const rotatedVertices = vertices.map(vertex => {
        const vx = vertex.x - tx;
        const vy = vertex.y - ty;
        return {
            x: vx * cos_ta - vy * sin_ta + tx,
            y: vx * sin_ta + vy * cos_ta + ty
        };
    });
    const [ax, ay] = [rotatedVertices[0].x, rotatedVertices[0].y];
    const [bx, by] = [rotatedVertices[1].x, rotatedVertices[1].y];
    const [cx1, cy1] = [rotatedVertices[2].x, rotatedVertices[2].y];
    if (pointInTriangle(rotatedC.x, rotatedC.y, ax, ay, bx, by, cx1, cy1)) {
        return true;
    }
    for (let i = 0; i < 3; i++) {
        const [x1, y1] = [rotatedVertices[i].x, rotatedVertices[i].y];
        const [x2, y2] = [rotatedVertices[(i + 1) % 3].x, rotatedVertices[(i + 1) % 3].y];
        const distSq = distanceSquared(x1, y1, rotatedC.x, rotatedC.y);
        if (distSq <= cr * cr) {
            return true;
        }
        const dx = x2 - x1;
        const dy = y2 - y1;
        const projection = ((rotatedC.x - x1) * dx + (rotatedC.y - y1) * dy) / (dx * dx + dy * dy);
        if (projection >= 0 && projection <= 1) {
            const projx = x1 + projection * dx;
            const projy = y1 + projection * dy;
            if (distanceSquared(projx, projy, rotatedC.x, rotatedC.y) <= cr * cr) {
                return true;
            }
        }
    }
    return false;
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
    } catch (error) {
      console.log(error);
    }


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

  // Path: server.js

  const UPDATE_INTERVAL = 75;

  setInterval(() => {
    // Filter and update bullets
    bullets = bullets.filter(bullet => {
      let newX = bullet.x + bullet.speed * Math.cos(bullet.angle);
      let newY = bullet.y + bullet.speed * Math.sin(bullet.angle);
      bullet.distanceTraveled += Math.hypot(newX - bullet.x, newY - bullet.y);

      if (bullet.distanceTraveled < bullet.bullet_distance) {
        bullet.x = newX;
        bullet.y = newY;
        return true;
      }
      return false;
    });

    // Emit updated bullet positions
    io.emit('bulletUpdate', bullets);

    try {
      bullets.forEach((bullet) => {
        // Player collision detection
        for (const playerId in players) {
          const player = players[playerId];
          const distanceX = Math.abs(player.x - bullet.x);
          const distanceY = Math.abs(player.y - bullet.y);

          if (distanceX < (player.size * 40 + bullet.size) &&
              distanceY < (player.size * 40 + bullet.size) &&
              bullet.id !== player.id) {
            player.health -= (bullet.bullet_damage - 0.3) / (player.size / bullet.speed);
            bullet.bullet_distance -= (player.width / (bullet.speed + bullet.bullet_penetration)) - 30;

            io.emit('bulletDamage', { playerID: player.id, playerHealth: player.health, BULLETS: bullets });
          }
        }

        // Food collision detection
        food_squares = food_squares.filter((item, index) => {
          const distanceX = Math.abs(item.x - bullet.x);
          const distanceY = Math.abs(item.y - bullet.y);

          if (distanceX < 200 && distanceY < 200) {
            const collisionCheck = (item.type === "square")
              ? checkCircleSquareCollision(bullet, item)
              : checkCircleTriangleCollision(bullet, item);

            if (collisionCheck) {
              const damage = bullet.bullet_damage * 4 / (item.size / bullet.speed);

              if (damage > item.health) {
                players[bullet.id].score += item.score_add;
                io.emit('playerScore', { bulletId: bullet.id, socrepluse: item.score_add });

                let x, y;
                do {
                  x = getRandomInt(-3500, 3500);
                  y = getRandomInt(-3500, 3500);
                } while (cors_taken.some(c => between(x, c.x - 50, c.x + 50) && between(y, c.y - 50, c.y + 50)));

                cors_taken.push({ x, y });

                const isTriangle = getRandomInt(0, 2) === 1;
                const newItem = {
                  type: isTriangle ? "triangle" : "square",
                  health: isTriangle ? 15 : 10,
                  maxhealth: isTriangle ? 15 : 10,
                  size: 50,
                  angle: getRandomInt(0, 180),
                  x,
                  y,
                  color: isTriangle ? "Darkred" : "Gold",
                  score_add: isTriangle ? 15 : 10,
                  randomID: Math.random() * index * Date.now()
                };

                food_squares.push(newItem);
                bullet.bullet_distance -= item.size - 200;

                io.emit('bulletUpdate', bullets);
                io.emit('FoodUpdate', food_squares);

                return false;
              } else {
                item.health -= damage;
                bullet.bullet_distance -= item.size - 200;
                io.emit('FoodUpdate', food_squares);
              }
            }
          }
          return true;
        });
      });
    } catch (error) {
      console.log(error);
    }
  }, UPDATE_INTERVAL);

  setInterval(function() {
    for (const key in players) {
      if (!players[key].hasOwnProperty('id')) {
        delete players[key];
      }
    }
  }, 200);
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
