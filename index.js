const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const SAT = require("sat");
const { setTimeout } = require("timers");
const WebSocket = require("ws");
const crypto = require("crypto");
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

//TODO: fix upgrade for multi-level upgrade tank choice

app.use(express.static(path.join(__dirname, "public")));
var port = process.env.PORT;
let players = {};
let bullets = [];
let food_squares = [];
let cors_taken = [];
let leader_board = { shown: [], hidden: [] };
let autocannons = [];
let ColorUpgrades = [
  "#f54242",
  "#fa8050",
  "#fab350",
  "#fcf25b",
  "#57f75c",
  "#42fcf6",
  "#5181fc",
  "#5c14f7",
];
const levels = {
  0: 15,
  1: 28,
  2: 44,
  3: 67,
  4: 99,
  5: 143,
  6: 202,
  7: 279,
  8: 377,
  9: 500,
  10: 649,
  11: 829,
  12: 1042,
  13: 1290,
  14: 1578,
  15: 1908,
  16: 2283,
  17: 2706,
  18: 3179,
  19: 3707,
  20: 4292,
  21: 4937,
  22: 5645,
  23: 6419,
  24: 7262,
  25: 8177,
  26: 9167,
  27: 10235,
  28: 11384,
  29: 12617,
  30: 13937,
  31: 15348,
  32: 16851,
  33: 18451,
  34: 20149,
  35: 21950,
  36: 23855,
  37: 25869,
  38: 27993,
  39: 30231,
  40: 32586,
  41: 35061,
  42: 37659,
  43: 40383,
  44: 43236,
  45: 46221,
  46: 49341,
  47: 52599,
  48: 55998,
  49: 59541,
  50: 63231,
  51: 67071,
  52: 71064,
  53: 75213,
  54: 79522,
  55: 83992,
  56: 88628,
  57: 93431,
  58: 98406,
  59: 103554,
  60: 108880,
  61: 114385,
  62: 120074,
  63: 125948,
  64: 132012,
  65: 138267,
  66: 144718,
  67: 151366,
  68: 158216,
  69: 165269,
  70: 172530,
  71: 180000,
  72: 187684,
  73: 195583,
  74: 203702,
  75: 212042,
  76: 220608,
  77: 229401,
  78: 238426,
  79: 247684,
  80: 257180,
  81: 266915,
  82: 276894,
  83: 287118,
  84: 297592,
  85: 308317,
  86: 319298,
  87: 330536,
  88: 342036,
  89: 353799,
  90: 365830,
  91: 378130,
  92: 390704,
  93: 403553,
  94: 416682,
  95: 430092,
  96: 443788,
  97: 457771,
  98: 472046,
  99: 486614,
  100: 501480,
};
const tankmeta = {
  basic: {
    "size-m": 1,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 1,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgradeLevel: 15,
    upgrades: {
      twin: 1,
      flank: 2,
      sniper: 3,
      "mechiane gun": 4,
      spreader: 5,
      rammer: 6,
      traper: 7,
      directer: 8,
      autobasic: 9,
      autoduo: 10,
    },
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 1,
      },
    ],
  },
  twin: {
    "size-m": 1,
    "speed-m": 0.95,
    "damage-m": 1,
    "health-m": 1,
    fov: 1,
    "BodyDamage-m": 1,
    "regen-m": 1,
    "reaload-m": 1.3,
    upgradeLevel: 30,
    upgrades: ["twin", "sniper"],
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": -20,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 20,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0.5,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
    ],
  },
  flank: {
    "size-m": 1,
    "speed-m": 0.98,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 1,
    "BodyDamage-m": 1.1,
    "reaload-m": 1.2,
    upgradeLevel: 30,
    upgrades: ["twin", "sniper"],
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.8,
      },
      {
        type: "basicCannon",
        "cannon-width": 70,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 3.14159,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.8,
      },
    ],
  },
  sniper: {
    "size-m": 1.05,
    "speed-m": 0.9,
    "damage-m": 1,
    "health-m": 0.95,
    fov: 1,
    "BodyDamage-m": 1,
    "regen-m": 1,
    "reaload-m": 1.5,
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 120,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 1.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 1.6,
      },
    ],
  },
  "mechiane gun": {
    "size-m": 1.05,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    fov: 1,
    "BodyDamage-m": 1,
    "reaload-m": 0.75,
    "regen-m": 1,
    upgradeLevel: 30,
    upgrades: {
      twin: 1,
      sniper: 2,
      flank: 3,
      "mechiane gun": 4,
    },
    cannons: [
      {
        type: "trapezoid",
        "cannon-width-top": 70,
        "cannon-height": 50,
        "cannon-width-bottom": 40,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1.05,
        bulletSpeed: 1,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
    ],
  },
  spreader: {
    "size-m": 1.05,
    "speed-m": 1.5,
    "damage-m": 0.9,
    "health-m": 1.1,
    fov: 1,
    "BodyDamage-m": 1,
    "reaload-m": 0.8,
    "regen-m": 1,
    upgradeLevel: 30,
    upgrades: {
      twin: 1,
      sniper: 2,
      flank: 3,
      "mechiane gun": 4,
    },
    cannons: [
      {
        type: "trapezoid",
        "cannon-width-top": 55,
        "cannon-height": 40,
        "cannon-width-bottom": 50,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1.05,
        bulletSpeed: 0.9,
        delay: 0.1,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
      {
        type: "basicCannon",
        "cannon-width": 75,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 1,
      },
    ],
  },
  rammer: {
    "size-m": 1,
    "speed-m": 1.2,
    "damage-m": 1,
    "health-m": 1,
    fov: 1,
    "BodyDamage-m": 1,
    "reaload-m": 0.7,
    "regen-m": 1,
    upgradeLevel: 30,
    upgrades: ["twin", "sniper"],
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": -0.785398,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0.785398,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
    ],
  },
  traper: {
    "size-m": 1,
    "speed-m": 0.95,
    "damage-m": 1,
    fov: 1,
    "health-m": 0.95,
    "BodyDamage-m": 1,
    "regen-m": 1.1,
    "max-traps": 10,
    "reaload-m": 1.5,
    cannons: [
      {
        type: "trap",
        "cannon-width": 70,
        "cannon-height": 30,
        "trap-to-cannon-ratio": 0.8,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 1.5,
        delay: 0,
        reloadM: 1,
        "life-time": 10,
        bullet_pentration: 1.6,
      },
    ],
  },
  directer: {
    "size-m": 1,
    "speed-m": 1.05,
    "damage-m": 1,
    "health-m": 0.9,
    "regen-m": 1,
    fov: 1, // change later when fov is working
    "BodyDamage-m": 1,
    "reaload-m": 1.5,
    upgradeLevel: 15,
    upgrades: {
      twin: 1,
    },
    cannons: [
      {
        type: "directer",
        "cannon-width-top": 70,
        "cannon-height": 25,
        "cannon-width-bottom": 50,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        "max-drones": 6,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 1,
      },
    ],
  },
  autobasic: {
    "size-m": 1,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 1,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgradeLevel: 30,
    upgrades: {},
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 1,
      },
      {
        type: "autoCannon",
        "cannon-width": 35,
        "cannon-height": 15,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 0.8,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1.5,
        bullet_pentration: 0.9,
      },
    ],
  },
  autoduo: {
    "size-m": 1,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 1,
    AutoRoting: true,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgradeLevel: 30,
    upgrades: {},
    cannons: [
      {
        type: "SwivelAutoCannon",
        "cannon-width": 35,
        "cannon-height": 15,
        "offSet-x": "playerX",
        "offSet-x-multpliyer": -1,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 0.8,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1.5,
        bullet_pentration: 0.9,
      },
      {
        type: "SwivelAutoCannon",
        "cannon-width": 35,
        "cannon-height": 15,
        "offSet-x": "playerX",
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 0.8,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1.5,
        bullet_pentration: 0.9,
      },
    ],
  },
};

