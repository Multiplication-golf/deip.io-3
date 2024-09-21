// lol you little kids can't mess with my game
(function () {
  var username = "Unamed tank";
  for (let i = 0; i < 125; i++) {
    for (let j = 0; j < 125; j++) {
      const div = document.createElement("div");
      div.style.width = "79px";
      div.style.height = "79px";
      div.style.backgroundColor = "white";
      div.style.border = "1px solid black";
      document.getElementById("grid").appendChild(div);
    }
  }
  function ongame() {
    // TODO:
    // add pentgons [DONE]
    // add reciol - [Done]
    // {added state changes} = DONE
    // fix level-up bug [done]
    // add (e) for atuo fire
    // add (c) for atuo rotaion
    // create new 15 level tank [start-bugfix]
    // add player shape collsion - {DONE}
    // add shape-shape collsion - lower pryority
    // create drone tank - lower pryority

    const socket =
      new /*skill issus are comming to my server mohaa ha ha*/ WebSocket(
        "https://deip-io3.glitch.me/"
      );

    let playerId = null; // Connect to the server
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.getElementById("game").appendChild(canvas);
    canvas.id = "myCanvas";
    canvas.style["z-index"] = "5";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";

    // 0.() values decrease
    // delay which cannon fires first
    var pi180 = Math.PI / 180;
    // reloed 0.() values increase
    var tankmeta = {
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
    }; // over right
    var grid = document.getElementById("grid");
    var types = [
      "basic",
      "twin",
      "flank",
      "sniper",
      "mechiane gun",
      "spreader",
      "rammer",
      "traper",
      "directer",
      "autobasic",
    ];

    var HANDSHAKE = { null: [{ null: null }] };

    var players = {};
    var boardbullets = [];
    var bullets = [];
    var food_list = [];
    var autocannons = [];
    var level = 0;
    var xp = 0;
    var FOV = 1; // senstive
    var autoFiring = false;
    var autoRotating = false;
    var autoAngle = 0;
    var playerX = canvas.width / 2;
    var playerY = canvas.height / 2;
    var cavansX = 0;
    var cavansY = 0;
    var dronetanks = ["directer"];
    var playerHealTime = 0;
    var playerHealth = 100;
    var playerSpeed = 10;
    var playerSize = 1;
    var bodyDamage = 3;
    var __type__ = "basic";
    var bullet_damage = 10;
    var bullet_speed = 4;
    var bullet_size = 15;
    var sqrt23 = Math.sqrt(3) / 2;
    var vertices = [];
    var cannonFireData = [true];
    var __reload__ = 1;
    var bullet_pentration = 2;
    var cannonWidth = [0];
    var drones = 0;
    var current_angle = 0;
    var MouseX_ = 0;
    var MouseY_ = 0;
    var mapLeft = -5000;
    var mapRight = 5000;
    var mapTop = -5000;
    var mapBottom = 5000;
    var playerMovementX = 0;
    var playerMovementY = 0;
    var score = 0;
    var firingIntervals = {};
    var barWidth = 600;
    var barHeight = 30;
    var borderRadius = 10;
    var playerReheal = 1;
    var maxhealth = 100;
    var state = "start";
    var statecycle = 0;
    var progress = 0.0;
    var gridstyle = grid.style;
    var boundrectcanvas = canvas.getBoundingClientRect();
    var canmove = true;
    var nolist = [3, 5, 7, 8, 10, 11, 13];
    var keysPressed = {};
    var vertices = [];
    var typeindex = 0;
    var canFire = true;
    var canFire2 = true;
    var firingInterval = null;
    var movementTimeouts = [];
    var canW = canvas.width;
    var canH = canvas.height;
    var squareColor = "grey";
    var levels = {
      level0: 11.0,
      level1: 17.0,
      level2: 29.0,
      level3: 47.0,
      level4: 71.0,
      level5: 103.0,
      level6: 144.0,
      level7: 193.0,
      level8: 253.0,
      level9: 323.0,
      level10: 405.0,
      level11: 501.0,
      level12: 611.0,
      level13: 737.0,
      level14: 880.0,
      level15: 1043.0,
      level16: 1228.0,
      level17: 1436.0,
      level18: 1669.0,
      level19: 1931.0,
      level20: 2224.0,
      level21: 2552.0,
      level22: 2917.0,
      level23: 3323.0,
      level24: 3776.0,
      level25: 4278.0,
      level26: 4836.0,
      level27: 5455.0,
      level28: 6140.0,
      level29: 6899.0,
      level30: 7739.0,
      level31: 8668.0,
      level32: 9695.0,
      level33: 10829.0,
      level34: 12082.0,
      level35: 13465.0,
      level36: 14992.0,
      level37: 16676.0,
      level38: 18534.0,
      level39: 20582.0,
      level40: 22840.0,
      level41: 25329.0,
      level42: 28072.0,
      level43: 31095.0,
      level44: 34424.0,
      level45: 38092.0,
      level46: 42131.0,
      level47: 46579.0,
      level48: 51477.0,
      level49: 56869.0,
      level50: 62806.0,
      level51: 69342.0,
      level52: 76536.0,
      level53: 84455.0,
      level54: 93170.0,
      level55: 102762.0,
      level56: 113318.0,
      level57: 124935.0,
      level58: 137719.0,
      level59: 151786.0,
      level60: 167264.0,
      level61: 100000000000000000000000000000000000000000000000000,
    };

    function getMousePos(canvas, evt) {
      const rect = boundrectcanvas;
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      };
    }

    function send(type, data) {
      socket.send(JSON.stringify({ type: type, data: data }));
    }

    function generateUniquePlayerId() {
      return "player-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    }
    function levelHANDLER() {
      let tonextlevel = levels["level" + level] - levels["level" + (level - 1)];
      progress =
        (score - levels["level" + (level - 1)]) /
        (levels["level" + level] - levels["level" + (level - 1)]);
      if (score / levels["level" + level] >= 1) {
        // Add transition property

        let tankdata = tankmeta[__type__];
        if (level === tankdata["upgradeLevel"]) {
          var tankstiles = document.getElementById("tanktiles");
          tankstiles.style.display = "block";
          tankstiles.style.left = 0;
          tankstiles.style.animation = "2s 1 move";
          var upgrade = tankdata["upgrades"];

          for (let i = 0; i < Object.keys(upgrade).length; i++) {
            var img__ = document.createElement("img");
            var tileImg = Object.values(upgrade)[i];
            tankstiles.appendChild(img__);

            img__.src = "tanktiles/" + tileImg + ".png";
            img__.style =
              "width: 6vw; height: 6vw; margin: 10px; z-index: 100;";

            img__.addEventListener("click", function () {
              event.stopPropagation();
              tankstiles.style.display = "none";
              __type__ = Object.keys(upgrade)[i];
              players[playerId].type = __type__;
              tankdata = tankmeta[__type__];
              var tankdatacannon__ = tankdata["cannons"];
              playerSize *= tankdata["size-m"];
              playerSpeed *= tankdata["speed-m"];
              bullet_damage *= tankdata["damage-m"];
              playerReheal *= tankdata["regen-m"];
              bodyDamage *= tankdata["BodyDamage-m"];
              maxhealth *= tankdata["health-m"];
              if (playerHealth > maxhealth) {
                playerHealth = maxhealth;
              }

              send("typeChange", {
                id: playerId,
                x: playerX,
                y: playerY,
                health: playerHealth,
                speed: playerSpeed,
                size: playerSize,
                bodyDamage: bodyDamage,
                cannonW: cannonWidth,
                cannonH: 0,
                __type__: __type__,
                cannon_angle: 0,
                score: score,
                username: username,
                level: level,
                state: state,
                statecycle: statecycle,
                playerHealTime: playerHealTime,
                maxhealth: maxhealth,
                playerReheal: playerReheal,
                FOV: FOV,
                MouseX: MouseX_,
                MouseY: MouseY_,
                screenWidth: canvas.width,
                screenHeight: canvas.height,
              });
              console.log(__type__)

              setTimeout(() => {
                cannonWidth = [];
                cannonFireData = [];
                for (let i = 0; i < Object.keys(tankdatacannon__).length; i++) {
                  cannonWidth.push(0);
                  cannonFireData.push(true);
                }
                autocannons.forEach((popcannon) => {
                  if (popcannon.playerid === playerId) {
                    send("deletAuto", { CannonID: popcannon.CannonID });
                  }
                });
                for (const cannon_ in tankdatacannon__) {
                  let cannon = tankdatacannon__[cannon_];
                  console.log(tankdatacannon__,cannon)
                  if (cannon.type === "autoCannon") {
                    let autoID = Math.random() * 1000 + Math.random() * 1000;
                    send("autoCannonADD", {
                      CannonID: autoID,
                      playerid: playerId,
                      angle: 0,
                      _type_: cannon.type,
                    });
                    let cannon__ = cannon;
                    let cannonINT;
                    let tankdata = tankmeta[__type__];
                    console.log(tankdata,tankdata["reaload-m"] * cannon["reloadM"] * __reload__,tankdata["reaload-m"] * cannon["reloadM"],750 * tankdata["reaload-m"] * cannon["reloadM"] * __reload__)
                    cannonINT = setInterval(() => {
                      var __tankdata__ = tankmeta[__type__];
                      console.log(cannon__.playerid,playerId)
                      console.log(cannon__)
                      if (cannon__.playerid === playerId) {
                        let cannon;
                        let index = 0;
                        for (const ___cannon___ in __tankdata__.cannons) {
                          let cannon___ = __tankdata__.cannons[___cannon___];
                          if (index === cannon__.autoindex) {
                            cannon = cannon___;
                          }
                          index++;
                        }
                        send("Autofire", {
                          playerId: playerId,
                          playerX: playerX,
                          playerY: playerY,
                          cannon: cannon,
                          bullet_damage: bullet_damage,
                          bullet_speed: bullet_speed,
                          bullet_size: bullet_size,
                          bullet_pentration: bullet_pentration,
                          _cannon: cannon__
                        });
                      }
                    }, 750 * tankdata["reaload-m"] * cannon["reloadM"] * __reload__);
                  }
                }
              }, 100);
            });
          }
        }
        level += 1;
        let tonextlevel =
          levels["level" + level] - levels["level" + (level - 1)];
        progress =
          (score - levels["level" + (level - 1)]) /
          (levels["level" + level] - levels["level" + (level - 1)]);
        playerSize += playerSize * 0.005;
        while (score / levels["level" + level] >= 1) {
          level += 1;
          playerSize += playerSize * 0.005;
          progress =
            (score - levels["level" + (level - 1)]) /
            (levels["level" + level] - levels["level" + (level - 1)]);
        }
      }
    }

    socket.onopen = function () {
      // new player or a skill issus
      setTimeout(() => {
        playerId = generateUniquePlayerId();

        const playerData = {
          id: playerId,
          x: playerX,
          y: playerY,
          health: playerHealth,
          speed: playerSpeed,
          size: playerSize,
          bodyDamage: bodyDamage,
          cannonW: cannonWidth,
          cannonH: 0,
          __type__: __type__,
          cannon_angle: 0,
          score: score,
          username: username,
          level: level,
          state: state,
          statecycle: statecycle,
          playerHealTime: playerHealTime,
          maxhealth: maxhealth,
          playerReheal: playerReheal,
          FOV: FOV,
          MouseX: MouseX_,
          MouseY: MouseY_,
          screenWidth: canvas.width,
          screenHeight: canvas.height,
        };

        // setup
        send("newPlayer", playerData);

        send("getFood", {});

        send("getTankMeta", {});

        send("HANDSHAKE", {});

        var masseg = document.getElementById("mesage");

        socket.onmessage = function (event) {
          const message = JSON.parse(event.data);

          const { type, data } = message;

          if (message.type === "playerUpdated") {
            players[data.id] = data; // Update the local player data
            console.log("Player updated:", data); // Log the update
          } else if (message.type === "RETURNtankmeta") {
            tankmeta = data;
            draw();
          } else if (type === "handshake") {
            HANDSHAKE = data;
          } else if (message.type === "updaterHeal") {
            if (!players[data.ID]) return;
            players[data.ID].playerHealTime = data.HEALTime;
          } else if (message.type === "playerHeal") {
            players[data.ID].health = data.HEALTH;
            if (data.ID === playerId) {
              playerHealth = data.HEALTH;
            } // Log the update
          } else if (message.type === "playerHealthCheck") {
            if (!(players[data.ID].health === data.HEALTH)) {
              players[data.ID].health = data.HEALTH;
              // yes hackty hackers you getting a waring
              setCookie("player", socket.id, 1000000);
              socket.emit("unSynched Health", {
                playerId: playerId,
                "expsected Health": data.HEALTH,
                "actual Health": players[data.ID].health,
              });
            }
          } else if (type === "autoCannonUPDATE-ADD") {
            autocannons = data;
          } else if (type === "autoCannonUPDATE-ANGLE") {
            autocannons.forEach((cannon_ooo) => {
              if (cannon_ooo.CannonID === data.CannonID) {
                cannon_ooo.angle = data.angle;
              }
            });
          } else if (message.type === "playerMoved") {
            players[data.id].x = data.x;
            players[data.id].y = data.y;
          } else if (message.type === "playerCannonUpdated") {
            players[data.id].cannon_angle = data.cannon_angle;
          } else if (message.type === "playerLeft") {
            let id = data.playerId;
            players = Object.entries(players).reduce(
              (newPlayers, [key, value]) => {
                if (key !== data["playerID"]) {
                  newPlayers[key] = value;
                }
                return newPlayers;
              },
              {}
            );
          } else if (message.type === "playerDied") {
            if (data["playerID"] === playerId) {
              document.getElementById("die").style.display = "block";
              document.getElementById("container").style.display = "none";
              document.getElementById("myCanvas").style.display = "none";
              clearInterval(healer);
              socket.onmessage = {};
              
              var old_element = document.body;
              var new_element = old_element.cloneNode(true);
              old_element.parentNode.replaceChild(new_element, old_element);
              let respawn = document.createElement("button");

              respawn.innerHTML = "Respawn";
              respawn.style.position = "absolute";
              respawn.style.top = "calc(50vh - 50px)";
              respawn.style.left = "calc(50vw - 100px)";
              respawn.style.width = "200px";
              respawn.style.height = "100px";
              document.getElementById("game").appendChild(respawn);
              respawn.addEventListener("click", () => {
                window.location.reload();
              });
            } else if (data["rewarder"] === playerId && data.reward) {
              score += data.reward;
            }

            players = Object.entries(players).reduce(
              (newPlayers, [key, value]) => {
                if (key !== data["playerID"]) {
                  newPlayers[key] = value;
                }
                return newPlayers;
              },
              {}
            );
          } else if (message.type === "playerDamaged") {
            players[data.player1.id].health = data.player1.health;
            if (data.player2.id === playerId) {
              playerHealth = data.player2.health;
              playerHealTime = 0;
              state = "damaged";
              statecycle = 0;
              send("statechange", {
                state: state,
                statecycle: statecycle,
                playerID: playerId,
              });
              setTimeout(() => {
                state = "normal";
                statecycle = 0;
                send("statechange", {
                  state: state,
                  statecycle: statecycle,
                  playerID: playerId,
                });
              }, 1000);
            }
            if (data.player1.id === playerId) {
              playerHealth = data.player1.health;
              playerHealTime = 0;
              state = "damaged";
              statecycle = 0;
              send("statechange", {
                state: state,
                statecycle: statecycle,
                playerID: playerId,
              });
              setTimeout(() => {
                state = "normal";
                statecycle = 0;
                send("statechange", {
                  state: state,
                  statecycle: statecycle,
                  playerID: playerId,
                });
              }, 1000);
            }
            players[data.player2.id].health = data.player2.health;
          } else if (message.type === "bulletUpdate") {
            bullets = data;
          } else if (message.type === "playerJoined") {
            console.log(data); // Log the player data
            players[data.id] = data; // Update the local player list
            if (playerId !== data.id) {
              send("updatePlayer", {
                id: playerId,
                x: playerX,
                y: playerY,
                health: playerHealth,
                speed: playerSpeed,
                size: playerSize,
                bodyDamage: bodyDamage,
                cannonW: cannonWidth,
                cannonH: 0,
                __type__: __type__,
                cannon_angle: 0,
                score: score,
                username: username,
                level: level,
                state: state,
                statecycle: statecycle,
                playerHealTime: playerHealTime,
                maxhealth: maxhealth,
                playerReheal: playerReheal,
                FOV: FOV,
                MouseX: MouseX_,
                MouseY: MouseY_,
                screenWidth: canvas.width,
                screenHeight: canvas.height,
              });
            }
            setTimeout(() => {
              send("healrate", {
                playerId: playerId,
                playerReheal: playerReheal,
              });
            }, 3000);
          } else if (message.type === "playerScore") {
            players[data["bulletId"]].score += data["socrepluse"];
            if (data["bulletId"] === playerId) {
              score = players[data["bulletId"]].score;
            }
            levelHANDLER();
          } else if (message.type === "dronekilled") {
            if (data.droneID === playerId) {
              drones -= 1;
            }
          } else if (message.type === "FoodUpdate") {
            food_list = data;
          } else if (message.type === "bulletDamage") {
            if (players[data.playerID]) {
              bullets = data.BULLETS; // Check if the player exists
              players[data.playerID].health = data.playerHealth;

              if (data.playerID == playerId) {
                playerHealth = data.playerHealth;
                send("playerHealintterupted", { ID: playerId });
                playerHealTime = 0;
                state = "damaged";
                statecycle = 0;
                send("statechange", {
                  state: state,
                  statecycle: statecycle,
                  playerID: playerId,
                });
                setTimeout(() => {
                  state = "normal";
                  statecycle = 0;
                  send("statechange", {
                    state: state,
                    statecycle: statecycle,
                    playerID: playerId,
                  });
                }, 1000);
              }
            } else {
              //console.warn("Received bulletDamage for an unknown player:", data.playerID);
            }
          } else if (message.type === "shapeDamage") {
            if (players[data.PlayerId]) {
              food_list = data.shapes; // Check if the player exists
              players[data.PlayerId].health -= data.playerDamage;

              if (data.PlayerId == playerId) {
                state = "damaged";
                statecycle = 0;
                send("statechange", {
                  state: state,
                  statecycle: statecycle,
                  playerID: playerId,
                });
                setTimeout(() => {
                  state = "normal";
                  statecycle = 0;
                  send("statechange", {
                    state: state,
                    statecycle: statecycle,
                    playerID: playerId,
                  });
                }, 1000);
                playerHealth -= data.playerDamage;
                playerHealTime = 0;
                send("playerHealintterupted", { ID: playerId });
              }
            } else {
              console.warn(
                "Received shapeDamage for an unknown player:",
                data.PlayerId
              );
            }
          } else if (message.type === "bouceBack") {
            canmove = false;
            movementTimeouts.forEach((timeout) => {
              clearTimeout(timeout);
            });
            movementTimeouts = [];
            for (let i = 0; i < playerSpeed; i++) {
              setTimeout(() => {
                movePlayer(
                  data.response[1].overlapV.y / playerSpeed,
                  data.response[1].overlapV.x / playerSpeed
                );
              }, 50 * i);
            }
            setTimeout(() => {
              canmove = true;
            }, 10 * playerSpeed);
          } else if (message.type === "type_Change") {
            console.log(data)
            players[data.id] = data;
          } else if (message.type === "statechangeUpdate") {
            players[data.playerID].state = data.state;
            players[data.playerID].statecycle = data.statecycle;
          } else if (message.type === "playerCannonWidthUpdate") {
            players[data.id].cannonW = data.cannonW;
          }
        };

        const movePlayer = (dx, dy, last, i) => {
          if (!canmove) return;
          playerX += dx;
          cavansX += dx;
          playerY += dy;
          cavansY += dy;

          if (i in nolist) return; // just roll with it
          send("playerMoved", {
            id: playerId,
            x: playerX,
            y: playerY,
            dx: dx,
            dy: dy,
            last: last,
          });
        };

        let healer = setInterval(() => {
          playerHealTime += 1;
          send("AddplayerHealTime", {
            playerHealTime: playerHealTime,
            ID: playerId,
            maxhealth: maxhealth,
          });
        }, 1000);

        function MathHypotenuse(x, y) {
          return Math.sqrt(x * x + y * y);
        }

        function setCookie(cname, cvalue, exdays) {
          const d = new Date();
          d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
          let expires = "expires=" + d.toUTCString();
          document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }

        const getCannonAngle = () => {
          return Math.atan2(
            Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
            Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
          );
        };

        const checkCollisions = (dx, dy) => {
          for (let playerId_ in players) {
            let player = players[playerId_];
            let distance = MathHypotenuse(
              player.x - playerX,
              player.y - playerY
            );

            if (
              distance < player.size * 41 + playerSize * 41 &&
              playerId_ != playerId
            ) {
              send("playerCollided", {
                id_other: playerId_,
                damagetaken: player.bodyDamage,
                damagegiven: bodyDamage,
                id_self: playerId,
              });
              playerHealTime = 0;
              send("playerHealintterupted", { ID: playerId });
              canmove = false;
              setTimeout(() => {
                canmove = true;
              }, 10 * playerSpeed);
              for (let c = 0; c < playerSpeed + 10; c++) {
                setTimeout(() => {
                  movePlayer(-dx, -dy, c === playerSpeed - 1, c);
                }, 50 * c);
              } // Reverse the last movement
            }
          }
        };

        const handleMovement = (dx, dy) => {
          if (
            playerX + dx > mapLeft &&
            playerX + dx < mapRight &&
            playerY + dy > mapTop &&
            playerY + dy < mapBottom
          ) {
            for (let i = 0; i < playerSpeed / 3; i++) {
              var movement = setTimeout(() => {
                movePlayer(dx * 3, dy * 3, i === playerSpeed - 1 || i === 0);
              }, 75 * i);
              movementTimeouts.push(movement);
            }
            checkCollisions(dx, dy);
          } else {
            for (let i = 0; i < playerSpeed / 3; i++) {
              var movement = setTimeout(() => {
                movePlayer(-dx * 3, -dy * 3, i === playerSpeed - 1 || i === 0);
              }, 75 * i);
              movementTimeouts.push(movement);
            }
          }
        };

        function calculateTriangleVertices(cx, cy, size, angle) {
          const height = sqrt23 * size;
          const halfSize = size / 2;

          const angleRad = angle * pi180;
          const cosAngle = Math.cos(angleRad);
          const sinAngle = Math.sin(angleRad);

          let vertices = [
            { x: -halfSize, y: -height / 3 }, // Bottom-left
            { x: halfSize, y: -height / 3 }, // Bottom-right
            { x: 0, y: (2 * height) / 3 }, // Top
          ];

          for (let i = 0; i < vertices.length; i++) {
            const vertex = vertices[i];
            const rotatedX = vertex.x * cosAngle - vertex.y * sinAngle;
            const rotatedY = vertex.x * sinAngle + vertex.y * cosAngle;
            vertices[i] = { x: rotatedX + cx, y: rotatedY + cy };
          }

          return vertices;
        }
        document.addEventListener("keydown", (event) => {
          keysPressed[event.key] = true;
          if (keysPressed["]"]) {
            players[playerId].score += 15;
            score = players[playerId].score;
            levelHANDLER();
          }
          if (
            (keysPressed["ArrowLeft"] && keysPressed["ArrowUp"]) ||
            (keysPressed["a"] && keysPressed["w"])
          ) {
            handleMovement(-1, -1);
          } else if (
            (keysPressed["ArrowLeft"] && keysPressed["ArrowDown"]) ||
            (keysPressed["a"] && keysPressed["s"])
          ) {
            handleMovement(-1, 1);
          } else if (
            (keysPressed["ArrowRight"] && keysPressed["ArrowUp"]) ||
            (keysPressed["d"] && keysPressed["w"])
          ) {
            handleMovement(1, -1);
          } else if (
            (keysPressed["ArrowRight"] && keysPressed["ArrowDown"]) ||
            (keysPressed["d"] && keysPressed["s"])
          ) {
            handleMovement(1, 1);
          } else if (keysPressed["ArrowUp"] || keysPressed["w"]) {
            handleMovement(0, -1);
          } else if (keysPressed["ArrowDown"] || keysPressed["s"]) {
            handleMovement(0, 1);
          } else if (keysPressed["ArrowLeft"] || keysPressed["a"]) {
            handleMovement(-1, 0);
          } else if (keysPressed["ArrowRight"] || keysPressed["d"]) {
            handleMovement(1, 0);
          } else if (keysPressed["-"]) {
            FOV -= 0.1;
          } else if (keysPressed["="]) {
            FOV += 0.1;
          } else if (keysPressed["e"]) {
            autoFiring = !autoFiring;
            if (!autoFiring) {
              canFire = true;
            }
          } else if (keysPressed["c"]) {
            autoRotating = !autoRotating;
          } else if (keysPressed["h"]) {
            __type__ = types[typeindex];
            typeindex += 1;
            if (typeindex >= types.length) {
              typeindex = 0;
            }
            players[playerId].type = __type__;
            let tankdata = tankmeta[__type__];
            var tankdatacannon__ = tankdata["cannons"];
            playerSize *= tankdata["size-m"];
            playerSpeed *= tankdata["speed-m"];
            bullet_damage *= tankdata["damage-m"];
            playerReheal *= tankdata["regen-m"];
            bodyDamage *= tankdata["BodyDamage-m"];
            maxhealth *= tankdata["health-m"];
            if (playerHealth > maxhealth) {
              playerHealth = maxhealth;
            }

            send("typeChange", {
              id: playerId,
              x: playerX,
              y: playerY,
              health: playerHealth,
              speed: playerSpeed,
              size: playerSize,
              bodyDamage: bodyDamage,
              cannonW: cannonWidth,
              cannonH: 0,
              __type__: __type__,
              cannon_angle: getCannonAngle(),
              score: score,
              username: username,
              level: level,
              state: state,
              statecycle: statecycle,
              playerHealTime: playerHealTime,
              maxhealth: maxhealth,
              playerReheal: playerReheal,
              FOV: FOV,
              MouseX: MouseX_,
              MouseY: MouseY_,
              screenWidth: canvas.width,
              screenHeight: canvas.height,
            });
            setTimeout(() => {
              cannonWidth = [];
              for (let i = 0; i < Object.keys(tankdatacannon__).length; i++) {
                cannonWidth.push(0);
              }
            }, 100);
          }
        });

        document.addEventListener("keyup", (event) => {
          delete keysPressed[event.key];

          if (
            (keysPressed["ArrowLeft"] && keysPressed["ArrowUp"]) ||
            (keysPressed["a"] && keysPressed["w"])
          ) {
            handleMovement(-1, -1);
          } else if (
            (keysPressed["ArrowLeft"] && keysPressed["ArrowDown"]) ||
            (keysPressed["a"] && keysPressed["s"])
          ) {
            handleMovement(-1, 1);
          } else if (
            (keysPressed["ArrowRight"] && keysPressed["ArrowUp"]) ||
            (keysPressed["d"] && keysPressed["w"])
          ) {
            handleMovement(1, -1);
          } else if (
            (keysPressed["ArrowRight"] && keysPressed["ArrowDown"]) ||
            (keysPressed["d"] && keysPressed["s"])
          ) {
            handleMovement(1, 1);
          } else if (keysPressed["ArrowUp"] || keysPressed["w"]) {
            handleMovement(0, -1);
          } else if (keysPressed["ArrowDown"] || keysPressed["s"]) {
            handleMovement(0, 1);
          } else if (keysPressed["ArrowLeft"] || keysPressed["a"]) {
            handleMovement(-1, 0);
          } else if (keysPressed["ArrowRight"] || keysPressed["d"]) {
            handleMovement(1, 0);
          }

          if (event.key === "ArrowUp" || event.key === "w") {
            playerMovementY = 0;
          } else if (event.key === "ArrowDown" || event.key === "s") {
            playerMovementY = 0;
          } else if (event.key === "ArrowLeft" || event.key === "a") {
            playerMovementX = 0;
          } else if (event.key === "ArrowRight" || event.key === "d") {
            playerMovementX = 0;
          }
        });

        var container = document.getElementById("container");
        document.addEventListener("mousemove", (evt) => {
          if (autoRotating) return;
          var mousepos = getMousePos(container, evt);
          MouseX_ = mousepos.x;
          MouseY_ = mousepos.y;
          let __angle__ = Math.atan2(
            Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
            Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
          );
          send("playerCannonMoved", {
            id: playerId,
            cannon_angle: __angle__,
            MouseX: MouseX_,
            MouseY: MouseY_,
          });
        });
        let pi = Math.pi;
        setInterval(() => {
          if (!autoRotating) return;
          autoAngle += 1;
          if (359.8 <= autoAngle) {
            // yes point 8 I can do math kids
            autoAngle = 0;
          }
          let radians = (Math.PI / 180) * autoAngle;
          MouseX_ =
            cavansX +
            500 * Math.cos(radians) +
            (canvas.height / 2 - playerSize * FOV);
          MouseY_ =
            cavansY +
            500 * Math.sin(radians) +
            (canvas.width / 2 - playerSize * FOV);
          let angle = Math.atan2(
            Math.abs(MouseX_) - (canvas.height / 2 - playerSize * FOV),
            Math.abs(MouseY_) - (canvas.width / 2 - playerSize * FOV)
          );
          console.log(angle);
          send("playerCannonMoved", {
            id: playerId,
            cannon_angle: autoAngle,
            MouseX: MouseX_,
            MouseY: MouseY_,
          });
        }, 75);

        function generateRandomNumber(min, max) {
          return Math.random() * (max - min) + min;
        }

        function fireOnce(evt, directer) {
          let tankdata = tankmeta[__type__];
          let tankdatacannon = tankdata.cannons;
          if (!autoFiring && !directer) {
            if (evt.button === 2) return;
          }
          var angle = Math.atan2(
            Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
            Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
          );

          // Fire all cannons
          tankdatacannon.forEach((cannon, i) => {
            if (!cannonFireData[i]) return;
            cannonFireData[i] = false;
            setTimeout(() => {
              if (cannon.type === "autoCannon") return;

              //if (cannon.type === "directer" && !directer) return;
              let bullet_size_l = bullet_size * cannon["bulletSize"];

              let randomNumber = generateRandomNumber(-0.2, 0.2);

              if (
                cannon["type"] === "basicCannon" ||
                cannon["type"] === "trap"
              ) {
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
              }

              let rotated_offset_x =
                (cannon["offSet-x"] + xxx) * Math.cos(angle_) -
                (cannon["offSet-y"] + yyy) * Math.sin(angle_);
              let rotated_offset_y =
                (cannon["offSet-x"] + xxx) * Math.sin(angle_) +
                (cannon["offSet-y"] + yyy) * Math.cos(angle_);
              let bullet_start_x = playerX + rotated_offset_x;
              let bullet_start_y = playerY + rotated_offset_y;
              let identdfire = Date.now() + Math.random();
              let bullet_speed__ = bullet_speed * cannon["bulletSpeed"];

              // Recoil effect
              cannonWidth[i] = cannonWidth[i] || 0;
              for (let l = 0; l < 10; l++) {
                setTimeout(() => {
                  cannonWidth[i] -= 1;
                  send("playerCannonWidth", {
                    id: playerId,
                    cannonW: cannonWidth,
                  });
                }, 10 * l);
                setTimeout(() => {
                  cannonWidth[i] += 1;
                  send("playerCannonWidth", {
                    id: playerId,
                    cannonW: cannonWidth,
                  });
                }, 20 * l); // Updated to prevent overlap
              }

              let recoilX = -(
                (bullet_size_l / 10) *
                bullet_speed__ *
                Math.cos(angle_)
              );
              let recoilY = -(
                (bullet_size_l / 10) *
                bullet_speed__ *
                Math.sin(angle_)
              );
              for (let i = 0; i < playerSpeed; i++) {
                setTimeout(() => {
                  movePlayer(recoilX / 15, recoilY / 15, i == playerSpeed - 1);
                }, 15 * i);
              }
              let vertices = 0;
              if (
                cannon["type"] === "basicCannon" ||
                cannon["type"] === "trapezoid"
              ) {
                var bulletdistance = bullet_speed__ * 100 * (bullet_size / 6);
                var type = "basic";
                var health = 8;
              } else if (cannon["type"] === "trap") {
                var bulletdistance = bullet_speed__ * 70 * (bullet_size / 20);
                var type = "trap";
                var health = 10;
                const rawvertices = calculateTriangleVertices(
                  bullet_start_x,
                  bullet_start_y,
                  bullet_size_l,
                  0
                );
                vertices = rawvertices;
              } else if (cannon["type"] === "directer") {
                var bulletdistance = 100;
                var type = "directer";
                var health = 10;
                const rawvertices = calculateTriangleVertices(
                  bullet_start_x,
                  bullet_start_y,
                  bullet_size_l,
                  0
                );
                vertices = rawvertices;
              }

              let cannon_life = cannon["life-time"] || 0;

              let bullet = {
                type: type,
                bullet_distance: bulletdistance,
                speed: bullet_speed__,
                size: bullet_size_l,
                angle: angle_,
                bullet_damage: bullet_damage * cannon["bulletSize"],
                distanceTraveled: 0,
                vertices: vertices,
                bullet_pentration:
                  bullet_pentration * cannon["bullet_pentration"],
                x: bullet_start_x,
                y: bullet_start_y,
                lifespan: cannon_life,
                health: health,
                xstart: playerX,
                ystart: playerY,
                id: playerId,
                uniqueid: identdfire,
              };

              send("bulletFired", bullet);
            }, cannon.delay * 1000);
            if (!(cannonFireData[i] || dronetanks.includes(__type__))) {
              setTimeout(() => {
                cannonFireData[i] = true;
              }, 750 * tankdata["reaload-m"] * cannon["reloadM"] * __reload__);
            }
          });
        }

        function FireIntervale(evt) {
          let tankdata = tankmeta[__type__];
          let tankdatacannon = tankdata["cannons"];
          if (autoFiring) return;
          if (evt.button === 2) return;
          tankdatacannon.forEach((cannon, i) => {
            firingInterval = setInterval(
              (event = evt, MouseY__ = MouseY_, MouseX__ = MouseX_) => {
                canFire2 = false;
                let angle = Math.atan2(
                  Math.abs(MouseY__) - (canvas.height / 2 - playerSize * FOV),
                  Math.abs(MouseX__) - (canvas.width / 2 - playerSize * FOV)
                );
                if (autoFiring) return;

                let tankdatacannondata = tankdatacannon[i];
                setTimeout(() => {
                  if (cannon.type === "autoCannon" || cannon.type === "autoCannon") return;
                  let bullet_size_l = bullet_size * cannon["bulletSize"];

                  let randomNumber = generateRandomNumber(-0.2, 0.2);

                  if (
                    cannon["type"] === "basicCannon" ||
                    cannon["type"] === "trap"
                  ) {
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
                  }

                  let rotated_offset_x =
                    (cannon["offSet-x"] + xxx) * Math.cos(angle_) -
                    (cannon["offSet-y"] + yyy) * Math.sin(angle_);
                  let rotated_offset_y =
                    (cannon["offSet-x"] + xxx) * Math.sin(angle_) +
                    (cannon["offSet-y"] + yyy) * Math.cos(angle_);
                  let bullet_start_x = playerX + rotated_offset_x;
                  let bullet_start_y = playerY + rotated_offset_y;
                  // lol
                  let identdfire = Date.now() + Math.random();
                  let bullet_speed__ = bullet_speed * cannon["bulletSpeed"];

                  // Recoil effect
                  cannonWidth[i] = cannonWidth[i] || 0;
                  for (let l = 0; l < 10; l++) {
                    setTimeout(() => {
                      cannonWidth[i] -= 1;
                      send("playerCannonWidth", {
                        id: playerId,
                        cannonW: cannonWidth,
                      });
                    }, 10 * l);
                    setTimeout(() => {
                      cannonWidth[i] += 1;
                      send("playerCannonWidth", {
                        id: playerId,
                        cannonW: cannonWidth,
                      });
                    }, 20 * l); // Updated to prevent overlap
                  }

                  let recoilX = -(
                    (bullet_size_l / 10) *
                    bullet_speed__ *
                    Math.cos(angle_)
                  );
                  let recoilY = -(
                    (bullet_size_l / 10) *
                    bullet_speed__ *
                    Math.sin(angle_)
                  );
                  for (let i = 0; i < playerSpeed; i++) {
                    setTimeout(() => {
                      movePlayer(
                        recoilX / 15,
                        recoilY / 15,
                        i == playerSpeed - 1
                      );
                    }, 15 * i);
                  }
                  let vertices = 0;
                  if (
                    cannon["type"] === "basicCannon" ||
                    cannon["type"] === "trapezoid"
                  ) {
                    var bulletdistance =
                      bullet_speed__ * 100 * (bullet_size / 6);
                    var type = "basic";
                    var health = 8;
                  } else if (cannon["type"] === "trap") {
                    var bulletdistance =
                      bullet_speed__ * 70 * (bullet_size / 20);
                    var type = "trap";
                    var health = 10;
                    const rawvertices = calculateTriangleVertices(
                      bullet_start_x,
                      bullet_start_y,
                      bullet_size_l,
                      0
                    );
                    vertices = rawvertices;
                  } else if (cannon["type"] === "directer") {
                    var bulletdistance = 100;
                    var type = "directer";
                    var health = 10;
                    bullet_speed__ += 10;
                    const rawvertices = calculateTriangleVertices(
                      bullet_start_x,
                      bullet_start_y,
                      bullet_size_l,
                      0
                    );
                    vertices = rawvertices;
                  }

                  let cannon_life = cannon["life-time"] || 0;

                  let bullet = {
                    type: type,
                    bullet_distance: bulletdistance,
                    speed: bullet_speed__,
                    size: bullet_size_l,
                    angle: angle_,
                    bullet_damage: bullet_damage * cannon["bulletSize"],
                    distanceTraveled: 0,
                    vertices: vertices,
                    bullet_pentration:
                      bullet_pentration * cannon["bullet_pentration"],
                    x: bullet_start_x,
                    y: bullet_start_y,
                    lifespan: cannon_life,
                    health: health,
                    xstart: playerX,
                    ystart: playerY,
                    id: playerId,
                    uniqueid: identdfire,
                  };
                  send("bulletFired", bullet);
                }, tankdatacannondata["delay"] * 1000);
              },
              750 * tankdata["reaload-m"] * cannon["reloadM"] * __reload__
            );
            name = JSON.stringify(firingInterval + i);
            firingIntervals[name] = firingInterval;
          });
        }

        document.addEventListener("mousedown", (evt) => {
          fireOnce(evt, false);
        });

        document.addEventListener("click", (evt) => {
          evt.preventDefault();
        });

        let __tankdata__ = tankmeta[__type__];
        function autoengine() {
          __tankdata__ = tankmeta[__type__];
          if (!dronetanks.includes(__type__) && autoFiring) {
            __tankdata__ = tankmeta[__type__];
            if (firingInterval) {
              clearInterval(firingInterval);
              firingInterval = null;
            }
            fireOnce();
          }
          if (dronetanks.includes(__type__)) {
            console.log(tankmeta[__type__]["cannons"])
            for (var cannon in tankmeta[__type__]["cannons"]) {
              if (drones <= tankmeta[__type__]["max-drones"] && cannon.type === "directer") {
                fireOnce(null, true);
                drones += 1;
              }
            }
          }

          setTimeout(() => {
            autoengine();
          }, 750 * __tankdata__["reaload-m"]);
        }
        setTimeout(() => {
          autoengine();
        }, 750 * __tankdata__["reaload-m"]);

        document.addEventListener("mousedown", (evt) => {
          if (!dronetanks.includes(__type__)) {
            FireIntervale(evt);
          }
        });

        document.addEventListener("mouseup", function () {
          for (const interval in firingIntervals) {
            firingInterval = firingIntervals[interval];
            clearInterval(firingInterval);
            firingInterval = null;
            canFire2 = true;
          }
        });
        var start;
        start = setInterval(() => {
          statecycle += 1;
          send("statechange", {
            state: state,
            statecycle: statecycle,
            playerID: playerId,
          });
        }, 50);
        setTimeout(() => {
          start = null;
          state = "normal";
          send("statechange", {
            state: state,
            statecycle: statecycle,
            playerID: playerId,
          });
          // make sure the server got the mesage
          setTimeout(() => {
            send("statechange", {
              state: state,
              statecycle: statecycle,
              playerID: playerId,
            });
          }, 300);
        }, 5000);
      }, 300);
    };
    function drawRoundedLevelBar(ctx, x, y, width, height, radius, progress) {
      // Full bar
      ctx.fillStyle = "#ddd";
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Filled bar (progress)
      const filledWidth = width * progress;
      ctx.fillStyle = "#00f";
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      if (filledWidth > radius) {
        ctx.lineTo(x + filledWidth - radius, y);
        if (filledWidth < width - radius) {
          ctx.quadraticCurveTo(x + filledWidth, y, x + filledWidth, y + radius);
          ctx.lineTo(x + filledWidth, y + height - radius);
          ctx.quadraticCurveTo(
            x + filledWidth,
            y + height,
            x + filledWidth - radius,
            y + height
          );
        } else {
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radius,
            y + height
          );
          ctx.lineTo(x + filledWidth - radius, y + height);
        }
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
      } else {
        ctx.quadraticCurveTo(x + filledWidth, y, x + filledWidth, y + radius);
        ctx.lineTo(x + filledWidth, y + height - radius);
        ctx.quadraticCurveTo(
          x + filledWidth,
          y + height,
          x + filledWidth - radius,
          y + height
        );
        ctx.lineTo(x, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
      }
      ctx.closePath();

      ctx.fill();
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.font = "bold 40px Courier New";
      ctx.fillText(level, canvas.width / 2, canvas.height - 40);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      food_list.forEach((item) => {
        var realx = item.x - item.size * (FOV - 1);
        var realy = item.y - item.size * (FOV - 1);
        if (
          realx > 0 + cavansX &&
          realx < canvas.width + cavansX &&
          realy - cavansY > 0 &&
          realy < canvas.height + cavansY &&
          item.health > 0
        ) {
          ctx.save();
          ctx.translate(realx - cavansX, realy - cavansY);

          ctx.rotate(item.angle * pi180);

          if (item.type === "square") {
            ctx.fillStyle = item.color;
            ctx.fillRect(
              -item.size / 2,
              -item.size / 2,
              item.size * FOV,
              item.size * FOV
            );
            ctx.strokeStyle = "GoldenRod";
            ctx.lineWidth = 5;
            ctx.strokeRect(
              -item.size / 2,
              -item.size / 2,
              item.size * FOV,
              item.size * FOV
            );

            ctx.rotate(-item.angle * pi180);
            if (item.health < 10) {
              ctx.fillStyle = "black";
              ctx.fillRect(-45, 35, 90 * FOV, 10);
              const healthWidth = (item.health / item.maxhealth) * 90 * FOV;
              ctx.fillStyle = "green";
              ctx.fillRect(-45, 35, healthWidth, 10);
            }
          }

          if (item.type === "triangle") {
            let realitemsize = item.size * FOV;
            const h = realitemsize * sqrt23;

            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(-realitemsize / 2, h / 2);
            ctx.lineTo(realitemsize / 2, h / 2);
            ctx.closePath();

            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.strokeStyle = "Darkred";
            ctx.lineWidth = 5;
            ctx.stroke();

            ctx.rotate(-item.angle * pi180);
            if (item.health < 15) {
              ctx.fillStyle = "black";
              ctx.fillRect(-45, 35, 90 * FOV, 10 * FOV);
              const healthWidth = (item.health / item.maxhealth) * 90 * FOV;
              ctx.fillStyle = "green";
              ctx.fillRect(-45, 35, healthWidth, 10 * FOV);
            }
          }
          if (item.type === "pentagon") {
            ctx.fillStyle = item.color;
            const centerX = 0;
            const centerY = 0;
            const radius = item.size * FOV;
            const angle = item.angle * pi180; // Convert angle to radians
            vertices = [];

            for (let i = 0; i < 5; i++) {
              const theta = (i * 2 * Math.PI) / 5 + angle; // Divide circle into 5 parts and add rotation angle
              const x = centerX + radius * Math.cos(theta);
              const y = centerY + radius * Math.sin(theta);
              vertices.push({ x, y });
            }

            // Draw filled pentagon
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
              ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.fill();

            // Draw pentagon outline
            ctx.strokeStyle = "#3976cc";
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
              ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.stroke();

            // Rotate context back to original position (if needed)
            ctx.rotate(-item.angle * pi180);

            // Draw health bar if health is less than 100%
            if (item.health < 100) {
              ctx.fillStyle = "black";
              ctx.fillRect(
                centerX - 60 * FOV,
                centerY + 35 * FOV,
                120 * FOV,
                10
              );
              const healthWidth = (item.health / item.maxhealth) * 120 * FOV;
              ctx.fillStyle = "green";
              ctx.fillRect(
                centerX - 60 * FOV,
                centerY + 35 * FOV,
                healthWidth,
                10
              );
            }
          }

          ctx.restore();
        }
      });
      bullets.forEach((bullet) => {
        var realx = bullet.x - Math.abs(bullet.size * 2 * (FOV - 1));
        var realy = bullet.y - Math.abs(bullet.size * 2 * (FOV - 1));
        if (
          realx > 0 + cavansX &&
          realx < canvas.width + cavansX &&
          realy - cavansY > 0 &&
          realy < canvas.height + cavansY
        ) {
          if (bullet.transparency) {
            console.log(bullet.transparency)
            ctx.globalAlpha = bullet.transparency;
          }
          ctx.beginPath();
          if (bullet.type === "basic") {
            if (bullet.id === playerId) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            let realsize = bullet.size * FOV;

            ctx.arc(
              realx - (bullet.xstart - (bullet.xstart - cavansX)),
              realy - (bullet.ystart - (bullet.ystart - cavansY)),
              realsize,
              0,
              2 * Math.PI
            );
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
          } else if (bullet.type === "trap") {
            if (bullet.id === playerId) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            let vertices = bullet.vertices;

            let x1 =
              vertices[2].x - (bullet.xstart - (bullet.xstart - cavansX));
            let y1 =
              vertices[2].y - (bullet.ystart - (bullet.ystart - cavansY)); // Top point
            let x2 =
              vertices[1].x - (bullet.xstart - (bullet.xstart - cavansX));
            let y2 =
              vertices[1].y - (bullet.ystart - (bullet.ystart - cavansY)); // Bottom-left point
            let x3 =
              vertices[0].x - (bullet.xstart - (bullet.xstart - cavansX));
            let y3 =
              vertices[0].y - (bullet.ystart - (bullet.ystart - cavansY)); // Bottom-right point

            const controlOffset = 5;

            ctx.beginPath();
            ctx.moveTo(x1, y1);

            const controlPoint1 = { x: (x1 + x3) / 2, y: (y1 + y3) / 2 };

            // Control point for curve from bottom-left to bottom-right
            const controlPoint2 = {
              x: (x2 + x1) / 2,
              y: (y2 + y3) / 2 + controlOffset,
            };

            // Control point for curve from bottom-right to top
            const controlPoint3 = {
              x: (x1 + x3) / 2 + controlOffset,
              y: (y1 + y3) / 2,
            };

            // Draw the curved edge from top to bottom-left

            ctx.quadraticCurveTo(controlPoint1.x, controlPoint1.y, x2, y2);

            // Draw the curved edge from bottom-left to bottom-right
            ctx.quadraticCurveTo(controlPoint2.x, controlPoint2.y, x3, y3);

            // Draw the curved edge from bottom-right to top
            ctx.quadraticCurveTo(controlPoint3.x, controlPoint3.y, x1, y1);

            ctx.fill();
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
          } else if (bullet.type === "directer") {
            if (bullet.id === playerId) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            ctx.save();
            ctx.translate(realx - cavansX, realy - cavansY);
            ctx.rotate(bullet.angle);
            let realitemsize = bullet.size * 3 * FOV;
            const h = realitemsize * sqrt23;

            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(-realitemsize / 2, h / 2);
            ctx.lineTo(realitemsize / 2, h / 2);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();

            ctx.restore();
          }
          ctx.globalAlpha = 1
        }
      });
      for (let playerId__ in players) {
        if (players.hasOwnProperty(playerId__) && playerId__ != playerId) {
          let player = players[playerId__];

          let tankdata = tankmeta[player.__type__];

          let tankdatacannon = tankdata["cannons"];

          let playerX = player.x - Math.abs(player.size * 80 * (FOV - 1));
          let playerY = player.y - Math.abs(player.size * 80 * (FOV - 1));

          let FOVplayerz = player.size * FOV;

          for (let i = 0; i < Object.keys(tankdatacannon).length; i++) {
            ctx.fillStyle = "#b3b3b3";
            let tankdatacannondata = tankdatacannon[i];

            let cannon_widthFOV =
              tankdatacannondata["cannon-width"] * FOVplayerz;
            let cannon_heightFOV =
              tankdatacannondata["cannon-height"] * FOVplayerz;
            if (tankdatacannondata["type"] === "basicCannon") {
              ctx.save();
              ctx.translate(playerX - cavansX, playerY - cavansY);
              let angle = player.cannon_angle;

              let angle_offset = tankdatacannondata["offset-angle"];
              ctx.rotate(angle + angle_offset);
              // Draw the square
              let basex =
                -cannon_widthFOV / 2 +
                cannon_heightFOV +
                tankdatacannondata["offSet-x"] -
                player.cannonW[i];
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

              ctx.fillRect(basex, basey, cannon_widthFOV, cannon_heightFOV);

              // Add a border to the cannon
              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(basex, basey, cannon_widthFOV, cannon_heightFOV); // Draw the border
              // Restore the previous transformation matrix
              ctx.restore();
            } else if (
              tankdatacannondata["type"] === "trapezoid" ||
              tankdatacannondata["type"] === "directer"
            ) {
              ctx.save();
              ctx.translate(playerX - cavansX, playerY - cavansY);
              let angle = player.cannon_angle;

              let angle_offset = tankdatacannondata["offset-angle"];
              ctx.rotate(angle + angle_offset);
              // Draw the square
              const cannonWidth_bottom =
                tankdatacannondata["cannon-width-bottom"] * playerSize * FOV;

              let basex =
                cannonWidth_bottom / 2 +
                cannon_heightFOV +
                tankdatacannondata["offSet-x"] -
                player.cannonW[i];
              let basey =
                -cannon_heightFOV / 2 +
                cannon_heightFOV / 2 -
                tankdatacannondata["offSet-y"];

              const cannonHeight = cannon_heightFOV;
              const cannonWidth_top =
                tankdatacannondata["cannon-width-top"] * playerSize * FOV;

              var canwB2 = cannonWidth_bottom / 2;
              var canwH2 = cannonWidth_top / 2;
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.fill();

              // Add a border to the cannon
              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.stroke(); // Draw the border
              ctx.restore();
            } else if (tankdatacannondata["type"] === "trap") {
              let cannonwidth = tankdatacannondata["cannon-width"];
              let cannonheight = tankdatacannondata["cannon-height"];
              ctx.save();

              ctx.translate(playerX - cavansX, playerY - cavansY);
              let angle = player.cannon_angle;

              let angle_offset = tankdatacannondata["offset-angle"];
              let trapR = tankdatacannondata["trap-to-cannon-ratio"];
              ctx.rotate(angle + angle_offset);
              // Draw the square
              let basex =
                -cannon_widthFOV / 2 +
                cannonheight +
                tankdatacannondata["offSet-x"] -
                player.cannonW[i];
              let reH = cannon_widthFOV * (1 - trapR);
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];
              ctx.fillRect(
                basex,
                basey,
                cannon_widthFOV - reH,
                cannon_heightFOV
              );
              // Add a border to the cannon

              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(
                basex,
                basey,
                cannon_widthFOV - reH,
                cannon_heightFOV
              );
              // Restore the previous transformation matrix
              const cannonHeight = reH;
              const cannonWidth_top = cannon_heightFOV * 1.4;
              const cannonWidth_bottom = cannon_heightFOV;

              basex = basex + (cannon_widthFOV - trapR);

              var canwB2 = cannonWidth_bottom / 2;
              var canwH2 = cannonWidth_top / 2;
              basey += canwB2;
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.fill();

              // Add a border to the cannon
              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.stroke(); // Draw the border
              ctx.restore();
            }
          }

          ctx.beginPath();
          ctx.fillStyle = squareColor;
          ctx.arc(
            playerX - cavansX,
            playerY - cavansY,
            player.size * FOV * 40,
            0,
            2 * Math.PI,
            false
          );
          let num = player.statecycle % 10;
          if (
            num === 0 &&
            (player.state === "start" || player.state === "damaged")
          ) {
            ctx.fillStyle = "white";
          } else {
            ctx.fillStyle = "red";
          }

          ctx.fill();
          ctx.lineWidth = 5;
          ctx.strokeStyle = "darkred";
          ctx.stroke();
          ctx.closePath();

          // Draw background bar
          ctx.fillStyle = "black";
          ctx.fillRect(
            playerX - cavansX - 50 * FOV,
            playerY - cavansY + 55 * FOV,
            90 * FOV,
            10 * playerSize * FOV
          );

          // Draw health bar
          const healthWidth = (player.health / player.maxhealth) * 90 * FOV;
          ctx.fillStyle = "green";
          ctx.fillRect(
            playerX - cavansX - 50 * FOV,
            playerY - cavansY + 55 * FOV,
            healthWidth,
            10 * playerSize * FOV
          );
          // cannons on top of player
          for (let i = 0; i < Object.keys(tankdatacannon).length; i++) {
            ctx.fillStyle = "#b3b3b3";
            let tankdatacannondata = tankdatacannon[i];
            let cannon_widthFOV =
              tankdatacannondata["cannon-width"] * FOVplayerz;
            let cannon_heightFOV =
              tankdatacannondata["cannon-height"] * FOVplayerz;
            let cannonangle;
            autocannons.forEach((cannonA) => {
              if (cannonA.playerid === playerId__ && cannonA.autoindex-1 === i) {
                cannonangle = cannonA.angle;
              }
            });
            if (tankdatacannondata["type"] === "autoCannon") {
              ctx.save();
              ctx.translate(playerX - cavansX, playerY - cavansY);
              console.log("cannonangle", cannonangle);
              let angle = cannonangle;

              let angle_offset = tankdatacannondata["offset-angle"];
              ctx.rotate(angle + angle_offset);
              // Draw the square

              let basex =
                -cannon_widthFOV / 2 +
                cannon_heightFOV +
                tankdatacannondata["offSet-x"] -
                player.cannonW[i];
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

              ctx.fillRect(basex, basey, cannon_widthFOV, cannon_heightFOV);

              // Add a border to the cannon
              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(basex, basey, cannon_widthFOV, cannon_heightFOV); // Draw the border
              // Restore the previous transformation matrix
              ctx.rotate(-(angle + angle_offset));
              ctx.beginPath();
              ctx.arc(0, 0, cannon_widthFOV / 3, 0, 2 * Math.PI, false);
              ctx.fill();
              ctx.stroke();
              ctx.closePath();
              ctx.restore();
            }
          }

          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.font = "bold 20px Geneva";
          ctx.fillText(player.score, playerX - cavansX, playerY - cavansY - 55);

          ctx.fillText(
            player.username,
            playerX - cavansX,
            playerY - cavansY - 75
          );

          // Draw border
          ctx.lineWidth = 1;
          ctx.strokeStyle = "grey";
          ctx.strokeRect(
            playerX - cavansX - 50,
            playerY - cavansY + 55,
            90 * playerSize * FOV,
            10 * playerSize * FOV
          );
        }
      }

      ctx.fillStyle = squareColor;

      let angle = Math.atan2(
        Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
        Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
      );
      let tankdata = tankmeta[__type__];

      let tankdatacannon = tankdata["cannons"];

      let FOVplayerz = playerSize * FOV;

      for (let i = 0; i < Object.keys(tankdatacannon).length; i++) {
        ctx.fillStyle = "#b3b3b3";
        let tankdatacannondata = tankdatacannon[i];
        let cannon_widthFOV = tankdatacannondata["cannon-width"] * FOVplayerz;
        let cannon_heightFOV = tankdatacannondata["cannon-height"] * FOVplayerz;
        if (tankdatacannondata["type"] === "basicCannon") {
          ctx.save();
          // Translate to the center of the square
          ctx.translate(canW / 2, canH / 2);
          let angle_offset = tankdatacannondata["offset-angle"];
          ctx.rotate(angle + angle_offset);
          // Draw the square
          let basex =
            -cannon_widthFOV / 2 +
            cannon_heightFOV +
            tankdatacannondata["offSet-x"] -
            cannonWidth[i];
          let basey = -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];
          ctx.fillRect(basex, basey, cannon_widthFOV, cannon_heightFOV);
          // Add a border to the cannon
          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.strokeRect(basex, basey, cannon_widthFOV, cannon_heightFOV); // Draw the border
          // Restore the previous transformation matrix
          ctx.restore();
        } else if (
          tankdatacannondata["type"] === "trapezoid" ||
          tankdatacannondata["type"] === "directer"
        ) {
          ctx.save();
          // Translate to the center of the square
          ctx.translate(canW / 2, canH / 2);
          let tankdatacannondata = tankdatacannon[i];
          var angle_offset = tankdatacannondata["offset-angle"];
          ctx.rotate(angle + angle_offset);
          let cannwidthtop =
            tankdatacannondata["cannon-width-top"] * FOVplayerz;
          let cannwidthbottom =
            tankdatacannondata["cannon-width-bottom"] * FOVplayerz;
          let cannonHeight = tankdatacannondata["cannon-height"] * FOVplayerz;
          // Draw the square
          let basex =
            cannwidthbottom / 2 +
            cannon_heightFOV +
            tankdatacannondata["offSet-x"] -
            cannonWidth[i];
          let basey =
            -cannon_heightFOV / 2 +
            cannon_heightFOV / 2 +
            tankdatacannondata["offSet-y"];

          const cannonWidth_top = cannwidthtop;
          const cannonWidth_bottom = cannwidthbottom;

          var canwB2 = cannonWidth_bottom / 2;
          var canwH2 = cannonWidth_top / 2;
          ctx.beginPath();
          ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
          ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
          ctx.lineTo(basex, basey + canwH2);
          ctx.lineTo(basex, basey - canwH2);
          ctx.closePath(); // Close the path
          ctx.fill();

          // Add a border to the cannon
          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.beginPath();
          ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
          ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
          ctx.lineTo(basex, basey + canwH2);
          ctx.lineTo(basex, basey - canwH2);
          ctx.closePath(); // Close the path
          ctx.stroke(); // Draw the border
          ctx.restore();
        }
        if (tankdatacannondata["type"] === "trap") {
          ctx.save();
          // Translate to the center of the square
          ctx.translate(canW / 2, canH / 2);
          let angle_offset = tankdatacannondata["offset-angle"];
          let trapR = tankdatacannondata["trap-to-cannon-ratio"];
          ctx.rotate(angle + angle_offset);
          // Draw the square
          let basex =
            -cannon_widthFOV / 2 +
            cannon_heightFOV +
            tankdatacannondata["offSet-x"] -
            cannonWidth[i];
          let reH = cannon_widthFOV * (1 - trapR);
          let basey = -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];
          ctx.fillRect(
            basex * playerSize * FOV,
            basey * playerSize * FOV,
            cannon_widthFOV - reH,
            cannon_heightFOV
          );

          ctx.strokeStyle = "lightgrey";
          ctx.lineWidth = 3; // Set border width
          ctx.strokeRect(
            basex * playerSize * FOV,
            basey * playerSize * FOV,
            cannon_widthFOV - reH,
            cannon_heightFOV
          );

          var cannonHeight = reH;
          var cannonWidth_top = cannon_heightFOV * 1.4;
          var cannonWidth_bottom = cannon_heightFOV;

          basex = basex + (cannon_widthFOV - trapR);

          var canwB2 = cannonWidth_bottom / 2;
          var canwH2 = cannonWidth_top / 2;
          basey += canwB2 - trapR;
          ctx.beginPath();
          ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
          ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
          ctx.lineTo(basex, basey + canwH2);
          ctx.lineTo(basex, basey - canwH2);
          ctx.closePath(); // Close the path
          ctx.fill();

          // Add a border to the cannon
          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.beginPath();
          ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
          ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
          ctx.lineTo(basex, basey + canwH2);
          ctx.lineTo(basex, basey - canwH2);
          ctx.closePath(); // Close the path
          ctx.stroke(); // Draw the border
          ctx.restore();
        }
      }

      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        playerSize * FOV * 40,
        0,
        2 * Math.PI,
        false
      );
      let num = statecycle % 10;
      if (num === 0 && (state === "start" || state === "damaged")) {
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "blue";
      }
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "darkblue";
      ctx.stroke();

      // Draw background bar
      ctx.fillStyle = "black";
      ctx.fillRect(
        canvas.width / 2 - 50 * FOV,
        canvas.height / 2 + 55 * FOV,
        90 * FOV,
        10 * FOV
      );

      ctx.textAlign = "center";
      ctx.font = "bold 20px Geneva";
      ctx.fillText(score, canvas.width / 2, canvas.height / 2 - 55);

      ctx.fillText(username, canvas.width / 2, canvas.height / 2 - 75);

      // Draw health bar
      const healthWidth = (playerHealth / maxhealth) * 90 * FOV;
      ctx.fillStyle = "green";
      ctx.fillRect(
        canvas.width / 2 - 50 * FOV,
        canvas.height / 2 + 55 * FOV,
        healthWidth,
        10 * FOV
      );

      // Draw border
      ctx.lineWidth = 1;
      ctx.strokeStyle = "grey";
      ctx.strokeRect(
        canvas.width / 2 - 50 * FOV,
        canvas.height / 2 + 55 * FOV,
        90 * FOV,
        10 * FOV
      );
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(mapLeft, mapTop);
      ctx.lineTo(mapRight, mapTop);
      ctx.lineTo(mapRight, mapBottom);
      ctx.lineTo(mapLeft, mapBottom);
      ctx.lineTo(mapLeft, mapTop);
      ctx.stroke();

      gridstyle.top = `calc(-5000px - ${cavansY}px)`;
      gridstyle.left = `calc(-5000px - ${cavansX}px)`;

      // Call the function to draw the level bar
      drawRoundedLevelBar(
        ctx,
        canvas.width / 2 - barWidth / 2,
        canvas.height - 40,
        barWidth,
        barHeight,
        borderRadius,
        progress + 0.05
      );

      requestAnimationFrame(draw);
    }
  }

  document.getElementById("playButton").addEventListener("mousedown", () => {
    username = document.getElementById("username").value;
    if (username) {
      // Proceed to the game with the entered username
      setTimeout(() => {
        document.getElementById("start").style.display = "none";
        document.getElementById("game").style.display = "block";
        if (username !== "A") {
          document.addEventListener("contextmenu", (event) =>
            event.preventDefault()
          );
        }
        ongame();
      }, 100);
    } else {
      setTimeout(() => {
        username = "unknown";
        document.getElementById("start").style.display = "none";
        document.getElementById("game").style.display = "block";
        ongame();
      }, 100);
    }
  });
})();
