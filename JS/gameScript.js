import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js'
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/FBXLoader.js';
import * as LSManager from '../JS/localStorageManager.js';
//global variables
var scene;
var camera;
//estas variables son para multijugador local
var cameras=[];
var renderers=[];
var players=[];
//
var loader; //variable que sirve como cargador FBX
var renderer;
var clock;
var deltaTime;
var listener; //cargador para audio
var keys={}; //variable para almacenar las teclas presionadas
var loadedAssets=0; //cuantos assets cargan
const totalAssets=0; //cuantos deben cargar antes de obtener el deltatime
var objects = []; //variable para almacenar los objetos a colisionar
var localStorageInfo; //variable para acceder a las llaves del local storage, sera un objeto literal
const rayFloor=new THREE.Vector3(0, -1, 0);
const rayCasterDown= new THREE.Raycaster();
var visibleSize = { width: window.innerWidth, height: window.innerHeight};
var target = new THREE.Vector3();
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
const player={
    death: false,
    victory: false,
    mixer: null, //objeto de threejs que permite manejar animaciones
    handler: null, //valor que permite manejar la rotacion, animacion, etc
    yaw:null,
    forward:null,
    actions: {
        idle: null,
        walking: null,
        death: null,
        win:null
    }
};
const player2={
	death: false,
    victory: false,
    mixer: null, //objeto de threejs que permite manejar animaciones
    handler: null, //valor que permite manejar la rotacion, animacion, etc
    yaw:null,
    forward:null,
    actions: {
        idle: null,
        walking: null,
        death: null,
        win:null
    }

};
const terrain={
	handler:null
};
var myplane; //es el ultimo intento para que podamos agarrar el terreno
var miplanito;
var terrenoColision=[];


//shaders en constantes
const _VS= `
uniform sampler2D bumpTex;
uniform float bumpScale;

varying float vAmount;
varying vec2 vUV;

void main() 
{ 
	vUV = uv;
	vec4 bumpData = texture2D(bumpTex, uv);
	
	vAmount = bumpData.r;
	
    vec3 newPosition = position + normal * bumpScale * vAmount;
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}`;
const _FS= `
uniform sampler2D blendMap;
uniform sampler2D baseTex;
uniform sampler2D redTex;
uniform sampler2D greenTex;
uniform sampler2D blueTex;

varying vec2 vUV;

varying float vAmount;

void main() 
{	
	vec4 tbBlend = texture2D(blendMap, vUV );

	float tbBaseWeight = 1.0 - max(tbBlend.r, max(tbBlend.g, tbBlend.b));

	vec4 base =  tbBaseWeight * texture2D(baseTex, vUV * 10.0);
	vec4 red = tbBlend.r * texture2D(redTex, vUV * 10.0);
	vec4 green = tbBlend.g * texture2D(greenTex, vUV * 10.0);
	vec4 blue = tbBlend.b * texture2D(blueTex, vUV * 10.0);
	vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0) + base + red + green + blue;
	finalColor.a=tbBlend.a;
	gl_FragColor= finalColor;
}`;


