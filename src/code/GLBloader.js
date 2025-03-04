import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export async function loadGLBAndGetMesh(url) {
    const loader = new GLTFLoader();

    // Return a promise that resolves with the first mesh
    return new Promise((resolve, reject) => {
        loader.load(url, (gltf) => {
            // Traverse the loaded scene to find the first mesh
            let firstMesh = null;
            gltf.scene.traverse((child) => {
                if (child.isMesh && !firstMesh) {
                    firstMesh = child; // Assign the first mesh found
                }
            });

            if (firstMesh) {
                // Resolve the promise with the first mesh
                resolve(firstMesh);
            } else {
                // Reject the promise if no mesh is found
                reject('No mesh found in the GLB file');
            }
        }, undefined, (error) => {
            console.error('Error loading GLB:', error);
            reject(error); // Reject the promise in case of error
        });
    });
}
