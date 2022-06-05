import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js'
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/FBXLoader.js';
var escalaEscenario1=.01;
var posicionEscenario1Y=18.25;
var posicionEscenario1X=0;
var posicionEscenario1Z=-8;
var Enemigoescala=.1

function modelosN1(scene,loader,monsterMixers,typep)
{


if (typep==1){

	var geometryCube = new THREE.BoxGeometry(2,2,2);
	var materialCube = new THREE.MeshBasicMaterial({color:0x00aaff});
	var cube1 = new THREE.Mesh(geometryCube,materialCube);
	materialCube.transparent=true;
	materialCube.opacity=0;
	cube1.name="C1";
	cube1.position.set(-6,17.5,-24);
	scene.add(cube1)

	var cube2 = new THREE.Mesh(geometryCube,materialCube);
	cube2.name="C2";
	cube2.position.set(6,17.5,-24);
	scene.add(cube2)

	var cube3 = new THREE.Mesh(geometryCube,materialCube);
	cube3.name="C3";
	cube3.position.set(6,17.5,6);
	scene.add(cube3)

	var cube4 = new THREE.Mesh(geometryCube,materialCube);
	cube4.name="C4";
	cube4.position.set(4,17.5,-18);
	scene.add(cube4)

	

	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E1_ENE1";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		const mixer=new THREE.AnimationMixer(model);
		loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
			const walkanimation=asset.animations[0];
			let monstAnim= mixer.clipAction(walkanimation);;
			monstAnim.play();
			monsterMixers.push(mixer);
			cube1.add(model);
		});
		
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E1_ENE2";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		const mixer=new THREE.AnimationMixer(model);
		loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
			const walkanimation=asset.animations[0];
			let monstAnim= mixer.clipAction(walkanimation);;
			monstAnim.play();
			monsterMixers.push(mixer);
			cube2.add(model);
		});
		
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E1_ENE3";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		const mixer=new THREE.AnimationMixer(model);
		loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
			const walkanimation=asset.animations[0];
			let monstAnim= mixer.clipAction(walkanimation);;
			monstAnim.play();
			monsterMixers.push(mixer);
			cube3.add(model);
		});
		
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E1_ENE4";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		const mixer=new THREE.AnimationMixer(model);
		loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
			const walkanimation=asset.animations[0];
			let monstAnim= mixer.clipAction(walkanimation);;
			monstAnim.play();
			monsterMixers.push(mixer);
			cube4.add(model);
		});
		
	});

}

			loader.load('gameAssets/3dModels/nivel1/nivel1Suelo.fbx',(model)=>{
				model.name="Suelo1";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);
			});

			loader.load('gameAssets/3dModels/nivel1/nivel1Muro1.fbx',(model)=>{
				model.name="Muro1";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro2.fbx',(model)=>{
				model.name="Muro2";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro3.fbx',(model)=>{
				model.name="Muro3";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro4.fbx',(model)=>{
				model.name="Muro4";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro4_1.fbx',(model)=>{
				model.name="Muro4_1";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro5.fbx',(model)=>{
				model.name="Muro5";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro6.fbx',(model)=>{
				model.name="Muro6";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro7.fbx',(model)=>{
				model.name="Muro7";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro7_1.fbx',(model)=>{
				model.name="Muro7_1";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro7_2.fbx',(model)=>{
				model.name="Muro7_2";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});

	
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro9.fbx',(model)=>{
				model.name="Muro9";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro10.fbx',(model)=>{
				model.name="Muro10";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro11.fbx',(model)=>{
				model.name="Muro11";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro11_1.fbx',(model)=>{
				model.name="Muro11_1";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro12.fbx',(model)=>{
				model.name="Muro12";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro13.fbx',(model)=>{
				model.name="Muro13";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro13_1.fbx',(model)=>{
				model.name="Muro13_1";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro14.fbx',(model)=>{
				model.name="Muro14";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro15.fbx',(model)=>{
				model.name="Muro15";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});
			loader.load('gameAssets/3dModels/nivel1/nivel1Muro16.fbx',(model)=>{
				model.name="Muro16";
				model.scale.multiplyScalar(escalaEscenario1);
				model.position.set(posicionEscenario1X,posicionEscenario1Y,posicionEscenario1Z);
				scene.add(model);

			});

}
function modelosN2(scene,loader,monsterMixers,typep)
{

var escalaEscenario2=.015;
var posicionEscenario2Y=19;
var posicionEscenario2X=0;
var posicionEscenario2Z=-23;

if (typep==1){
	var geometryCube = new THREE.BoxGeometry(2,2,2);
	var materialCube = new THREE.MeshBasicMaterial({color:0x000000});
	materialCube.transparent=true;
	materialCube.opacity=.01;
	var cubeb1 = new THREE.Mesh(geometryCube,materialCube);
	cubeb1.name="CB1";
	cubeb1.position.set(-25.5,17.5,2);
	scene.add(cubeb1)

	var cubeb2 = new THREE.Mesh(geometryCube,materialCube);
	cubeb2.name="CB2";
	cubeb2.position.set(22.5,17.5,-48);
	scene.add(cubeb2)

	var cubeb3 = new THREE.Mesh(geometryCube,materialCube);
	cubeb3.name="CB3";
	cubeb3.position.set(22.5,17.5,2.5);
	scene.add(cubeb3)


	var cubeb4 = new THREE.Mesh(geometryCube,materialCube);
	cubeb4.name="CB4";
	cubeb4.position.set(4.5,17.5,0);
	scene.add(cubeb4)

	var cubeb5 = new THREE.Mesh(geometryCube,materialCube);
	cubeb5.name="CB5";
	cubeb5.position.set(-7,17.5,-15);
	scene.add(cubeb5)


	var cubeb6 = new THREE.Mesh(geometryCube,materialCube);
	cubeb6.name="CB6";
	cubeb6.position.set(-13.5,17.5,-46);
	scene.add(cubeb6)


	var cubeb7 = new THREE.Mesh(geometryCube,materialCube);
	cubeb7.name="CB7";
	cubeb7.position.set(-2,17.5,-33.5);
	scene.add(cubeb7)




	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E2_ENE1";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		
		
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E2_ENE2";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		const mixer=new THREE.AnimationMixer(model);
		loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
			const walkanimation=asset.animations[0];
			let monstAnim= mixer.clipAction(walkanimation);;
			monstAnim.play();
			monsterMixers.push(mixer);
			cubeb2.add(model);
		});
		
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E2_ENE3";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		const mixer=new THREE.AnimationMixer(model);
		loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
			const walkanimation=asset.animations[0];
			let monstAnim= mixer.clipAction(walkanimation);;
			monstAnim.play();
			monsterMixers.push(mixer);
			cubeb3.add(model);
		});
		
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E2_ENE4";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		const mixer=new THREE.AnimationMixer(model);
		loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
			const walkanimation=asset.animations[0];
			let monstAnim= mixer.clipAction(walkanimation);;
			monstAnim.play();
			monsterMixers.push(mixer);
			cubeb4.add(model);
		});
		
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E2_ENE5";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		const mixer=new THREE.AnimationMixer(model);
		loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
			const walkanimation=asset.animations[0];
			let monstAnim= mixer.clipAction(walkanimation);;
			monstAnim.play();
			monsterMixers.push(mixer);
			cubeb5.add(model);
		});
		
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E2_ENE6";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		const mixer=new THREE.AnimationMixer(model);
		loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
			const walkanimation=asset.animations[0];
			let monstAnim= mixer.clipAction(walkanimation);;
			monstAnim.play();
			monsterMixers.push(mixer);
			cubeb6.add(model);
		});
		
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E2_ENE7";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		const mixer=new THREE.AnimationMixer(model);
		loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
			const walkanimation=asset.animations[0];
			let monstAnim= mixer.clipAction(walkanimation);;
			monstAnim.play();
			monsterMixers.push(mixer);
			cubeb7.add(model);
		});
		
	});

}