//inicializamos las variables globales, luego las metemos a una funcion
function SetUpScene(gamemode){ //set para un solo jugador
	scene=new THREE.Scene(); //crea la escena
	clock= new THREE.Clock();
	loader=new FBXLoader();
	listener = new THREE.AudioListener(); //cargador de audio
	const monsterSound = new THREE.Audio(listener); //añadir sonido de monstruos/ruido de fondo
	const runningChild = new THREE.Audio(listener);
	const gameOverSound = new THREE.Audio(listener); //añadir sonido de derrota
	const victorySound = new THREE.Audio(listener); //añadir sonido de victoria
	var ambientLight = new THREE.AmbientLight(new THREE.Color(1, 1, 1), 1.0);
	scene.add(ambientLight);

	var directionalLight = new THREE.DirectionalLight(new THREE.Color(1, 1, 0), 0.4);
	directionalLight.position.set(0, 0, 1);
	scene.add(directionalLight);
		if(gamemode=="single"){
		
			camera= new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1, 1000);
			
			renderer= new THREE.WebGLRenderer();
			camera.add( listener );
			camera.position.set(0.0,25.0,40);
			renderer.setClearColor(new THREE.Color(1,1,1)); //setea el color a blanco
			renderer.setSize(window.innerWidth,window.innerHeight);

			scene.add(camera);
			camera.position.set(0,150,400);
			camera.lookAt(scene.position);	
			//añadirlo al html
			document.body.appendChild(renderer.domElement); //indica que el canvas en html es nuestro lienzo donde renderizamos

		}else if (gamemode=="multiplayerLocal"){
			createCamera();
			createCamera(); //almacenadas en cameras[0] y cameras[1]

			createRenderer(new THREE.Color(0, 0, 0));
			createRenderer(new THREE.Color(0.0, 0, 0));

			cameras[0].add(listener);
			cameras[1].add(listener);


			scene.add(cameras[0]);
			scene.add(cameras[1]);

			cameras[0].position.set(0.0,25.0,5);
			cameras[1].position.set(0.0,25.0,5);

			cameras[0].lookAt(scene.position);	
			cameras[1].lookAt(scene.position);


			$("body").append('<div id="mainDiv" style="display: flex; height: 100px;"></div>');

			
			$("#mainDiv").append('<div style="width: 50%;" id="scene-section"></div>');
			$("#mainDiv").append('<div style="flex-grow: 1;" id="scene-section-2"></div>');

			$("#scene-section").append(renderers[0].domElement);
			$("#scene-section-2").append(renderers[1].domElement);
		}
	

}

function createCamera() {
	var camera = new THREE.PerspectiveCamera(75, visibleSize.width / visibleSize.height, 0.1, 100);
	cameras.push(camera);
}
function createRenderer(color) {
	var renderer = new THREE.WebGLRenderer( {precision: "mediump" } );
	renderer.setClearColor(color);
	renderer.setPixelRatio((visibleSize.width / 2) / visibleSize.height);
	renderer.setSize(visibleSize.width / 2, visibleSize.height);

	renderers.push(renderer);
}

//sacamos la informacion del Local Storage

//localStorageInfo=LSManager.leer();
//del local storage obtenemos: Tipo de jugador, tipo de escenario, nombre del jugador
//añadimos cosas del jugador de ser necesarias

//guardamos de nuevo en el local storage, ya actualizado, y lo volveremos a hacer al terminar el juego
//LSManager.guardar(localStorageInfo);
//al acabar el juego y guardar en la base de datos, ejecutamos la eliminacion del local storage
//LSManager.eliminar();

function loadOBJWithMTL(path, objFile, mtlFile, _onLoadCallback) {
		
		var mtLoader = new THREE.MTLLoader();
		mtLoader.setPath(path); //aqui ponemos la ruta del archivo
		mtlLoader.load(mtlFile,(misMateriales)=>{ //carga asincrona
		//aqui nos avisa que ya se cargaron los materiales

		var objLoader= new THREE.OBJLoader();
			objLoader.setMaterials(misMateriales);
			objLoader.setPath(path);
			objLoader.load(objFile, (miObj)=>{
				//aqui se cargo el obj

				//cuando todo termine
				onloadCallBack(miObj);
			});

		});
}

