const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const SAT = require("sat");
const { setTimeout } = require("timers");
const WebSocket = require("ws");
const crypto = require('crypto');

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

// fix memory leak with dead players-fixed
// fix auto rotion with cannon-started
// fix game loop with nested functions-fixed
// fix level up bar-FIXED-sure
// fix bullet error with player-to-player combat-fixed

app.use(express.static(path.join(__dirname, "public")));
var port = process.env.PORT;
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
  return Math.sqrt(x * x + y * y);
}

function normalizeAngleRadians(angle) {
  while (angle >= Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

var pi = Math.PI;
var pi180 = pi / 180;
var sqrt23 = Math.sqrt(3) / 2;
var piby2 = -pi / 2;

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
    { x: 0, y: (2 * height) / 3 },
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
    const angle = (2 * pi * i) / 5 + angleOffset;
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
    { x: -halfSize, y: halfSize },
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
  var circleSAT;
  if (player === true) {
    circleSAT = new SAT.Circle(
      new SAT.Vector(circle.x, circle.y),
      circle.size * 40
    );
  } else {
    circleSAT = new SAT.Circle(new SAT.Vector(circle.x, circle.y), circle.size);
  }
  const polygonSAT = toSATPolygon(polygonVertices);
  const collided = SAT.testCirclePolygon(circleSAT, polygonSAT);
  return collided;
}

// Example usage for the fooditem object
for (let i = 0; i < getRandomInt(300, 400); i++) {
  let x = getRandomInt(-3500, 3500);
  let y = getRandomInt(-3500, 3500);
  for (let j = 0; j < cors_taken.length; j++) {
    if (
      between(x, cors_taken[j].x - 50, cors_taken[j].x + 50) &&
      between(y, cors_taken[j].y - 50, cors_taken[j].y + 50)
    ) {
      x = getRandomInt(-3500, 3500);
      y = getRandomInt(-3500, 3500);
    }
  }
  cors_taken.push({ x: x, y: y });
  const valueOp = getRandomInt(1, 16);
  var type = "";
  var color = "";
  var health_max = "";
  var score_add = 0;
  var body_damage = 0;
  switch (true) {
    case between(valueOp, 1, 9): // Adjusted to 1-6 for square
      type = "square";
      color = "Gold";
      health_max = 10;
      score_add = 10;
      body_damage = 2;
      break;
    case between(valueOp, 10, 13): // Adjusted to 7-8 for triangle
      type = "triangle";
      color = "Red";
      health_max = 15;
      score_add = 15;
      body_damage = 3.5;
      break;
    case between(valueOp, 14, 15): // Adjusted to 9-10 for pentagon
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
    randomID: Math.random() * i * Date.now(),
  };
  if (type === "square") {
    const rawvertices = calculateSquareVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle
    );
    fooditem.vertices = rawvertices;
  }
  if (type === "triangle") {
    const rawvertices = calculateTriangleVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle
    );
    fooditem.vertices = rawvertices;
  }
  if (type === "pentagon") {
    const rawvertices = calculateRotatedPentagonVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle
    );
    fooditem.vertices = rawvertices;
  }

  food_squares.push(fooditem);
}

var angle = 0;

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);



var serverseed = crypto.randomUUID()

var invaled_requests = [];

const UPDATE_INTERVAL = 85;
let speed = 0.000006;
const connections = [];

