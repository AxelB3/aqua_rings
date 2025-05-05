import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import './style.css';

const config = {
  type: Phaser.AUTO,
  width: 300,
  height: 450,
  parent: 'phaser-game',
  backgroundColor: '#b2ebf2',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }, // Puedes ajustar la gravedad
      debug: false,
    },
  },
  scene: [PreloadScene, GameScene]
};

new Phaser.Game(config);