loader.load('gameAssets/3dModels/nivel2/N2Escenario.fbx',(model)=>{
	model.name="Escenario";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});
loader.load('gameAssets/3dModels/nivel2/N2Suelo.fbx',(model)=>{
	model.name="Suelo";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro1.fbx',(model)=>{
	model.name="2Muro1";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro2.fbx',(model)=>{
	model.name="2Muro2";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro3.fbx',(model)=>{
	model.name="2Muro3";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro4.fbx',(model)=>{
	model.name="2Muro4";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro5.fbx',(model)=>{
	model.name="2Muro5";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro6.fbx',(model)=>{
	model.name="2Muro6";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro7.fbx',(model)=>{
	model.name="2Muro7";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro8.fbx',(model)=>{
	model.name="2Muro8";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro9.fbx',(model)=>{
	model.name="2Muro9";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro10.fbx',(model)=>{
	model.name="2Muro10";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro11.fbx',(model)=>{
	model.name="2Muro11";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro12.fbx',(model)=>{
	model.name="2Muro12";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro13.fbx',(model)=>{
	model.name="2Muro13";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro14.fbx',(model)=>{
	model.name="2Muro14";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro15.fbx',(model)=>{
	model.name="2Muro15";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro16.fbx',(model)=>{
	model.name="2Muro16";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro17.fbx',(model)=>{
	model.name="2Muro17";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro18.fbx',(model)=>{
	model.name="2Muro18";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro19.fbx',(model)=>{
	model.name="2Muro19";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro20.fbx',(model)=>{
	model.name="2Muro20";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro21.fbx',(model)=>{
	model.name="2Muro21";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro22.fbx',(model)=>{
	model.name="2Muro22";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro23.fbx',(model)=>{
	model.name="2Muro23";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro24.fbx',(model)=>{
	model.name="2Muro24";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro25.fbx',(model)=>{
	model.name="2Muro25";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro26.fbx',(model)=>{
	model.name="2Muro26";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro27.fbx',(model)=>{
	model.name="2Muro27";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro28.fbx',(model)=>{
	model.name="2Muro28";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro29.fbx',(model)=>{
	model.name="2Muro29";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro30.fbx',(model)=>{
	model.name="2Muro30";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro31.fbx',(model)=>{
	model.name="2Muro31";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});

