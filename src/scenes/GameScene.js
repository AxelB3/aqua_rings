export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.listenersAttached = false;
  }

  create() {
    this.gameInProgress = false;
    this.score = 0;
    this.updateScoreText();

    if (!this.listenersAttached) {
      const startButton = document.getElementById("startButton");
      const resetButton = document.getElementById("resetButton");
  
      startButton.addEventListener("click", () => {
        if (this.gameInProgress) return;
  
        this.gameInProgress = true;
        this.spawnRings(12);
      });
  
      resetButton.addEventListener("click", () => {
        this.scene.restart(); // Reinicia escena
      });
  
      this.listenersAttached = true;
    }

    const bg = this.add.image(0, 0, "background").setOrigin(0);
    const canvasWidth = this.cameras.main.width;
    const canvasHeight = this.cameras.main.height;

    const scaleX = canvasWidth / bg.width;
    const scaleY = canvasHeight / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    bg.setScrollFactor(0);
    bg.setPosition(
      (canvasWidth - bg.displayWidth) / 2,
      (canvasHeight - bg.displayHeight) / 2
    );
    this.bg = bg;
    this.bgBaseY = bg.y;
    this.bgTime = 0;

    this.physics.world.setBoundsCollision(true, true, true, true);

    // Spikes y sensores
    this.spikeSensors = [];
    this.spikesGroup = this.physics.add.staticGroup();

    const spikePositions = [
      { x: 75, y: 350 },
      { x: 150, y: 250 },
      { x: 225, y: 350 },
    ];

    spikePositions.forEach((pos) => {
      const spike = this.add.image(pos.x, pos.y, "spike");
      spike.setScale(0.3);
      spike.setOrigin(0.5, 1);

      const spikeWidth = 0.01;
      const spikeHeight = 10;
      const colliderY = pos.y - spikeHeight; // más arriba

      // Collider visual
      const spikeCollider = this.spikesGroup
        .create(pos.x, colliderY, null)
        .setDisplaySize(spikeWidth, spikeHeight)
        .setVisible(false);
      spikeCollider.body.updateFromGameObject();

      // // Sensor igual al collider
      const sensor = this.physics.add
        .staticImage(pos.x, colliderY, null)
        .setSize(10, spikeHeight)
        .setVisible(false);

      this.spikeSensors.push(sensor);
    });

    this.createWalls();

    // Grupo de anillos
    this.ringsGroup = this.physics.add.group();
    this.ringSpawnXRange = { min: 80, max: 270 };
    this.ringStartY = 50;
    this.ringTypes = [
      "red_circle",
      "blue_circle",
      "green_circle",
      "yellow_circle",
    ];

    document.getElementById("startButton").addEventListener("click", () => {
      if (this.gameInProgress) return;
      this.gameInProgress = true;
      startButton.disabled = true; // deshabilita el botón
      this.spawnRings(12);
    });

    document.getElementById("resetButton").addEventListener("click", () => {
      this.scene.restart();
    });
    

    document.getElementById("leftButton").addEventListener("click", () => {
      this.disperseRings("left");
    });

    document.getElementById("rightButton").addEventListener("click", () => {
      this.disperseRings("right");
    });

    // Piso invisible
    const floor = this.physics.add
      .staticImage(this.sys.canvas.width / 2, 450, null)
      .setDisplaySize(this.sys.canvas.width, 24)
      .setVisible(false);
    floor.body.updateFromGameObject();
    this.floor = floor;

    // this.physics.world.createDebugGraphic();
  }

  updateScoreText() {
    document.getElementById("score").innerText = `${this.score}`;
  }

  trapRing(ring) {
    if (ring.getData("hooked")) return;

    ring.setVelocity(0, 0);
    ring.body.setAllowGravity(false);
    ring.body.setImmovable(true);
    ring.body.moves = false;
    ring.body.checkCollision.none = true;
    ring.setData("hooked", true);

    this.score += 1;
    this.updateScoreText()
  }

  createWalls() {
    const canvasWidth = this.cameras.main.width;
    const canvasHeight = this.cameras.main.height;
    const thickness = 32;

    const leftWall = this.physics.add
      .staticImage(0, this.sys.canvas.height / 2, null)
      .setDisplaySize(12, this.sys.canvas.height)
      .setOrigin(0, 0.5)
      .setVisible(false);

    leftWall.body.updateFromGameObject();
    this.leftWall = leftWall;

    const rightWall = this.physics.add
      .staticImage(this.sys.canvas.width, this.sys.canvas.height / 2, null)
      .setDisplaySize(12, this.sys.canvas.height)
      .setOrigin(1, 0.5)
      .setVisible(false);

    rightWall.body.updateFromGameObject();
    this.rightWall = rightWall;

    const ceiling = this.physics.add
      .staticImage(this.sys.canvas.width / 2, 0, null)
      .setDisplaySize(this.sys.canvas.width, 24)
      .setVisible(false);
    ceiling.body.updateFromGameObject();
    this.ceiling = ceiling;
  }

  spawnRings(count) {
    this.ringsGroup = this.physics.add.group(); // Reinicia grupo

    let created = 0;
    const timer = this.time.addEvent({
      delay: 150,
      callback: () => {
        if (created >= count) {
          timer.remove();
          return;
        }

        const type = Phaser.Utils.Array.GetRandom(this.ringTypes);
        const x = Phaser.Math.Between(
          this.ringSpawnXRange.min,
          this.ringSpawnXRange.max
        );
        const ring = this.physics.add.image(x, this.ringStartY, type);

        // Colliders
        this.physics.add.collider(ring, this.floor);
        this.physics.add.collider(ring, this.leftWall);
        this.physics.add.collider(ring, this.rightWall);
        this.physics.add.collider(ring, this.ceiling);

        ring.setScale(0.1);
        ring.setBounce(0.5);
        ring.setCollideWorldBounds(true);
        ring.body.setSize(ring.width * 0.3, ring.height * 0.3, true);

        ring.setData("hooked", false);
        this.ringsGroup.add(ring);

        // Colliders y overlaps
        this.physics.add.collider(ring, this.floor);
        this.physics.add.collider(ring, this.spikesGroup);

        // Detectar si el anillo toca un sensor para engancharse
        this.spikeSensors.forEach((sensor) => {
          this.physics.add.overlap(ring, sensor, () => {
            const isFalling = ring.body.velocity.y > 0;
            const notHooked = !ring.getData("hooked");

            if (isFalling && notHooked) {
              this.trapRing(ring);
            }
          });
        });

        created++;
      },
      callbackScope: this,
      loop: true,
    });
  }

  disperseRings(side) {
    const middleX = this.sys.canvas.width / 2;

    this.ringsGroup.children.iterate((ring) => {
      if (!ring.body || ring.getData("hooked")) return;

      const isRight = ring.x >= middleX;
      const isLeft = ring.x < middleX;

      if ((side === "right" && isRight) || (side === "left" && isLeft)) {
        const randomX = Phaser.Math.FloatBetween(-100, 100);
        const randomY = Phaser.Math.FloatBetween(-300, -150);

        ring.body.setVelocity(randomX, randomY);
      }
    });
  }

  update(time, delta) {
    this.bgTime += delta;
    const wave = Math.sin(this.bgTime * 0.001) * 5;
    this.bg.y = this.bgBaseY + wave;
  }
}
