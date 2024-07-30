const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path')
const SAT = require('sat');

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


const pi = Math.PI
const pi180 = pi / 180;
// Function to calculate triangle vertices
function calculateTriangleVertices(cx, cy, size, angle) {
  const height = (Math.sqrt(3) / 2) * size; // Height of an equilateral triangle
  const halfSize = size / 2;

  const angleRad = angle * (Math.PI / 180); // Convert angle to radians
  const cosAngle = Math.cos(angleRad);
  const sinAngle = Math.sin(angleRad);

  // Define vertices relative to the center
  let vertices = [
    { x: -halfSize, y: height / 3 }, // Bottom-left
    { x: halfSize, y: height / 3 },  // Bottom-right
    { x: 0, y: -2 * height / 3 }     // Top
  ];

  // Rotate and translate vertices
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const rotatedX = vertex.x * cosAngle - vertex.y * sinAngle;
    const rotatedY = vertex.x * sinAngle + vertex.y * cosAngle;
    vertices[i] = { x: rotatedX + cx, y: rotatedY + cy };
  }

  return vertices;
}

function calculateRotatedPentagonVertices(cx, cy, r, rotation) {
  const R = r + 5;
  const angleOffset = -pi / 2 + rotation;
  const vertices = new Array(5);

  for (let i = 0; i < 5; i++) {
    const angle = (2 * pi * i / 5) + angleOffset;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    vertices[i] = { x, y };
  }

  return vertices;
}

function calculateSquareVertices(cx, cy, size, angle) {
  const halfSize = size / 2;

  const angleRad = angle * (pi180);
  const cosAngle = Math.cos(angleRad);
  const sinAngle = Math.sin(angleRad);

  let vertices = [
    { x: -halfSize, y: -halfSize },
    { x: halfSize, y: -halfSize },
    { x: halfSize, y: halfSize },
    { x: -halfSize, y: halfSize }
  ];

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const rotatedX = vertex.x * cosAngle - vertex.y * sinAngle;
    const rotatedY = vertex.x * sinAngle + vertex.y * cosAngle;
    vertices[i] = { x: rotatedX + cx, y: rotatedY + cy };
  }

  return vertices;
}


// Helper function to convert points to SAT Polygon
function toSATPolygon(vertices) {
  const points = new Array(vertices.length);
  for (let i = 0; i < vertices.length; i++) {
    points[i] = new SAT.Vector(vertices[i].x, vertices[i].y);
  }
  return new SAT.Polygon(new SAT.Vector(0, 0), points);
}


// Function to check collision between circle and polygon using SAT.js
function isCircleCollidingWithPolygon(circle, polygonVertices, player) {
  var circleSAT
  if (player === true) {
    circleSAT = new SAT.Circle(new SAT.Vector(circle.x, circle.y), circle.size*40);
  } else {
    circleSAT = new SAT.Circle(new SAT.Vector(circle.x, circle.y), circle.size);
  }
  const polygonSAT = toSATPolygon(polygonVertices);
  const response = new SAT.Response();
  const collided = SAT.testCirclePolygon(circleSAT, polygonSAT, response);
  return collided;
}

// Example usage for the fooditem object
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
  const valueOp = getRandomInt(1, 16);
  var type = ""
  var color = ""
  var health_max = ""
  var score_add = 0
  var body_damage = 0
  switch (true) {
    case (between(valueOp, 1, 9)): // Adjusted to 1-6 for square
      type = "square";
      color = "Gold";
      health_max = 10;
      score_add = 10;
      body_damage = 2;
      break;
    case (between(valueOp, 10, 13)): // Adjusted to 7-8 for triangle
      type = "triangle";
      color = "Red";
      health_max = 15;
      score_add = 15;
      body_damage = 3.5;
      break;
    case (between(valueOp, 14, 15)): // Adjusted to 9-10 for pentagon
      type = "pentagon";
      color = "#579bfa";
      health_max = 100;
      score_add = 120;
      body_damage = 4;
      break;
  }
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
    body_damage: body_damage,
    scalarX: getRandomInt(-100, 100),
    scalarY: getRandomInt(-100, 100),
    vertices: null,
    color: color,
    score_add: score_add,
    randomID: (Math.random() * i * Date.now())
  };
  if (type === "square") {
    const rawvertices = calculateSquareVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle,
    );
    fooditem.vertices = rawvertices;
  }
  if (type === "triangle") {
    const rawvertices = calculateTriangleVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle,
    );
    fooditem.vertices = rawvertices;
  }
  if (type === "pentagon") {
    const rawvertices = calculateRotatedPentagonVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle,
    );
    fooditem.vertices = rawvertices;
  }

  food_squares.push(fooditem);
}




