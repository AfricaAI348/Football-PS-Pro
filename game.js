// Football PS Pro 3D Script
window.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('gameScene');
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.2, 0.7, 0.2);

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 2,
      Math.PI / 3,
      60,
      new BABYLON.Vector3(0, 0, 0),
      scene
    );
    camera.attachControl(canvas, true);

    // Lights
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.9;

    // Football pitch
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 100, height: 60 }, scene);
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.1);
    ground.material = groundMat;

    // Ball
    const ball = BABYLON.MeshBuilder.CreateSphere('ball', { diameter: 2 }, scene);
    const ballMat = new BABYLON.StandardMaterial('ballMat', scene);
    ballMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    ball.material = ballMat;
    ball.position.y = 1;

    // Players
    const playerMatA = new BABYLON.StandardMaterial('playerMatA', scene);
    playerMatA.diffuseColor = new BABYLON.Color3(0, 0, 1);
    const playerMatB = new BABYLON.StandardMaterial('playerMatB', scene);
    playerMatB.diffuseColor = new BABYLON.Color3(1, 0, 0);

    const playersA = [];
    const playersB = [];
    for (let i = 0; i < 5; i++) {
      const pA = BABYLON.MeshBuilder.CreateCapsule('pA' + i, { height: 4, radius: 1 }, scene);
      pA.material = playerMatA;
      pA.position = new BABYLON.Vector3(-20 + i * 5, 2, -10);
      playersA.push(pA);

      const pB = BABYLON.MeshBuilder.CreateCapsule('pB' + i, { height: 4, radius: 1 }, scene);
      pB.material = playerMatB;
      pB.position = new BABYLON.Vector3(-20 + i * 5, 2, 10);
      playersB.push(pB);
    }

    // Physics
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.OimoJSPlugin());

    ball.physicsImpostor = new BABYLON.PhysicsImpostor(
      ball,
      BABYLON.PhysicsImpostor.SphereImpostor,
      { mass: 1, restitution: 0.7 },
      scene
    );

    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.2 },
      scene
    );

    // AI movement
    scene.onBeforeRenderObservable.add(() => {
      playersB.forEach(p => {
        const dir = ball.position.subtract(p.position);
        if (dir.length() > 5) {
          dir.normalize();
          p.position.addInPlace(dir.scale(0.05));
        }
      });
    });

    // Controls
    document.getElementById('kickBtn').addEventListener('click', () => {
      const force = new BABYLON.Vector3(Math.random() - 0.5, 0.3, Math.random() - 0.5).scale(40);
      ball.physicsImpostor.applyImpulse(force, ball.getAbsolutePosition());
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      ball.position = new BABYLON.Vector3(0, 1, 0);
      ball.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
    });

    return scene;
  };

  const scene = createScene();
  engine.runRenderLoop(() => scene.render());
  window.addEventListener('resize', () => engine.resize());
});
