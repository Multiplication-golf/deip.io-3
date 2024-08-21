const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path')
const SAT = require('sat');
const { setTimeout } = require('timers');

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
function MathHypotenuse(x, y) {
  return Math.sqrt(x * x + y * y)
}


var pi = Math.PI
var pi180 = pi / 180;
var sqrt23 = (Math.sqrt(3) / 2)
var piby2 = -pi / 2


// Function to calculate triangle vertices
function calculateTriangleVertices(cx, cy, size, angle) {
  var height = sqrt23 * size;
  var halfSize = size / 2;

  var angleRad = angle * pi180;
  var cosAngle = Math.cos(angleRad);
  var sinAngle = Math.sin(angleRad);

  let vertices = [
    { x: -halfSize, y: -height / 3 },
    { x: halfSize, y: -height / 3 },
    { x: 0, y: 2 * height / 3 }
  ];

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
  const angleOffset = piby2 + rotation;
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

  var halfSize = size / 2;

  var angleRad = angle * pi180;
  var cosAngle = Math.cos(angleRad);
  var sinAngle = Math.sin(angleRad);

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
    circleSAT = new SAT.Circle(new SAT.Vector(circle.x, circle.y), circle.size * 40);
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

var angle = 0;

var invaled_requests = [];

const UPDATE_INTERVAL = 85;
let speed = 0.000006;


io.on('connection', (socket) => {
  socket.on('newPlayer', (data) => {
    players[data.id] = data;
    console.log(players)
    io.emit('playerJoined', data); // Emit playerJoined event to notify all clients
    io.emit('FoodUpdate', food_squares); // Emit FoodUpdate event to update food squares
  });

  socket.on('updatePlayer', (data) => {
    io.emit('playerUpdated', data); // Emit playerUpdated event if needed
  });

  socket.on('getFood', () => {
    io.emit('FoodUpdate', food_squares);
  });

  socket.on("typeChange", (data) => {
    if (!players[data.id]) { invaled_requests.push(data.id); return }
    players[data.id] = data
    io.emit("type_Change", data);
  })

  socket.on('playerCannonWidth', (data) => {
    if (!players[data.id]) { invaled_requests.push(data.id); return }
    players[data.id].cannon_width = data.cannon_width;
    socket.broadcast.emit('playerCannonWidthUpdate', { id: data.id, cannon_width: data.cannon_width });
  });

  socket.on('playerMoved', (data) => {
    if (!players[data.id]) return
    players[data.id].x = data.x;
    players[data.id].y = data.y;
    if (!data.last) { return }
    let player = players[data.id]
    food_squares = food_squares.filter((item, index) => {
      const distanceX = Math.abs(player.x - item.x);
      const distanceY = Math.abs(player.y - item.y);
      // for speed
      let size__ = player.size * 80
      if (!(distanceX < size__ && distanceY < size__)) return true
      if (distanceX < size__ && distanceY < size__) {

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


    // Send to other players
  });

  socket.on('playerCannonMoved', (data) => {
    if (!players[data.id]) { invaled_requests.push(data.id); return }
    players[data.id].cannon_angle = data.cannon_angle;
    players[data.id].MouseX = data.MouseX;
    players[data.id].MouseY = data.MouseY;
    socket.broadcast.emit('playerCannonUpdated', data);
  });

  socket.on('statechange', (data) => {
    if (!players[data.id]) { invaled_requests.push(data.id); return }
    socket.broadcast.emit('statechangeUpdate', data);
  });

  socket.on("healrate", (data) => {
    if (!players[data.id]) { invaled_requests.push(data.id); return }
    players[data.playerId].playerReheal = data.playerReheal;
  });

  socket.on("AddplayerHealTime", (data) => {
    //playerHealTime:playerHealTime, ID:playerId
    if (!players[data.ID]) { invaled_requests.push(data.id); return }
    players[data.ID].maxhealth = data.maxhealth;
    players[data.ID].playerHealTime = data.playerHealTime;
    io.emit("updaterHeal", { ID: data.ID, HEALTime: data.playerHealTime })
    if (data.playerHealTime > 30 && players[data.ID].health < players[data.ID].maxhealth) {
      io.emit('playerHealing', { "playerID": data.ID, "playerHealTime": data.playerHealTime });

      let healer = setInterval(function() {
        players[data.ID].health += players[data.ID].playerReheal;
        if (players[data.ID].health >= players[data.ID].maxhealth) {
          players[data.ID].health = players[data.ID].maxhealth;
          clearInterval(healer);

        }
        if (players[data.ID].playerHealTime < 30) {
          players[data.ID].health -= players[data.ID].playerReheal
          clearInterval(healer);
        }
        io.emit("playerHeal", { HEALTH: players[data.ID].health, ID: data.ID })
      }, 50);
    }
  });

  socket.on("playerHealintterupted", (data) => {
    if (!players[data.ID]) { invaled_requests.push(data.id); return }
    players[data.ID].playerHealTime = 0;
    io.emit("updaterHeal", { ID: data.ID, HEALTime: 0 })
  });

  socket.on('playerCollided', (data) => {
    try {
      players[data.id_other].health -= data.damagegiven; // Swap damagegiven and damagetaken
      players[data.id_self].health -= data.damagetaken;
      if (players[data.id_other].health <= 0) {
        let player = players[data.id_other]
        let player2 = players[data.id_self]
        var reward = Math.round(player.score / (20 + (players[player2.id].score / 10000)))
        io.emit('playerScore', { bulletId: player2.id, socrepluse: reward });
        io.emit('playerDied', { "playerID": player.id, "rewarder": player2.id, "reward": reward });
        players = Object.entries(players).reduce((newPlayers, [key, value]) => {
          if (key !== player.id) {
            newPlayers[key] = value;
          }
          return newPlayers;
        }, {});
      }
      if (players[data.id_self].health <= 0) {
        let player = players[data.id_self]
        let player2 = players[data.id_other]
        var reward = Math.round(player.score / (20 + (players[player2.id].score / 10000)))
        io.emit('playerScore', { bulletId: player2.id, socrepluse: reward });
        io.emit('playerDied', { "playerID": player.id, "rewarder": player2.id, "reward": reward });
        players = Object.entries(players).reduce((newPlayers, [key, value]) => {
          if (key !== player.id) {
            newPlayers[key] = value;
          }
          return newPlayers;
        }, {});
      }
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

  socket.on("playerUPDATE", (data) => {
    players[data.id] = data;
  });

  socket.on('bulletFired', (data) => {
    if (!players[data.id]) return
    if (players[data.id].health <= 0) {
      // looks like some one is messing with the game
      // lets send them to the annoying site (LOL) >:
      io.killPlayer = () => {
        io.emit('f-4ofl04kmzm932-03idk03-39', {})
      }
      io.killPlayer()
    }

    bullets.push(data);
    let indexbullet = bullets.indexOf(data)
    let bullet = bullets[indexbullet]
    if (data.type === "trap") {
      setTimeout(() => {
        // hacky soltion to remove the bullet
        bullet.distanceTraveled = 100e9;

      }, bullet.lifespan * 1000)
    }
    io.emit('bulletUpdate', bullets); // Broadcast to all clients
  });

  setInterval(() => {
    // Filter and update bullets
    bullets = bullets.filter(bullet => {
      if (bullet.type === "directer") {
        try {
          let dx = players[bullet.id].MouseX - bullet.x
          let dy = players[bullet.id].MouseY - bullet.y
          let angle = Math.atan2(dy, dx)
          bullet.angle = angle
        } catch (e) {
          // delet bad bullets
          return false
        }
      }
      let collied = false;
      let newX = bullet.x + bullet.speed * Math.cos(bullet.angle);
      let newY = bullet.y + bullet.speed * Math.sin(bullet.angle);
      var newX__
      var newY__
      if (bullet.type !== "directer") {
        bullet.distanceTraveled += MathHypotenuse(newX - bullet.x, newY - bullet.y);
      }

      if (bullet.type === "trap" || bullet.type === "directer") {
        if (((bullet.bullet_distance - bullet.distanceTraveled) < 200) && bullet.type === "trap") {
          bullet.speed -= (bullet.bullet_distance - bullet.distanceTraveled) / 85
          if (bullet.speed <= 0) bullet.speed = 0;
        }

        bullets.forEach((bullet_) => {
          let distance = MathHypotenuse(bullet.x - bullet_.x, bullet.y - bullet_.y);

          if (distance > 50) return
          var bullet_speed = bullet.speed || 10

          if (distance < (bullet.size * 2 + bullet_.size * 2) && bullet.id !== bullet_.id) {
            bullet.bullet_distance -= (bullet_.speed *
              (bullet_.size + Math.cos(Math.abs(bullet.angle - bullet_.angle))));
            bullet_.bullet_distance -= (bullet_speed *
              (bullet.size + Math.cos(Math.abs(bullet.angle - bullet_.angle))));
          }
          if (distance < (bullet.size * 1.25 + bullet_.size * 1.25) 
              && bullet.id === bullet_.id 
              && bullet.uniqueid !== bullet_.uniqueid
              && bullet.type === bullet_.type) {
            newX__ = (bullet.size*-0.9 * Math.sin(bullet.angle-bullet_.angle));
            newY__ = (bullet.size*-0.9 * Math.cos(bullet.angle-bullet_.angle));
            collied = true;
            bullet_.x += -newX__;
            bullet_.y += -newY__;
          }
        });

        const rawvertices = calculateTriangleVertices(
          bullet.x,
          bullet.y,
          bullet.size * 3,
          0,
        );
        bullet.vertices = rawvertices;
      }

      if ((bullet.distanceTraveled < bullet.bullet_distance)) {
        bullet.x = newX;
        bullet.y = newY;
        if (collied) {
          bullet.x += newX__;
          bullet.y += newY__;
        }
        return true;
      }
      if (bullet.type === "drone") {
        io.emit('dronekilled', { "droneID": bullet.id});
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
    bullets.forEach((bullet) => {
      for (const playerId in players) {
        const player = players[playerId];
        const distanceX = Math.abs(player.x - bullet.x);
        const distanceY = Math.abs(player.y - bullet.y);
        let player40 = player.size * 40

        let bulletsize = bullet.size

        if (distanceX < (player40 + bulletsize) &&
          distanceY < (player40 + bulletsize) &&
          bullet.id !== player.id) {
          if (bullet.type === "trap") {
            player.health -= (bullet.bullet_damage - 0.8) / (player.size / bullet.size + 3);
            bullet.bullet_distance /= (bullet.size / (bullet.bullet_pentration + 10));
            console.log(player.size, bullet.size, bullet.bullet_pentration, bullet.bullet_distance)
          } else {
            player.health -= (bullet.bullet_damage - 0.8) / (player.size / bullet.speed);
            bullet.bullet_distance /= (bullet.size / (bullet.bullet_pentration + 10));
          }



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
          }
        }
      }

      food_squares = food_squares.filter((item, index) => {
        let distanceX = Math.abs(item.x - bullet.x);
        let distanceY = Math.abs(item.y - bullet.y);
        if (distanceX < 200 && distanceY < 200) {
          let collisionCheck = isCircleCollidingWithPolygon(bullet, item.vertices, false)

          if (collisionCheck) {
            if (bullet.type === "trap") {
              var bulletSpeed = 4;
            } else {
              var bulletSpeed = bullet.speed || 0;
            }

            const damage = bullet.bullet_damage * 4 / (item.size / bulletSpeed);

            if (damage > item.health) {
              if (!players[bullet.id]) {
                console.log(bullet.id)
                console.log(players)
                return
              }
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
              bullet.bullet_distance /= (bullet.size / (bullet.bullet_pentration + 10));
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


              if (bullet.bullet_pentration > item.size) {
                if (bullet.type === "triangle") {
                  bullet.angle *= 5;
                }
              }
              io.emit('FoodUpdate', food_squares);
            }
            bullet.bullet_distance /= (bullet.size / (bullet.bullet_pentration + 10));
          }
        }
        return true;
      });
    });
    io.emit('FoodUpdate', food_squares);
  }, UPDATE_INTERVAL);

  setInterval(function() {
    for (const key in players) {
      if (!players[key].hasOwnProperty('id')) {
        delete players[key];
      }
    }
  }, 5000);
  
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
  
  socket.on("unSynched Health", (data) => {
    console.warn(data)
  })
});

server.listen(3000, function() {
  console.log('Server listening at port %d', 3000);
});
