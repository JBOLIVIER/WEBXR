import * as THREE from 'three';

export function placeMeshesOnGrid(size, divisions, meshes, grid, scene, PlayStep) {
    let mesh;
    let xori = grid.position.x;
    let yori = grid.position.y;
    let zori = grid.position.z;
    const step = (size / divisions) * 0.1; // Step size between grid lines
    // Place a mesh at the center of each grid cell
    if (PlayStep == 0) {
        let count = 0;
        for (let i = -divisions / 2; i < divisions / 2; i++) {
            for (let j = -divisions / 2; j < divisions / 2; j++) {
                // Calculate the center position of each grid cell
                const x = i * step;
                const z = j * step;
                // Create a mesh and set its position
                mesh = meshes[count];
                mesh.position.set(xori + x, yori + 0.01, zori + z); // Position the mesh above the grid (0.5 units up)

                // Add the mesh to the scene
                scene.add(mesh);
                count++;
            }
        }
    };
    if (PlayStep == 1) {
        let geometry = new THREE.PlaneGeometry(2, 2);
        let material = new THREE.MeshStandardMaterial();
        let waterCase = new THREE.Mesh(geometry.rotateX(- Math.PI / 2), material);
        console.log(waterCase);
        waterCase.material.color.set(0x0E519C);
        waterCase.position.set(xori, yori, zori); // Position the mesh above the grid (0.5 units up)
        // Add the mesh to the scene
        scene.add(waterCase);
    };

}