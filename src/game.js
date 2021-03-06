
import { Textures, WIDTH } from './textures';
import Background from './background';
import Collidable from './collidable';
import Player from './player';

class Game { }

Game.prototype.init = function () {

  // Arrays
  this.objectList = [];
  this.animated = [];

  // Utilities
  this.raycaster = new THREE.Raycaster();
  this.mouse = new THREE.Vector2();
  this.clock = new THREE.Clock();

  // Scene
  this.scene = new THREE.Scene();

  // Renderer
  this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.querySelector('canvas') });
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setSize(window.innerWidth, window.innerHeight);

  // Light
  this.scene.add(new THREE.AmbientLight(0xffffff));

  // Camera
  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  this.camera.position.set(0, 0, 1200)

  // Player
  this.player = new Player(this.scene);

  this.scene.add(this.player.mesh);

  // Create background template
  let template = new Background();

  // Create background
  let backround_tiles = window.innerWidth < 768 ? [-1, 0, 1] : [-2, -1, 0, 1, 2];
  backround_tiles.forEach(i => {
    let new_background = template.mesh.clone();
    new_background.translateX(i * WIDTH);
    this.scene.add(new_background);
  })

  this.scene.traverse(child => child.userData.animated ? this.animated.push(child) : null);

  // Events
  const defaultEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
  window.addEventListener(defaultEvent, (e) => this.onClick(e), false);
  window.addEventListener('resize', (e) => this.onWindowResize(e), false);
  document.querySelector('.infoBtn').addEventListener(defaultEvent, (e) => {
    document.querySelector('.info').style.visibility =
      document.querySelector('.info').style.visibility == 'visible' ?
        'hidden' : 'visible';
  }, false)
}

Game.prototype.render = function () {

  // Camera follow player
  this.camera.position.x = this.player.mesh.position.x;

  this.player.checkCollision(this.objectList);
  this.updateMap();

  this.player.update(this.clock.getDelta());
  this.updateAnimations(this.clock.getElapsedTime());

  this.renderer.render(this.scene, this.camera);
}

Game.prototype.updateMap = function () {


  // If we are at position 0 generate columns and pickups at position 1
  // If we are at position 1 generate collidables at position 0 and move us to position -1
  // -1 -> 0 -> 1 -> -1 -> 0 -> 1 ... 
  [0, 1].forEach(position => {

    // Poor solution to check at which tile the player is
    // We check 3 conditions because player speed is 3 and window.innerWidth % 3 might vary
    let tile = (position - 1) * WIDTH;
    if (this.player.mesh.position.x == tile ||
      this.player.mesh.position.x == tile + 1 ||
      this.player.mesh.position.x == tile - 1) this.updateCollidable(position);

  })

}

Game.prototype.updateAnimations = function (delta) {

  this.objectList.forEach((obj, i) => obj.userData.isPickup ? this.pickupAnimations(obj, i, delta) : null);

  // Number 1-16
  delta = Math.floor(delta * 16) % 16 + 1;

  // Number 1-8 then 8-1 to make an animation loop instead of restarting it
  // [1,2,3,4,5,6,7,8,7,6,5,4,3,2,1,2,3,4,5,6,7,8,7...]
  delta = delta > 8 ? 16 - delta : delta;

  // Change lava texture to the next one
  this.animated.forEach(texture => texture.material.map = Textures[`lava_slosh_0${delta}`]);
}

Game.prototype.animate = function () {

  requestAnimationFrame(() => this.animate());
  this.render();

}

Game.prototype.pickupAnimations = function (obj, i, delta) {

  obj.position.y = i % 2 == 0 ? Math.sin(delta) * 100 : Math.cos(delta) * 100;
  obj.rotation.z -= 0.03;

}

Game.prototype.updateCollidable = function (position) {

  // Create new columns and pickups when at position 0 / 1
  let objGroup = new Collidable(position);

  // Delete previous ones
  this.objectList = this.objectList.filter(obj => obj.parent ? obj.parent.userData != position : null);
  this.scene.children.forEach(child => child.userData == position ? this.scene.remove(child) : null);

  // Add new
  this.objectList = [...this.objectList, ...objGroup.mesh.children];
  this.scene.add(objGroup.mesh);

}

Game.prototype.onClick = function (event) {
  this.player.isAlive ? this.player.jump() : null;
}


Game.prototype.onWindowResize = function () {

  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(window.innerWidth, window.innerHeight);

}

export default Game;