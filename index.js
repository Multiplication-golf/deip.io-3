const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')));

let players = {};
let bullets = [];
let food_squares = [];
let cors_taken = [];

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
function between(x, min, max) {
  return x >= min && x <= max;
}

const Math180R = Math.PI / 180;

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
    const rotatedX = vertex.x * Math.cos(angleRad) - vertex.y * Math.sin(angleRad);
    const rotatedY = vertex.x * Math.sin(angleRad) + vertex.y * Math.cos(angleRad);
    return { x: rotatedX + x, y: rotatedY + y };
  });

  return vertices;
}

// Example usage for the fooditem object:
for (let i = 0; i < getRandomInt(300, 400); i++) {
  let x = getRandomInt(-3500, 3500);
  let y = getRandomInt(-3500, 3500);
  for (let j = 0; j < cors_taken.length; j++) {
    if (between(x, cors_taken[j].x - 50, cors_taken[j].x + 50) && between(y, cors_taken[j].y - 50, cors_taken[j].y + 50)) {
      x = getRandomInt(-3500, 3500);
      y = getRandomInt(-3500, 3500);
    }
  }
  cors_taken.push({ x: x, y: y });
  const valueOp = (getRandomInt(0, 2) === 1);
  const type = valueOp ? "triangle" : "square";
  const color = valueOp ? "red" : "Gold";
  const health_max = valueOp ? 15 : 10;
  let fooditem = {
    type: type,
    health: health_max,
    maxhealth: health_max,
    size: 50,
    angle: getRandomInt(0, 180),
    x: x,
    y: y,
    centerX: x,
    centerY: y,
    scalarX: getRandomInt(-100, 100),
    scalarY: getRandomInt(-100, 100),
    vertices: null,
    color: color,
    score_add: health_max,
    randomID: (Math.random() * i * Date.now())
  };
  if (type === "triangle") {
    const rawvertices = calculateTriangleVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle,
    );
    fooditem.vertices = rawvertices;
  }

  food_squares.push(fooditem);
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

  const localC = rotatePoint(cx, cy, sx, sy, -sa * Math180R);

  const halfW = sw / 2;
  const halfH = sw / 2; // Assuming square, so width = height
  const dx = Math.max(Math.abs(localC.x - sx) - halfW, 0);
  const dy = Math.max(Math.abs(localC.y - sy) - halfH, 0);

  return (dx * dx + dy * dy) <= (cr * cr);
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
  const { x: cx, y: cy, size: cr } = circle;
  const { x: tx, y: ty, angle: ta, vertices } = triangle;

  // Rotate circle center to triangle's local coordinates
  const rotatedC = rotatePoint(cx, cy, tx, ty, -ta);

  // Rotate triangle vertices to align with local coordinates
  const rotatedVertices = vertices.map(vertex => {
    return rotatePoint(vertex.x, vertex.y, tx, ty, -ta);
  });

  const [ax, ay] = [rotatedVertices[0].x, rotatedVertices[0].y];
  const [bx, by] = [rotatedVertices[1].x, rotatedVertices[1].y];
  const [cx1, cy1] = [rotatedVertices[2].x, rotatedVertices[2].y];

  // Check if circle center is inside the triangle
  if (pointInTriangle(rotatedC.x, rotatedC.y, ax, ay, bx, by, cx1, cy1)) {
    return true;
  }

  // Check if any of the triangle's edges are intersecting with the circle
  for (let i = 0; i < 3; i++) {
    const [x1, y1] = [rotatedVertices[i].x, rotatedVertices[i].y];
    const [x2, y2] = [rotatedVertices[(i + 1) % 3].x, rotatedVertices[(i + 1) % 3].y];

    const dx = x2 - x1;
    const dy = y2 - y1;

    // Project the circle center onto the edge
    const projection = ((rotatedC.x - x1) * dx + (rotatedC.y - y1) * dy) / (dx * dx + dy * dy);
    const projx = x1 + projection * dx;
    const projy = y1 + projection * dy;

    // Check if the projection is within the edge segment
    if (projection >= 0 && projection <= 1) {
      if (distanceSquared(projx, projy, rotatedC.x, rotatedC.y) <= cr * cr) {
        return true;
      }
    }

    // Check the distances from the circle center to the vertices
    if (distanceSquared(rotatedC.x, rotatedC.y, x1, y1) <= cr * cr || 
        distanceSquared(rotatedC.x, rotatedC.y, x2, y2) <= cr * cr) {
      return true;
    }
  }

  return false;
}



function removeItemOnce(arr, id) {
  return arr.filter(obj => obj.randomID !== id);
}


var angle = 0;

//console.log(array);

io.on('connection', (socket) => {
  socket.on('newPlayer', (data) => {
    players[socket.id] = data;
    io.emit('playerJoined', data)
    io.emit('FoodUpdate', food_squares)
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

  const UPDATE_INTERVAL = 85;
  let speed = 0.000006;


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
    
    for (const gkg_ in food_squares) {
      var item = food_squares[gkg_]
      item.x = item.centerX + item.scalarX * Math.cos(angle);
      item.y = item.centerY + item.scalarY * Math.sin(angle);
      angle += speed;
      if (item.type === "triangle") {
        const rawvertices = calculateTriangleVertices(
          item.x,
          item.y,
          item.size,
          item.angle,
        );
        item.vertices = rawvertices;
      }
      
    };
    

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
                let type = isTriangle ? "triangle" : "square";
                const color = isTriangle ? "red" : "Gold";
                const health_max = isTriangle ? 15 : 10;
                const newItem = {
                  type: type,
                  health: health_max,
                  maxhealth: health_max,
                  size: 50,
                  angle: getRandomInt(0, 180),
                  x: x,
                  y: y,
                  centerX: x,
                  centerY: y,
                  scalarX: getRandomInt(-100, 100),
                  scalarY: getRandomInt(-100, 100),
                  vertices: null,
                  color: color,
                  score_add: health_max,
                  randomID: (Math.random() * index * Date.now())
                };
                rawvertices = calculateTriangleVertices(
                  newItem.x,
                  newItem.y,
                  newItem.size,
                  newItem.angle,
                  );
                newItem.vertices = rawvertices
                

                food_squares.push(newItem);
                bullet.bullet_distance /= (3/bullet.bullet_pentration);
                io.emit('bulletUpdate', bullets);
                io.emit('FoodUpdate', food_squares);


                return false;
              } else {
                item.health -= damage;
                bullet.bullet_distance /= (3/bullet.bullet_pentration);
                if (bullet.bullet_pentration > item.size) {
                  if (bullet.type === "triangle") {
                    bullet.angle *= 5;
                  }
                }
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
    
    io.emit('FoodUpdate', food_squares);
  }, UPDATE_INTERVAL);

  setInterval(function() {
    for (const key in players) {
      if (!players[key].hasOwnProperty('id')) {
        delete players[key];
      }
    }
  }, 200);
  socket.on("playerDied", (data) => {
    players = Object.entries(players).reduce((newPlayers, [key, value]) => {
      if (key !== data.id) {
        newPlayers[key] = value;
      }
      return newPlayers;
    }, {});
    io.emit('playerLeft', data.id);
  });
  socket.on('disconnect', () => {
    players = Object.entries(players).reduce((newPlayers, [key, value]) => {
      if (key !== socket.id) {
        newPlayers[key] = value;
      }
      return newPlayers;
    }, {});
    io.emit('playerLeft', socket.id); // Inform everyone of the departure
  });
});

server.listen(3000, function() {
  console.log('Server listening at port %d', 3000);
});
