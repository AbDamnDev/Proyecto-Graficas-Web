import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js'
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/FBXLoader.js';
import {SVGLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/SVGLoader.js';
import {SubdivisionModifier} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/modifiers/SubdivisionModifier.js';
import {ParticleEngine} from '../JS/particle_class.js';
import {Tween} from '../JS/particle_class.js';
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
const raycaster= new THREE.Raycaster();
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
    keys: 0,
    pEye:{
    	active:false,
    	time: 15,
    	num: 0
    },
    pBoot:{
    	active:false,
    	time: 15,
    	num: 0
    },
    pCoat:{
    	active:false,
    	time: 10,
    	num: 0
    },
    actions: {
        idle: null,
        walking: null,
        death: null,
        win:null
    },
    rayo:new THREE.Vector3(0, 0, 1)// front
};
const player2={
	death: false,
    victory: false,
    mixer: null, //objeto de threejs que permite manejar animaciones
    handler: null, //valor que permite manejar la rotacion, animacion, etc
    yaw:null,
    forward:null,
    keys: 0,
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
var itemsCollectable=[];
var pointer= new THREE.Vector2();

//audios
	var monsterSound; //añadir sonido de monstruos
	var AmbienceSound;
	var pickUpSound;
	var powerUp;
	var pickKey;
	var runningChild;
	var gameOverSound; //añadir sonido de derrota
	var childDeath;
	var victorySound;
//boolean back play
var backplay=false;

var FirefliesEngine=null;
//shaders en constantes
const _VS= `
uniform sampler2D bumpTex;
uniform float bumpScale;

varying float vAmount;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

void main() 
{ 
	vUV = uv;
	vNormal = normalMatrix * normal;
	vec4 bumpData = texture2D(bumpTex, uv);
	
	vAmount = bumpData.r;
	
    vec3 vPosition = position + normal * bumpScale * vAmount;
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}`;
const _FS= `
struct DirectionalLight{
    vec3 color;
    vec3 direction;
};


uniform vec3 ambientLightColor;
uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];

uniform sampler2D blendMap;
uniform sampler2D baseTex;
uniform sampler2D redTex;
uniform sampler2D greenTex;
uniform sampler2D blueTex;

varying float vAmount;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

void main() 
{	
	vec4 addedLights = vec4(0.0,0.0,0.0, 1.0);

    addedLights.rgb += ambientLightColor;
    #pragma unroll_loop_start
    for(int i = 0; i < NUM_DIR_LIGHTS; i++) {
        addedLights.rgb +=  clamp(dot(directionalLights[i].direction, vNormal), 0.0, 1.0) * directionalLights[i].color;
    }
    #pragma unroll_loop_end

    addedLights.rgb = clamp( addedLights.rgb, 0.0, 1.0);

    //multitexture
	vec4 tbBlend = texture2D(blendMap, vUV );

	float tbBaseWeight = 1.0 - max(tbBlend.r, max(tbBlend.g, tbBlend.b));

	vec4 base =  tbBaseWeight * texture2D(baseTex, vUV * 10.0);
	vec4 red = tbBlend.r * texture2D(redTex, vUV * 10.0);
	vec4 green = tbBlend.g * texture2D(greenTex, vUV * 10.0);
	vec4 blue = tbBlend.b * texture2D(blueTex, vUV * 10.0);
	vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0) + base + red + green + blue;
	finalColor.a=tbBlend.a;
	//gl_FragColor= finalColor;

	//vec4 color = texture2D(mainTex, vUV);
    gl_FragColor= finalColor*addedLights;
}`;

const glowVS=`
uniform vec3 viewVector;
uniform float c;
uniform float p;
varying float intensity;
void main() 
{
    vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * viewVector );
	intensity = pow( c - dot(vNormal, vNormel), p );
	
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
const glowFS=`
uniform vec3 glowColor;
varying float intensity;
void main() 
{
	vec3 glow = glowColor * intensity;
    gl_FragColor = vec4( glow, 1.0 );
}`;
//inicializamos las variables globales, luego las metemos a una funcion
function SetUpScene(gamemode){ //set para un solo jugador
	scene=new THREE.Scene(); //crea la escena
	clock= new THREE.Clock();
	loader=new FBXLoader();
	listener = new THREE.AudioListener(); //cargador de audio
	
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
			//camera.lookAt(scene.position);	
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
		monsterSound = new THREE.Audio(listener); //añadir sonido de monstruos
		AmbienceSound=new THREE.Audio(listener);
		pickUpSound= new THREE.Audio(listener);
		powerUp= new THREE.Audio(listener);
		pickKey= new THREE.Audio(listener);
		runningChild = new THREE.Audio(listener);
		gameOverSound = new THREE.Audio(listener); //añadir sonido de derrota
		childDeath=new THREE.Audio(listener);
		victorySound = new THREE.Audio(listener); //añadir sonido de victoria
	

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

function loadOBJWithMTL(path, objFile, mtlFile, onLoadCallback) {
		
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
							...THREE.UniformsLib['lights'],
							};

							var customMaterial = new THREE.ShaderMaterial( 
							{
							    uniforms: customUniforms,
								vertexShader:   _VS,
								fragmentShader: _FS,
								lights:true
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



function onStartSkybox(path, skyarray) {
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
	//loadKeys(4);
	loadSpecialItems(4);
}
function loadKeyS(keysNumber){
	const billLoader=new THREE.TextureLoader();
	 billLoader.load('gameAssets/3dModels/billboards/key.png',(keyBill)=>{
	 	keyBill.magFilter = THREE.NearestFilter;
	 	let mapKey= new THREE.SpriteMaterial( { map: keyBill, rotation:THREE.Math.degToRad(45)  });
	 	var spriteKey= new THREE.Sprite( mapKey );
		spriteKey.position.set( 0, 18, 5 );
		spriteKey.scale.set( 0.5, 0.25, 1 ); //
		spriteKey.name="Key";

		// SUPER SIMPLE GLOW EFFECT
		// use sprite because it appears the same from all angles
		const glowtext=billLoader.load('gameAssets/3dModels/billboards/glow.png'); 
		var spriteMaterial = new THREE.SpriteMaterial( 
		{ 
			map: glowtext,
			useScreenCoordinates: false, alignment: THREE.center,
			color: 0xcfd433, transparent: true, blending: THREE.AdditiveBlending
		});
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set(1.5, 3, 1.0);
		spriteKey.add(sprite); // this centers the glow at the mesh
		itemsCollectable.push(spriteKey);
		scene.add(spriteKey);
		for(let i=1;i<keysNumber;i++){
			var keyX= spriteKey.clone();
			keyX.name="Key"+i;
			keyX.position.x=keyX.position.x+i;
			itemsCollectable.push(keyX);
			scene.add(keyX);
		}
		
	 });
}
function loadSpecialItems(keysNumber){
	const billLoader=new THREE.TextureLoader();
	var botasnum=Math.floor(Math.random() * (4-1))+1;
	var ojosnum=Math.floor(Math.random() * (4-1))+1;
	var capasnum=Math.floor(Math.random() * (4-1))+1;
	const glowtextI=billLoader.load('gameAssets/3dModels/billboards/glow.png'); 
	var spriteMaterialI = new THREE.SpriteMaterial({ 
			map: glowtextI,
			useScreenCoordinates: false, alignment: THREE.center,
			color: 0xcfd433, transparent: true, blending: THREE.AdditiveBlending});
	var spriteI = new THREE.Sprite( spriteMaterialI );
	spriteI.scale.set(2, 2, 1.0);
	let bootpos=new THREE.Vector3(0,18,4);
	let bootrot=new THREE.Math.degToRad(0);
	let bootscale=new THREE.Vector3(0.5,0.5,1);
	var keysArray=ItemsLoaderFB(billLoader,'gameAssets/3dModels/billboards/key2.png','Key',keysNumber,bootpos,bootrot,bootscale,0xffff00);
	if(keysArray.length>0){
		keysArray.forEach(function (key){
			itemsCollectable.push(key);
			scene.add(key);
		});
	}
	bootpos.z=bootpos.z-1;
	var bootsArray=ItemsLoaderFB(billLoader,'gameAssets/3dModels/billboards/boots.png','Boot',botasnum,bootpos,bootrot,bootscale,0xdb483d);
	if(bootsArray.length>0){
		bootsArray.forEach(function (boot){
			itemsCollectable.push(boot);
			scene.add(boot);
		});
	}
	bootpos.z=bootpos.z-1;
	var eyesArray=ItemsLoaderFB(billLoader,'gameAssets/3dModels/billboards/eye.png','Eye',ojosnum,bootpos,bootrot,bootscale,0x09adef);//0x09adef
	if(eyesArray.length>0){
		eyesArray.forEach(function (eye){
			itemsCollectable.push(eye);
			scene.add(eye);
		});
	}
	bootpos.z=bootpos.z-1;
	var coatArray=ItemsLoaderFB(billLoader,'gameAssets/3dModels/billboards/coat.png','Coat',capasnum,bootpos,bootrot,bootscale,0x0cdd09);//0x0cdd09
	if(coatArray.length>0){
		coatArray.forEach(function (coat){
			itemsCollectable.push(coat);
			scene.add(coat);
		});
	}

}
function ItemsLoaderF(loader,path,baseName,itemsNumber,basePosition,baseRotation,baseScale,glowsprite,glowcolor){
		var itemArray=new Array();
		if(itemsNumber>0){
			const textT= loader.load(path);
			let textmap= new THREE.SpriteMaterial( { map: textT});
			var itemsprite= new THREE.Sprite( textmap );
			itemsprite.position.set( basePosition.x, basePosition.y,basePosition.z);
			itemsprite.scale.set( baseScale.x,baseScale.y,baseScale.z); //
			itemsprite.name=baseName;

			let glowmaterial=glowsprite.clone();
			glowmaterial.color.setHex(glowcolor);
			let glowspritenew = new THREE.Sprite( glowmaterial );
			itemsprite.add(glowspritenew); // this centers the glow at the mesh}
			//newbox.scale.set(baseScale);
			itemArray.push(itemsprite);//<-------
				if (itemsNumber>1){
					for(let i=1;i<itemsNumber;i++){
						var itemX= itemsprite.clone();
						itemX.name=baseName+i;
						itemX.position.x=itemX.position.x+i;
						itemArray.push(itemX); //<-------
					}
				}

		}
		return itemArray;
}
function ItemsLoaderFB(loader,path,baseName,itemsNumber,basePosition,baseRotation,baseScale,glowcolor){
		var itemArray=new Array();
		if(itemsNumber>0){
			//const textT= loader.load(finalpath);

			let materials=[];
			for(let i=0;i<6;i++){
				materials.push(
					new THREE.MeshBasicMaterial({
      					map: loader.load(path),
      				}));
			}

			const cubecube= new THREE.BoxGeometry(1,1,1);
			let meshitem= new THREE.Mesh(cubecube,materials);
			meshitem.position.set( basePosition.x, basePosition.y,basePosition.z);
			meshitem.scale.set(0.7,0.7,0.7); //
			meshitem.name=baseName;
			var customMaterial = new THREE.ShaderMaterial({
					    uniforms: 
						{ 
							"c":   { type: "f", value: 1.0 },
							"p":   { type: "f", value: 1.4 },
							glowColor: { type: "c", value: new THREE.Color(glowcolor) },
							viewVector: { type: "v3", value: camera.position }
						},
						vertexShader:  glowVS,
						fragmentShader: glowFS,
						side: THREE.FrontSide,
						blending: THREE.AdditiveBlending,
						transparent: true
					});
			var smoothCubeGeom = cubecube.clone();
			var modifier = new SubdivisionModifier( 2);
			let subcube=modifier.modify( smoothCubeGeom );

			let glowmesh=new THREE.Mesh( subcube, customMaterial.clone());
			glowmesh.scale.multiplyScalar(1.75);
			glowmesh.geometry.computeVertexNormals();
			//glowmesh.position.set(meshitem.position.x,meshitem.position.y,meshitem.position.z);
			meshitem.add(glowmesh);
			itemArray.push(meshitem);//<-------
				if (itemsNumber>1){
					for(let i=1;i<itemsNumber;i++){
						var itemX= meshitem.clone();
						var glowX=glowmesh.clone();
						itemX.name=baseName+i;
						itemX.position.x=itemX.position.x+i;
						itemX.add(glowX);
						itemArray.push(itemX); //<-------
					}
				}

		}
		return itemArray;
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
		completeLoadPlayer(playertype,"Jugador",pos,player);
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

	raycaster.set(player.handler, raydown);
	var collisionResults = raycaster.intersectObject(terrenito,true);

	if (collisionResults.length > 0 && collisionResults[0].distance > 0){
	   const pointHeight = collisionResults[0].point.y;
	   const relativeHeight = player.handler.position.y - pointHeight;
	   return relativeHeight;
	}else{
		return 0.0;
	}

}
function onStartAudio(){
	/*const monsterSound = new THREE.Audio(listener); //añadir sonido de monstruos
	const AmbientSound=new THREE.Audio(listener);
	const pickUpSound= new THREE.Audio(listener);
	const powerUp= new THREE.Audio(listener);
	const pickKey= new THREE.Audio(listener);
	const runningChild = new THREE.Audio(listener);
	const gameOverSound = new THREE.Audio(listener); //añadir sonido de derrota
	const childDeath=new THREE.Audio(listener);
	const victorySound = new THREE.Audio(listener); //añadir sonido de victoria*/

	const audioLoader=new THREE.AudioLoader(); //cargador de audio
	audioLoader.load('gameAssets/soundsfx/horror-ambience.wav', (audio)=>{
		AmbienceSound.setBuffer(audio);
		AmbienceSound.setLoop(true);
		AmbienceSound.setVolume(0.15);
		//.play();
		loadedAssets++;
	},
    // onError callback
    function ( err ) {
            console.log( 'Un error ha ocurrido con el audio' );
    });
    audioLoader.load('gameAssets/soundsfx/level-up-02.wav', (audio)=>{
		pickUpSound.setBuffer(audio);
		pickUpSound.setVolume(0.4);
		//.play();
		loadedAssets++;
	},
    // onError callback
    function ( err ) {
            console.log( 'Un error ha ocurrido con el audio' );
    });
    audioLoader.load('gameAssets/soundsfx/power-boost.wav', (audio)=>{
		powerUp.setBuffer(audio);
		powerUp.setVolume(0.4);
		//.play();
		loadedAssets++;
	},
    // onError callback
    function ( err ) {
            console.log( 'Un error ha ocurrido con el audio' );
    });
    audioLoader.load('gameAssets/soundsfx/okay.wav', (audio)=>{
		pickKey.setBuffer(audio);
		pickKey.setVolume(0.4);
		//.play();
		loadedAssets++;
	},
    // onError callback
    function ( err ) {
            console.log( 'Un error ha ocurrido con el audio' );
    });
    audioLoader.load('gameAssets/soundsfx/victory.wav', (audio)=>{
		victorySound.setBuffer(audio);
		victorySound.setVolume(0.5);
		//.play();
		loadedAssets++;
	},
    // onError callback
    function ( err ) {
            console.log( 'Un error ha ocurrido con el audio' );
    });
    audioLoader.load('gameAssets/soundsfx/monster-growl.wav', (audio)=>{
		monsterSound.setBuffer(audio);
		monsterSound.setLoop(true);
		monsterSound.setVolume(0.1);
		//.play();
		loadedAssets++;
	},
    // onError callback
    function ( err ) {
            console.log( 'Un error ha ocurrido con el audio' );
    });
    audioLoader.load('gameAssets/soundsfx/run.wav', (audio)=>{
		runningChild.setBuffer(audio);
		runningChild.setLoop(true);
		runningChild.setVolume(0.6);
		//.play();
		loadedAssets++;
	},
    // onError callback
    function ( err ) {
            console.log( 'Un error ha ocurrido con el audio' );
    });
    audioLoader.load('gameAssets/soundsfx/death.wav', (audio)=>{
		childDeath.setBuffer(audio);
		//childDeath.setLoop(true);
		childDeath.setVolume(0.6);
		//.play();
		loadedAssets++;
	},
    // onError callback
    function ( err ) {
            console.log( 'Un error ha ocurrido con el audio' );
    });
}
function onStartParticles(){
	const geometry = new THREE.BufferGeometry();
	const vertices = [];
	const materials = [];

	const fireLoader=new THREE.TextureLoader();
	const text=fireLoader.load( 'gameAssets/3dModels/billboards/spark.png');
	for ( let i = 0; i < 1000; i ++ ) {

			const x = Math.random() * 200 - 100;
			const y = Math.random() * 200 - 100;
			const z = Math.random() * 200 - 100;

			vertices.push( x, y, z );

	}

	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	let parameters = [
					[[ 0.1, 1.0, 0.5 ], text, 10 ]
				];
	
	for ( let i = 0; i < parameters.length; i ++ ) {

		const color = parameters[ i ][ 0 ];
		const sprite = parameters[ i ][ 1 ];
		const size = parameters[ i ][ 2 ];

		materials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true, opacity:1 } );
		materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );

		const particles = new THREE.Points( geometry, materials[ i ] );

		particles.rotation.x = Math.random() * 6;
		particles.rotation.y = Math.random() * 6;
		particles.rotation.z = Math.random() * 6;

		FirefliesEngine=particles;
		scene.add( particles );

	}

	/*FirefliesEngine=new ParticleEngine();
	var Type = Object.freeze({ "CUBE":1, "SPHERE":2 });
	let fireflies =
	{
		positionStyle  : Type.CUBE,
		positionBase   : new THREE.Vector3( 0, 100, 0 ),
		positionSpread : new THREE.Vector3( 400, 200, 400 ),

		velocityStyle  : Type.CUBE,
		velocityBase   : new THREE.Vector3( 0, 0, 0 ),
		velocitySpread : new THREE.Vector3( 60, 20, 60 ), 
		
		particleTexture : text,

		sizeBase   : 0.1,
		sizeSpread : 2.0,
		opacityTween : new Tween([0.0, 1.0, 1.1, 2.0, 2.1, 3.0, 3.1, 4.0, 4.1, 5.0, 5.1, 6.0, 6.1],
		                         [0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2] ),				
		colorBase   : new THREE.Vector3(0.30, 1.0, 0.6), // H,S,L
		colorSpread : new THREE.Vector3(0.3, 0.0, 0.0),

		particlesPerSecond : 20,
		particleDeathAge   : 6.1,		
		emitterDeathAge    : 600
	};
	FirefliesEngine.setValues( fireflies );
	FirefliesEngine.initialize(scene);*/

}
function onStartEnemies(){


}

function onStart(){
	SetUpScene("single");
	onStartSkybox('gameAssets/terrainTextures/sky/',[ 'px.jpg', 'nx.jpg','py.jpg', 'ny.jpg','pz.jpg', 'nz.jpg']);
	onStartFloor('gameAssets/terrainTextures/terrain/altura3.jpg','gameAssets/terrainTextures/terrain/blendMap1.jpg',
	'gameAssets/terrainTextures/terrain/soil.jpg','gameAssets/terrainTextures/terrain/Piedras.jpg',	
	'gameAssets/terrainTextures/terrain/piso.jpg','gameAssets/terrainTextures/terrain/moss.jpg',-130);
	setItemsOnGame();
	loadPlayerS(1,"druida");
	onStartEnemies();
	onStartAudio();
	onStartParticles();
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
   	pointer.x= mouseX*2-1;
   	pointer.y= mouseY*2+1;
}
function calculateOffset(cube){
    const offset = new THREE.Vector3(0,1.2,-3);
    offset.applyQuaternion(cube.quaternion);
    offset.add(cube.position);
    return offset;
}

function calculateLookat(cube){
    const lookat = new THREE.Vector3(0,0.8,1.5);
    lookat.applyQuaternion(cube.quaternion);
    lookat.add(cube.position);
    return lookat;
}
function killPlayer(player){
    //gunSound.play();
    childDeath.play();
    player.death=true;
    player.mixer.stopAllAction();

    player.actions.death.play();

}
let lastState='idle';
let lastState2='idle';
function onUpdateSinglePlayer(deltaTime){
	 player.mixer.update(deltaTime); //para hacer el update de la animacion necesita un deltatime
    if (!player.death){
        let state='idle';
		player.forward=getSpeed(deltaTime,player);
		getInvisibility(deltaTime,player);
        if(keys['W']){
        	//player.forward=10;
        	//player.handler.rotation.y=THREE.Math.degToRad(0);
        	player.handler.translateZ(player.forward * deltaTime);
            
            state='walking';
        }
        if(keys['S']){
        	//player.forward=-10;
        	//player.handler.rotation.y=THREE.Math.degToRad(180);
            player.handler.translateZ(-player.forward * deltaTime);
            state='walking';
            
        }if(keys['A']){
        	player.yaw=5;
        	player.handler.rotation.y += player.yaw * deltaTime;
		
            
        }if(keys['D']){
        	player.yaw=-5;
        	player.handler.rotation.y += player.yaw * deltaTime;
            
        }if (keys['Z']){
        	//ACTIVAR BOTAS desactivo todo lo demás
        	if(player.pBoot.num>0){
        		if(player.pBoot.active==false){
        			//powerUp.play();
        			player.pBoot.active=true;
		        	player.pEye.active=false;
		        	player.pCoat.active=false;
        		}else{
        			player.pBoot.active=false;
        		}
        	}
        	
        }if (keys['X']){
        	//ACTIVAR CAPA
	        	if(player.pCoat.num>0){
	        		if(player.pCoat.active==false){
	        			//powerUp.play();
			        	player.pCoat.active=true;
			        	player.pBoot.active=false;
			        	player.pEye.active=false;
			        }else{
			        	player.pCoat.active=false;
			        }
        	}
        }if (keys['C']){
        	//ACTIVAR OJO
        	if(player.pEye.num>0){
        		if(player.pEye.active==false){
        			//powerUp.play();
		        	player.pEye.active=true;
		        	player.pBoot.active=false;
		        	player.pCoat.active=false;
	        	}else{
	        		player.pEye.active=false;
	        	}
        	}
        }
        const offset = calculateOffset(player.handler);
        const lookat = calculateLookat(player.handler);
    
        camera.position.copy(offset);
        camera.lookAt(lookat);

        if (lastState!=state){
            const lastAnimation=player.actions[lastState];
            const newAnimation=player.actions[state];

            lastAnimation.reset(); //si se esta ejecutando en pausa o lo quesea, empiezo de nuevo
            newAnimation.reset();

            const crossFadeTime=0.2; //tiempo de transicion en seg
            lastAnimation.crossFadeTo(newAnimation,crossFadeTime).play(); //para realizar la transicion suave
            lastState=state;
            runningChild.play();
        }else{
        	if(state!="walking"){
        		if(runningChild.isPlaying){
        			runningChild.stop();
        		}
        	}
        	
        }
        if(loadedAssets>10){
				//var rayo=player.rayo;
				//var point=new THREE.Vector2(0,300);
				//raycaster.setFromCamera(point,camera);
				raycaster.set(player.handler.position, player.rayo);
				var colision=raycaster.intersectObjects(itemsCollectable,true);

				if(colision.length>0 &&colision[0].distance<=1 ){

					//alert("si hay colision con el objeto: "+ colision[0].object.parent.name);
					//si choca, que la camera no se pueda mover
					getItem(colision,player);
					colision=null;
				}
		}
		/*if(player.handler.position.z<=door.handler.position.z&&player.keys==keysNumber && !player.victory){ CONDICION DE VICTORIA
	        player.victory=true;
	        victorySound.play();
	        console.log("ganaste");
	        //victory page

    	}*/
		
    }else{
    	//game over
    }
    

}
function getItem(colArray,player){
	let itemName =new String();
	itemName=colArray[0].object.parent.name;
	if (itemName.match(/[0-9]/g)){
		itemName=itemName.replace(/[0-9]/g, '');
	}
	switch(itemName){
		case 'Key':{
			player.keys=player.keys+1;
			pickKey.play();
		break;
		}
		case 'Boot':{
			player.pBoot.num=player.pBoot.num+1;
			pickUpSound.play();
		break;
		}
		case 'Coat':{
			player.pCoat.num=player.pCoat.num+1;
			pickUpSound.play();
		break;
		}
		case 'Eye':{
			player.pEye.num=player.pEye.num+1;
			pickUpSound.play();
		break;
		}
		default:
		break;

	}
	scene.remove(colArray[0].object.parent);
	itemsCollectable=itemsCollectable.filter(function (item){
		return item.parent!=null;
	});

}
function getSpeed(deltaTime, player){
	if(player.pBoot.active){ 
		if(player.pBoot.time>0){
			if(player.pBoot.time==15){
				//por alguna razon lo tengo que poner antes y despues del play
				player.pBoot.active=true; 
				powerUp.play();
				player.pBoot.active=true;
			}
			player.pBoot.time-=deltaTime; //vamos quitando tiempo
			/*player.handler.children[0].material.transparent=true;
			player.handler.children[0].material.opacity=0.5;*/
			return 20; //asignamos la velocidad especial
		}else{
			player.pBoot.active=false; //desactivamos
			player.pBoot.num=player.pBoot.num-1; //quitamos el que ya utilizamos
			player.pBoot.time=15; //reseteamos tiempo
			//esto sirve para la capa de invisibilidad
			/*player.handler.children[0].material.transparent=false;
			player.handler.children[0].material.opacity=1;*/
			//$("body").append('<button>Hey</button>');agregar botones de manera dinamica
			return 10; //asignamos la velocidad original
		}
	}else{
		return 10;//asignamos la velocidad original
		
	}
}
function getInvisibility(deltaTime, player){
	if(player.pCoat.active){
		if(player.pCoat.time>0){
			if(player.pCoat.time==10){
				//por alguna razon lo tengo que poner antes y despues del play
				player.pCoat.active=true; 
				powerUp.play();
				player.pCoat.active=true;
			}
			player.handler.children[0].material.transparent=true;
			player.handler.children[0].material.opacity=0.5;
			player.pCoat.time-=deltaTime;
		}else{
			player.handler.children[0].material.transparent=false;
			player.handler.children[0].material.opacity=1;
			player.pCoat.active=false; //desactivamos
			player.pCoat.num=player.pCoat.num-1; //quitamos el que ya utilizamos
			player.pCoat.time=10;
		}

	}
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
function updateItems(deltatime,camera){
	if(itemsCollectable.length>0){
		itemsCollectable.forEach((item)=>{
			item.children[0].material.uniforms.viewVector.value=new THREE.Vector3().subVectors( camera.position, item.position );
		});
	}
}
function updateParticles(deltaTime){
	FirefliesEngine.rotation.y-=deltaTime*0.05;
}
function onUpdateSingle(deltaTime){
	 onUpdateSinglePlayer(deltaTime); 
	 updateItems(deltaTime,camera);
	 updateParticles(deltaTime);
	 //FirefliesEngine.update(deltaTime*0.5);
}
function onUpdateMulti(deltaTime){
	onUpdateTwoPlayers(deltaTime);
	updateItems(deltaTime,cameras[0]);
	updateItems(deltaTime,cameras[1]);
}

function render(){
	 	
		requestAnimationFrame(render);
		deltaTime = clock.getDelta();
		if(loadedAssets>=10){
			//AmbienceSound.play();
			onUpdateSingle(deltaTime);
			
			renderer.render(scene,camera);
		}


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
	if(!backplay){
		AmbienceSound.play();
	}
}
function onKeyUp(event) {	
	keys[String.fromCharCode(event.keyCode)] = false;
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);	
onStart();
window.addEventListener("mousemove", onmousemove, false);
render();
//renderTwo();
