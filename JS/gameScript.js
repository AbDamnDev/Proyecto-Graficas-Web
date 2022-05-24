import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js'
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/controls/OrbitControls.js';
import { Water } from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/objects/Water.js'
import { Sky } from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/objects/Sky.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/FBXLoader.js';
import {SubdivisionModifier} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/modifiers/SubdivisionModifier.js';
import * as LSManager from './localStorageManager.js';

var itemsPosition= new Array();
var keyNumber=4;
//global variables
var scene;
var camera;
//Variable para elegir mapa
var escenaro1=false;
var escenaro2=false;
var escenaro3=false;
var itemsCollectable=[];
//Variabel pausa
var isPaused = false;

//estas variables son para multijugador local
var cameras=[];
var renderers=[];
var players=[];
//

//variables enemigos
var pos_a=1;
var pos_b=1;
var pos_c=1;
var pos_d=1;

var pos1_a=1;
var pos1_b=1;
var pos1_c=1;
var pos1_d=1;
var pos1_e=1;
var pos1_f=1;
var pos1_g=1;


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
var ambientLight = new THREE.AmbientLight(new THREE.Color(1, 1, 1), .25);  //variable de la luz ambiental
var directionalLight = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), .5); //variable direccion de la luz
directionalLight.position.y=1;
directionalLight.target.position.set(0,0,0);
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
	timer: 0,
    nameplayer: null,
    typeplyer:"Druida",
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
	timer: 0,
    nameplayer: null,
    typeplyer:"Druida",
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
const terrain={
	handler:null
};
var myplane; //es el ultimo intento para que podamos agarrar el terreno
var miplanito;
var terrenoColision=[];

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


//Aguwa



function buildWater() {
	const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
	const water = new Water(
	  waterGeometry,
	  {
		textureWidth: 512,
		textureHeight: 512,
		waterNormals: new THREE.TextureLoader().load('gameAssets/terrainTextures/terrain/4141-normal.jpg', function ( texture ) {
		  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		}),
		alpha: 1.0,
		sunDirection: new THREE.Vector3(),
		sunColor: 0xffffff,
		waterColor: 0x001e0f,
		distortionScale: 3.7,
		fog: scene.fog !== undefined
	  }
	);
	water.rotation.x =- Math.PI / 2;
	if (escenaro3)
	{
		water.position.y = 0;

	}
	else
	{
	water.position.y = 17;
	}
	water.name="Awita";
	scene.add(water);
	
	const waterUniforms = water.material.uniforms;
	return water;
  }


//shaders en constantes
const _VS= `
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;
void main() {
  vPos = (modelMatrix * vec4(position, 1.0 )).xyz;
  vNormal = normalMatrix * normal;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`;;