function onStartFloor(bumpmap,blendmap,basemap,redmap,greenmap,bluemap,heightPos){ //esta funcion tambien hay que optimizarla para que cargue otras cosas
	const textureLoader=new THREE.TextureLoader();
    const textureRepeat=100;
    const bumpScale=200;
    textureLoader.load(bumpmap,(bump)=>{
    	textureLoader.load(blendmap,(blend)=>{
    		textureLoader.load(basemap,(base)=>{ //los demas si se repiten
    			base.wrapS=base.wrapT=THREE.RepeatWrapping; 
    			base.repeat.multiplyScalar(textureRepeat); 
    			textureLoader.load(redmap,(red)=>{
    				red.wrapS=red.wrapT=THREE.RepeatWrapping; 
    				red.repeat.multiplyScalar(textureRepeat); 
    				textureLoader.load(greenmap,(green)=>{
    					green.wrapS=green.wrapT=THREE.RepeatWrapping; 
    					green.repeat.multiplyScalar(textureRepeat); 
    					textureLoader.load(bluemap,(blue)=>{
    						blue.wrapS=blue.wrapT=THREE.RepeatWrapping; 
    						blue.repeat.multiplyScalar(textureRepeat); 
    						var customUniforms = {
							bumpTex:	{ type: "t", value: bump },
							bumpScale:	{ type: "f", value: bumpScale },
							blendMap:   { type: "t", value: blend },
							baseTex:	{ type: "t", value: base },
							redTex:	{ type: "t", value: red },
							greenTex:	{ type: "t", value: green },
							blueTex:	{ type: "t", value: blue },
							};

							var customMaterial = new THREE.ShaderMaterial( 
							{
							    uniforms: customUniforms,
								vertexShader:   _VS,
								fragmentShader: _FS,
								// side: THREE.DoubleSide
							});
							var planeGeo = new THREE.PlaneGeometry( 1000, 1000, 100, 100 );
							myplane = new THREE.Mesh(planeGeo, customMaterial );
							myplane.name="terreno";
							myplane.rotation.x = -Math.PI / 2;
							myplane.position.y = heightPos;
							scene.add( myplane );
							miplanito= scene.getObjectByName("terreno");
							loadedAssets++;
    					});
    				});
    			});
    		});
    	});
    });
}



function onStartSkybox(_path, skyarray) {
    const ctLoader = new THREE.CubeTextureLoader();
    ctLoader.setPath( 'gameAssets/terrainTextures/sky/' ); //necesitamos el path de la carpeta donde se encuentran todas

    ctLoader.load(skyarray, (cubeTexture) => {
        scene.background = cubeTexture;
        loadedAssets++;
    });
}
function setItemsOnGame(){
	//en esta funcion vamos a cargar todos los modelos del escenario, el jugador y enemigos se cargan en otra
	//ademas ocupamos información del local storage para saber que escenario cargar
	loader.load('gameAssets/3dModels/Escenario/Laberintos1.fbx',(model)=>{
		model.name="Laberinto";
		model.scale.multiplyScalar(.05);
		scene.add(model);
		model.position.set(10,21,10);
	});

	loader.load('gameAssets/3dModels/Escenario/Arbol1.fbx',(model)=>{
		model.name="Arbol1";
		model.scale.multiplyScalar(0.02);
		model.position.set(0,50,0);
		scene.add(model);
	});
	loader.load('gameAssets/3dModels/Escenario/Arbol2.fbx',(model)=>{
		model.name="Arbol12";
		model.scale.multiplyScalar(0.02);
		model.position.set(0,50,25);
		scene.add(model);
	});
	loader.load('gameAssets/3dModels/Escenario/Arbol3.fbx',(model)=>{
		model.name="Arbol3";
		model.scale.multiplyScalar(0.02);
		model.position.set(0,50,45);
		scene.add(model);
	});

	loader.load('gameAssets/3dModels/Escenario/Arbol5.fbx',(model)=>{
		model.name="Arbol5";
		model.scale.multiplyScalar(0.02);
		model.position.set(0,50,-20);
		scene.add(model);
	});


}