loader.load('gameAssets/3dModels/nivel2/N2Muro32.fbx',(model)=>{
	model.name="2Muro32";
	model.scale.multiplyScalar(escalaEscenario2);
	model.position.set(posicionEscenario2X,posicionEscenario2Y,posicionEscenario2Z);
	scene.add(model);
});


}
function modelosN3(scene,loader)
{
    var escalaEscenario3=.015;
    var posicionEscenario3Y=10.9;
    var posicionEscenario3X=0;
    var posicionEscenario3Z=-40;
    

        var geometryCube = new THREE.BoxGeometry(0.2,0.2,0.2);
        var geometryCube2 = new THREE.BoxGeometry(100,2,7);
    
        var materialCube = new THREE.MeshBasicMaterial({color:0xffffff});
        materialCube.transparent=true;
        materialCube.opacity=.2;
        var cubec1 = new THREE.Mesh(geometryCube,materialCube);
        cubec1.name="CC1";
        cubec1.position.set(0,17.5,-38);
       
    
        var cubec2 = new THREE.Mesh(geometryCube2,materialCube);
        cubec2.name="CC2";
        cubec2.position.set(0,0,0);
        cubec2.rotation.y=2 * Math.PI * (45 / 360);
    
        cubec1.add(cubec2);
    
        var cubec3 = new THREE.Mesh(geometryCube2,materialCube);
        cubec3.name="CC3";
        cubec3.position.set(0,0,0);
        cubec3.rotation.y=2 * Math.PI * (135 / 360);
        cubec1.add(cubec3);

		scene.add(cubec1);

		const jug = scene.getObjectByName('Suelo3');
    
    
		loader.load('gameAssets/3dModels/nivel3/E3_Arbol9.fbx',(model)=>{
            model.name="Arbol9";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
    
        loader.load('gameAssets/3dModels/nivel3/E3_suelo.fbx',(model)=>{
            model.name="Suelo";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo2.fbx',(model)=>{
            model.name="Suelo2";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        //llevan colisiones
        loader.load('gameAssets/3dModels/nivel3/E3_suelo3.fbx',(model)=>{
            model.name="Suelo3";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo4.fbx',(model)=>{
            model.name="Suelo4";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo5.fbx',(model)=>{
            model.name="Suelo5";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo6.fbx',(model)=>{
            model.name="Suelo6";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo7.fbx',(model)=>{
            model.name="Suelo7";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo8.fbx',(model)=>{
            model.name="Suelo8";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo9.fbx',(model)=>{
            model.name="Suelo9";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo10.fbx',(model)=>{
            model.name="Suelo10";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo11.fbx',(model)=>{
            model.name="Suelo11";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo12.fbx',(model)=>{
            model.name="Suelo12";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo13.fbx',(model)=>{
            model.name="Suelo13";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_suelo14.fbx',(model)=>{
            model.name="Suelo14";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_ControladorJefe.fbx',(model)=>{
            model.name="ControladorJefe";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
    
    
        //llevan colisiones
       
    
        //tumbas
        loader.load('gameAssets/3dModels/nivel3/E3_T1.fbx',(model)=>{
            model.name="T1";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T2.fbx',(model)=>{
            model.name="T2";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T3.fbx',(model)=>{
            model.name="T3";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T4.fbx',(model)=>{
            model.name="T4";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T5.fbx',(model)=>{
            model.name="T5";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T6.fbx',(model)=>{
            model.name="T6";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T7.fbx',(model)=>{
            model.name="T7";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T8.fbx',(model)=>{
            model.name="T8";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T9.fbx',(model)=>{
            model.name="T9";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T10.fbx',(model)=>{
            model.name="T10";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T11.fbx',(model)=>{
            model.name="T11";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T12.fbx',(model)=>{
            model.name="T12";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T13.fbx',(model)=>{
            model.name="T13";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T14.fbx',(model)=>{
            model.name="T14";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T15.fbx',(model)=>{
            model.name="T15";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T16.fbx',(model)=>{
            model.name="T16";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T17.fbx',(model)=>{
            model.name="T17";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T18.fbx',(model)=>{
            model.name="T18";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T19.fbx',(model)=>{
            model.name="T19";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T20.fbx',(model)=>{
            model.name="T20";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T21.fbx',(model)=>{
            model.name="T21";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T22.fbx',(model)=>{
            model.name="T22";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T23.fbx',(model)=>{
            model.name="T23";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        loader.load('gameAssets/3dModels/nivel3/E3_T24.fbx',(model)=>{
            model.name="T24";
            model.scale.multiplyScalar(escalaEscenario3);
            model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
            scene.add(model);
        });
        //tumbas
    
    
    


}

export{modelosN1,modelosN2,modelosN3};