function removeItemOnce(arr, id) {
  return arr.filter(obj => obj.randomID !== id);
}


var angle = 0;


io.on('connection', (socket) => {
  socket.on('newPlayer', (data) => {
    players[data.id] = data;
    io.emit('playerJoined', data); // Emit playerJoined event to notify all clients
    io.emit('FoodUpdate', food_squares); // Emit FoodUpdate event to update food squares
  });

  socket.on('updatePlayer', (data) => {
    io.emit('playerUpdated', data); // Emit playerUpdated event if needed
  });

  socket.on('getFood', (data) => {
    io.emit('FoodUpdate', food_squares);
  });

  socket.on('playerMoved', (data) => {
    if (players[data.id]) {
      players[data.id].x = data.x;
      players[data.id].y = data.y;
      players[data.id].cannonW = data.cannonW;
      players[data.id].type = data.type;
      players[data.id].username = data.username;
      players[data.id].bodyDamage = data.bodyDamage;
      if (!data.last) {return}
      let player = players[data.id]
      food_squares = food_squares.filter((item, index) => {
        const distanceX = Math.abs(player.x - item.x);
        const distanceY = Math.abs(player.y - item.y);
        if (distanceX < 200 && distanceY < 200) {
          
          var collisionCheck = isCircleCollidingWithPolygon(player, item.vertices, true)
          
          if (collisionCheck) {
            let damageplayer = item.body_damage
            let damageother = player["bodyDamage"];
            player.health -= damageplayer;

            if (player.health < 0) {
              io.emit('playerDied', { "playerID": player.id, "rewarder": null, "reward": null });
              players = Object.entries(players).reduce((newPlayers, [key, value]) => {
                if (key !== player.id) {
                  newPlayers[key] = value;
                }
                return newPlayers;
              }, {});
            }
            
            io.emit('bouceBack', { "dx": -data.dx, "dy": -data.dy })
            if (0 > item.health) {
              player.score += item.score_add;
              io.emit('playerScore', { bulletId: player.id, socrepluse: item.score_add });
  
              let x, y;
              do {
                x = getRandomInt(-3500, 3500);
                y = getRandomInt(-3500, 3500);
              } while (cors_taken.some(c => between(x, c.x - 50, c.x + 50) && between(y, c.y - 50, c.y + 50)));
  
              cors_taken.push({ x, y });
  
              const valueOp = getRandomInt(1, 10);
              var type = ""
              var color = ""
              var health_max = ""
              var score_add = 0
              var body_damage = 0
              switch (true) {
                case (between(valueOp, 1, 6)): // Adjusted to 1-6 for square
                  type = "square";
                  color = "Gold";
                  health_max = 10;
                  score_add = 10;
                  body_damage = 2
                  break;
                case (between(valueOp, 0, 1)): // Adjusted to 7-8 for triangle
                  type = "triangle";
                  color = "Red";
                  health_max = 15;
                  score_add = 15;
                  body_damage = 3.5;
                  break;
                case (between(valueOp, 6, 10)): // Adjusted to 9-10 for pentagon
                  type = "pentagon";
                  color = "#579bfa";
                  health_max = 100;
                  score_add = 120;
                  body_damage = 4;
                  break;
              }
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
                body_damage: body_damage,
                scalarX: getRandomInt(-100, 100),
                scalarY: getRandomInt(-100, 100),
                vertices: null,
                color: color,
                score_add: score_add,
                randomID: (Math.random() * index * Date.now())
              };
              if (type === "square") {
                const rawvertices = calculateSquareVertices(
                  fooditem.x,
                  fooditem.y,
                  fooditem.size,
                  fooditem.angle,
                );
                fooditem.vertices = rawvertices;
              }
              if (type === "triangle") {
                const rawvertices = calculateTriangleVertices(
                  fooditem.x,
                  fooditem.y,
                  fooditem.size,
                  fooditem.angle,
                );
                fooditem.vertices = rawvertices;
              }
              if (type === "pentagon") {
                const rawvertices = calculateRotatedPentagonVertices(
                  fooditem.x,
                  fooditem.y,
                  fooditem.size,
                  fooditem.angle,
                );
                fooditem.vertices = rawvertices;
              }
  
              food_squares.push(fooditem);
              io.emit('bulletUpdate', bullets);
  
              return false;
            } else {
              item.health -= damageother;
            }
            
            io.emit("shapeDamage", { "PlayerId": player.id, "playerDamage": damageplayer, "shapes": food_squares });
          }
        }
        return true
      });
      io.emit('FoodUpdate', food_squares);
      socket.broadcast.emit('playerMoved', data);
    }
    
    // Send to other players
  });

  socket.on('playerCannonMoved', (data) => {
    players[data.id] = data;
    if (data.id != undefined) {
      socket.broadcast.emit('playerCannonUpdated', data);
    }
  });

  socket.on('statechange', (data) => {
    socket.broadcast.emit('statechangeUpdate', data);
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
      if (item.type === "pentagon") {
        item.angle += 0.05
      } else {
        item.angle += 0.5;
      }
      if (item.angle > 360) {
        item.angle = 0;
      }
      angle += speed;
      if (item.type === "square") {
        const rawvertices = calculateSquareVertices(
          item.x,
          item.y,
          item.size,
          item.angle,
        );
        item.vertices = rawvertices;
      }
      if (item.type === "triangle") {
        const rawvertices = calculateTriangleVertices(
          item.x,
          item.y,
          item.size,
          item.angle,
        );
        item.vertices = rawvertices;
      }
      if (item.type === "pentagon") {
        const rawvertices = calculateRotatedPentagonVertices(
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
          var player40 = player.size * 40

          if (distanceX < (player40 + bullet.size) &&
            distanceY < (player40 + bullet.size) &&
            bullet.id !== player.id) {
            player.health -= (bullet.bullet_damage - 0.3) / (player.size / bullet.speed);
            bullet.bullet_distance -= (player.width / (bullet.speed + bullet.bullet_penetration)) - 30;

            io.emit('bulletDamage', { playerID: player.id, playerHealth: player.health, BULLETS: bullets });
            if (player.health <= 0) {
              var reward = Math.round(player.score / (20 + (players[bullet.id].score / 10000)))
              io.emit('playerScore', { bulletId: bullet.id, socrepluse: reward });
              io.emit('playerDied', { "playerID": player.id, "rewarder": bullet.id, "reward": reward });
              players = Object.entries(players).reduce((newPlayers, [key, value]) => {
                if (key !== player.id) {
                  newPlayers[key] = value;
                }
                return newPlayers;
              }, {});
              //socket.disconnect(true);
            }
          }
        }


        // Food collision detection
        food_squares = food_squares.filter((item, index) => {
          const distanceX = Math.abs(item.x - bullet.x);
          const distanceY = Math.abs(item.y - bullet.y);
          if (distanceX < 200 && distanceY < 200) {
            var collisionCheck = isCircleCollidingWithPolygon(bullet, item.vertices, false)

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

                const valueOp = getRandomInt(1, 15);
                var type = ""
                var color = ""
                var health_max = ""
                var score_add = 0
                var body_damage = 0
                switch (true) {
                  case (between(valueOp, 1, 10)): // Adjusted to 1-6 for square
                    type = "square";
                    color = "Gold";
                    health_max = 10;
                    score_add = 10;
                    body_damage = 2
                    break;
                  case (between(valueOp, 10, 13)): // Adjusted to 7-8 for triangle
                    type = "triangle";
                    color = "Red";
                    health_max = 15;
                    score_add = 15;
                    body_damage = 3.5
                    break;
                  case (between(valueOp, 14, 15)): // Adjusted to 9-10 for pentagon
                    type = "pentagon";
                    color = "#579bfa";
                    health_max = 100;
                    score_add = 120;
                    body_damage = 10
                    break;
                }
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
                  body_damage: body_damage,
                  scalarX: getRandomInt(-100, 100),
                  scalarY: getRandomInt(-100, 100),
                  vertices: null,
                  color: color,
                  score_add: score_add,
                  randomID: (Math.random() * index * Date.now())
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
                if (type === "pentagon") {
                  const rawvertices = calculateRotatedPentagonVertices(
                    fooditem.x,
                    fooditem.y,
                    fooditem.size,
                    fooditem.angle,
                  );
                  fooditem.vertices = rawvertices;
                }
                if (type === "square") {
                  const rawvertices = calculateSquareVertices(
                    fooditem.x,
                    fooditem.y,
                    fooditem.size,
                    fooditem.angle,
                  );
                  fooditem.vertices = rawvertices;
                }

                food_squares.push(fooditem);
                bullet.bullet_distance /= (3 / bullet.bullet_pentration);
                if (bullet.bullet_pentration > item.size) {
                  if (bullet.type === "triangle") {
                    bullet.angle *= 5;
                  }
                }
                io.emit('bulletUpdate', bullets);
                io.emit('FoodUpdate', food_squares);

                return false;
              } else {
                item.health -= damage;
                bullet.bullet_distance /= (3 / bullet.bullet_pentration);
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
  }, 300);
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