const _FS= `
uniform sampler2D blendMap;
uniform sampler2D baseTex;
uniform sampler2D redTex;
uniform sampler2D greenTex;
uniform sampler2D blueTex;

struct DirectionalLight {
    vec3 direction;
    vec3 color;
    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
};
uniform vec3 ambientLightColor;
uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

uniform vec3 pointLightColor[NUM_POINT_LIGHTS];
uniform vec3 pointLightPosition[NUM_POINT_LIGHTS];
uniform float pointLightDistance[NUM_POINT_LIGHTS];
uniform vec3 directionalLightColor[ NUM_DIR_LIGHTS ];
uniform vec3 directionalLightDirection[ NUM_DIR_LIGHTS ];

varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vUv;
varying float vAmount;

void main() 
{    
    // calculate illumination
    vec4 addedLights = vec4(0.0,0.0,0.0, 1.0);
   // for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
   //   vec3 lightDirection = normalize(vPos - pointLightPosition[l]);
   //  addedLights.rgb += clamp(dot(-lightDirection, vNormal), 0.0, 1.0) * pointLightColor[l];
   // }

    for(int l = 0; l < NUM_DIR_LIGHTS; l++) {
        vec3 lightDirection = directionalLights[l].direction;
		addedLights.rgb += lightDirection;
   //     addedLights.rgb += clamp(dot(-lightDirection, vNormal), 0.0, 1.0) ;
    }

    vec4 tbBlend = texture2D(blendMap, vUv );

    float tbBaseWeight = 1.0 - max(tbBlend.r, max(tbBlend.g, tbBlend.b));

    vec4 base =  tbBaseWeight * texture2D(baseTex, vUv * 10.0);
    vec4 red = tbBlend.r * texture2D(redTex, vUv * 10.0);
    vec4 green = tbBlend.g * texture2D(greenTex, vUv * 10.0);
    vec4 blue = tbBlend.b * texture2D(blueTex, vUv * 10.0);
    vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0) + base + red + green + blue;
    finalColor.a=tbBlend.a;

    gl_FragColor= vec4(addedLights.rgb, 1.0);
	
   //gl_FragColor=vec4(0,0,1,1);
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

function localStorageGetInfo(){
	if(localStorage.length>0){
		//typeOfPlayer,gameScene,gameMode,namePlayer1,namePlayer2,idPlayer1,idPlayer2
		localStorageInfo={
			typeOfPlayer: localStorage.getItem('typeOfPlayer'), //niño o monstruo
            gameScene: localStorage.getItem('gameScene'), //escenario 1, 2 o 3
            gameMode: localStorage.getItem('gameMode'), // single or multiplayer
			playerNum:localStorage.getItem('playerNum'),
			idplayer1:localStorage.getItem('idPlayer1'),
            nameofPlayer1: localStorage.getItem('namePlayer1'),
			idplayer2: null,
            nameofPlayer2: null,
            gameDifficulty:localStorage.getItem('gameScene'),
		}
		if(localStorageInfo.gameMode=="Multijugador"){
			localStorageInfo.idplayer2=localStorage.getItem('idPlayer2');
			localStorageInfo.nameofPlayer2=localStorage.getItem('namePlayer2');
		}
	}
}

//inicializamos las variables globales, luego las metemos a una funcion
function SetUpScene(){ //set para un solo jugador
	localStorageGetInfo();
	scene=new THREE.Scene(); //crea la escena
	clock= new THREE.Clock();
	loader=new FBXLoader();
	listener = new THREE.AudioListener(); //cargador de audio
	const water = buildWater();


	scene.add(ambientLight);

	{										//agregamos niebla
		const near = 6;
		const far = 100;
		const color = 'lightblue';
		scene.fog = new THREE.Fog(color, near, far);
		scene.background = new THREE.Color(color);
	  }

	directionalLight.position.set(0, 0, 1);
	scene.add(directionalLight);
		if(localStorageInfo.gameMode=="Solitario"){
		
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

		}else if (localStorageInfo.gameMode=="Multijugador"){
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
							//customUniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['lights'],{}]);
							var customMaterial = new THREE.ShaderMaterial( 
							{
							    uniforms:customUniforms,
								vertexShader:   _VS,
								fragmentShader: _FS,
								//lights: true,

								// side: THREE.DoubleSide
							});
							var planeGeo = new THREE.PlaneGeometry( 1000, 1000, 100, 100 );
							myplane = new THREE.Mesh(planeGeo, customMaterial );
							myplane.name="terreno";
							myplane.rotation.x = -Math.PI / 2;
							myplane.position.y = heightPos;
							//scene.add( myplane );
							miplanito= scene.getObjectByName("terreno");
							loadedAssets++;
							console.log('LIGHTS CHECK', THREE.UniformsLib['lights']);
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

	const light = new THREE.PointLight( 0x76bda4, 1, 20);
			light.position.set( 0, 0, 20 );
			light.castShadow = true; // default false
		//	scene.add( light );
		if(localStorageInfo.gameMode=="Solitario"){
			switch(localStorageInfo.gameScene){
				case '1':{
					escenaro1=true;
					escenaro2=false;
					escenaro3=false;
					loadSpecialItems(1);
					keyNumber=1;
					
					break;
				}
				case '2':{
					escenaro1=false;
					escenaro2=true;
					escenaro3=false;
					loadSpecialItems(2);
					keyNumber=2;
					
					break;
				}
				case '3':{
					escenaro1=false;
					escenaro2=false;
					escenaro3=true;
					loadSpecialItems(4);
					keyNumber=4;
					
					break;
				}
	
			}
		}else{
			escenaro1=false;
			escenaro2=true;
			escenaro3=false;
			loadSpecialItems(1);
			keyNumber=1;
			
		}
		
//ESCENARIO1//
	var escalaEscenario1=.01;
	var posicionEscenario1Y=18.25;
	var posicionEscenario1X=0;
	var posicionEscenario1Z=-8;
	var Enemigoescala=.1

if (escenaro1)
{
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
		cube1.add(model);
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E1_ENE2";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		cube2.add(model);
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E1_ENE3";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		cube3.add(model);
	});
	loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
		model.name="E1_ENE4";
		model.scale.multiplyScalar(Enemigoescala);
		model.position.set(0,0,0);
		cube4.add(model);
	});



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

			loader.load('gameAssets/3dModels/Escenario/Arbol1.fbx',(model)=>{
				model.name="Arbol1";
				model.scale.multiplyScalar(0.005);
				model.position.set(15,27.5,1);
				scene.add(model);
			});
			loader.load('gameAssets/3dModels/Escenario/Arbol2.fbx',(model)=>{
				model.name="Arbol12";
				model.scale.multiplyScalar(0.005);
				model.position.set(-10,27,2);
				scene.add(model);
			});
			loader.load('gameAssets/3dModels/Escenario/Arbol3.fbx',(model)=>{
				model.name="Arbol3";
				model.scale.multiplyScalar(0.005);
				model.position.set(-15,27,-5);
				scene.add(model);
			});
		
			loader.load('gameAssets/3dModels/Escenario/Arbol5.fbx',(model)=>{
				model.name="Arbol5";
				model.scale.multiplyScalar(0.005);
				model.position.set(18,27,-10);
				scene.add(model);
			});


}


//ESCENARIO 1//	


//ESCENARIO 2//	
var escalaEscenario2=.015;
var posicionEscenario2Y=19;
var posicionEscenario2X=0;
var posicionEscenario2Z=-23;


if (escenaro2)
{
	if(localStorageInfo.typeOfPlayer=="Druida"){
		var geometryCube = new THREE.BoxGeometry(2,2,2);
		var materialCube = new THREE.MeshBasicMaterial({color:0x000000});
		materialCube.transparent=true;
		materialCube.opacity=.21;
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
			cubeb1.add(model);
		});
		loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
			model.name="E2_ENE2";
			model.scale.multiplyScalar(Enemigoescala);
			model.position.set(0,0,0);
			cubeb2.add(model);
		});
		loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
			model.name="E2_ENE3";
			model.scale.multiplyScalar(Enemigoescala);
			model.position.set(0,0,0);
			cubeb3.add(model);
		});
		loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
			model.name="E2_ENE4";
			model.scale.multiplyScalar(Enemigoescala);
			model.position.set(0,0,0);
			cubeb4.add(model);
		});
		loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
			model.name="E2_ENE5";
			model.scale.multiplyScalar(Enemigoescala);
			model.position.set(0,0,0);
			cubeb5.add(model);
		});
		loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
			model.name="E2_ENE6";
			model.scale.multiplyScalar(Enemigoescala);
			model.position.set(0,0,0);
			cubeb6.add(model);
		});
		loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
			model.name="E2_ENE7";
			model.scale.multiplyScalar(Enemigoescala);
			model.position.set(0,0,0);
			cubeb7.add(model);
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
//ESCENARIO 2//


//ESCENARIO 3//
var escalaEscenario3=.015;
var posicionEscenario3Y=10.9;
var posicionEscenario3X=0;
var posicionEscenario3Z=-40;

if (escenaro3)
{
	var geometryCube = new THREE.BoxGeometry(2,2,2);
	var geometryCube2 = new THREE.BoxGeometry(100,2,7);

	var materialCube = new THREE.MeshBasicMaterial({color:0xffffff});
	materialCube.transparent=true;
	materialCube.opacity=.2;
	var cubec1 = new THREE.Mesh(geometryCube,materialCube);
	cubec1.name="CC1";
	cubec1.position.set(0,17.5,-38);
	scene.add(cubec1)

	var cubec2 = new THREE.Mesh(geometryCube2,materialCube);
	cubec2.name="CC2";
	cubec2.position.set(0,0,0);
	cubec2.rotation.y=2 * Math.PI * (45 / 360);

	cubec1.add(cubec2)

	var cubec3 = new THREE.Mesh(geometryCube2,materialCube);
	cubec3.name="CC3";
	cubec3.position.set(0,0,0);
	cubec3.rotation.y=2 * Math.PI * (135 / 360);
	cubec1.add(cubec3)






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
	loader.load('gameAssets/3dModels/nivel3/E3_Arbol1.fbx',(model)=>{
		model.name="Arbol1";
		model.scale.multiplyScalar(escalaEscenario3);
		model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
		scene.add(model);
	});
	loader.load('gameAssets/3dModels/nivel3/E3_Arbol2.fbx',(model)=>{
		model.name="Arbol2";
		model.scale.multiplyScalar(escalaEscenario3);
		model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
		scene.add(model);
	});
	loader.load('gameAssets/3dModels/nivel3/E3_Arbol3.fbx',(model)=>{
		model.name="Arbol3";
		model.scale.multiplyScalar(escalaEscenario3);
		model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
		scene.add(model);
	});
	loader.load('gameAssets/3dModels/nivel3/E3_Arbol4.fbx',(model)=>{
		model.name="Arbol4";
		model.scale.multiplyScalar(escalaEscenario3);
		model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
		scene.add(model);
	});
	loader.load('gameAssets/3dModels/nivel3/E3_Arbol5.fbx',(model)=>{
		model.name="Arbol5";
		model.scale.multiplyScalar(escalaEscenario3);
		model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
		scene.add(model);
	});
	loader.load('gameAssets/3dModels/nivel3/E3_Arbol6.fbx',(model)=>{
		model.name="Arbol6";
		model.scale.multiplyScalar(escalaEscenario3);
		model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
		scene.add(model);
	});
	loader.load('gameAssets/3dModels/nivel3/E3_Arbol7.fbx',(model)=>{
		model.name="Arbol7";
		model.scale.multiplyScalar(escalaEscenario3);
		model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
		scene.add(model);
	});
	loader.load('gameAssets/3dModels/nivel3/E3_Arbol9.fbx',(model)=>{
		model.name="Arbol9";
		model.scale.multiplyScalar(escalaEscenario3);
		model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
		scene.add(model);
	});
	loader.load('gameAssets/3dModels/nivel3/E3_Arbol8.fbx',(model)=>{
		model.name="Arbol8";
		model.scale.multiplyScalar(escalaEscenario3);
		model.position.set(posicionEscenario3X,posicionEscenario3Y,posicionEscenario3Z);
		scene.add(model);
	});

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

//ESCENARIO 3//

}

function loadSpecialItems(keysNumber){
	if(escenaro1)
	{
		itemsPosition[0]=new THREE.Vector3(-6,17.5,6);
		itemsPosition[1]=new THREE.Vector3(-6,17.5,-23);
		itemsPosition[2]=new THREE.Vector3(6,17.5,-24);
		itemsPosition[3]=new THREE.Vector3(6,17.5,6);
		itemsPosition[4]=new THREE.Vector3(-4,17.5,-17);
		itemsPosition[5]=new THREE.Vector3(-3,17.5,-9);
		itemsPosition[6]=new THREE.Vector3(3,17.5,-10);
		itemsPosition[7]=new THREE.Vector3(0,17.5,-20);
		itemsPosition[8]=new THREE.Vector3(0,17.5,-6);
		itemsPosition[9]=new THREE.Vector3(-3,17.5,-13);
		itemsPosition[10]=new THREE.Vector3(0,17.5,-13);
		itemsPosition[11]=new THREE.Vector3(-6,17.5,-20);
		itemsPosition[12]=new THREE.Vector3(6,17.5,-20);

	}
	if(escenaro2)
	{
		itemsPosition[0]=new THREE.Vector3(-25.6,17.5,2.4);
		itemsPosition[1]=new THREE.Vector3(-25,17.5,-48);
		itemsPosition[2]=new THREE.Vector3(22.5,17.5,-48);
		itemsPosition[3]=new THREE.Vector3(22.5,17.5,5.8);
		itemsPosition[4]=new THREE.Vector3(4,17.5,.5);
		itemsPosition[5]=new THREE.Vector3(4,17.5,-28);
		itemsPosition[6]=new THREE.Vector3(-7,17.5,-15);
		itemsPosition[7]=new THREE.Vector3(-17.5,-36);
		itemsPosition[8]=new THREE.Vector3(-13,17.5,-46);
		itemsPosition[9]=new THREE.Vector3(-13,17.5,-6);
		itemsPosition[10]=new THREE.Vector3(-2,17.5,-33.5);
		itemsPosition[11]=new THREE.Vector3(10.5,17.5,-33);
		itemsPosition[12]=new THREE.Vector3(-19,17.5,-34);
		itemsPosition[13]=new THREE.Vector3(22.5,17.5,-18);
		itemsPosition[14]=new THREE.Vector3(5,17.5,-21);

	}
	if(escenaro3)
	{
		itemsPosition[0]=new THREE.Vector3(0,17.5,-97);
		itemsPosition[1]=new THREE.Vector3(-58,17.5,-39.5);
		itemsPosition[2]=new THREE.Vector3(0,17.5,17);
		itemsPosition[3]=new THREE.Vector3(58.5,17.5,-40);
		itemsPosition[4]=new THREE.Vector3(0,17.5,-12);
		itemsPosition[5]=new THREE.Vector3(43.5,17.5,-53.5);
		itemsPosition[6]=new THREE.Vector3(26,17.5,-26);
		itemsPosition[7]=new THREE.Vector3(13,17.5,-79.5);
		itemsPosition[8]=new THREE.Vector3(-12.8,17.5,-80);
		itemsPosition[9]=new THREE.Vector3(0,17.5,-65.5);
		itemsPosition[10]=new THREE.Vector3(-26,17.5,-53);
		itemsPosition[11]=new THREE.Vector3(-57,17.5,-26);
		itemsPosition[12]=new THREE.Vector3(-16.5,17.5,-36);
	}
	const billLoader=new THREE.TextureLoader();
	if (localStorageInfo.typeOfPlayer=="Druida"){
		var botasnum=Math.floor(Math.random() * (4-1))+1;
		var ojosnum=Math.floor(Math.random() * (4-1))+1;
		var capasnum=Math.floor(Math.random() * (4-1))+1;
		let bootpos=new THREE.Vector3(0,18,4);
		let bootrot=new THREE.Math.degToRad(0);
		let bootscale=new THREE.Vector3(0.5,0.5,1);
		var keysArray=ItemsLoaderFB(billLoader,'gameAssets/3dModels/billboards/key2.png','Key',keysNumber,bootpos,bootrot,bootscale,0xffff00);
		
		bootpos.z=bootpos.z-1;
		var bootsArray=ItemsLoaderFB(billLoader,'gameAssets/3dModels/billboards/boots.png','Boot',botasnum,bootpos,bootrot,bootscale,0xdb483d);
		if(bootsArray.length>0){
			bootsArray.forEach(function (boot){
				i=Math.floor(Math.random()*itemsPosition.length); 
				boot.position.x=itemsPosition[i].x;
				boot.position.z=itemsPosition[i].z;	
				itemsPosition.splice(i,1);
				itemsCollectable.push(boot);
				scene.add(boot);
			});
		}
		bootpos.z=bootpos.z-1;
		var eyesArray=ItemsLoaderFB(billLoader,'gameAssets/3dModels/billboards/eye.png','Eye',ojosnum,bootpos,bootrot,bootscale,0x09adef);//0x09adef
		if(eyesArray.length>0){
			eyesArray.forEach(function (eye){
				i=Math.floor(Math.random()*itemsPosition.length); 
				eye.position.x=itemsPosition[i].x;
				eye.position.z=itemsPosition[i].z;	
				itemsCollectable.push(eye);
				scene.add(eye);
			});
		}
		bootpos.z=bootpos.z-1;
		var coatArray=ItemsLoaderFB(billLoader,'gameAssets/3dModels/billboards/coat.png','Coat',capasnum,bootpos,bootrot,bootscale,0x0cdd09);//0x0cdd09
		if(coatArray.length>0){
			coatArray.forEach(function (coat){
				i=Math.floor(Math.random()*itemsPosition.length); 
				coat.position.x=itemsPosition[i].x;
				coat.position.z=itemsPosition[i].z;
				itemsCollectable.push(coat);
				scene.add(coat);
			});
	}
	}else{
		let objEnemy={
			handler: null,
			mixer:null,
			idle:null
		}
		var pos= new THREE.Vector3(0.0,17.5,5);
		var keysArray=druidasLoader(objEnemy,keysNumber,'Key',pos);
	}
	var i=0;
	if(keysArray.length>0){
		keysArray.forEach(function (key){
			i=Math.floor(Math.random()*itemsPosition.length); 
			key.position.x=itemsPosition[i].x;
			key.position.z=itemsPosition[i].z;

			itemsPosition.splice(i,1);
			itemsCollectable.push(key);
			scene.add(key);
		});
	}

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
		if (localStorageInfo.gameMode=="Solitario"){
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
		}else{
			var customMaterial = new THREE.ShaderMaterial({
				uniforms: 
				{ 
					"c":   { type: "f", value: 1.0 },
					"p":   { type: "f", value: 1.4 },
					glowColor: { type: "c", value: new THREE.Color(glowcolor) },
					viewVector: { type: "v3", value: cameras[0].position }
				},
				vertexShader:  glowVS,
				fragmentShader: glowFS,
				side: THREE.FrontSide,
				blending: THREE.AdditiveBlending,
				transparent: true
			});
		}
		
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
function druidasLoader(player,itemsNumber,baseName,basePosition){
	var itemArray=new Array();
	loader.load('gameAssets/3dModels/druida/Druida.fbx',(model)=>{
		model.scale.multiplyScalar(0.09);
		model.rotation.y=THREE.Math.degToRad(-180); 
		player.handler=model;
		player.mixer=new THREE.AnimationMixer(player.handler);

		loader.load('gameAssets/3dModels/druida/animations/Druida@Idle.fbx',(animacion1)=>{
			const idleanimation=animacion1.animations[0];
			player.idle=player.mixer.clipAction(idleanimation);
			player.idle.play(); //reproducir animacion
			loadedAssets++;
		});
		model.name=baseName;
		model.position.set(basePosition.x,basePosition.y,basePosition.z);
		itemArray.push(model);
		if (itemsNumber>1){
			for(let i=1;i<itemsNumber;i++){
				var itemX= model.clone();
				itemX.name=baseName+i;
				itemX.position.x=itemX.position.x+i;
				itemArray.push(itemX); //<-------
			}
		}
	});
	return itemArray;
}

function completeLoadPlayer(type, nombre, posicion,player){
	if(type=="Druida"){
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
			model.position.set(posicion.x,posicion.y,posicion.z+15);
			player.yaw=0;
			player.forward=0;
			
			
	
		

			//model.add(camera);
			//camera.position.set(0,25,0);
			scene.add(model);

		});
			
	}else if (type=="Leshy"){
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
	for ( let i = 0; i < 200; i ++ ) {

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

}
function onStartEnemies(){


}

function onStart(){
	SetUpScene();
	onStartSkybox('gameAssets/terrainTextures/sky/',[ 'px.jpg', 'nx.jpg','py.jpg', 'ny.jpg','pz.jpg', 'nz.jpg']);
	onStartFloor('gameAssets/terrainTextures/terrain/altura3.jpg','gameAssets/terrainTextures/terrain/blendMap1.jpg',
	'gameAssets/terrainTextures/terrain/soil.jpg','gameAssets/terrainTextures/terrain/Piedras.jpg',	
	'gameAssets/terrainTextures/terrain/piso.jpg','gameAssets/terrainTextures/terrain/moss.jpg',-130);
	setItemsOnGame();
	loadPlayerS(localStorageInfo.playerNum,localStorageInfo.typeOfPlayer);
	onStartEnemies();
	onStartAudio();
	onStartParticles();
	if(localStorageInfo.gameMode=="Druida"){
		window.addEventListener( 'resize', onWindowResize );
	}
	
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
    childDeath.play();
    player.death=true; //a lo mejor esta condicion es para ejecutar el killplayer
    player.mixer.stopAllAction();

    player.actions.death.play();
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

	}else{
		player.handler.children[0].material.transparent=false;
		player.handler.children[0].material.opacity=1;
	}
}
let lastState='idle';
let lastState2='idle';
function onUpdateSinglePlayer(deltaTime){
	 player.mixer.update(deltaTime); //para hacer el update de la animacion necesita un deltatime Hay que revisas, marca error 
	
    if (!player.death){
		player.timer+=deltaTime;
        let state='idle';
		player.forward=getSpeed(deltaTime,player);
		getInvisibility(deltaTime,player);
        if(keys['W']){
        	//player.forward=10;  Hay que revisar deberia funcionar
        	player.handler.translateZ(player.forward * deltaTime);
			console.log("VColision Antes: "+player.forward * deltaTime);

            state='walking';
        }
        if(keys['S']){
        	player.forward=0;
			player.handler.translateZ(-player.forward * deltaTime);
            state='walking';
            
        }if(keys['A']){
        	player.yaw=5;
        	player.handler.rotation.y += player.yaw * deltaTime;
		
            
        }if(keys['D']){
        	player.yaw=-5;
        	player.handler.rotation.y += player.yaw * deltaTime;
        }
		if(player.typeplyer=="Druida"){
			if (keys['Z']){
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
		}
		if (keys['P']){
			isPaused=true;
        }


		const offset = calculateOffset(player.handler);
        const lookat = calculateLookat(player.handler);

        camera.position.copy(offset);
        camera.lookAt(lookat);
		//camera.lookAt( player.handler.position);

        if (lastState!=state){
            const lastAnimation=player.actions[lastState];
            const newAnimation=player.actions[state];

            lastAnimation.reset(); //si se esta ejecutando en pausa o lo quesea, empiezo de nuevo
            newAnimation.reset();

            const crossFadeTime=0.2; //tiempo de transicion en seg
            lastAnimation.crossFadeTo(newAnimation,crossFadeTime).play(); //para realizar la transicion suave
            lastState=state;
			if(player.typeplyer=="Druida"){
				runningChild.play();
			}else{
				monsterSound.play();
			}
			
        }else{
        	if(state!="walking"){
				if(player.typeplyer=="Druida"){
					if(runningChild.isPlaying){
						runningChild.stop();
					}
				}else{
					if(monsterSound.isPlaying){
						monsterSound.stop();
					}
				}
        		
        	}
        	
        }
		if(loadedAssets>10){
			
			raycaster.set(player.handler.position, player.rayo);
			var colision=raycaster.intersectObjects(itemsCollectable,true);

			if(colision.length>0 &&colision[0].distance<=1 ){
				getItem(colision,player);
				colision=null;
			}
		}
		if(player.keys==keyNumber&& !player.victory){ //CONDICION DE VICTORIA
        player.victory=true;
        victorySound.play();
		setFinalSinglePlayer(player);
        console.log("ganaste");
   		}
    }else{
    	//game over
		setFinalSinglePlayer(player);
    }
}
function setFinalSinglePlayer(player){
		let playerid=localStorage.getItem('idPlayer1');
		let score=0;
		if(!player.victory){
			score = Math.round((player.keys/keyNumber*100));
		}else{
			score=100;
		}
		if (score<0){
			score=0;
		}
		//let finaltime=new Date(player.timer * 1000);//.toISOString().substring(11, 8);
		//Wed Dec 31 1969 00:00:21 GMT-0600 (hora estándar central) 18-25 -1
		let fitime=new Date(null);
		fitime.setHours(0, 0, 0, 0);
		fitime.setSeconds(player.timer);
		let finaltime=fitime.toString();
		finaltime=finaltime.substring(16,24);
		var formData = new FormData();
		formData.append('playerid',playerid);
        formData.append('score',score);
        formData.append('victory',player.victory);
		formData.append('time',finaltime);
		formData.append('accion','updateScore');
		$.ajax({
			async:false,
            url     : "./php/service_include.php",
            method  : "POST",
            data    : formData,
            contentType:false,
            cache:false,
            processData: false
        }).done(function (data, textEstado, jqXHR){
			data=$.parseJSON(data);
            if(data.result){
                //enviar los datos a la pagina
				if(!player.victory){
					localStorage.setItem('score',score);
					window.location='gameOver.html';
				}else{
					localStorage.setItem('score',score);
					window.location='victory.html';
				}  
            }else{
                alert("No se pudo actualizar la informacion del jugador");
            }
           
        }).fail(function (data, textEstado, jqXHR){
            alert("la solicitud fallos porque: " + textEstado);
            console.log("la solicitud fallos porque: " + textEstado);
        });
}
function onUpdateTwoPlayers(deltaTime){
	players[0].mixer.update(deltaTime); //para hacer el update de la animacion necesita un deltatime
    players[1].mixer.update(deltaTime);
	
    if (!players[0].death){
		players[0].timer+=deltaTime;
        let state='idle';
		players[0].forward=getSpeed(deltaTime,players[0]);
		getInvisibility(deltaTime,players[0]);
        if(keys['W']){
        	players[0].handler.translateZ(players[0].forward * deltaTime);
			console.log("VColision Antes: "+players[0].forward * deltaTime);
            state='walking';
        }
        if(keys['S']){
            players[0].handler.translateZ(-players[0].forward * deltaTime);
            state='walking';
            
        }if(keys['A']){
        	players[0].yaw=5;
        	players[0].handler.rotation.y += players[0].yaw * deltaTime;
            
        }if(keys['D']){
        	players[0].yaw=-5;
        	players[0].handler.rotation.y += players[0].yaw * deltaTime;
            
        }if (keys['P']){
			isPaused=true;
        }
		if(players[0].typeplyer=="Druida"){
			if (keys['Z']){
				//ACTIVAR BOTAS desactivo todo lo demás
				if(players[0].pBoot.num>0){
					if(players[0].pBoot.active==false){
						//powerUp.play();
						players[0].pBoot.active=true;
						players[0].pEye.active=false;
						players[0].pCoat.active=false;
					}else{
						players[0].pBoot.active=false;
					}
				}
				
			}if (keys['X']){
				//ACTIVAR CAPA
					if(players[0].pCoat.num>0){
						if(players[0].pCoat.active==false){
							//powerUp.play();
							players[0].pCoat.active=true;
							players[0].pBoot.active=false;
							players[0].pEye.active=false;
						}else{
							players[0].pCoat.active=false;
						}
				}
			}if (keys['C']){
				//ACTIVAR OJO
				if(players[0].pEye.num>0){
					if(players[0].pEye.active==false){
						//powerUp.play();
						players[0].pEye.active=true;
						players[0].pBoot.active=false;
						players[0].pCoat.active=false;
					}else{
						players[0].pEye.active=false;
					}
				}
			}
		}
		
	const offset = calculateOffset(players[0].handler);
	const lookat = calculateLookat(players[0].handler);

	cameras[0].position.copy(offset);
	cameras[0].lookAt(lookat);

        if (lastState!=state){
            const lastAnimation=players[0].actions[lastState];
            const newAnimation=players[0].actions[state];

            lastAnimation.reset(); //si se esta ejecutando en pausa o lo quesea, empiezo de nuevo
            newAnimation.reset();

            const crossFadeTime=0.2; //tiempo de transicion en seg
            lastAnimation.crossFadeTo(newAnimation,crossFadeTime).play(); //para realizar la transicion suave
            lastState=state;
			if(players[0].typeplyer=="Druida"){
				runningChild.play();
			}else{
				monsterSound.play();
			}
        }else{
        	if(state!="walking"){
				if(players[0].typeplyer=="Druida"){
					if(runningChild.isPlaying){
						runningChild.stop();
					}
				}else{
					if(monsterSound.isPlaying){
						monsterSound.stop();
					}
				}
        		
        	}
        	
        }
		if(loadedAssets>15){
			
			raycaster.set(players[0].handler.position, players[0].rayo);
			var colision=raycaster.intersectObjects(itemsCollectable,true);

			if(colision.length>0 &&colision[0].distance<=1 ){
				getItem(colision,players[0]);
				colision=null;
			}
		}
		if(players[0].keys==keyNumber&& !players[0].victory){ //CONDICION DE VICTORIA
			players[0].victory=true;
			victorySound.play();
			setFinalSinglePlayer(players[0]);
			console.log("ganaste");
		}
    }else{
		setFinalSinglePlayer(players[0]);
	} 

    if (!players[1].death){
		players[1].timer+=deltaTime;
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
		if (keys['P']){
			isPaused=true;
        }
		if(players[1].typeplyer=="Druida"){
			if (keys['B']){
				//ACTIVAR BOTAS desactivo todo lo demás
				if(players[1].pBoot.num>0){
					if(players[1].pBoot.active==false){
						//powerUp.play();
						players[1].pBoot.active=true;
						players[1].pEye.active=false;
						players[1].pCoat.active=false;
					}else{
						players[1].pBoot.active=false;
					}
				}
				
			}if (keys['N']){
				//ACTIVAR CAPA
					if(players[1].pCoat.num>0){
						if(players[1].pCoat.active==false){
							//powerUp.play();
							players[1].pCoat.active=true;
							players[1].pBoot.active=false;
							players[1].pEye.active=false;
						}else{
							players[1].pCoat.active=false;
						}
				}
			}if (keys['M']){
				//ACTIVAR OJO
				if(players[1].pEye.num>0){
					if(players[1].pEye.active==false){
						//powerUp.play();
						players[1].pEye.active=true;
						players[1].pBoot.active=false;
						players[1].pCoat.active=false;
					}else{
						players[1].pEye.active=false;
					}
				}
			}
		}
		const offset = calculateOffset(players[1].handler);
		const lookat = calculateLookat(players[1].handler);

	cameras[1].position.copy(offset);
	cameras[1].lookAt(lookat);

        if (lastState2!=state2){
            const lastAnimation=players[1].actions[lastState2];
            const newAnimation=players[1].actions[state2];

            lastAnimation.reset(); //si se esta ejecutando en pausa o lo quesea, empiezo de nuevo
            newAnimation.reset();

            const crossFadeTime=0.2; //tiempo de transicion en seg
            lastAnimation.crossFadeTo(newAnimation,crossFadeTime).play(); //para realizar la transicion suave
            lastState2=state2;
			if(players[1].typeplyer=="Druida"){
				runningChild.play();
			}else{
				monsterSound.play();
			}
        }else{
        	if(state2!="walking"){
				if(players[1].typeplyer=="Druida"){
					if(runningChild.isPlaying){
						runningChild.stop();
					}
				}else{
					if(monsterSound.isPlaying){
						monsterSound.stop();
					}
				}
        		
        	}
        	
        }
		if(loadedAssets>15){
			
			raycaster.set(players[1].handler.position, players[1].rayo);
			var colision=raycaster.intersectObjects(itemsCollectable,true);

			if(colision.length>0 &&colision[0].distance<=1 ){
				getItem(colision,players[1]);
				colision=null;
			}
		}
		if(players[1].keys==keyNumber&& !players[1].victory){ //CONDICION DE VICTORIA
			players[1].victory=true;
			victorySound.play();
			setFinalSinglePlayer(players[1]);
			console.log("ganaste");
		}
    }else{//perder
		setFinalSinglePlayer(players[1]);
	} 

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
}
function onUpdateMulti(deltaTime){
	onUpdateTwoPlayers(deltaTime);
	updateItems(deltaTime,cameras[0]);
	updateItems(deltaTime,cameras[1]);
	updateParticles(deltaTime);

}
function render(){

		requestAnimationFrame(render);
		if(isPaused){
			clock.stop();
			if(keys['R']){
				isPaused=false;
				clock.start();
			
			}
			
		}else{
		//Colisiones
		const Vcolision= (player.forward * deltaTime*-1 )-.7;
		if (escenaro1)
		{
			const P1 =scene.getObjectByName('Jugador');
			const P2 =scene.getObjectByName('Jugador1');
			const P3 =scene.getObjectByName('Jugador2');
		
			const E1 =scene.getObjectByName('C1');
			const E2 =scene.getObjectByName('C2');
			const E3 =scene.getObjectByName('C3');
			const E4 =scene.getObjectByName('C4');
		
			const vel =.1;
		//enemigos
		
		//1
		if(pos_a==1)
		{
			E1.position.z+=vel;
			if(E1.position.z>6)
			{
				pos_a=0;
				E1.rotation.y=2 * Math.PI * (180 / 360);
		
			}
		}
		if(pos_a==0)
		{
			E1.position.z-=vel;
		
			if(E1.position.z<-21)
			{
				pos_a=1;
				E1.rotation.y=0;
		
		
			}
		}
		//2
		if(pos_b==1)
		{
			E2.position.x+=vel;
			if(E2.position.x>6)
			{
				pos_b=0;
				E2.rotation.y=2 * Math.PI * (270 / 360);
		
			}
		}
		if(pos_b==0)
		{
			E2.position.x-=vel;
		
			if(E2.position.x<-6)
			{
				pos_b=1;
				E2.rotation.y=2 * Math.PI * (90 / 360);
		
		
			}
		}
		//3
		if(pos_c==1)
		{
			E3.position.z+=vel;
			if(E3.position.z>6)
			{
				pos_c=0;
				E3.rotation.y=2 * Math.PI * (180 / 360);
		
			}
		}
		if(pos_c==0)
		{
			E3.position.z-=vel;
		
			if(E3.position.z<-21)
			{
				pos_c=1;
				E3.rotation.y=0;
		
		
			}
		}
		//4
		if(pos_d==1)
		{
			E4.position.x+=vel;
			if(E4.position.x>6)
			{
				pos_d=0;
				E4.rotation.y=2 * Math.PI * (270 / 360);
		
			}
		}
		if(pos_d==0)
		{
			E4.position.x-=vel;
		
			if(E4.position.x<-6)
			{
				pos_d=1;
				E4.rotation.y=2 * Math.PI * (90 / 360);
		
			}
		}
		//
		
			const CO1 = scene.getObjectByName('Muro1');
			const CO2 = scene.getObjectByName('Muro2');
			const CO3 = scene.getObjectByName('Muro3');
			const CO4 = scene.getObjectByName('Muro4');
			const CO4_1 = scene.getObjectByName('Muro4_1');
		
			const CO5 = scene.getObjectByName('Muro5');
			const CO6 = scene.getObjectByName('Muro6');
			const CO7 = scene.getObjectByName('Muro7');
			const CO7_1 = scene.getObjectByName('Muro7_1');
			const CO7_2 = scene.getObjectByName('Muro7_2');
		
		
			const CO9 = scene.getObjectByName('Muro9');
			const CO10 = scene.getObjectByName('Muro10');
			const CO11 = scene.getObjectByName('Muro11');
			const CO11_1 = scene.getObjectByName('Muro11_1');
		
			const CO12 = scene.getObjectByName('Muro12');
			const CO13 = scene.getObjectByName('Muro13');
			const CO13_1 = scene.getObjectByName('Muro13_1');
		
		
			const CO14 = scene.getObjectByName('Muro14');
			const CO15 = scene.getObjectByName('Muro15');
			const CO16 = scene.getObjectByName('Muro16');
		
			if (CO1 && P1)
			{
				var SecondBB = new THREE.Box3().setFromObject(P1);
				var firstBB = new THREE.Box3().setFromObject(CO1);
				var firstBB1 = new THREE.Box3().setFromObject(CO2);
				var firstBB2 = new THREE.Box3().setFromObject(CO3);
				var firstBB3 = new THREE.Box3().setFromObject(CO4);
				var firstBB3_1 = new THREE.Box3().setFromObject(CO4_1);
		
				var firstBB4 = new THREE.Box3().setFromObject(CO5);
				var firstBB5 = new THREE.Box3().setFromObject(CO6);
				var firstBB6 = new THREE.Box3().setFromObject(CO7);
				var firstBB6_1 = new THREE.Box3().setFromObject(CO7_1);
				var firstBB6_2 = new THREE.Box3().setFromObject(CO7_2);
		
		
				var firstBB8 = new THREE.Box3().setFromObject(CO9);
				var firstBB9 = new THREE.Box3().setFromObject(CO10);
				var firstBB10 = new THREE.Box3().setFromObject(CO11);
				var firstBB10_1 = new THREE.Box3().setFromObject(CO11_1);
		
		
				var firstBB11 = new THREE.Box3().setFromObject(CO12);
				var firstBB12 = new THREE.Box3().setFromObject(CO13);
				var firstBB12_1 = new THREE.Box3().setFromObject(CO13_1);
		
				var firstBB13 = new THREE.Box3().setFromObject(CO14);
				var firstBB14 = new THREE.Box3().setFromObject(CO15);
				var firstBB15 = new THREE.Box3().setFromObject(CO16);
		
				var enemy1 =new THREE.Box3().setFromObject(E1);
				var enemy2 =new THREE.Box3().setFromObject(E2);
				var enemy3 =new THREE.Box3().setFromObject(E3);
				var enemy4 =new THREE.Box3().setFromObject(E4);
		
		
				if(E1 && P1)
				{
					if (enemy1.intersectsBox(SecondBB)||enemy2.intersectsBox(SecondBB)||enemy3.intersectsBox(SecondBB)||enemy4.intersectsBox(SecondBB))
					{
						player.handler.translateZ(Vcolision);
						killPlayer(player);	
					}
				}
		
				//colisiones de escenario
				 if (firstBB.intersectsBox(SecondBB)){
					 player.handler.translateZ(Vcolision);	
					}
				if (firstBB1.intersectsBox(SecondBB))
				{
					player.handler.translateZ(Vcolision);	
				}
			   if (firstBB2.intersectsBox(SecondBB))
			   {
				   player.handler.translateZ(Vcolision);		
			  }
			  if (firstBB3.intersectsBox(SecondBB))
			  {
				  player.handler.translateZ(Vcolision);		
			 }
			 if (firstBB4.intersectsBox(SecondBB))
			 {
				 player.handler.translateZ(Vcolision);		
			}
			if (firstBB3_1.intersectsBox(SecondBB))
			{
				player.handler.translateZ(Vcolision);		
		   }
			if (firstBB5.intersectsBox(SecondBB))
			{
				player.handler.translateZ(Vcolision);		
		   }
		   if (firstBB6.intersectsBox(SecondBB))
		   {
			   player.handler.translateZ(Vcolision);		
		  }
		  if (firstBB6_1.intersectsBox(SecondBB))
		  {
			  player.handler.translateZ(Vcolision);		
		 }
		 if (firstBB6_2.intersectsBox(SecondBB))
		 {
			 player.handler.translateZ(Vcolision);		
		}
		
		 if (firstBB8.intersectsBox(SecondBB))
		 {
			 player.handler.translateZ(Vcolision);		
		}
		if (firstBB9.intersectsBox(SecondBB))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB10.intersectsBox(SecondBB))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB10_1.intersectsBox(SecondBB))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB11.intersectsBox(SecondBB))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB12.intersectsBox(SecondBB))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB12_1.intersectsBox(SecondBB))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB13.intersectsBox(SecondBB))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB14.intersectsBox(SecondBB))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB15.intersectsBox(SecondBB))
		{
			player.handler.translateZ(Vcolision);		
		}
			}
		
			/*if (CO1 && P2 && P3)
			{
				var firstBB = new THREE.Box3().setFromObject(CO1);
				var firstBB1 = new THREE.Box3().setFromObject(CO2);
				var firstBB2 = new THREE.Box3().setFromObject(CO3);
				var firstBB3 = new THREE.Box3().setFromObject(CO4);
				var firstBB3_1 = new THREE.Box3().setFromObject(CO4_1);
		
				var firstBB4 = new THREE.Box3().setFromObject(CO5);
				var firstBB5 = new THREE.Box3().setFromObject(CO6);
				var firstBB6 = new THREE.Box3().setFromObject(CO7);
				var firstBB6_1 = new THREE.Box3().setFromObject(CO7_1);
				var firstBB6_2 = new THREE.Box3().setFromObject(CO7_2);
		
		
				var firstBB8 = new THREE.Box3().setFromObject(CO9);
				var firstBB9 = new THREE.Box3().setFromObject(CO10);
				var firstBB10 = new THREE.Box3().setFromObject(CO11);
				var firstBB10_1 = new THREE.Box3().setFromObject(CO11_1);
		
		
				var firstBB11 = new THREE.Box3().setFromObject(CO12);
				var firstBB12 = new THREE.Box3().setFromObject(CO13);
				var firstBB12_1 = new THREE.Box3().setFromObject(CO13_1);
		
				var firstBB13 = new THREE.Box3().setFromObject(CO14);
				var firstBB14 = new THREE.Box3().setFromObject(CO15);
				var firstBB15 = new THREE.Box3().setFromObject(CO16);
		
				var enemy1 =new THREE.Box3().setFromObject(E1);
				var enemy2 =new THREE.Box3().setFromObject(E2);
				var enemy3 =new THREE.Box3().setFromObject(E3);
				var enemy4 =new THREE.Box3().setFromObject(E4);
		
				var SecondBB1 = new THREE.Box3().setFromObject(P1);
				var SecondBB2 = new THREE.Box3().setFromObject(P1);
				if (firstBB.intersectsBox(SecondBB1))
				{
					player.handler.translateZ(Vcolision);	
				   }
			   if (firstBB1.intersectsBox(SecondBB1))
			   {
				   player.handler.translateZ(Vcolision);	
			   }
			  if (firstBB2.intersectsBox(SecondBB1))
			  {
				  player.handler.translateZ(Vcolision);		
			 }
			 if (firstBB3.intersectsBox(SecondBB1))
			 {
				 player.handler.translateZ(Vcolision);		
			}
			if (firstBB4.intersectsBox(SecondBB1))
			{
				player.handler.translateZ(Vcolision);		
		   }
		   if (firstBB3_1.intersectsBox(SecondBB1))
		   {
			   player.handler.translateZ(Vcolision);		
		  }
		   if (firstBB5.intersectsBox(SecondBB1))
		   {
			   player.handler.translateZ(Vcolision);		
		  }
		  if (firstBB6.intersectsBox(SecondBB1))
		  {
			  player.handler.translateZ(Vcolision);		
		 }
		 if (firstBB6_1.intersectsBox(SecondBB1))
		 {
			 player.handler.translateZ(Vcolision);		
		}
		if (firstBB6_2.intersectsBox(SecondBB1))
		{
			player.handler.translateZ(Vcolision);		
		}
		
		if (firstBB8.intersectsBox(SecondBB1))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB9.intersectsBox(SecondBB1))
		{
		   player.handler.translateZ(Vcolision);		
		}
		if (firstBB10.intersectsBox(SecondBB1))
		{
		   player.handler.translateZ(Vcolision);		
		}
		if (firstBB10_1.intersectsBox(SecondBB1))
		{
		   player.handler.translateZ(Vcolision);		
		}
		if (firstBB11.intersectsBox(SecondBB1))
		{
		   player.handler.translateZ(Vcolision);		
		}
		if (firstBB12.intersectsBox(SecondBB1))
		{
		   player.handler.translateZ(Vcolision);		
		}
		if (firstBB12_1.intersectsBox(SecondBB1))
		{
		   player.handler.translateZ(Vcolision);		
		}
		if (firstBB13.intersectsBox(SecondBB1))
		{
		   player.handler.translateZ(Vcolision);		
		}
		if (firstBB14.intersectsBox(SecondBB1))
		{
		   player.handler.translateZ(Vcolision);		
		}
		if (firstBB15.intersectsBox(SecondBB1))
		{
		   player.handler.translateZ(Vcolision);		
		}
		//
		if (firstBB.intersectsBox(SecondBB2))
				 {
					 player.handler.translateZ(Vcolision);	
					}
				if (firstBB1.intersectsBox(SecondBB2))
				{
					player.handler.translateZ(Vcolision);	
				}
			   if (firstBB2.intersectsBox(SecondBB2))
			   {
				   player.handler.translateZ(Vcolision);		
			  }
			  if (firstBB3.intersectsBox(SecondBB2))
			  {
				  player.handler.translateZ(Vcolision);		
			 }
			 if (firstBB4.intersectsBox(SecondBB2))
			 {
				 player.handler.translateZ(Vcolision);		
			}
			if (firstBB3_1.intersectsBox(SecondBB2))
			{
				player.handler.translateZ(Vcolision);		
		   }
			if (firstBB5.intersectsBox(SecondBB2))
			{
				player.handler.translateZ(Vcolision);		
		   }
		   if (firstBB6.intersectsBox(SecondBB2))
		   {
			   player.handler.translateZ(Vcolision);		
		  }
		  if (firstBB6_1.intersectsBox(SecondBB2))
		  {
			  player.handler.translateZ(Vcolision);		
		 }
		 if (firstBB6_2.intersectsBox(SecondBB2))
		 {
			 player.handler.translateZ(Vcolision);		
		}
		
		 if (firstBB8.intersectsBox(SecondBB2))
		 {
			 player.handler.translateZ(Vcolision);		
		}
		if (firstBB9.intersectsBox(SecondBB2))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB10.intersectsBox(SecondBB2))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB10_1.intersectsBox(SecondBB2))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB11.intersectsBox(SecondBB2))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB12.intersectsBox(SecondBB2))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB12_1.intersectsBox(SecondBB2))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB13.intersectsBox(SecondBB2))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB14.intersectsBox(SecondBB2))
		{
			player.handler.translateZ(Vcolision);		
		}
		if (firstBB15.intersectsBox(SecondBB2))
		{
			player.handler.translateZ(Vcolision);		
		}
		
			}*/
		//Collisiones		
		}
		if(escenaro2)
		{
			const P1 =scene.getObjectByName('Jugador');
			const P2 =scene.getObjectByName('Jugador1');
			const P3 =scene.getObjectByName('Jugador2');
		
			if(localStorageInfo.typeOfPlayer=="Druida"){
				const EB1 =scene.getObjectByName('CB1');
				const EB2 =scene.getObjectByName('CB2');
				const EB3 =scene.getObjectByName('CB3');
				const EB4 =scene.getObjectByName('CB4');
				const EB5 =scene.getObjectByName('CB5');
				const EB6 =scene.getObjectByName('CB6');
				const EB7 =scene.getObjectByName('CB7');
		
				const vel =.1;
			//1
			if(pos1_a==1)
			{
				EB1.position.z+=vel;
				if(EB1.position.z>2)
				{
					pos1_a=0;
					EB1.rotation.y=2 * Math.PI * (180 / 360);
				}
			}
			if(pos1_a==0)
			{
				EB1.position.z-=vel;
		
				if(EB1.position.z<-47)
				{
					pos1_a=1;
					EB1.rotation.y=0;
		
				}
			}
			//2
			if(pos1_b==1)
			{
				EB2.position.x+=vel;
				if(EB2.position.x>22.5)
				{
					pos1_b=0;
					EB2.rotation.y=2 * Math.PI * (270 / 360);
				}
			}
			if(pos1_b==0)
			{
				EB2.position.x-=vel;
		
				if(EB2.position.x<-25)
				{
					pos1_b=1;
					EB2.rotation.y=2 * Math.PI * (90 / 360);
		
				}
			}
			//3
			if(pos1_c==1)
			{
				EB3.position.z+=vel;
				if(EB3.position.z>2)
				{
					pos1_c=0;
					EB3.rotation.y=2 * Math.PI * (180 / 360);;
				}
			}
			if(pos1_c==0)
			{
				EB3.position.z-=vel;
		
				if(EB3.position.z<-47)
				{
					pos1_c=1;
					EB3.rotation.y=0;
		
				}
			}
			//4
			if(pos1_d==1)
			{
				EB4.position.z+=vel;
				if(EB4.position.z>0)
				{
					pos1_d=0;
					EB4.rotation.y=2 * Math.PI * (180 / 360);;
				}
			}
			if(pos1_d==0)
			{
				EB4.position.z-=vel;
		
				if(EB4.position.z<-28)
				{
					pos1_d=1;
					EB4.rotation.y=0;
		
				}
			}
			//5
			if(pos1_e==1)
			{
				EB5.position.z+=vel;
				if(EB5.position.z>-15)
				{
					pos1_e=0;
					EB5.rotation.y=2 * Math.PI * (180 / 360);;
				}
			}
			if(pos1_e==0)
			{
				EB5.position.z-=vel;
		
				if(EB5.position.z<-36)
				{
					pos1_e=1;
					EB5.rotation.y=0;
		
				}
			}
			//6
			if(pos1_f==1)
			{
				EB6.position.z+=vel;
				if(EB6.position.z>-6)
				{
					pos1_f=0;
					EB6.rotation.y=2 * Math.PI * (180 / 360);;
				}
			}
			if(pos1_f==0)
			{
				EB6.position.z-=vel;
		
				if(EB6.position.z<-47)
				{
					pos1_f=1;
					EB6.rotation.y=0;
		
				}
			}
			//7
			if(pos1_g==1)
			{
				EB7.position.x+=vel;
				if(EB7.position.x>10)
				{
					pos1_g=0;
					EB7.rotation.y=2 * Math.PI * (270 / 360);
				}
			}
			if(pos1_g==0)
			{
				EB7.position.x-=vel;
		
				if(EB7.position.x<-2)
				{
					pos1_g=1;
					EB7.rotation.y=2 * Math.PI * (90 / 360);
		
				}
			}
				let Second2BB = new THREE.Box3().setFromObject(P1);
				var EnemyB1= new THREE.Box3().setFromObject(EB1);
				var EnemyB2= new THREE.Box3().setFromObject(EB2);
				var EnemyB3= new THREE.Box3().setFromObject(EB3);
				var EnemyB4= new THREE.Box3().setFromObject(EB4);
				var EnemyB5= new THREE.Box3().setFromObject(EB5);
				var EnemyB6= new THREE.Box3().setFromObject(EB6);
				var EnemyB7= new THREE.Box3().setFromObject(EB7);
		
				if (EnemyB1.intersectsBox(Second2BB)||EnemyB2.intersectsBox(Second2BB)||EnemyB3.intersectsBox(Second2BB)
					||EnemyB4.intersectsBox(Second2BB)||EnemyB5.intersectsBox(Second2BB)||EnemyB6.intersectsBox(Second2BB)
					||EnemyB7.intersectsBox(Second2BB)){
						player.handler.translateZ(Vcolision);
						killPlayer(player);		
					}
			}
			
		//
		
			const CO2_1 = scene.getObjectByName('2Muro1');
			const CO2_2 = scene.getObjectByName('2Muro2');
			const CO2_3 = scene.getObjectByName('2Muro3');
			const CO2_4 = scene.getObjectByName('2Muro4');
			const CO2_5 = scene.getObjectByName('2Muro5');
			const CO2_6 = scene.getObjectByName('2Muro6');
			const CO2_7 = scene.getObjectByName('2Muro7');
			const CO2_8 = scene.getObjectByName('2Muro8');
			const CO2_9 = scene.getObjectByName('2Muro9');
			const CO2_10 = scene.getObjectByName('2Muro10');
			const CO2_11 = scene.getObjectByName('2Muro11');
			const CO2_12 = scene.getObjectByName('2Muro12');
			const CO2_13 = scene.getObjectByName('2Muro13');
			const CO2_14 = scene.getObjectByName('2Muro14');
			const CO2_15 = scene.getObjectByName('2Muro15');
			const CO2_16 = scene.getObjectByName('2Muro16');
			const CO2_17 = scene.getObjectByName('2Muro17');
			const CO2_18 = scene.getObjectByName('2Muro18');
			const CO2_19 = scene.getObjectByName('2Muro19');
			const CO2_20 = scene.getObjectByName('2Muro20');
			const CO2_21 = scene.getObjectByName('2Muro21');
			const CO2_22 = scene.getObjectByName('2Muro22');
			const CO2_23 = scene.getObjectByName('2Muro23');
			const CO2_24 = scene.getObjectByName('2Muro24');
			const CO2_25 = scene.getObjectByName('2Muro25');
			const CO2_26 = scene.getObjectByName('2Muro26');
			const CO2_27 = scene.getObjectByName('2Muro27');
			const CO2_28 = scene.getObjectByName('2Muro28');
			const CO2_29 = scene.getObjectByName('2Muro29');
			const CO2_30 = scene.getObjectByName('2Muro30');
			const CO2_31 = scene.getObjectByName('2Muro31');
			const CO2_32 = scene.getObjectByName('2Muro32');
		
		 if (CO2_1 && P1)
		 {	
		
			 var Second2BB = new THREE.Box3().setFromObject(P1);
			 var first2BB_1 = new THREE.Box3().setFromObject(CO2_1);
			 var first2BB_2 = new THREE.Box3().setFromObject(CO2_2);
			 var first2BB_3 = new THREE.Box3().setFromObject(CO2_3);
			 var first2BB_4 = new THREE.Box3().setFromObject(CO2_4);
			 var first2BB_5 = new THREE.Box3().setFromObject(CO2_5);
			 var first2BB_6 = new THREE.Box3().setFromObject(CO2_6);
			 var first2BB_7 = new THREE.Box3().setFromObject(CO2_7);
			 var first2BB_8 = new THREE.Box3().setFromObject(CO2_8);
			 var first2BB_9 = new THREE.Box3().setFromObject(CO2_9);
			 var first2BB_10 = new THREE.Box3().setFromObject(CO2_10);
			 var first2BB_11 = new THREE.Box3().setFromObject(CO2_11);
			 var first2BB_12 = new THREE.Box3().setFromObject(CO2_12);
			 var first2BB_13 = new THREE.Box3().setFromObject(CO2_13);
			 var first2BB_14 = new THREE.Box3().setFromObject(CO2_14);
			 var first2BB_15 = new THREE.Box3().setFromObject(CO2_15);
			 var first2BB_16 = new THREE.Box3().setFromObject(CO2_16);
			 var first2BB_17 = new THREE.Box3().setFromObject(CO2_17);
			 var first2BB_18 = new THREE.Box3().setFromObject(CO2_18);
			 var first2BB_19 = new THREE.Box3().setFromObject(CO2_19);
			 var first2BB_20 = new THREE.Box3().setFromObject(CO2_20);
			 var first2BB_21 = new THREE.Box3().setFromObject(CO2_21);
			 var first2BB_22 = new THREE.Box3().setFromObject(CO2_22);
			 var first2BB_23 = new THREE.Box3().setFromObject(CO2_23);
			 var first2BB_24 = new THREE.Box3().setFromObject(CO2_24);
			 var first2BB_25 = new THREE.Box3().setFromObject(CO2_25);
			 var first2BB_26 = new THREE.Box3().setFromObject(CO2_26);
			 var first2BB_27 = new THREE.Box3().setFromObject(CO2_27);
			 var first2BB_28 = new THREE.Box3().setFromObject(CO2_28);
			 var first2BB_29 = new THREE.Box3().setFromObject(CO2_29);
			 var first2BB_30 = new THREE.Box3().setFromObject(CO2_30);
			 var first2BB_31 = new THREE.Box3().setFromObject(CO2_31);
			 var first2BB_32= new THREE.Box3().setFromObject(CO2_32);
			
		
			 if (first2BB_1.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_2.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_3.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_4.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_5.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_6.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_7.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_8.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_9.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_10.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_11.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_12.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_13.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_14.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_15.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_16.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_17.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_18.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_19.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_20.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_21.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_22.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_23.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_24.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_25.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_26.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_27.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_28.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_29.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_30.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_31.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_32.intersectsBox(Second2BB))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
		 }
		
		/*if(CO2_1 &&P2 &&P3)
		{
			var Second2BB1 = new THREE.Box3().setFromObject(P2);
			var Second2BB2 = new THREE.Box3().setFromObject(P3);
		
			var first2BB_1 = new THREE.Box3().setFromObject(CO2_1);
			var first2BB_2 = new THREE.Box3().setFromObject(CO2_2);
			var first2BB_3 = new THREE.Box3().setFromObject(CO2_3);
			var first2BB_4 = new THREE.Box3().setFromObject(CO2_4);
			var first2BB_5 = new THREE.Box3().setFromObject(CO2_5);
			var first2BB_6 = new THREE.Box3().setFromObject(CO2_6);
			var first2BB_7 = new THREE.Box3().setFromObject(CO2_7);
			var first2BB_8 = new THREE.Box3().setFromObject(CO2_8);
			var first2BB_9 = new THREE.Box3().setFromObject(CO2_9);
			var first2BB_10 = new THREE.Box3().setFromObject(CO2_10);
			var first2BB_11 = new THREE.Box3().setFromObject(CO2_11);
			var first2BB_12 = new THREE.Box3().setFromObject(CO2_12);
			var first2BB_13 = new THREE.Box3().setFromObject(CO2_13);
			var first2BB_14 = new THREE.Box3().setFromObject(CO2_14);
			var first2BB_15 = new THREE.Box3().setFromObject(CO2_15);
			var first2BB_16 = new THREE.Box3().setFromObject(CO2_16);
			var first2BB_17 = new THREE.Box3().setFromObject(CO2_17);
			var first2BB_18 = new THREE.Box3().setFromObject(CO2_18);
			var first2BB_19 = new THREE.Box3().setFromObject(CO2_19);
			var first2BB_20 = new THREE.Box3().setFromObject(CO2_20);
			var first2BB_21 = new THREE.Box3().setFromObject(CO2_21);
			var first2BB_22 = new THREE.Box3().setFromObject(CO2_22);
			var first2BB_23 = new THREE.Box3().setFromObject(CO2_23);
			var first2BB_24 = new THREE.Box3().setFromObject(CO2_24);
			var first2BB_25 = new THREE.Box3().setFromObject(CO2_25);
			var first2BB_26 = new THREE.Box3().setFromObject(CO2_26);
			var first2BB_27 = new THREE.Box3().setFromObject(CO2_27);
			var first2BB_28 = new THREE.Box3().setFromObject(CO2_28);
			var first2BB_29 = new THREE.Box3().setFromObject(CO2_29);
			var first2BB_30 = new THREE.Box3().setFromObject(CO2_30);
			var first2BB_31 = new THREE.Box3().setFromObject(CO2_31);
			var first2BB_32= new THREE.Box3().setFromObject(CO2_32);
			//separacion
			if(localStorageInfo.typeOfPlayer=="Druida"){
				var EnemyB1= new THREE.Box3().setFromObject(EB1);
				var EnemyB2= new THREE.Box3().setFromObject(EB2);
				var EnemyB3= new THREE.Box3().setFromObject(EB3);
				var EnemyB4= new THREE.Box3().setFromObject(EB4);
				var EnemyB5= new THREE.Box3().setFromObject(EB5);
				var EnemyB6= new THREE.Box3().setFromObject(EB6);
				var EnemyB7= new THREE.Box3().setFromObject(EB7);
		
				if (EnemyB1.intersectsBox(Second2BB1))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (EnemyB2.intersectsBox(Second2BB1))
				{
				player.handler.translateZ(Vcolision);	
				} if (EnemyB3.intersectsBox(Second2BB1))
				{
				player.handler.translateZ(Vcolision);	
				} if (EnemyB4.intersectsBox(Second2BB1))
				{
				player.handler.translateZ(Vcolision);	
				} if (EnemyB5.intersectsBox(Second2BB1))
				{
				player.handler.translateZ(Vcolision);	
				} if (EnemyB6.intersectsBox(Second2BB1))
				{
				player.handler.translateZ(Vcolision);	
				} if (EnemyB7.intersectsBox(Second2BB1))
				{
				player.handler.translateZ(Vcolision);	
				}
					
				if (EnemyB1.intersectsBox(Second2BB2))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (EnemyB2.intersectsBox(Second2BB2))
				{
				player.handler.translateZ(Vcolision);	
				} if (EnemyB3.intersectsBox(Second2BB2))
				{
				player.handler.translateZ(Vcolision);	
				} if (EnemyB4.intersectsBox(Second2BB2))
				{
				player.handler.translateZ(Vcolision);	
				} if (EnemyB5.intersectsBox(Second2BB2))
				{
				player.handler.translateZ(Vcolision);	
				} if (EnemyB6.intersectsBox(Second2BB2))
				{
				player.handler.translateZ(Vcolision);	
				} if (EnemyB7.intersectsBox(Second2BB2))
				{
				player.handler.translateZ(Vcolision);	
				}
		}
		
			if (first2BB_1.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_2.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_3.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_4.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_5.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_6.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_7.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_8.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_9.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_10.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_11.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_12.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_13.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_14.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_15.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_16.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_17.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_18.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_19.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_20.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_21.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_22.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_23.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_24.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_25.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_26.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_27.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_28.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_29.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_30.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_31.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_32.intersectsBox(Second2BB1))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
		
				 if (first2BB_1.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_2.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_3.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_4.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_5.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_6.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_7.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_8.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_9.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_10.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_11.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_12.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_13.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_14.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_15.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_16.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_17.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_18.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_19.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_20.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_21.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_22.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_23.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_24.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_25.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_26.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_27.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_28.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_29.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_30.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_31.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
			 if (first2BB_32.intersectsBox(Second2BB2))
				 {
				 player.handler.translateZ(Vcolision);	
				 }
		
		}*/
		
		}
		if(escenaro3)
			{
				const P1 =scene.getObjectByName('Jugador');
				const CC1 =scene.getObjectByName('CC1');
		
				var VelGiro=.003
				CC1.rotation.y+=VelGiro;
		
				const S_3 = scene.getObjectByName('Suelo3');
				const S_4 = scene.getObjectByName('Suelo4');
				const S_5 = scene.getObjectByName('Suelo5');
				const S_6 = scene.getObjectByName('Suelo6');
				const S_7 = scene.getObjectByName('Suelo7');
				const S_8 = scene.getObjectByName('Suelo8');
				const S_9 = scene.getObjectByName('Suelo9');
				const S_10 = scene.getObjectByName('Suelo10');
				const S_11 = scene.getObjectByName('Suelo11');
				const S_12= scene.getObjectByName('Suelo12');
				const S_13 = scene.getObjectByName('Suelo13');
				const S_14 = scene.getObjectByName('Suelo14');
				const T_1 = scene.getObjectByName('T1');
				const T_2 = scene.getObjectByName('T2');
				const T_3 = scene.getObjectByName('T3');
				const T_4 = scene.getObjectByName('T4');
				const T_5 = scene.getObjectByName('T5');
				const T_6 = scene.getObjectByName('T6');
				const T_7 = scene.getObjectByName('T7');
				const T_8 = scene.getObjectByName('T8');
				const T_9 = scene.getObjectByName('T9');
				const T_10 = scene.getObjectByName('T10');
				const T_11 = scene.getObjectByName('T11');
				const T_12 = scene.getObjectByName('T12');
				const T_13 = scene.getObjectByName('T13');
				const T_14 = scene.getObjectByName('T14');
				const T_15 = scene.getObjectByName('T15');
				const T_16 = scene.getObjectByName('T16');
				const T_17 = scene.getObjectByName('T17');
				const T_18 = scene.getObjectByName('T18');
				const T_19 = scene.getObjectByName('T19');
				const T_20 = scene.getObjectByName('T20');
				const T_21 = scene.getObjectByName('T21');
				const T_22 = scene.getObjectByName('T22');
				const T_23 = scene.getObjectByName('T23');
				const T_24 = scene.getObjectByName('T24');
				const J_C = scene.getObjectByName('ControladorJefe');
		
		
					if(S_3 && P1 && T_1)
					{
						var Second2BB = new THREE.Box3().setFromObject(P1);
						var first3BB_3 = new THREE.Box3().setFromObject(S_3);
						var first3BB_4 = new THREE.Box3().setFromObject(S_4);
						var first3BB_5 = new THREE.Box3().setFromObject(S_5);
						var first3BB_6 = new THREE.Box3().setFromObject(S_6);
						var first3BB_7 = new THREE.Box3().setFromObject(S_7);
						var first3BB_8 = new THREE.Box3().setFromObject(S_8);
						var first3BB_9 = new THREE.Box3().setFromObject(S_9);
						var first3BB_10 = new THREE.Box3().setFromObject(S_10);
						var first3BB_11 = new THREE.Box3().setFromObject(S_11);
						var first3BB_12 = new THREE.Box3().setFromObject(S_12);
						var first3BB_13 = new THREE.Box3().setFromObject(S_13);
						var first3BB_14 = new THREE.Box3().setFromObject(S_14);
						var first3BBT_1 = new THREE.Box3().setFromObject(T_1);
						var first3BBT_2 = new THREE.Box3().setFromObject(T_2);
						var first3BBT_3 = new THREE.Box3().setFromObject(T_3);
						var first3BBT_4 = new THREE.Box3().setFromObject(T_4);
						var first3BBT_5 = new THREE.Box3().setFromObject(T_5);
						var first3BBT_6 = new THREE.Box3().setFromObject(T_6);
						var first3BBT_7 = new THREE.Box3().setFromObject(T_7);
						var first3BBT_8 = new THREE.Box3().setFromObject(T_8);
						var first3BBT_9 = new THREE.Box3().setFromObject(T_9);
						var first3BBT_10 = new THREE.Box3().setFromObject(T_10);
						var first3BBT_11 = new THREE.Box3().setFromObject(T_11);
						var first3BBT_12 = new THREE.Box3().setFromObject(T_12);
						var first3BBT_13 = new THREE.Box3().setFromObject(T_13);
						var first3BBT_14 = new THREE.Box3().setFromObject(T_14);
						var first3BBT_15 = new THREE.Box3().setFromObject(T_15);
						var first3BBT_16 = new THREE.Box3().setFromObject(T_16);
						var first3BBT_17 = new THREE.Box3().setFromObject(T_17);
						var first3BBT_18 = new THREE.Box3().setFromObject(T_18);
						var first3BBT_19 = new THREE.Box3().setFromObject(T_19);
						var first3BBT_20 = new THREE.Box3().setFromObject(T_20);
						var first3BBT_21 = new THREE.Box3().setFromObject(T_21);
						var first3BBT_22 = new THREE.Box3().setFromObject(T_22);
						var first3BBT_23 = new THREE.Box3().setFromObject(T_23);
						var first3BBT_24 = new THREE.Box3().setFromObject(T_24);
						var first3BBJ = new THREE.Box3().setFromObject(J_C);
		
		
		
						if (first3BB_3.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_4.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_5.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_6.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_7.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_8.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_9.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_10.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_11.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_12.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_13.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BB_14.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_1.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_2.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_3.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_4.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_5.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_6.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_7.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_8.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_9.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_10.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_11.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_12.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_13.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_14.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_15.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_16.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_17.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_18.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_19.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_20.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_21.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_22.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_23.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBT_24.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
						if (first3BBJ.intersectsBox(Second2BB))
						{
						player.handler.translateZ(Vcolision);	
						}
		
					}
		
		}
			deltaTime = clock.getDelta();
			if(loadedAssets>=12){
				onUpdateSingle(deltaTime);
			//checkForTarget();
				const time = performance.now() * 0.001;	
				var Wat= scene.getObjectByName("Awita");
				Wat.material.uniforms[ 'time' ].value += 1.0 / 60.0;
				renderer.render(scene,camera);
			}
		}
		


}
function renderTwo(){
		requestAnimationFrame(renderTwo);
		if(isPaused){
			clock.stop();
			if(keys['R']){
				isPaused=false;
				clock.start();
			
			}
		}else{
			if(escenaro2){
				const P2 =scene.getObjectByName('Jugador1');
				const P3 =scene.getObjectByName('Jugador2');

				var Second2BB1 = new THREE.Box3().setFromObject(P2);
				var Second2BB2 = new THREE.Box3().setFromObject(P3);

					const CO2_1 = scene.getObjectByName('2Muro1');
					const CO2_2 = scene.getObjectByName('2Muro2');
					const CO2_3 = scene.getObjectByName('2Muro3');
					const CO2_4 = scene.getObjectByName('2Muro4');
					const CO2_5 = scene.getObjectByName('2Muro5');
					const CO2_6 = scene.getObjectByName('2Muro6');
					const CO2_7 = scene.getObjectByName('2Muro7');
					const CO2_8 = scene.getObjectByName('2Muro8');
					const CO2_9 = scene.getObjectByName('2Muro9');
					const CO2_10 = scene.getObjectByName('2Muro10');
					const CO2_11 = scene.getObjectByName('2Muro11');
					const CO2_12 = scene.getObjectByName('2Muro12');
					const CO2_13 = scene.getObjectByName('2Muro13');
					const CO2_14 = scene.getObjectByName('2Muro14');
					const CO2_15 = scene.getObjectByName('2Muro15');
					const CO2_16 = scene.getObjectByName('2Muro16');
					const CO2_17 = scene.getObjectByName('2Muro17');
					const CO2_18 = scene.getObjectByName('2Muro18');
					const CO2_19 = scene.getObjectByName('2Muro19');
					const CO2_20 = scene.getObjectByName('2Muro20');
					const CO2_21 = scene.getObjectByName('2Muro21');
					const CO2_22 = scene.getObjectByName('2Muro22');
					const CO2_23 = scene.getObjectByName('2Muro23');
					const CO2_24 = scene.getObjectByName('2Muro24');
					const CO2_25 = scene.getObjectByName('2Muro25');
					const CO2_26 = scene.getObjectByName('2Muro26');
					const CO2_27 = scene.getObjectByName('2Muro27');
					const CO2_28 = scene.getObjectByName('2Muro28');
					const CO2_29 = scene.getObjectByName('2Muro29');
					const CO2_30 = scene.getObjectByName('2Muro30');
					const CO2_31 = scene.getObjectByName('2Muro31');
					const CO2_32 = scene.getObjectByName('2Muro32');
					
					if(CO2_1 &&P2 &&P3){
						var Second2BB1 = new THREE.Box3().setFromObject(P2);
						var Second2BB2 = new THREE.Box3().setFromObject(P3);
					
						var first2BB_1 = new THREE.Box3().setFromObject(CO2_1);
						var first2BB_2 = new THREE.Box3().setFromObject(CO2_2);
						var first2BB_3 = new THREE.Box3().setFromObject(CO2_3);
						var first2BB_4 = new THREE.Box3().setFromObject(CO2_4);
						var first2BB_5 = new THREE.Box3().setFromObject(CO2_5);
						var first2BB_6 = new THREE.Box3().setFromObject(CO2_6);
						var first2BB_7 = new THREE.Box3().setFromObject(CO2_7);
						var first2BB_8 = new THREE.Box3().setFromObject(CO2_8);
						var first2BB_9 = new THREE.Box3().setFromObject(CO2_9);
						var first2BB_10 = new THREE.Box3().setFromObject(CO2_10);
						var first2BB_11 = new THREE.Box3().setFromObject(CO2_11);
						var first2BB_12 = new THREE.Box3().setFromObject(CO2_12);
						var first2BB_13 = new THREE.Box3().setFromObject(CO2_13);
						var first2BB_14 = new THREE.Box3().setFromObject(CO2_14);
						var first2BB_15 = new THREE.Box3().setFromObject(CO2_15);
						var first2BB_16 = new THREE.Box3().setFromObject(CO2_16);
						var first2BB_17 = new THREE.Box3().setFromObject(CO2_17);
						var first2BB_18 = new THREE.Box3().setFromObject(CO2_18);
						var first2BB_19 = new THREE.Box3().setFromObject(CO2_19);
						var first2BB_20 = new THREE.Box3().setFromObject(CO2_20);
						var first2BB_21 = new THREE.Box3().setFromObject(CO2_21);
						var first2BB_22 = new THREE.Box3().setFromObject(CO2_22);
						var first2BB_23 = new THREE.Box3().setFromObject(CO2_23);
						var first2BB_24 = new THREE.Box3().setFromObject(CO2_24);
						var first2BB_25 = new THREE.Box3().setFromObject(CO2_25);
						var first2BB_26 = new THREE.Box3().setFromObject(CO2_26);
						var first2BB_27 = new THREE.Box3().setFromObject(CO2_27);
						var first2BB_28 = new THREE.Box3().setFromObject(CO2_28);
						var first2BB_29 = new THREE.Box3().setFromObject(CO2_29);
						var first2BB_30 = new THREE.Box3().setFromObject(CO2_30);
						var first2BB_31 = new THREE.Box3().setFromObject(CO2_31);
						var first2BB_32= new THREE.Box3().setFromObject(CO2_32);
					//separacion colisiones con enemigo
					if(localStorageInfo.typeOfPlayer=="Druida"){
							const EB1 =scene.getObjectByName('CB1');
							const EB2 =scene.getObjectByName('CB2');
							const EB3 =scene.getObjectByName('CB3');
							const EB4 =scene.getObjectByName('CB4');
							const EB5 =scene.getObjectByName('CB5');
							const EB6 =scene.getObjectByName('CB6');
							const EB7 =scene.getObjectByName('CB7');
					
							const vel =.1;
						//1
						if(pos1_a==1)
						{
							EB1.position.z+=vel;
							if(EB1.position.z>2)
							{
								pos1_a=0;
								EB1.rotation.y=2 * Math.PI * (180 / 360);
							}
						}
						if(pos1_a==0)
						{
							EB1.position.z-=vel;
					
							if(EB1.position.z<-47)
							{
								pos1_a=1;
								EB1.rotation.y=0;
					
							}
						}
						//2
						if(pos1_b==1)
						{
							EB2.position.x+=vel;
							if(EB2.position.x>22.5)
							{
								pos1_b=0;
								EB2.rotation.y=2 * Math.PI * (270 / 360);
							}
						}
						if(pos1_b==0)
						{
							EB2.position.x-=vel;
					
							if(EB2.position.x<-25)
							{
								pos1_b=1;
								EB2.rotation.y=2 * Math.PI * (90 / 360);
					
							}
						}
						//3
						if(pos1_c==1)
						{
							EB3.position.z+=vel;
							if(EB3.position.z>2)
							{
								pos1_c=0;
								EB3.rotation.y=2 * Math.PI * (180 / 360);;
							}
						}
						if(pos1_c==0)
						{
							EB3.position.z-=vel;
					
							if(EB3.position.z<-47)
							{
								pos1_c=1;
								EB3.rotation.y=0;
					
							}
						}
						//4
						if(pos1_d==1)
						{
							EB4.position.z+=vel;
							if(EB4.position.z>0)
							{
								pos1_d=0;
								EB4.rotation.y=2 * Math.PI * (180 / 360);;
							}
						}
						if(pos1_d==0)
						{
							EB4.position.z-=vel;
					
							if(EB4.position.z<-28)
							{
								pos1_d=1;
								EB4.rotation.y=0;
					
							}
						}
						//5
						if(pos1_e==1)
						{
							EB5.position.z+=vel;
							if(EB5.position.z>-15)
							{
								pos1_e=0;
								EB5.rotation.y=2 * Math.PI * (180 / 360);;
							}
						}
						if(pos1_e==0)
						{
							EB5.position.z-=vel;
					
							if(EB5.position.z<-36)
							{
								pos1_e=1;
								EB5.rotation.y=0;
					
							}
						}
						//6
						if(pos1_f==1)
						{
							EB6.position.z+=vel;
							if(EB6.position.z>-6)
							{
								pos1_f=0;
								EB6.rotation.y=2 * Math.PI * (180 / 360);;
							}
						}
						if(pos1_f==0)
						{
							EB6.position.z-=vel;
					
							if(EB6.position.z<-47)
							{
								pos1_f=1;
								EB6.rotation.y=0;
					
							}
						}
						//7
						if(pos1_g==1)
						{
							EB7.position.x+=vel;
							if(EB7.position.x>10)
							{
								pos1_g=0;
								EB7.rotation.y=2 * Math.PI * (270 / 360);
							}
						}
						if(pos1_g==0)
						{
							EB7.position.x-=vel;
					
							if(EB7.position.x<-2)
							{
								pos1_g=1;
								EB7.rotation.y=2 * Math.PI * (90 / 360);
					
							}
			}
						var EnemyB1= new THREE.Box3().setFromObject(EB1);
						var EnemyB2= new THREE.Box3().setFromObject(EB2);
						var EnemyB3= new THREE.Box3().setFromObject(EB3);
						var EnemyB4= new THREE.Box3().setFromObject(EB4);
						var EnemyB5= new THREE.Box3().setFromObject(EB5);
						var EnemyB6= new THREE.Box3().setFromObject(EB6);
						var EnemyB7= new THREE.Box3().setFromObject(EB7);
						//player 1
						if (EnemyB1.intersectsBox(Second2BB1)||EnemyB2.intersectsBox(Second2BB1)||EnemyB3.intersectsBox(Second2BB1)
						||EnemyB4.intersectsBox(Second2BB1)||EnemyB5.intersectsBox(Second2BB1)||EnemyB6.intersectsBox(Second2BB1)
						||EnemyB7.intersectsBox(Second2BB1))
						{
							let Vcolision= (players[0].forward * deltaTime*-1 )-.7;
							players[0].handler.translateZ(Vcolision);
							killPlayer(players[0]);	
						}
						//player2
						if (EnemyB1.intersectsBox(Second2BB2)||EnemyB2.intersectsBox(Second2BB2)||EnemyB3.intersectsBox(Second2BB2)
						||EnemyB4.intersectsBox(Second2BB2)||EnemyB5.intersectsBox(Second2BB2)||EnemyB6.intersectsBox(Second2BB2)
						||EnemyB7.intersectsBox(Second2BB2))
						{
							let Vcolision= (players[1].forward * deltaTime*-1 )-.7;
							players[1].handler.translateZ(Vcolision);
							killPlayer(players[1]);		
						}
						
					}
					//separacion colisiones con escenario
					//player 1
					if (first2BB_1.intersectsBox(Second2BB1)||first2BB_2.intersectsBox(Second2BB1)||first2BB_3.intersectsBox(Second2BB1)
					||first2BB_4.intersectsBox(Second2BB1)||first2BB_5.intersectsBox(Second2BB1)||first2BB_6.intersectsBox(Second2BB1)
					||first2BB_7.intersectsBox(Second2BB1)|| first2BB_8.intersectsBox(Second2BB1)||first2BB_9.intersectsBox(Second2BB1)
					||first2BB_10.intersectsBox(Second2BB1)||first2BB_11.intersectsBox(Second2BB1)||first2BB_12.intersectsBox(Second2BB1)
					||first2BB_13.intersectsBox(Second2BB1)||first2BB_14.intersectsBox(Second2BB1)||first2BB_15.intersectsBox(Second2BB1)
					||first2BB_16.intersectsBox(Second2BB1)||first2BB_17.intersectsBox(Second2BB1)|| first2BB_18.intersectsBox(Second2BB1)
					||first2BB_19.intersectsBox(Second2BB1)||first2BB_20.intersectsBox(Second2BB1)||first2BB_21.intersectsBox(Second2BB1)||first2BB_22.intersectsBox(Second2BB1)
					||first2BB_23.intersectsBox(Second2BB1)||first2BB_24.intersectsBox(Second2BB1)||first2BB_25.intersectsBox(Second2BB1)
					||first2BB_26.intersectsBox(Second2BB1)||first2BB_27.intersectsBox(Second2BB1)|| first2BB_28.intersectsBox(Second2BB1)
					||first2BB_29.intersectsBox(Second2BB1)||first2BB_30.intersectsBox(Second2BB1)||first2BB_31.intersectsBox(Second2BB1)||first2BB_32.intersectsBox(Second2BB1))
					{
						let Vcolision= (players[0].forward * deltaTime*-1 )-.7;
						players[0].handler.translateZ(Vcolision);
					}
					
					//player 2
					if (first2BB_1.intersectsBox(Second2BB2)||first2BB_2.intersectsBox(Second2BB2)||first2BB_3.intersectsBox(Second2BB2)
					||first2BB_4.intersectsBox(Second2BB2)||first2BB_5.intersectsBox(Second2BB2)||first2BB_6.intersectsBox(Second2BB2)
					||first2BB_7.intersectsBox(Second2BB2)|| first2BB_8.intersectsBox(Second2BB2)||first2BB_9.intersectsBox(Second2BB2)
					||first2BB_10.intersectsBox(Second2BB2)||first2BB_11.intersectsBox(Second2BB2)||first2BB_12.intersectsBox(Second2BB2)
					||first2BB_13.intersectsBox(Second2BB2)||first2BB_14.intersectsBox(Second2BB2)||first2BB_15.intersectsBox(Second2BB2)
					||first2BB_16.intersectsBox(Second2BB2)||first2BB_17.intersectsBox(Second2BB2)|| first2BB_18.intersectsBox(Second2BB2)
					||first2BB_19.intersectsBox(Second2BB2)||first2BB_20.intersectsBox(Second2BB2)||first2BB_21.intersectsBox(Second2BB2)||first2BB_22.intersectsBox(Second2BB2)
					||first2BB_23.intersectsBox(Second2BB2)||first2BB_24.intersectsBox(Second2BB2)||first2BB_25.intersectsBox(Second2BB2)
					||first2BB_26.intersectsBox(Second2BB2)||first2BB_27.intersectsBox(Second2BB2)|| first2BB_28.intersectsBox(Second2BB2)
					||first2BB_29.intersectsBox(Second2BB2)||first2BB_30.intersectsBox(Second2BB2)||first2BB_31.intersectsBox(Second2BB2)||first2BB_32.intersectsBox(Second2BB2))
					{	let Vcolision= (players[1].forward * deltaTime*-1 )-.7;
						players[1].handler.translateZ(Vcolision);
					}
				
				}
			}
			requestAnimationFrame(renderTwo);
			deltaTime = clock.getDelta();

			if(loadedAssets>=12){
				onUpdateMulti(deltaTime);
				const time = performance.now() * 0.001;	
				var Wat= scene.getObjectByName("Awita");
				Wat.material.uniforms[ 'time' ].value += 1.0 / 60.0;
				
				renderers[0].render(scene, cameras[0]);
				renderers[1].render(scene, cameras[1]);
			}
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


if(localStorageInfo.gameMode=="Solitario"){
	render();
}else{
	renderTwo();
}

