import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { loadGLBAndGetMesh } from './src/code/GLBloader';
import { placeMeshesOnGrid } from './src/code/meshGrid'

let container;
let camera, scene, renderer;
let controller;
let reticle;
let hitTestSource = null;
let hitTestSourceRequested = false;
let InitialPOS = null;
let MeshPromises = [];
let meshes = [];
let PlayStep = 0;
let Raycast;
// c'est pas élégant mais ça marche
const glbFiles = [
  "barrel.glb", "palm-bend.glb", "ship-wreck.glb",
  "boat-row-large.glb", "palm-detailed-bend.glb", "structure-fence.glb",
  "boat-row-small.glb", "palm-detailed-straight.glb", "structure-fence-sides.glb",
  "bottle.glb", "palm-straight.glb", "structure.glb",
  "bottle-large.glb", "patch-grass-foliage.glb", "structure-platform-dock.glb",
  "cannon-ball.glb", "patch-grass.glb", "structure-platform-dock-small.glb",
  "cannon.glb", "patch-sand-foliage.glb", "structure-platform.glb",
  "cannon-mobile.glb", "patch-sand.glb", "structure-platform-small.glb",
  "chest.glb", "platform.glb", "structure-roof.glb",
  "crate-bottles.glb", "platform-planks.glb",
  "crate.glb", "rocks-a.glb", "tool-paddle.glb",
  "flag.glb", "rocks-b.glb", "tool-shovel.glb",
  "flag-high.glb", "rocks-c.glb", "tower-base-door.glb",
  "flag-high-pennant.glb", "rocks-sand-a.glb", "tower-base.glb",
  "flag-pennant.glb", "rocks-sand-b.glb", "tower-complete-large.glb",
  "flag-pirate.glb", "rocks-sand-c.glb", "tower-complete-small.glb",
  "flag-pirate-high.glb", "ship-ghost.glb", "tower-middle.glb",
  "flag-pirate-high-pennant.glb", "ship-large.glb", "tower-middle-windows.glb",
  "flag-pirate-pennant.glb", "ship-medium.glb", "tower-roof.glb",
  "grass.glb", "ship-pirate-large.glb", "tower-top.glb",
  "grass-patch.glb", "ship-pirate-medium.glb", "tower-watch.glb",
  "grass-plant.glb", "ship-pirate-small.glb",
  "hole.glb", "ship-small.glb"
];
const modelPath = '/three_vite_xr/src/assets/kenney_pirate-kit/Models/';
function loadModels() {
  glbFiles.forEach(async (name) => {
    let meshpromise = loadGLBAndGetMesh(modelPath + name);
    MeshPromises.push(meshpromise)
  })
}

//-------------------------------
/// Initials Meshes
//-------------------------------

console.log(MeshPromises);
loadModels();
Promise.all(MeshPromises)
  .then(promises => {
    promises.forEach(p => {
      console.log('mesh pushed');
      p.scale.set(0.05, 0.05, 0.05);
      meshes.push(p);
    })
  })
console.log(meshes);

//-------------------
/// global initiation
//--------------------
init();

async function init() {

  //------------------------------------
  /// SetUp
  //------------------------------------
  container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  //

  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  //-------------------------------
  /// Initial Reticle
  //-------------------------------
  reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );

  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle)

  //-------------------------------
  /// water
  //-------------------------------
  let waterSurf = meshes[-1];

  //-------------------------------
  /// Initial GRID
  //-------------------------------
  const size = 11;
  const divisions = 6;
  let gridHelper = new THREE.GridHelper(size, divisions, 0x35FF03, 0x35FF03);
  gridHelper.visible = false;
  scene.add(gridHelper);

  //------------------------------------
  /// Raycaster
  //------------------------------------

  Raycast = new THREE.Raycaster();

  function onSelect() {
    // étape de placement de la grille de choix
    console.log(PlayStep);
    if (PlayStep == 0) {
      if (reticle.visible) {
        reticle.matrix.decompose(gridHelper.position, gridHelper.quaternion, gridHelper.scale);
        gridHelper.scale.x = 0.1;
        gridHelper.scale.y = 0.1;
        gridHelper.scale.z = 0.1;
        gridHelper.visible = true;
        InitialPOS = gridHelper.position;
        placeMeshesOnGrid(size, divisions, meshes, gridHelper, scene, PlayStep);

      }
    }
    // étape de positionement de la surface d'eau 
    if (PlayStep == 1) {
      if (reticle.visible) {

        reticle.matrix.decompose(gridHelper.position, gridHelper.quaternion, gridHelper.scale);
        gridHelper.scale.x = 0.1;
        gridHelper.scale.y = 0.1;
        gridHelper.scale.z = 0.1;
        gridHelper.visible = true;
        InitialPOS = gridHelper.position;
        placeMeshesOnGrid(size, divisions, meshes, gridHelper, scene, PlayStep);

      }
    }
    if (PlayStep == 2) {

    }
    PlayStep++;
    // étape sélection de position des objets
  }

  controller = renderer.xr.getController(0);
  controller.addEventListener('select', onSelect);
  scene.add(controller);


  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate(timestamp, frame) {
  // gridHelper.position.x = reticle.position.x;
  // gridHelper.position.y = reticle.position.y;
  // gridHelper.position.z = reticle.position.z;

  if (frame) {

    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    if (hitTestSourceRequested === false) {

      session.requestReferenceSpace('viewer').then(function (referenceSpace) {

        session.requestHitTestSource({ space: referenceSpace }).then(function (source) {

          hitTestSource = source;

        });

      });

      session.addEventListener('end', function () {

        hitTestSourceRequested = false;
        hitTestSource = null;

      });

      hitTestSourceRequested = true;

    }

    if (hitTestSource) {

      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length) {

        const hit = hitTestResults[0];

        reticle.visible = true;
        reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);


      } else {

        reticle.visible = false;

      }

    }

  }

  renderer.render(scene, camera);

}