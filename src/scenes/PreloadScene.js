import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image("background", "assets/images/background.png");
    this.load.image("spike", "assets/images/spike.png"); // Asegúrate que el path sea correcto
    this.load.image("red_circle", "assets/images/red_circle.png");
    this.load.image("blue_circle", "assets/images/blue_circle.png");
    this.load.image("green_circle", "assets/images/green_circle.png");
    this.load.image("yellow_circle", "assets/images/yellow_circle.png");
  }

  create() {
    this.scene.start("GameScene");
  }
}