function completeLoadPlayer(type, nombre, posicion,player){
	if(type=="druida"){
		loader.load('gameAssets/3dModels/druida/Druida.fbx',(model)=>{
			model.scale.multiplyScalar(0.09);
			model.rotation.y=THREE.Math.degToRad(-180); 
			player.handler=model;
			player.mixer=new THREE.AnimationMixer(player.handler);

			loader.load('gameAssets/3dModels/druida/animations/Druida@Idle.fbx',(animacion1)=>{
				const idleanimation=animacion1.animations[0];
	            player.actions.idle=player.mixer.clipAction(idleanimation);
	            player.actions.idle.play(); //reproducir animacion
	            loadedAssets++;
			});
			loader.load('gameAssets/3dModels/druida/animations/Druida@Death.fbx', function (asset){ //cargar animacion
	            const deathanimation=asset.animations[0];
	            player.actions.death=player.mixer.clipAction(deathanimation);
	            player.actions.death.loop=THREE.LoopOnce;  //que solo se ejecute una vez
	            player.actions.death.clampWhenFinished=true; //cuando se acabaa se queda pausado en el ultimo frame
	            loadedAssets++;
        	});
        	loader.load('gameAssets/3dModels/druida/animations/Druida@Victory.fbx', function (asset1){ //cargar animacion
	            const victoryAnimation=asset1.animations[0];
	            player.actions.win=player.mixer.clipAction(victoryAnimation);
	            player.actions.win.loop=THREE.LoopOnce;  //que solo se ejecute una vez
	            player.actions.win.clampWhenFinished=true; //cuando se acabaa se queda pausado en el ultimo frame
	            loadedAssets++;
        	});
	        	loader.load('gameAssets/3dModels/druida/animations/Druida@Running.fbx', function (asset2){ //cargar animacion
	            const walkanimation=asset2.animations[0];
	            player.actions.walking=player.mixer.clipAction(walkanimation);
	            loadedAssets++;
        	});
			model.name=nombre;
			model.position.set(posicion.x,posicion.y,posicion.z);
			player.yaw=0;
			player.forward=0;
			
			
			//model.add(camera);
			//camera.position.set(0,25,0);
			scene.add(model);

		});
			
	}else if (type=="wendigo"){
		loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
			model.scale.multiplyScalar(0.2);
			player.handler=model;
			player.mixer=new THREE.AnimationMixer(player.handler);

			loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Idle.fbx',(animacion1)=>{
				const idleanimation=animacion1.animations[0];
	            player.actions.idle=player.mixer.clipAction(idleanimation);
	            player.actions.idle.play(); //reproducir animacion
	            loadedAssets++;
			});
			loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Dying.fbx', function (asset){ //cargar animacion
	            const deathanimation=asset.animations[0];
	            player.actions.death=player.mixer.clipAction(deathanimation);
	            player.actions.death.loop=THREE.LoopOnce;  //que solo se ejecute una vez
	            player.actions.death.clampWhenFinished=true; //cuando se acabaa se queda pausado en el ultimo frame
	            loadedAssets++;
        	});
        	loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Victory.fbx', function (asset){ //cargar animacion
	            const victoryAnimation=asset.animations[0];
	            player.actions.win=player.mixer.clipAction(victoryAnimation);
	            player.actions.win.loop=THREE.LoopOnce;  //que solo se ejecute una vez
	            player.actions.win.clampWhenFinished=true; //cuando se acabaa se queda pausado en el ultimo frame
	            loadedAssets++;
        	});
        	loader.load('gameAssets/3dModels/wendigo/animation/Wendigo@Running.fbx', function (asset){ //cargar animacion
	            const walkanimation=asset.animations[0];
	            player.actions.walking=player.mixer.clipAction(walkanimation);
	            loadedAssets++;
        	});
			model.name=nombre;
			model.position.set(posicion.x,posicion.y,posicion.z);
			player.yaw=0;
			player.forward=0;
			scene.add(model);
        	
			

		});

	}
			
}
function loadPlayerS(playernumber,playertype){
	if(playernumber==1){ //si solo es un jugador
		var pos= new THREE.Vector3(0.0,17.5,5);
		completeLoadPlayer(playertype,"Jugador",pos);
	}else{
		
				var pos= new THREE.Vector3(0.0,17.5,5);
				completeLoadPlayer(playertype,"Jugador1",pos,player);
				player.yaw=0;
				player.forward=0;
				players.push(player);
			
				let pos2= new THREE.Vector3(5.0,17.5,5.0);
				completeLoadPlayer(playertype,"Jugador2",pos2,player2);
				var player1=scene.getObjectById("Jugador1");
				//var player2=player1.clone();
				players.push(player2);
		}

	}


