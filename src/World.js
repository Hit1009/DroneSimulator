
export {World};
import * as THREE from '../threejs/build/three.module.js';
import {Landscape} from './rendering/landscape.js'
import {Plane} from "./objects/plane.js";
import {Drone, createDroneModel} from "./objects/drone.js";
import {FoliageSystem} from "./rendering/foliageSystem.js";
import {getHeightAtLocation} from "./rendering/HeightGenerator.js";




class World {
	constructor(camera, sunDirectionVector) {
		this.camera = camera;
		// Create scene
		this.scene = new THREE.Scene();

		// Light
		const lightIntensity = 0.2;
		this.ambiantLight = new THREE.AmbientLight(new THREE.Color(lightIntensity, lightIntensity, lightIntensity));
		this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
		this.scene.add(this.ambiantLight);
		this.scene.add(this.directionalLight);

		// Set heightmap generator function
		this.heightGenerator = { getHeightAtLocation };

		// Create foliage system
		this.foliageSystem = new FoliageSystem(this.scene, this.heightGenerator, null, camera);


		// Create landscape
		this.landscape = new Landscape(this.scene, camera, this.heightGenerator);
		this.scene.add(camera);

		this.planes = [];

		this.sunDirection = sunDirectionVector;
	}

	add(object) {
		this.scene.add(object);
	}

	tick(deltaTime) {


		this.directionalLight.target.position.set(0, 0, 0);
		this.directionalLight.position.set(0,0, 0).addScaledVector(this.sunDirection, -10000)

		this.landscape.render(deltaTime);
		this.foliageSystem.update();
		for (let plane of this.planes) {
			plane.update(deltaTime);
			if (plane.position.z < this.heightGenerator.getHeightAtLocation(plane.position.x, plane.position.y)) {
				plane.position.set(0, 0, this.heightGenerator.getHeightAtLocation(0, 0) + 400);
				plane.velocity.set(0, 0, 0);
			}
		}
	}

	addPlane(mesh) {
		// Create a drone instead of using the provided mesh
		const drone = new Drone(this.scene, true);
		this.planes.push(drone);
		return drone;
	}
}