wss.on("connection", (socket) => {
  let connection = { socket: socket, playerId: null };
  let handshaked = false
  connections.push(connection);

  socket.on("message", (message) => {
    const { type, data } = JSON.parse(message);

    if (type === "newPlayer") {
      players[data.id] = data;
      connection.playerId = data.id; // bind call
      console.log(players);
      emit("playerJoined", data); // Emit playerJoined event to notify all clients
      emit("FoodUpdate", food_squares); // Emit FoodUpdate event to update food squares
      return;
    }
    
    if (type === "HANDSHAKE") {
      if (handshaked) return
      (function() {
        handshaked = true
        const handshake = Date.now() + "-" + (Math.floor(Math.random() * 1000) + (Date.now()*Math.random()) + (Date.now()/1387)+Math.random())*serverseed;
        socket.send(JSON.stringify({type:"handshake", data:handshake}))
      })();
      return;
    }

    if (type === "updatePlayer") {
      emit("playerUpdated", data); // Emit playerUpdated event if needed
      return;
    }

    if (type === "getFood") {
      emit("FoodUpdate", food_squares);
      return;
    }

    if (type === "typeChange") {
      if (!players[data.id]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.id] = data;
      emit("type_Change", data);
      return;
    }

    if (type === "playerCannonWidth") {
      if (!players[data.id]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.id].cannon_width = data.cannon_width;
      broadcast(
        "playerCannonWidthUpdate",
        { id: data.id, cannon_width: data.cannon_width },
        socket
      );
      return;
    }

    if (type === "playerMoved") {
      if (!players[data.id]) return;
      players[data.id].x = data.x;
      players[data.id].y = data.y;
      if (!data.last) {
        return;
      }
      let player = players[data.id];
      let hasfoodchanged = false;
      food_squares = food_squares.filter((item, index) => {
        const distanceX = Math.abs(player.x - item.x);
        const distanceY = Math.abs(player.y - item.y);
        // for speed
        let size__ = player.size * 80;
        if (!(distanceX < size__ && distanceY < size__)) return true;

        var collisionCheck = isCircleCollidingWithPolygon(
          player,
          item.vertices,
          true
        );

        if (collisionCheck) {
          hasfoodchanged = true;
          let damageplayer = item.body_damage;
          let damageother = player["bodyDamage"];
          player.health -= damageplayer;

          if (player.health < 0) {
            emit("playerDied", {
              playerID: player.id,
              rewarder: null,
              reward: null,
            });
            players = Object.entries(players).reduce(
              (newPlayers, [key, value]) => {
                if (key !== player.id) {
                  newPlayers[key] = value;
                }
                return newPlayers;
              },
              {}
            );
          }

          emit("bouceBack", { dx: -data.dx, dy: -data.dy });
          if (0 > item.health) {
            player.score += item.score_add;
            emit("playerScore", {
              bulletId: player.id,
              socrepluse: item.score_add,
            });

            let x, y;
            do {
              x = getRandomInt(-3500, 3500);
              y = getRandomInt(-3500, 3500);
            } while (
              cors_taken.some(
                (c) =>
                  between(x, c.x - 50, c.x + 50) &&
                  between(y, c.y - 50, c.y + 50)
              )
            );

            cors_taken.push({ x, y });

            const valueOp = getRandomInt(1, 10);
            var type = "";
            var color = "";
            var health_max = "";
            var score_add = 0;
            var body_damage = 0;
            switch (true) {
              case between(valueOp, 1, 6): // Adjusted to 1-6 for square
                type = "square";
                color = "Gold";
                health_max = 10;
                score_add = 10;
                body_damage = 2;
                break;
              case between(valueOp, 0, 1): // Adjusted to 7-8 for triangle
                type = "triangle";
                color = "Red";
                health_max = 15;
                score_add = 15;
                body_damage = 3.5;
                break;
              case between(valueOp, 6, 10): // Adjusted to 9-10 for pentagon
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
              randomID: Math.random() * index * Date.now(),
            };
            if (type === "square") {
              const rawvertices = calculateSquareVertices(
                fooditem.x,
                fooditem.y,
                fooditem.size,
                fooditem.angle
              );
              fooditem.vertices = rawvertices;
            }
            if (type === "triangle") {
              const rawvertices = calculateTriangleVertices(
                fooditem.x,
                fooditem.y,
                fooditem.size,
                fooditem.angle
              );
              fooditem.vertices = rawvertices;
            }
            if (type === "pentagon") {
              const rawvertices = calculateRotatedPentagonVertices(
                fooditem.x,
                fooditem.y,
                fooditem.size,
                fooditem.angle
              );
              fooditem.vertices = rawvertices;
            }

            food_squares.push(fooditem);
            emit("bulletUpdate", bullets);

            return false;
          } else {
            item.health -= damageother;
          }

          emit("shapeDamage", {
            PlayerId: player.id,
            playerDamage: damageplayer,
            shapes: food_squares,
          });
        }
        return true;
      });
      if (hasfoodchanged) {
        emit("FoodUpdate", food_squares);
      }
      broadcast("playerMoved", data, socket);
      return;
    }

    function generateRandomNumber(min, max) {
      return Math.random() * (max - min) + min;
    }

    if (type === "Autofire") {
      let maxdistance = 5000;
      let fire_at = null;
      for (const playerID in players) {
        let player = players[playerID];
        if (playerID !== data.playerId) {
          var distance = MathHypotenuse(
            player.x - data.playerX,
            player.y - data.playerY
          );
          if (distance < maxdistance) {
            maxdistance = distance;
            fire_at = player;
          }
        }
      }
      if (maxdistance > 1300) {
        food_squares.forEach((item) => {
          var distance = MathHypotenuse(
            item.x - data.playerX,
            item.y - data.playerY
          );
          if (distance < maxdistance) {
            maxdistance = distance;
            fire_at = item;
          }
        });
      }
      let cannon = data.cannon;
      let bullet_speed__ = data.bullet_speed * cannon["bulletSpeed"];
      if (cannon["type"] === "basicCannon" || cannon["type"] === "trapezoid") {
        var bulletdistance = bullet_speed__ * 100 * (data.bullet_size / 6);
        var __type = "basic";
        var health = 8;
      } else if (cannon["type"] === "trap") {
        var bulletdistance = bullet_speed__ * 70 * (data.bullet_size / 20);
        var __type = "trap";
        var health = 10;
      } else if (cannon["type"] === "directer") {
        var bulletdistance = 100;
        var __type = "directer";
        var health = 10;
      } else if (cannon["type"] === "autoCannon") {
        var bulletdistance = bullet_speed__ * 100 * (data.bullet_size / 6);
        var __type = "basic";
        var health = 8;
      }
      let angle = Math.atan2(
        fire_at.y - data.playerY,  // y difference
        fire_at.x - data.playerX   // x difference
      );
      

      let bullet_size_l = data.bullet_size * cannon["bulletSize"];

      let randomNumber = generateRandomNumber(-0.2, 0.2);

      if (cannon["type"] === "basicCannon" || cannon["type"] === "trap") {
        var xxx = cannon["cannon-width"] - bullet_size_l * 1.5;
        var yyy = cannon["cannon-height"] - bullet_size_l * 2;
        var angle_ = angle + cannon["offset-angle"];
      } else if (cannon["type"] === "trapezoid") {
        var angle_ = angle + cannon["offset-angle"] + randomNumber;
        var xxx = cannon["cannon-width-top"] - bullet_size_l * 1.5;
        var yyy =
          cannon["cannon-height"] -
          bullet_size_l * 2 -
          (cannon["cannon-width-top"] / 2) * Math.random();
      } else if (cannon["type"] === "autoCannon") {
        var xxx = cannon["cannon-width"] - bullet_size_l * 1.5;
        var yyy = cannon["cannon-height"] - bullet_size_l * 2;
        var angle_ = angle + cannon["offset-angle"];
      }
      console.log(angle_,fire_at.type)
      

      let rotated_offset_x =
        (cannon["offSet-x"] + xxx) * Math.cos(angle_) -
        (cannon["offSet-y"] + yyy) * Math.sin(angle_);
      let rotated_offset_y =
        (cannon["offSet-x"] + xxx) * Math.sin(angle_) +
        (cannon["offSet-y"] + yyy) * Math.cos(angle_);
      let bullet_start_x = data.playerX + rotated_offset_x;
      let bullet_start_y = data.playerY + rotated_offset_y;
      // lol
      let identdfire = Date.now() + Math.random();

      let cannon_life = cannon["life-time"] || 0;

      let bullet = {
        type: __type,
        bullet_distance: bulletdistance,
        speed: bullet_speed__,
        size: bullet_size_l,
        angle: angle_,
        bullet_damage: data.bullet_damage * cannon["bulletSize"],
        distanceTraveled: 0,
        vertices: null,
        bullet_pentration: data.bullet_pentration * cannon["bullet_pentration"],
        x: bullet_start_x,
        y: bullet_start_y,
        lifespan: cannon_life,
        health: health,
        xstart: data.playerX,
        ystart: data.playerY,
        id: data.playerId,
        uniqueid: identdfire,
      };
      bullets.push(bullet);
    }

    if (type === "playerCannonMoved") {
      if (!players[data.id]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.id].cannon_angle = data.cannon_angle;
      players[data.id].MouseX = data.MouseX;
      players[data.id].MouseY = data.MouseY;
      broadcast("playerCannonUpdated", data, socket);
      return;
    }

    if (type === "statechange") {
      if (!players[data.id]) {
        invaled_requests.push(data.id);
        return;
      }
      broadcast("statechangeUpdate", data, socket);
      return;
    }

    if (type === "healrate") {
      if (!players[data.id]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.playerId].playerReheal = data.playerReheal;
      return;
    }

    if (type === "AddplayerHealTime") {
      //playerHealTime:playerHealTime, ID:playerId
      if (!players[data.ID]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.ID].maxhealth = data.maxhealth;
      players[data.ID].playerHealTime = data.playerHealTime;
      emit("updaterHeal", { ID: data.ID, HEALTime: data.playerHealTime });
      if (
        data.playerHealTime > 30 &&
        players[data.ID].health < players[data.ID].maxhealth
      ) {
        emit("playerHealing", {
          playerID: data.ID,
          playerHealTime: data.playerHealTime,
        });

        let healer = setInterval(function () {
          players[data.ID].health += players[data.ID].playerReheal;
          if (players[data.ID].health >= players[data.ID].maxhealth) {
            players[data.ID].health = players[data.ID].maxhealth;
            clearInterval(healer);
          }
          if (players[data.ID].playerHealTime < 30) {
            players[data.ID].health -= players[data.ID].playerReheal;
            clearInterval(healer);
          }
          emit("playerHeal", { HEALTH: players[data.ID].health, ID: data.ID });
        }, 50);
      }
      return;
    }

    if (type === "playerHealintterupted") {
      if (!players[data.ID]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.ID].playerHealTime = 0;
      emit("updaterHeal", { ID: data.ID, HEALTime: 0 });
      return;
    }

    if (type === "playerCollided") {
      try {
        players[data.id_other].health -= data.damagegiven; // Swap damagegiven and damagetaken
        players[data.id_self].health -= data.damagetaken;
        if (players[data.id_other].health <= 0) {
          let player = players[data.id_other];
          let player2 = players[data.id_self];
          var reward = Math.round(
            player.score / (20 + players[player2.id].score / 10000)
          );
          emit("playerScore", { bulletId: player2.id, socrepluse: reward });
          emit("playerDied", {
            playerID: player.id,
            rewarder: player2.id,
            reward: reward,
          });
          players = Object.entries(players).reduce(
            (newPlayers, [key, value]) => {
              if (key !== player.id) {
                newPlayers[key] = value;
              }
              return newPlayers;
            },
            {}
          );
        }
        if (players[data.id_self].health <= 0) {
          let player = players[data.id_self];
          let player2 = players[data.id_other];
          var reward = Math.round(
            player.score / (20 + players[player2.id].score / 10000)
          );
          emit("playerScore", { bulletId: player2.id, socrepluse: reward });
          emit("playerDied", {
            playerID: player.id,
            rewarder: player2.id,
            reward: reward,
          });
          players = Object.entries(players).reduce(
            (newPlayers, [key, value]) => {
              if (key !== player.id) {
                newPlayers[key] = value;
              }
              return newPlayers;
            },
            {}
          );
        }
      } catch (error) {
        console.log(error);
      }

      emit("playerDamaged", {
        player1: players[data.id_other],
        ID1: data.id_other,
        player2: players[data.id_self],
        ID2: data.id_self,
      });
      return;
    }

    if (type === "playerUPDATE") {
      players[data.id] = data;
      return;
    }

    if (type === "bulletFired") {
      if (!players[data.id]) return;
      if (players[data.id].health <= 0) {
        // looks like some one is messing with the game
      }

      bullets.push(data);
      console.log("angle",data.angle)
      let indexbullet = bullets.indexOf(data);
      let bullet = bullets[indexbullet];
      if (data.type === "trap") {
        setTimeout(() => {
          // hacky soltion to remove the bullet
          bullet.distanceTraveled = 100e9;
        }, bullet.lifespan * 1000);
      }
      emit("bulletUpdate", bullets); // Broadcast to all clients
      return;
    }

    if (type === "playerDied") {
      players = Object.entries(players).reduce((newPlayers, [key, value]) => {
        if (key !== data.id) {
          newPlayers[key] = value;
        }
        return newPlayers;
      }, {});
      emit("playerLeft", data.id);
      return;
    }
  });
  setInterval(function () {
    for (const key in players) {
      if (!players[key].hasOwnProperty("id")) {
        delete players[key];
      }
    }
  }, 5000);
  socket.on("close", () => {
    const index = connections.indexOf(socket);
    if (index !== -1) {
      connections.splice(index, 1); // Remove the connection from the list
    }
    players = Object.entries(players).reduce((newPlayers, [key, value]) => {
      if (key !== connection.playerId) {
        newPlayers[key] = value;
      }
      return newPlayers;
    }, {});
    emit("playerLeft", { playerID: connection.playerId });
  });
});