function getYonTerrain(player,raydown,terrenito){

	rayCasterDown.set(player.handler, raydown);
	var collisionResults = rayCasterDown.intersectObject(terrenito,true);

	if (collisionResults.length > 0 && collisionResults[0].distance > 0){
	   const pointHeight = collisionResults[0].point.y;
	   const relativeHeight = player.handler.position.y - pointHeight;
	   return relativeHeight;
	}else{
		return 0.0;
	}

}
function onStartEnemies(){


}

function onStart(){
	SetUpScene("multiplayerLocal");
	onStartSkybox('gameAssets/terrainTextures/sky/',[ 'px.jpg', 'nx.jpg','py.jpg', 'ny.jpg','pz.jpg', 'nz.jpg']);
	onStartFloor('gameAssets/terrainTextures/terrain/altura3.jpg','gameAssets/terrainTextures/terrain/blendMap1.jpg',
	'gameAssets/terrainTextures/terrain/soil.jpg','gameAssets/terrainTextures/terrain/Piedras.jpg',	
	'gameAssets/terrainTextures/terrain/piso.jpg','gameAssets/terrainTextures/terrain/moss.jpg',-130);
	setItemsOnGame();
	loadPlayerS(2,"wendigo");
	onStartEnemies();
	window.addEventListener( 'resize', onWindowResize );
}
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onmousemove( event ) {

    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );

}
let lastState='idle';
let lastState2='idle';
function onUpdateSinglePlayer(deltaTime){
	 player.mixer.update(deltaTime); //para hacer el update de la animacion necesita un deltatime
    if (!player.death){
        let state='idle';
	
        if(keys['W']){
        	player.forward=10;
        	player.handler.translateZ(player.forward * deltaTime);
            
            state='walking';
        }
        if(keys['S']){
        	player.forward=-10;
            player.handler.translateZ(player.forward * deltaTime);
            state='walking';
            
        }if(keys['A']){
        	player.yaw=5;
        	player.handler.rotation.y += player.yaw * deltaTime;
		
            
        }if(keys['D']){
        	player.yaw=-5;
        	player.handler.rotation.y += player.yaw * deltaTime;
		
            
        }

		var relativeCameraOffset = new THREE.Vector3(0,11.5,-35);

		var cameraOffset = relativeCameraOffset.applyMatrix4( player.handler.matrixWorld );

		camera.position.x = cameraOffset.x;
		camera.position.y = cameraOffset.y;
		camera.position.z = cameraOffset.z;
		camera.lookAt( player.handler.position);

        if (lastState!=state){
            const lastAnimation=player.actions[lastState];
            const newAnimation=player.actions[state];

            lastAnimation.reset(); //si se esta ejecutando en pausa o lo quesea, empiezo de nuevo
            newAnimation.reset();

            const crossFadeTime=0.2; //tiempo de transicion en seg
            lastAnimation.crossFadeTo(newAnimation,crossFadeTime).play(); //para realizar la transicion suave
            lastState=state;
        }
    }
    /*if(player.handler.position.z<=doll.handler.position.z && !player.victory){ CONDICION DE VICTORIA
        player.victory=true;
        victorySound.play();
        console.log("ganaste");

    }*/

}
function onUpdateTwoPlayers(deltaTime){
	players[0].mixer.update(deltaTime); //para hacer el update de la animacion necesita un deltatime
    players[1].mixer.update(deltaTime);
    if (!players[0].death){
        let state='idle';

        if(keys['W']){
        	players[0].forward=10;
        	players[0].handler.translateZ(players[0].forward * deltaTime);
            
            state='walking';
        }
        if(keys['S']){
        	players[0].forward=-10;
            players[0].handler.translateZ(players[0].forward * deltaTime);
            state='walking';
            
        }if(keys['A']){
        	players[0].yaw=5;
        	players[0].handler.rotation.y += players[0].yaw * deltaTime;
            
        }if(keys['D']){
        	players[0].yaw=-5;
        	players[0].handler.rotation.y += players[0].yaw * deltaTime;
            
        }
		//var heightTest=getYonTerrain(players[0],rayFloor,myplane);
		let relativeCameraOffset = new THREE.Vector3(0,11.5,-35);

		let cameraOffset = relativeCameraOffset.applyMatrix4( players[0].handler.matrixWorld );

		cameras[0].position.x = cameraOffset.x;
		cameras[0].position.y = cameraOffset.y;
		cameras[0].position.z = cameraOffset.z;
		cameras[0].lookAt( players[0].handler.position);

        //cameras[0].position.x = players[0].handler.position.x;
		//cameras[0].position.z = players[0].handler.position.z;

        if (lastState!=state){
            const lastAnimation=players[0].actions[lastState];
            const newAnimation=players[0].actions[state];

            lastAnimation.reset(); //si se esta ejecutando en pausa o lo quesea, empiezo de nuevo
            newAnimation.reset();

            const crossFadeTime=0.2; //tiempo de transicion en seg
            lastAnimation.crossFadeTo(newAnimation,crossFadeTime).play(); //para realizar la transicion suave
            lastState=state;
        }
    } //victory condition

    if (!players[1].death){

    	let state2='idle';

        if(keys['I']){
        	players[1].forward=10;
        	players[1].handler.translateZ(players[1].forward * deltaTime);
            
            state2='walking';
        }
        if(keys['K']){
        	players[1].forward=-10;
            players[1].handler.translateZ(players[1].forward * deltaTime);
            state2='walking';
            
        }if(keys['J']){
        	players[1].yaw=5;
        	players[1].handler.rotation.y += players[1].yaw * deltaTime;
            
        }if(keys['L']){
        	players[1].yaw=-5;
        	players[1].handler.rotation.y += players[1].yaw * deltaTime;
            
        }
		let relativeCameraOffset = new THREE.Vector3(5,11.5,-35);

		let cameraOffset = relativeCameraOffset.applyMatrix4( players[1].handler.matrixWorld );

		cameras[1].position.x = cameraOffset.x;
		cameras[1].position.y = cameraOffset.y;
		cameras[1].position.z = cameraOffset.z;
		cameras[1].lookAt( players[1].handler.position);

        if (lastState2!=state2){
            const lastAnimation=players[1].actions[lastState2];
            const newAnimation=players[1].actions[state2];

            lastAnimation.reset(); //si se esta ejecutando en pausa o lo quesea, empiezo de nuevo
            newAnimation.reset();

            const crossFadeTime=0.2; //tiempo de transicion en seg
            lastAnimation.crossFadeTo(newAnimation,crossFadeTime).play(); //para realizar la transicion suave
            lastState2=state2;
        }
    } //victory condition


}

