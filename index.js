function APP() {
    this.init();
}

APP.prototype.init = function() {
    //初始化场景
    this.scene = new THREE.Scene();

    //初始化相机
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
    this.camera.position.set(0, 0, 0);
    this.scene.add(this.camera);

    //初始化渲染器
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    document.getElementById('main').appendChild(this.renderer.domElement);

    this.initVR();
    this.initCube();
    this.render();
}

APP.prototype.initVR = function() {
    // Apply VR headset positional data to camera.
    this.controls = new THREE.VRControls(this.camera);
    //站立姿态
    this.controls.standing = true;

    // Apply VR stereo rendering to renderer.
    this.effects = new THREE.VREffect(this.renderer);
    this.effects.setSize(window.innerWidth, window.innerHeight);

    this.manager = new WebVRManager(this.renderer, this.effects);
}

APP.prototype.initCube = function() {
    var self = this;
    // skybox
    var skyBoxSize = 5;

    var _geometry = new THREE.BoxGeometry(skyBoxSize, skyBoxSize, skyBoxSize);
    var _material = new THREE.MeshNormalMaterial({
        side: THREE.BackSide
    });
    // Align the skybox to the floor (which is at y=0).
    this.skybox = new THREE.Mesh(_geometry, _material);
    this.skybox.position.y = skyBoxSize/2;
    this.scene.add(this.skybox);
    //this.setupStage()

    // 3d box
    var boxSize = 0.5;
    var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    var material = new THREE.MeshNormalMaterial();
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(0, this.controls.userHeight, -1);

    //this.cube.castShadow = true;
    this.scene.add(this.cube);

    console.log(this.cube)
    console.log(this.scene)
}

APP.prototype.render = function() {
    console.log('render')
    var self = this;
    this.lastRender = 0;
    var render = function(timestamp) {

        var delta = Math.min(timestamp - self.lastRender, 500);
        self.lastRender = timestamp;
        self.cube.rotation.y += delta * 0.0006;

        //更新获取HMD的信息
        self.controls.update();

        //进行camera更新和场景绘制
        self.manager.render(self.scene, self.camera, timestamp);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

// Get the HMD, and if we're dealing with something that specifies
// stageParameters, rearrange the scene.
APP.prototype.setupStage = function() {
    var self = this;
    this.display = '';
    navigator.getVRDisplays().then(function(displays) {
        if (displays.length > 0) {
            self.display = displays[0];
            if (self.display.stageParameters) {
                self.setStageDimensions(self.display.stageParameters);
            }
        }
    });
}

APP.prototype.setStageDimensions = function(stage) {
  // Make the skybox fit the stage.
  var material = this.skybox.material;
  this.scene.remove(this.skybox);

  // Size the skybox according to the size of the actual stage.
  var geometry = new THREE.BoxGeometry(stage.sizeX, 5, stage.sizeZ);
  this.skybox = new THREE.Mesh(geometry, material);

  // Place it on the floor.
  this.skybox.position.y = 5/2;
  this.scene.add(this.skybox);

  // Place the cube in the middle of the scene, at user height.
  this.cube.position.set(0, this.controls.userHeight, 0);
}

new APP();