var levelmultiplyer = 1.2;
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

function calculateTriangleVertices(cx, cy, size, angle) {
  const height = sqrt23 * size;
  const halfSize = size / 2;

  // Convert the angle to radians
  const angleRad = angle * pi180;

  // Precalculate cos and sin of the angle to avoid repeating it
  const cosAngle = Math.cos(angleRad);
  const sinAngle = Math.sin(angleRad);

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
  const R = r;
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
var response = new SAT.Response();
// Function to check collision between circle and polygon using SAT.js

function normalizeAngle(angle) {
  return angle % 360;
}

function rotatePointAroundPlayer(cannonOffsetX, cannonOffsetY, playerRotation) {
  // Convert player rotation to radians for math
  const playerRotationRad = playerRotation * (Math.PI / 180);

  // Rotate cannon's offset position based on player rotation
  const rotatedX =
    cannonOffsetX * Math.cos(playerRotationRad) -
    cannonOffsetY * Math.sin(playerRotationRad);
  const rotatedY =
    cannonOffsetX * Math.sin(playerRotationRad) +
    cannonOffsetY * Math.cos(playerRotationRad);

  return [rotatedX, rotatedY];
}

// Check if the target angle is within the cannon's swivel range, accounting for player rotation
function isTargetInSwivelRange(
  playerRotation,
  targetAngle,
  logging,
  offset_degress
) {
  // Normalize player's rotation and target angle
  playerRotation = normalizeAngle(playerRotation + offset_degress);
  targetAngle = normalizeAngle(targetAngle);

  // Define the swivel range around the player's current rotation
  const minSwivelAngle = normalizeAngle(playerRotation - 85); // 90 degrees left of player
  const maxSwivelAngle = normalizeAngle(playerRotation + 85); // 90 degrees right of player

  // Check if the target is within the swivel range
  if (minSwivelAngle <= maxSwivelAngle) {
    return minSwivelAngle <= targetAngle && targetAngle <= maxSwivelAngle;
  } else {
    // Handle the case where angles wrap around 0°
    return targetAngle >= minSwivelAngle || targetAngle <= maxSwivelAngle;
  }
}

function isBulletCollidingWithPolygon(circle, polygonVertices) {
  var circleSAT;
  circleSAT = new SAT.Circle(new SAT.Vector(circle.x, circle.y), circle.size);
  const polygonSAT = toSATPolygon(polygonVertices);
  var collided = SAT.testCirclePolygon(circleSAT, polygonSAT);
  return collided;
}

function isPlayerCollidingWithPolygon(circle, polygonVertices) {
  response.clear();
  var circleSAT;
  circleSAT = new SAT.Circle(
    new SAT.Vector(circle.x, circle.y),
    circle.size * 40
  );
  const polygonSAT = toSATPolygon(polygonVertices);
  var collided = SAT.testCirclePolygon(circleSAT, polygonSAT, response);
  return [collided, response];
}

function finder_(data) {
  let index___ = autocannons.findIndex(
    (cannon) => data._cannon.CannonID === cannon.CannonID
  );
  if (index___ !== -1) {
    let cannon = autocannons[index___];
    return [cannon, index___];
  }
  return undefined;
}

for (let i = 0; i < getRandomInt(400, 500); i++) {
  let x = getRandomInt(-5000, 5000);
  let y = getRandomInt(-5000, 5000);
  for (let j = 0; j < cors_taken.length; j++) {
    if (
      between(x, cors_taken[j].x - 50, cors_taken[j].x + 50) &&
      between(y, cors_taken[j].y - 50, cors_taken[j].y + 50)
    ) {
      x = getRandomInt(-5000, 5000);
      y = getRandomInt(-5000, 5000);
    }
  }
  cors_taken.push({ x: x, y: y });
  const valueOp__A = getRandomInt(1, 16);
  var type = "";
  var color = "";
  var health_max = "";
  var score_add = 0;
  var body_damage = 0;
  switch (true) {
    case between(valueOp__A, 1, 9): // Adjusted to 1-6 for square
      type = "square";
      color = "Gold";
      health_max = 10;
      score_add = 10;
      body_damage = 2;
      break;
    case between(valueOp__A, 10, 13): // Adjusted to 7-8 for triangle
      type = "triangle";
      color = "Red";
      health_max = 15;
      score_add = 15;
      body_damage = 3.5;
      break;
    case between(valueOp__A, 14, 15): // Adjusted to 9-10 for pentagon
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

for (let i = 0; i < getRandomInt(25, 50); i++) {
  let x = getRandomInt(-1000, 1000);
  let y = getRandomInt(-1000, 1000);
  for (let j = 0; j < cors_taken.length; j++) {
    if (
      between(x, cors_taken[j].x - 50, cors_taken[j].x + 50) &&
      between(y, cors_taken[j].y - 50, cors_taken[j].y + 50)
    ) {
      x = getRandomInt(-1000, 1000);
      y = getRandomInt(-1000, 1000);
    }
  }
  cors_taken.push({ x: x, y: y });
  const valueOp = getRandomInt(1, 10);
  var type = "";
  var color = "";
  var health_max = "";
  var score_add = 0;
  var body_damage = 0;

  type = "pentagon";
  color = "#579bfa";
  health_max = 100;
  score_add = 120;
  body_damage = 4;
  if (valueOp === 5) {
    var size = 150;
    score_add = 3000;
    health_max = 1000;
    body_damage = 9;
  } else {
    var size = 50;
  }

  let fooditem = {
    type: type,
    health: health_max,
    maxhealth: health_max,
    size: size,
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
    "respawn-raidis": 1000,
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

function generateRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function rearrange() {
  if (leader_board.shown.length <= 1) {
    return;
  }
  leader_board.shown.sort(function (a, b) {
    return a.score - b.score;
  });
  leader_board.shown.reverse(); // huh
}

var angle = 0;

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

var serverseed = crypto.randomUUID();

var invaled_requests = [];

const UPDATE_INTERVAL = 75;
let speed = 0.00001;
const connections = [];

wss.on("connection", (socket) => {
  let connection = { socket: socket, playerId: null };
  let handshaked = false;
  connections.push(connection);

  socket.on("message", (message) => {
    const { type, data } = JSON.parse(message);

    if (type === "newPlayer") {
      players[data.id] = data;
      connection.playerId = data.id; // bind call
      console.log(players);
      emit("playerJoined", data); // Emit playerJoined event to notify all clients
      emit("FoodUpdate", food_squares); // Emit FoodUpdate event to update food squares
      emit("autoCannonUPDATE-ADD", autocannons);
      emit("colorUpgrades", ColorUpgrades);
      emit("Levels", levels);
      leader_board.hidden.push({ id: data.id, score: 0, name: data.username });
      if (!leader_board.shown[10]) {
        leader_board.shown.push({ id: data.id, score: 0, name: data.username });
      }
      if (leader_board.shown[10]) {
        if (0 > leader_board.shown[10].score) {
          leader_board.shown.push({
            id: data.id,
            score: 0,
            name: data.username,
          });
        }
        if (0 > leader_board.shown[10].score) {
          leader_board.shown[10] = {
            id: data.id,
            score: 0,
            name: data.username,
          };
        }
      }
      emit("boardUpdate", leader_board.shown);

      return;
    }

    if (type === "HANDSHAKE") {
      if (handshaked) return;
      (function () {
        handshaked = true;
        const handshake =
          Date.now() +
          "-" +
          (Math.floor(Math.random() * 1000) +
            Date.now() * Math.random() +
            Date.now() / 1387 +
            Math.random()) *
            serverseed;
        socket.send(JSON.stringify({ type: "handshake", data: handshake }));
      })();
      return;
    }

    if (type === "updatePlayer") {
      emit("playerUpdated", data); // Emit playerUpdated event if needed
      return;
    }

    if (type === "autoCannonADD") {
      autocannons.push(data);
      let cannosplayer = tankmeta[players[data.playerid].__type__].cannons;
      let cannonamountplayer = Object.keys(cannosplayer).length;
      let find = function () {
        let cannons = 0;
        autocannons.forEach((cannon) => {
          if (cannon.playerid === data.playerid) {
            if (
              cannon._type_ === "autoCannon" ||
              cannon._type_ === "SwivelAutoCannon"
            ) {
              cannons += 1;
            }
          }
        });
        return cannons;
      };
      let index = find();
      let autoindex = cannonamountplayer - index;
      let cannon__index = autocannons.indexOf(data);
      let cannon = autocannons[cannon__index];
      cannon.autoindex = autoindex;
      emit("autoCannonUPDATE-ADD", autocannons);
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
      players[data.id].cannonW = data.cannonW;
      broadcast(
        "playerCannonWidthUpdate",
        { id: data.id, cannonW: data.cannonW },
        socket
      );
      return;
    }

    if (type === "statUpgrade") {
      if (!players[data.id]) return;
      var upgradetype = data.Upgradetype;

      players[data.id].statsTree[data.Upgradetype] += data.UpgradeLevel;

      if (upgradetype === "health") {
        players[data.id].health =
          (players[data.id].health / 2) * levelmultiplyer;
        players[data.id].maxhealth =
          players[data.id].maxhealth * levelmultiplyer;
      } else if (upgradetype === "Regen") {
        let Regen = players[data.id].statsTree[data.Upgradetype];
        let Regenspeed = 30 - 30 * (Regen / 10);
        players[data.id].Regenspeed = Regenspeed;
        emit("healerRestart", { id: data.id, Regenspeed: Regenspeed });
      } else if (upgradetype === "Body Damage") {
        players[data.id].bodyDamage *= levelmultiplyer;
      } else if (upgradetype === "Speed") {
        players[data.id].speed *= levelmultiplyer;
      }

      broadcast("statsTreeRestart", {
        stats: players[data.id].statsTree,
        id: data.id,
      });

      if (
        upgradetype !== "Bullet Pentration" ||
        upgradetype !== "Bullet Speed" ||
        upgradetype !== "Bullet Damage"
      ) {
        emit("UpdateStatTree", {
          id: data.id,
          StatUpgradetype: upgradetype,
          levelmultiplyer: levelmultiplyer,
          doUpgrade: false,
        });
      } else {
        emit("UpdateStatTree", {
          id: data.id,
          StatUpgradetype: upgradetype,
          levelmultiplyer: levelmultiplyer,
          doUpgrade: true,
        });
      }
      return;
    } //

    if (type === "auto-x-update") {
      autocannons.forEach((cannon) => {
        if (cannon.CannonID === data.autoID) {
          if (cannon._type_ === "SwivelAutoCannon") {
            var tankdatacannondata =
              tankmeta[players[cannon.playerid].__type__].cannons[
                cannon.autoindex
              ];
            var offSet_x = tankdatacannondata["offSet-x"];
            if (tankdatacannondata["offSet-x"] === "playerX") {
              offSet_x = players[cannon.playerid].size * 40;
            }
            if (tankdatacannondata["offSet-x-multpliyer"]) {
              offSet_x *= -1;
            }
            var [X, Y] = rotatePointAroundPlayer(offSet_x, 0, data.angle);
            cannon["x_"] = -X;
            cannon["y_"] = -Y;
          }
        }
      });
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
        let size__ = player.size * 80 + item.size * 1.5;
        if (!(distanceX < size__ && distanceY < size__)) return true;

        var collisionCheck = isPlayerCollidingWithPolygon(
          player,
          item.vertices
        );

        if (collisionCheck[0]) {
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

          emit("bouceBack", { response: collisionCheck, playerID: player.id });
          if (0 > item.health) {
            player.score += item.score_add;
            emit("playerScore", {
              bulletId: player.id,
              socrepluse: item.score_add,
            });
            leader_board.hidden.forEach((__index__) => {
              if (__index__.id === player.id) {
                __index__.score += item.score_add;
                let isshown = false;
                leader_board.shown.forEach(() => {
                  if (__index__.id === player.id) {
                    isshown = true;
                  }
                });
                if (leader_board.shown[10]) {
                  if (leader_board.shown[10].score < __index__.score) {
                    leader_board.shown[10] = __index__;
                  }
                } else if (!leader_board.shown[10] && !isshown) {
                  leader_board.shown.push(__index__);
                }
              }
            });
            leader_board.shown.forEach((__index__) => {
              if (__index__.id === player.id) {
                __index__.score += item.score_add;
              }
            });
            rearrange();
            emit("boardUpdate", {
              leader_board: leader_board.shown,
            });

            let respawnrai = item["respawn-raidis"] || 4500;
            let x, y;
            do {
              x = getRandomInt(-respawnrai, respawnrai);
              y = getRandomInt(-respawnrai, respawnrai);
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
            if (!item["respawn-raidis"]) {
              switch (true) {
                case between(valueOp, 1, 10): // Adjusted to 1-6 for square
                  type = "square";
                  color = "Gold";
                  health_max = 10;
                  score_add = 10;
                  body_damage = 2;
                  break;
                case between(valueOp, 11, 13): // Adjusted to 7-8 for triangle
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
            } else {
              const valueOp2 = getRandomInt(1, 10);

              type = "pentagon";
              color = "#579bfa";
              health_max = 100;
              score_add = 120;
              body_damage = 4;
              if (valueOp2 === 5) {
                var size = 150;
                score_add = 3000;
                health_max = 1000;
                body_damage = 9;
              } else {
                var size = 50;
              }
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

    if (type === "Autofire") {
      let maxdistance = 5000;
      let fire_at = null;
      let cannon = data.cannon;
      for (const playerID in players) {
        let player = players[playerID];
        if (playerID !== data.playerId) {
          var distance = MathHypotenuse(player.x - data.x, player.y - data.y);
          if (distance < maxdistance) {
            let angle = Math.atan2(
              player.y - players[data.playerId].y, // y difference
              player.x - players[data.playerId].x // x difference
            );
            if (
              tankmeta[players[data.playerId].__type__]["cannons"][
                data.extracannon_
              ].type === "SwivelAutoCannon"
            ) {
              if (
                tankmeta[players[data.playerId].__type__]["cannons"][
                  data.extracannon_
                ]["offSet-x-multpliyer"] === -1
              ) {
                if (
                  isTargetInSwivelRange(
                    players[data.playerId].cannon_angle,
                    (angle * 180) / pi,
                    true,
                    180
                  )
                ) {
                  maxdistance = distance;
                  fire_at = player;
                }
              } else {
                if (
                  isTargetInSwivelRange(
                    players[data.playerId].cannon_angle,
                    (angle * 180) / pi,
                    true,
                    0
                  )
                ) {
                  maxdistance = distance;
                  fire_at = player;
                }
              }
            } else {
              maxdistance = distance;
              fire_at = player;
            }
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
            let angle = Math.atan2(
              item.y - players[data.playerId].y, // y difference
              item.x - players[data.playerId].x // x difference
            );
            if (
              tankmeta[players[data.playerId].__type__]["cannons"][
                data.extracannon_
              ].type === "SwivelAutoCannon"
            ) {
              if (
                tankmeta[players[data.playerId].__type__]["cannons"][
                  data.extracannon_
                ]["offSet-x-multpliyer"] === -1
              ) {
                if (
                  isTargetInSwivelRange(
                    players[data.playerId].cannon_angle,
                    (angle * 180) / pi,
                    true,
                    180
                  )
                ) {
                  maxdistance = distance;
                  fire_at = item;
                }
              } else {
                if (
                  isTargetInSwivelRange(
                    players[data.playerId].cannon_angle,
                    (angle * 180) / pi,
                    true,
                    0
                  )
                ) {
                  maxdistance = distance;
                  fire_at = item;
                }
              }
            } else {
              maxdistance = distance;
              fire_at = item;
            }
          }
        });
      }
      let speedUP = 0;
      if (fire_at === null) return;

      let cannon_life = cannon["life-time"] || 0;
      if (players[data.playerId].statsTree["Bullet Speed"] !== 1) {
        speedUP =
          players[data.playerId].statsTree["Bullet Speed"] * levelmultiplyer;
      }

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
      } else if (
        cannon["type"] === "autoCannon" ||
        cannon["type"] === "SwivelAutoCannon"
      ) {
        var bulletdistance =
          (bullet_speed__ + speedUP) * 100 * (data.bullet_size / 6);
        var __type = "basic";
        var health = 8;
      }
      let angle = Math.atan2(
        fire_at.y - data.playerY, // y difference
        fire_at.x - data.playerX // x difference
      );

      let bullet_size_l = data.bullet_size * cannon["bulletSize"];

      let randomNumber = generateRandomNumber(-0.2, 0.2);

      var offSet_x = cannon["offSet-x"];
      if (cannon["offSet-x"] === "playerX") {
        offSet_x = (players[data.playerId].size / 2) * 40;
      }

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
      } else if (
        cannon["type"] === "autoCannon" ||
        cannon["type"] === "SwivelAutoCannon"
      ) {
        var xxx = cannon["cannon-width"] - bullet_size_l * 0.2;
        var yyy = cannon["cannon-height"] - bullet_size_l * 1.2;
        var angle_ = angle + cannon["offset-angle"];
      }

      let rotated_offset_x =
        (offSet_x + xxx) * Math.cos(angle_) -
        (cannon["offSet-y"] + yyy) * Math.sin(angle_);
      let rotated_offset_y =
        (offSet_x + xxx) * Math.sin(angle_) +
        (cannon["offSet-y"] + yyy) * Math.cos(angle_);
      let bullet_start_x = data.playerX + rotated_offset_x;
      let bullet_start_y = data.playerY + rotated_offset_y;
      // lol
      let identdfire = Date.now() + Math.random();
      let damageUP = 0;
      if (players[data.playerId].statsTree["Bullet Damage"] !== 1) {
        damageUP =
          (players[data.playerId].statsTree["Bullet Damage"] *
            levelmultiplyer) /
          (data.bullet_damage ** 2 / (data.bullet_damage / 10));
      }
      let PentrationPluse = 0;
      if (players[data.playerId].statsTree["Bullet Pentration"] !== 1) {
        PentrationPluse =
          players[data.playerId].statsTree["Bullet Pentration"] *
          levelmultiplyer;
      }

      let bullet = {
        type: __type,
        bullet_distance: bulletdistance,
        speed: bullet_speed__ + speedUP,
        size: bullet_size_l,
        angle: angle_,
        bullet_damage: data.bullet_damage * cannon["bulletSize"] + damageUP,
        distanceTraveled: 0,
        vertices: null,
        bullet_pentration:
          data.bullet_pentration * cannon["bullet_pentration"] +
          PentrationPluse,
        x: bullet_start_x,
        y: bullet_start_y,
        lifespan: cannon_life,
        health: health,
        xstart: data.playerX,
        ystart: data.playerY,
        id: data.playerId,
        uniqueid: identdfire,
        Zlevel: 2,
      };

      bullets.push(bullet);
      var [_index_, CO] = finder_(data);
      /*autocannons[CO].angle = angle_;
      emit("autoCannonUPDATE-ANGLE", {
        angle: angle_,
        cannon_ID: data._cannon.CannonID,
      });*/
      return;
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
      if (!players[data.playerID]) {
        invaled_requests.push(data.playerID);
        return;
      }

      broadcast("statechangeUpdate", data, socket);
      return;
    }

    if (type === "getTankMeta") {
      socket.send(JSON.stringify({ type: "RETURNtankmeta", data: tankmeta }));
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
      if (!players[data.ID]) {
        invaled_requests.push(data.ID);
        return;
      }
      players[data.ID].maxhealth = data.maxhealth;
      players[data.ID].playerHealTime = data.playerHealTime;
      emit("updaterHeal", { ID: data.ID, HEALTime: data.playerHealTime });
      if (
        data.playerHealTime > players[data.ID].Regenspeed &&
        players[data.ID].health < players[data.ID].maxhealth
      ) {
        emit("playerHealing", {
          playerID: data.ID,
          playerHealTime: data.playerHealTime,
        });

        let healer = setInterval(function () {
          if (!players[data.ID]) {
            clearInterval(healer);
            return;
          }
          players[data.ID].health += players[data.ID].playerReheal;
          if (players[data.ID].health >= players[data.ID].maxhealth) {
            players[data.ID].health = players[data.ID].maxhealth;
            clearInterval(healer);
          }
          if (players[data.ID].playerHealTime < players[data.ID].Regenspeed) {
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
        return;
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

    if (type === "deletAuto") {
      autocannons.filter((cannons___0_0) => {
        if (cannons___0_0.playerid === connection.playerId) {
          return false;
        }
        return true;
      });
      return;
    }

    if (type === "bulletFired") {
      if (!players[data.id]) return;

      let damageUP = 0;
      if (players[data.id].statsTree["Bullet Damage"] !== 1) {
        damageUP =
          (players[data.id].statsTree["Bullet Damage"] * levelmultiplyer) /
          (data.bullet_damage ** 2 / (data.bullet_damage / 5));
        data.bullet_damage += damageUP;
      }
      let PentrationPluse = 0;
      if (players[data.id].statsTree["Bullet Pentration"] !== 1) {
        PentrationPluse =
          players[data.id].statsTree["Bullet Pentration"] * levelmultiplyer;
        data.bullet_pentration += PentrationPluse;
      }
      let speedUP = 0;
      if (players[data.id].statsTree["Bullet Speed"] !== 1) {
        speedUP = players[data.id].statsTree["Bullet Speed"] * levelmultiplyer;
        data.speed += speedUP;
      }
      bullets.push(data);
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
      leader_board.shown.forEach((__index__) => {
        if (__index__.id === connection.playerId) {
          leader_board.shown.splice(leader_board.shown.indexOf(__index__));
        }
      });
      leader_board.hidden.forEach((__index__) => {
        if (__index__.id === connection.playerId) {
          leader_board.hidden.splice(leader_board.hidden.indexOf(__index__));
        }
      });
      emit("boardUpdate", {
        leader_board: leader_board.shown,
      });
      emit("leader_board_update", leader_board.shown);
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
    leader_board.shown.forEach((__index__) => {
      if (__index__.id === connection.playerId) {
        leader_board.shown.splice(leader_board.shown.indexOf(__index__));
      }
    });
    leader_board.hidden.forEach((__index__) => {
      if (__index__.id === connection.playerId) {
        leader_board.hidden.splice(leader_board.hidden.indexOf(__index__));
      }
    });
    emit("leader_board_update", leader_board.shown);
    players = Object.entries(players).reduce((newPlayers, [key, value]) => {
      if (key !== connection.playerId) {
        newPlayers[key] = value;
      }
      return newPlayers;
    }, {});
    autocannons = autocannons.filter((cannons___0_0) => {
      return connection.playerId !== cannons___0_0.playerid;
    });
    emit("autoCannonUPDATE-ADD", autocannons);
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
        bullet.speed -= (bullet.bullet_distance - bullet.distanceTraveled) / 85;
        if (bullet.speed <= 0) bullet.speed = 0;
      }

      bullets.forEach((bullet_) => {
        let distance = MathHypotenuse(
          bullet.x - bullet_.x,
          bullet.y - bullet_.y
        );

        if (distance > 50) return;
        var bullet_speed = bullet.speed;

        if (
          distance < bullet.size * 2 + bullet_.size * 2 &&
          bullet.id !== bullet_.id
        ) {
          if (
            bullet_speed !== 0 &&
            bullet_speed !== 0 &&
            (!bullet_.speed || !bullet_speed) &&
            bullet.type === "trap"
          )
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
          bullet.type === bullet_.type &&
          bullet_speed !== 0 &&
          bullet_speed !== 0
        ) {
          newX__ = bullet.size * -0.9 * Math.sin(bullet.angle - bullet_.angle);
          newY__ = bullet.size * -0.9 * Math.cos(bullet.angle - bullet_.angle);
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
    } else {
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
          bullet.bullet_distance -=
            bullet_.speed *
            (bullet_.size / 5 +
              Math.cos(Math.abs(bullet.angle - bullet_.angle)));
        }
      });
    }
    if (
      bullet.bullet_distance - bullet.distanceTraveled < 10 &&
      bullet.bullet_distance > 20 &&
      bullet.type !== "directer"
    ) {
      bullet.transparency =
        (bullet.bullet_distance - bullet.distanceTraveled) / 10;
    } else if (bullet.bullet_distance < 10) {
      bullet.transparency = bullet.bullet_distance / 10;
    }

    for (const playerId in players) {
      var player = players[playerId];
      var distance = MathHypotenuse(player.x - bullet.x, player.y - bullet.y);
      let player40 = player.size * 40;

      let bulletsize = bullet.size;

      if (distance < player40 + bullet.size && bullet.id !== player.id) {
        if (bullet.type === "trap") {
          player.health -=
            (bullet.bullet_damage - 3.8) / (player.size + 6 / bullet.size + 3);
          bullet.bullet_distance /=
            bullet.size / (bullet.bullet_pentration + 10);
        } else if (bullet.type === "directer") {
          player.health -=
            (bullet.bullet_damage - 4.4) / (player.size + 6 / bullet.size + 5);
          bullet.bullet_distance /=
            bullet.size / (bullet.bullet_pentration + 10);
        } else {
          player.health -=
            (bullet.bullet_damage - 3.8) / (player.size + 6 / bullet.speed);
          bullet.bullet_distance -=
            bullet.size / (bullet.bullet_pentration + 10);
        }

        emit("bulletDamage", {
          playerID: player.id,
          playerHealth: player.health,
          BULLETS: bullets,
        });
        if (player.health <= 0) {
          try {
            var reward = Math.round(
              player.score / (20 + players[bullet.id].score / 10000)
            );
          } catch (e) {
            console.log(bullet.id);
          }
          emit("playerScore", { bulletId: bullet.id, socrepluse: reward });
          emit("playerDied", {
            playerID: player.id,
            rewarder: bullet.id,
            reward: reward,
          });
          leader_board.hidden.forEach((__index__) => {
            if (__index__.id === bullet.id) {
              __index__.score += reward;
              let isshown = false;
              leader_board.shown.forEach(() => {
                if (__index__.id === bullet.id) {
                  isshown = true;
                }
              });
              if (leader_board.shown[10]) {
                if (leader_board.shown[10].score < __index__.score) {
                  leader_board.shown[10] = __index__;
                }
              } else if (!leader_board.shown[10] && !isshown) {
                leader_board.shown.push(__index__);
              }
            }
          });
          leader_board.shown.forEach((__index__) => {
            if (__index__.id === bullet.id) {
              __index__.score += reward;
            }
          });
          rearrange();
          emit("boardUpdate", {
            leader_board: leader_board.shown,
          });
          console.log("player kill --", leader_board);
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

  autocannons.forEach((cannon) => {
    let maxdistance = 5000;
    let fire_at__ = null;
    let target_enity_type = null;
    let tankdatacannon__ =
      tankmeta[players[cannon.playerid].__type__]["cannons"];
    for (const playerID in players) {
      let player = players[playerID];
      if (playerID !== cannon.playerid && players[cannon.playerid]) {
        var offSet_x = tankdatacannon__[cannon.autoindex]["offSet-x"];
        if (tankdatacannon__[cannon.autoindex]["offSet-x"] === "playerX") {
          offSet_x = players[cannon.playerid].size * 40;
        }
        if (tankdatacannon__[cannon.autoindex]["offSet-x-multpliyer"]) {
          offSet_x *= -1;
        }
        var distance = MathHypotenuse(
          player.x - (players[cannon.playerid].x + offSet_x),
          player.y - players[cannon.playerid].y
        );
        if (distance < maxdistance) {
          maxdistance = distance;
          fire_at__ = player;
          target_enity_type = "player";
        }
      }
    }
    if (maxdistance > 1300) {
      food_squares.forEach((item) => {
        var offSet_x = tankdatacannon__[cannon.autoindex]["offSet-x"];
        if (tankdatacannon__[cannon.autoindex]["offSet-x"] === "playerX") {
          offSet_x = players[cannon.playerid].size * 40;
        }
        if (tankdatacannon__[cannon.autoindex]["offSet-x-multpliyer"]) {
          offSet_x *= -1;
        }
        if (cannon["x_"]) {
          var distance = MathHypotenuse(
            item.x - (players[cannon.playerid].x + cannon["x_"]),
            item.y - (players[cannon.playerid].y + cannon["y_"])
          );
        } else {
          var distance = MathHypotenuse(
            item.x - (players[cannon.playerid].x + offSet_x),
            item.y - players[cannon.playerid].y
          );
        }
        if (distance < maxdistance) {
          if (cannon._type_ === "SwivelAutoCannon") {
            var angle = Math.atan2(
              item.y - (players[cannon.playerid].y), // y difference
              item.x - (players[cannon.playerid].x) // x difference
            );
          } else {
            var angle = Math.atan2(
              item.y - players[cannon.playerid].y, // y difference
              item.x - (players[cannon.playerid].x + offSet_x) // x difference
            );
          }

          var playerRadangle = (players[cannon.playerid].angle * pi) / 180;
          
          if (cannon._type_ === "SwivelAutoCannon") {
            if (
              tankmeta[players[cannon.playerid].__type__]["cannons"][
                cannon.autoindex
              ]["offSet-x-multpliyer"] === -1
            ) {
              if (
                isTargetInSwivelRange(
                  players[cannon.playerid].cannon_angle,
                  angle * (180/pi),
                  true,
                  180
                )
              ) {
                maxdistance = distance;
                fire_at__ = item;
                target_enity_type = "food";
              }
            } else {
              if (
                isTargetInSwivelRange(
                  players[cannon.playerid].cannon_angle,
                  angle * (180/pi),
                  true,
                  0
                )
              ) {
                maxdistance = distance;
                fire_at__ = item;
                target_enity_type = "food";
              }
            }
          } else {
            maxdistance = distance;
            fire_at__ = item;
            target_enity_type = "food";
          }
        }
      });
    }
    if (target_enity_type === "player" && fire_at__) {
      if (cannon.targetID !== fire_at__.playerId) {
        if (cannon.angle < cannon.targetAngle) {
          cannon.angle += (cannon.targetAngle - cannon.angle) / 5;
        } else if (cannon.angle > cannon.targetAngle) {
          cannon.angle -= (cannon.angle - cannon.targetAngle) / 5;
        }
      }
    }
    if (target_enity_type === "food" && fire_at__) {
      if (
        cannon.angle < cannon.targetAngle &&
        Math.abs(cannon.angle - cannon.targetAngle) > 0.1
      ) {
        cannon.angle += Math.abs(cannon.angle - cannon.targetAngle) / 4.5;
        emit("autoCannonUPDATE-ANGLE", {
          angle: cannon.angle,
          cannon_ID: cannon.CannonID,
        });
      } else if (
        cannon.angle > cannon.targetAngle &&
        Math.abs(cannon.angle - cannon.targetAngle) > 0.1
      ) {
        cannon.angle -= Math.abs(cannon.angle - cannon.targetAngle) / 4.5;
        emit("autoCannonUPDATE-ANGLE", {
          angle: cannon.angle,
          cannon_ID: cannon.CannonID,
        });
      }
    }
    if (fire_at__ !== undefined && fire_at__ !== null) {
      
      var angle = Math.atan2(
        fire_at__.y - (players[cannon.playerid].y), // y difference
        fire_at__.x - (players[cannon.playerid].x) // x difference
      );

      cannon.targetAngle = angle;
      cannon.targetEntity = fire_at__;
      if (target_enity_type === "player") {
        cannon.targetID = fire_at__.playerId;
      }
      if (target_enity_type === "food") {
        cannon.targetID = fire_at__.randomID;
      }
    }
  });

  // Emit updated bullet positions
  emit("bulletUpdate", bullets);

  food_squares = food_squares.filter((item, index) => {
    item.x = item.centerX + item.scalarX * Math.cos(angle);
    item.y = item.centerY + item.scalarY * Math.sin(angle);
    if (item.type === "pentagon") {
      item.angle += 0.25;
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
    if (item.isdead) {
      item.transparency = 1 - (Date.now() - item.deathtime) / 150;
    }
    bullets.forEach((bullet) => {
      let distance = MathHypotenuse(item.x - bullet.x, item.y - bullet.y);
      if (distance < 400) {
        let collisionCheck = isBulletCollidingWithPolygon(
          bullet,
          item.vertices
        );

        if (bullet.type === "trap") {
          var bulletSpeed = 4;
        } else {
          var bulletSpeed = bullet.speed || 0;
        }

        if (!collisionCheck) return;
        const damage =
          (bullet.bullet_damage * 4) / (item.size / bulletSpeed) +
          bullet.bullet_pentration;

        if (damage > item.health) {
          if (!players[bullet.id]) {
            console.log(bullet.id);
            console.log(players);
            return;
          }
          players[bullet.id].score += item.score_add;
          leader_board.hidden.forEach((__index__) => {
            if (__index__.id === bullet.id) {
              __index__.score += item.score_add;
              let isshown = false;
              leader_board.shown.forEach(() => {
                if (__index__.id === bullet.id) {
                  isshown = true;
                }
              });
              if (leader_board.shown[10]) {
                if (leader_board.shown[10].score < __index__.score) {
                  leader_board.shown[10] = __index__;
                }
              } else if (!leader_board.shown[10] && !isshown) {
                leader_board.shown.push(__index__);
              }
            }
          });
          leader_board.shown.forEach((__index__) => {
            if (__index__.id === bullet.id) {
              __index__.score += item.score_add;
            }
          });
          rearrange();
          emit("boardUpdate", {
            leader_board: leader_board.shown,
          });
          emit("playerScore", {
            bulletId: bullet.id,
            socrepluse: item.score_add,
          });

          let respawnrai = item["respawn-raidis"] || 4500;
          let x, y;
          do {
            x = getRandomInt(-respawnrai, respawnrai);
            y = getRandomInt(-respawnrai, respawnrai);
          } while (
            cors_taken.some(
              (c) =>
                between(x, c.x - 50, c.x + 50) && between(y, c.y - 50, c.y + 50)
            )
          );

          cors_taken.push({ x, y });

          const valueOp = getRandomInt(1, 15);
          var type = "";
          var color = "";
          var health_max = "";
          var score_add = 0;
          var body_damage = 0;
          if (!item["respawn-raidis"]) {
            switch (true) {
              case between(valueOp, 1, 10): // Adjusted to 1-6 for square
                type = "square";
                color = "Gold";
                health_max = 10;
                score_add = 10;
                body_damage = 2;
                break;
              case between(valueOp, 11, 13): // Adjusted to 7-8 for triangle
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
          } else {
            const valueOp2 = getRandomInt(1, 10);

            type = "pentagon";
            color = "#579bfa";
            health_max = 100;
            score_add = 120;
            body_damage = 4;
            if (valueOp2 === 5) {
              var size = 150;
              score_add = 3000;
              health_max = 1000;
              body_damage = 9;
            } else {
              var size = 50;
            }
          }
          if (!item["respawn-raidis"]) {
            var fooditem__XX = {
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
          }
          if (item["respawn-raidis"]) {
            var fooditem__XX = {
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
              "respawn-raidis": 1000,
            };
          }

          if (type === "triangle") {
            const rawvertices = calculateTriangleVertices(
              fooditem__XX.x,
              fooditem__XX.y,
              fooditem__XX.size,
              fooditem__XX.angle
            );
            fooditem__XX.vertices = rawvertices;
          } //
          if (type === "pentagon") {
            const rawvertices = calculateRotatedPentagonVertices(
              fooditem__XX.x,
              fooditem__XX.y,
              fooditem__XX.size,
              fooditem__XX.angle
            );
            fooditem__XX.vertices = rawvertices;
          }
          if (type === "square") {
            const rawvertices = calculateSquareVertices(
              fooditem__XX.x,
              fooditem__XX.y,
              fooditem__XX.size,
              fooditem__XX.angle
            );
            fooditem__XX.vertices = rawvertices;
          }

          food_squares.push(fooditem__XX);
          bullet.bullet_distance -=
            (bullet.size * 40) / bullet.bullet_pentration +
            bullet.size * 3 +
            40;
          if (bullet.bullet_pentration > item.size) {
            if (bullet.type === "triangle") {
              bullet.angle *= 5;
            }
          }
          emit("bulletUpdate", bullets);
          //emit("FoodUpdate", food_squares);

          if (!item.isdead) {
            item.deathtime = Date.now();
            item.isdead = true;
          }

          return_ = false;
        } else {
          item.health -= damage;

          if (bullet.bullet_pentration > item.size) {
            if (bullet.type === "triangle") {
              bullet.angle *= 5;
            }
          }
        }
        bullet.bullet_distance -=
          (bullet.size * 40) / bullet.bullet_pentration + bullet.size * 3 + 40;

        bullet.bullet_distance -= 1; // for drones
        if (
          bullet.bullet_distance - bullet.distanceTraveled < 10 &&
          bullet.bullet_distance > 20 &&
          bullet.type !== "directer"
        ) {
          bullet.transparency =
            (bullet.bullet_distance - bullet.distanceTraveled) / 10;
        } else if (bullet.bullet_distance < 10) {
          bullet.transparency = bullet.bullet_distance / 10;
        }
      }
    });
    if (return_ === true && !(item.isdead === true)) {
      return return_;
    }
    if (item.isdead) {
      if (Date.now() >= item.deathtime + 150) {
        return false;
      }
    }
    if (item.isdead) {
      return true;
    }
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