function onUpdateSingle(deltaTime){
	 onUpdateSinglePlayer(deltaTime); 
}
function onUpdateMulti(deltaTime){
	onUpdateTwoPlayers(deltaTime);
}

function render(){
	 	
		requestAnimationFrame(render);
		deltaTime = clock.getDelta();
		if(loadedAssets>=4){
			onUpdateSingle(deltaTime);
			
			renderer.render(scene,camera);
		}
		
		/*
			camera.rotation.y += yaw * deltaTime;
			camera.translateZ(3*forward * deltaTime);
			
			target.x += ( mouseX - target.x ) * .2;
    		target.y += ( - mouseY - target.y ) * .2;
    		target.z = camera.position.z; // assuming the camera is located at ( 0, 0, z );

    		camera.lookAt( target );
    		*/


}
function renderTwo(){
		requestAnimationFrame(renderTwo);
		deltaTime = clock.getDelta();

		if(loadedAssets>=4){
			onUpdateMulti(deltaTime);
			//var heightTest=getYonTerrain(players[0],rayFloor,miplanito);
			renderers[0].render(scene, cameras[0]);
			renderers[1].render(scene, cameras[1]);
		}
}
function onKeyDown(event) {
	keys[String.fromCharCode(event.keyCode)] = true;
}
function onKeyUp(event) {	
	keys[String.fromCharCode(event.keyCode)] = false;
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);	
onStart();
window.addEventListener("mousemove", onmousemove, false);
//render();
renderTwo();
