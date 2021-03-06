import { Textures, WIDTH, HEIGHT } from './textures';
import Sound from './audio';

class Player { constructor(scene) { this.constructor(scene) } }

Player.prototype.constructor = function (scene) {

  this.score = 0;
  this.highestScore = 0;
  this.mass = 3;
  this.speed = 3;
  this.audio = Sound;
  this.scene = scene;
  this.isAlive = false;
  this.velocity = new THREE.Vector3(0, 0, 0);
  this.mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(WIDTH / 50, WIDTH / 50, 32),
    new THREE.MeshBasicMaterial({ transparent: true, map: Textures['flyingPixie'] })
  )
  this.mesh.translateY(-HEIGHT * 2);
  this.mesh.translateZ(255);
  this.addRestartButton();

}

Player.prototype.update = function (delta) {

  // Update 3D bounding box
  this.box = new THREE.Box3().setFromObject(this.mesh);

  // Gravitational constant * mass in kg * seconds passed since last  time update
  this.velocity.y -= 9.81 * this.mass * delta;

  // Spin around on column hit
  this.isAlive ? null : this.mesh.rotation.z += 0.1;

  this.mesh.position.y += this.velocity.y;
  this.mesh.position.x += this.velocity.x;

  this.mesh.rotation.z = this.velocity.y < 0 ? this.mesh.rotation.z - 0.01 : this.mesh.rotation.z;
  this.mesh.rotation.z = this.velocity.y > 0 ? this.mesh.rotation.z + 0.01 : this.mesh.rotation.z;

  // Position 1 -> -1
  this.mesh.position.x = this.mesh.position.x > WIDTH ? - WIDTH : this.mesh.position.x;

}

Player.prototype.jump = function () {

  this.velocity.y = 10;
  this.audio.play('wing');

}

Player.prototype.checkCollision = function (objectList) {

  this.objectList = objectList;
  // Find object closest to player
  let closest = objectList.reduce((accumulator, object) =>
    Math.abs(new THREE.Box3().setFromObject(object).min.x - this.mesh.position.x) < accumulator ?
      Math.abs(new THREE.Box3().setFromObject(object).min.x - this.mesh.position.x) : accumulator, Infinity);

  let closest_obj = objectList.filter(object => Math.abs(new THREE.Box3().setFromObject(object).min.x - this.mesh.position.x) == closest);

  closest_obj.forEach(object => {

    let object_box = new THREE.Box3().setFromObject(object);

    if (this.isAlive) {

      // First detect only x position so we can detect when pixie is passing columns
      // Then check y position for collision 
      if (this.box.min.x < object_box.getSize(new THREE.Vector3()).x + object_box.min.x &&
        this.box.min.x + this.box.getSize(new THREE.Vector3()).x > object_box.min.x) {

        if (object.userData.isColumn && !object.passed) {
          object.passed = true;
          this.audio.play('swooshing');
          this.updateScore(this.score + 5);
        } else if (this.box.min.y < object_box.getSize(new THREE.Vector3()).y + object_box.min.y &&
          this.box.min.y + this.box.getSize(new THREE.Vector3()).y > object_box.min.y) {

          if (object.userData.isColumn) this.hit();
          else if (object.userData.isPickup) this.pickup(object, objectList);
        }

        // Upper and lower boundaries
      } else if (this.mesh.position.y > HEIGHT / 2 - HEIGHT / 10 ||
        this.mesh.position.y < -HEIGHT / 2 + HEIGHT / 10) this.hit();
    }

  })

}

Player.prototype.pickup = function (object, objectList) {

  this.audio.play('point');
  this.updateScore(this.score + object.userData.value);
  object.userData.value = 0;

  objectList = objectList.filter(e => e.uuid != object.uuid);

  // Remove mirrored pickups
  objectList.forEach(e => {

    if (e.userData.mirroredPickup == object.uuid) {
      let mirrored = objectList.filter(e => e.userData.mirroredPickup == object.uuid)[0];

      if (mirrored) {
        objectList = objectList.filter(e => e.uuid != mirrored.uuid);
        mirrored.parent.remove(mirrored);
      }

    }

  })

  // Object parent might be removed during update
  if (object.parent) object.parent.remove(object);
  else this.scene.remove(object);

}

Player.prototype.hit = function () {

  this.isAlive = false;
  this.velocity.x = 0;
  this.velocity.y = 10;
  this.audio.play('hit');

  let game_over = document.createElement('div');
  game_over.classList = 'game-over';
  game_over.textContent = 'Game over';
  document.body.append(game_over);
  if (this.score > this.highestScore) this.updateHighestscore()

  setTimeout(() => this.audio.play('die'), this.audio['hit'].duration * 1000);
  setTimeout(() => this.addRestartButton(), (this.audio['die'].duration + this.audio['hit'].duration) * 1000);

}

Player.prototype.addRestartButton = function () {

  let restartButton = document.createElement('img');
  restartButton.src = './assets/playButton.png';
  restartButton.addEventListener('mousedown', (event) => {
    this.restart();
    restartButton.remove();
  }, false);
  document.body.appendChild(restartButton);
  document.querySelector('.game-over') ? document.querySelector('.game-over').remove() : null;

}

Player.prototype.restart = function () {

  this.objectList.forEach(obj => {
    // If an object is a group you cant remove it directly
    this.scene.remove(obj.parent);
    if (obj.parent) obj.parent.remove(this.scene.remove(obj))
  });

  let countdown = document.createElement('div');
  countdown.classList = 'countdown';
  document.body.append(countdown);

  setTimeout(() => countdown.textContent = '3', 0);
  setTimeout(() => countdown.textContent = '2', 1000);
  setTimeout(() => countdown.textContent = '1', 2000);
  setTimeout(() => this.reset(), 3000);

}

Player.prototype.reset = function () {

  this.isAlive = true;

  this.mesh.position.x = 0;
  this.mesh.position.y = 0;

  this.mesh.rotation.z = 0;

  this.velocity.x = this.speed;
  this.velocity.y = 0;

  this.updateScore(0);
  this.objectList = [];
  document.querySelector('.countdown').remove();

}

Player.prototype.updateScore = function (score) {

  this.score = score;
  document.querySelector('.score').textContent = `Score: ${this.score}`;

}

Player.prototype.updateHighestscore = function () {

  this.highestScore = this.score;
  document.querySelector('.highest').textContent = `Best: ${this.score}`;

}

export default Player;