setInterval(() => {
    // Filter and update bullets
    bullets = bullets.filter((bullet) => {
      if (bullet.type === "directer") {
        try {
          let dx =
            players[bullet.id].MouseX +
            players[bullet.id].x -
            players[bullet.id].screenWidth / 2 -
            bullet.x;
          let dy =
            players[bullet.id].MouseY +
            players[bullet.id].y -
            players[bullet.id].screenHeight / 2 -
            bullet.y;
          let angle = Math.atan2(dy, dx);
          bullet.angle = angle;
        } catch (e) {
          // delet bad bullets
          return false;
        }
      }
      let collied = false;
      let newX = bullet.x + bullet.speed * Math.cos(bullet.angle);
      let newY = bullet.y + bullet.speed * Math.sin(bullet.angle);
      var newX__;
      var newY__;
      if (bullet.type !== "directer") {
        bullet.distanceTraveled += MathHypotenuse(
          newX - bullet.x,
          newY - bullet.y
        );
      }

      if (bullet.type === "trap" || bullet.type === "directer") {
        if (
          bullet.bullet_distance - bullet.distanceTraveled < 200 &&
          bullet.type === "trap"
        ) {
          bullet.speed -=
            (bullet.bullet_distance - bullet.distanceTraveled) / 85;
          if (bullet.speed <= 0) bullet.speed = 0;
        }

        bullets.forEach((bullet_) => {
          let distance = MathHypotenuse(
            bullet.x - bullet_.x,
            bullet.y - bullet_.y
          );

          if (distance > 50) return;
          var bullet_speed = bullet.speed || 10;

          if (
            distance < bullet.size * 2 + bullet_.size * 2 &&
            bullet.id !== bullet_.id
          ) {
            if ((!bullet_.speed || !bullet_speed) && bullet.type === "trap")
              return;
            bullet.bullet_distance -=
              bullet_.speed *
              (bullet_.size / 5 +
                Math.cos(Math.abs(bullet.angle - bullet_.angle)));
            bullet_.bullet_distance -=
              bullet_speed *
              (bullet.size / 2 +
                Math.cos(Math.abs(bullet.angle - bullet_.angle)));
          }
          if (
            distance < bullet.size * 1.25 + bullet_.size * 1.25 &&
            bullet.id === bullet_.id &&
            bullet.uniqueid !== bullet_.uniqueid &&
            bullet.type === bullet_.type
          ) {
            newX__ =
              bullet.size * -0.9 * Math.sin(bullet.angle - bullet_.angle);
            newY__ =
              bullet.size * -0.9 * Math.cos(bullet.angle - bullet_.angle);
            collied = true;
            bullet_.x += -newX__;
            bullet_.y += -newY__;
          }
        });

        const rawvertices = calculateTriangleVertices(
          bullet.x,
          bullet.y,
          bullet.size * 3,
          0
        );
        bullet.vertices = rawvertices;
      }

      for (const playerId in players) {
        var player = players[playerId];
        var distance = MathHypotenuse(player.x - bullet.x, player.y - bullet.y);
        let player40 = player.size * 40;

        let bulletsize = bullet.size;

        if ((distance < player40 + bullet.size) & (bullet.id !== player.id)) {
          if (bullet.type === "trap") {
            player.health -=
              (bullet.bullet_damage - 3.8) / (player.size / bullet.size + 3);
            bullet.bullet_distance /=
              bullet.size / (bullet.bullet_pentration + 10);
          } else if (bullet.type === "directer") {
            player.health -=
              (bullet.bullet_damage - 4.4) / (player.size / bullet.size + 5);
            bullet.bullet_distance /=
              bullet.size / (bullet.bullet_pentration + 10);
          } else {
            player.health -=
              (bullet.bullet_damage - 3.8) / (player.size / bullet.speed);
            bullet.bullet_distance /=
              bullet.size / (bullet.bullet_pentration + 10);
          }

          emit("bulletDamage", {
            playerID: player.id,
            playerHealth: player.health,
            BULLETS: bullets,
          });
          if (player.health <= 0) {
            var reward = Math.round(
              player.score / (20 + players[bullet.id].score / 10000)
            );
            emit("playerScore", { bulletId: bullet.id, socrepluse: reward });
            emit("playerDied", {
              playerID: player.id,
              rewarder: bullet.id,
              reward: reward,
            });
            players = Object.entries(players).reduce(
              (newPlayers, [key, value]) => {
                if (key !== player.id) {
                  newPlayers[key] = value;
                }
                return newPlayers;
              },
              {}
            );
          }
        }
      }
      if (bullet.distanceTraveled < bullet.bullet_distance) {
        bullet.x = newX;
        bullet.y = newY;
        if (collied) {
          bullet.x += newX__;
          bullet.y += newY__;
        }

        return true;
      }
      if (bullet.type === "directer") {
        emit("dronekilled", { droneID: bullet.id });
      }

      return false;
    });

    // Emit updated bullet positions
    emit("bulletUpdate", bullets);

    food_squares = food_squares.filter((item, index) => {
      item.x = item.centerX + item.scalarX * Math.cos(angle);
      item.y = item.centerY + item.scalarY * Math.sin(angle);
      if (item.type === "pentagon") {
        item.angle += 0.05;
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
          item.angle
        );
        item.vertices = rawvertices;
      }
      if (item.type === "triangle") {
        const rawvertices = calculateTriangleVertices(
          item.x,
          item.y,
          item.size,
          item.angle
        );
        item.vertices = rawvertices;
      }
      if (item.type === "pentagon") {
        const rawvertices = calculateRotatedPentagonVertices(
          item.x,
          item.y,
          item.size,
          item.angle
        );
        item.vertices = rawvertices;
      }
      let return_ = true;
      bullets.forEach((bullet) => {
        let distance = MathHypotenuse(item.x - bullet.x, item.y - bullet.y);
        if (distance < 400) {
          let collisionCheck = isCircleCollidingWithPolygon(
            bullet,
            item.vertices,
            false
          );

          if (!collisionCheck) {
            return;
          }
          if (bullet.type === "trap") {
            var bulletSpeed = 4;
          } else {
            var bulletSpeed = bullet.speed || 0;
          }

          const damage = (bullet.bullet_damage * 4) / (item.size / bulletSpeed);

          if (damage > item.health) {
            if (!players[bullet.id]) {
              console.log(bullet.id);
              console.log(players);
              return;
            }
            players[bullet.id].score += item.score_add;
            emit("playerScore", {
              bulletId: bullet.id,
              socrepluse: item.score_add,
            });

            let x, y;
            do {
              x = getRandomInt(-3500, 3500);
              y = getRandomInt(-3500, 3500);
            } while (
              cors_taken.some(
                (c) =>
                  between(x, c.x - 50, c.x + 50) &&
                  between(y, c.y - 50, c.y + 50)
              )
            );

            cors_taken.push({ x, y });

            const valueOp = getRandomInt(1, 15);
            var type = "";
            var color = "";
            var health_max = "";
            var score_add = 0;
            var body_damage = 0;
            switch (true) {
              case between(valueOp, 1, 10): // Adjusted to 1-6 for square
                type = "square";
                color = "Gold";
                health_max = 10;
                score_add = 10;
                body_damage = 2;
                break;
              case between(valueOp, 10, 13): // Adjusted to 7-8 for triangle
                type = "triangle";
                color = "Red";
                health_max = 15;
                score_add = 15;
                body_damage = 3.5;
                break;
              case between(valueOp, 14, 15): // Adjusted to 9-10 for pentagon
                type = "pentagon";
                color = "#579bfa";
                health_max = 100;
                score_add = 120;
                body_damage = 10;
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
              randomID: Math.random() * index * Date.now(),
            };
            if (type === "triangle") {
              const rawvertices = calculateTriangleVertices(
                fooditem.x,
                fooditem.y,
                fooditem.size,
                fooditem.angle
              );
              fooditem.vertices = rawvertices;
            }
            if (type === "pentagon") {
              const rawvertices = calculateRotatedPentagonVertices(
                fooditem.x,
                fooditem.y,
                fooditem.size,
                fooditem.angle
              );
              fooditem.vertices = rawvertices;
            }
            if (type === "square") {
              const rawvertices = calculateSquareVertices(
                fooditem.x,
                fooditem.y,
                fooditem.size,
                fooditem.angle
              );
              fooditem.vertices = rawvertices;
            }

            food_squares.push(fooditem);
            bullet.bullet_distance /=
              bullet.size / (bullet.bullet_pentration + 10);
            if (bullet.bullet_pentration > item.size) {
              if (bullet.type === "triangle") {
                bullet.angle *= 5;
              }
            }
            emit("bulletUpdate", bullets);
            emit("FoodUpdate", food_squares);

            return_ = false;
          } else {
            item.health -= damage;

            if (bullet.bullet_pentration > item.size) {
              if (bullet.type === "triangle") {
                bullet.angle *= 5;
              }
            }
          }
          bullet.bullet_distance /=
            bullet.size / (bullet.bullet_pentration + 10);
          bullet.bullet_distance -= 1; // for drones
        }
      });
      return return_;
    });
    emit("FoodUpdate", food_squares);
  }, UPDATE_INTERVAL);

function emit(type, data) {
  const message = JSON.stringify({ type, data });
  connections.forEach((conn) => {
    conn.socket.send(message);
  });
}

function broadcast(type, data, senderConn) {
  const message = JSON.stringify({ type, data });
  connections.forEach((conn) => {
    // Exclude the sender connection if provided
    if (conn.socket !== senderConn) {
      conn.socket.send(message);
    }
  });
}

const listener = server.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
