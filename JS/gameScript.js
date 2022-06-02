import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js'
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/controls/OrbitControls.js';
import { Water } from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/objects/Water.js'
import { Sky } from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/objects/Sky.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/FBXLoader.js';
import {SubdivisionModifier} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/modifiers/SubdivisionModifier.js';
import * as LSManager from './localStorageManager.js';
import { modelosN1 } from './Modelos.js';
import { modelosN2 } from './Modelos.js';
import { modelosN3 } from './Modelos.js';
import { singleLevel1Colision } from './Colisiones.js';
import { singleLevel1Enemy } from './Colisiones.js';
import { singleLevel2Colision } from './Colisiones.js';
import { singleLevel2Enemy } from './Colisiones.js';
import { singleLevel3 } from './Colisiones.js';

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
var directionalLight = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), .7); //variable direccion de la luz
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

//animaciones ia
var monsterAnim=null;
var druidAnim=null;
var druidMixers=new Array();
var monsterMixers=new Array();
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
			gameQuality: localStorage.getItem('graphicsConfig')
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
	


	scene.add(ambientLight);

	if(localStorageInfo.gameMode=="Solitario"){	//agregamos niebla
		const near = 6;
		const far = 100;
		const color = 'lightblue';
		scene.fog = new THREE.Fog(color, near, far);
		scene.background = new THREE.Color(color);
	}

	directionalLight.position.set(0, 0, 1);
	scene.add(directionalLight);
		if(localStorageInfo.gameMode=="Solitario"){
			const water = buildWater();
			camera= new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.5, 1000);
			
			renderer= new THREE.WebGLRenderer({
				powerPreference:'high-performance',
				antialias:false
			});
			
			camera.add( listener );
			camera.position.set(0.0,25.0,40);
			renderer.setClearColor(new THREE.Color(1,1,1)); //setea el color a blanco
			renderer.setSize(window.innerWidth,window.innerHeight);
			//si los graficos son bajos modificamos el pixel ratio por 0.5 y asi
			switch(localStorageInfo.gameQuality){
				case 'Bajo':{
					renderer.setPixelRatio(window.devicePixelRatio*0.5);
					break;
				}
				case 'Medio':{
					renderer.setPixelRatio(window.devicePixelRatio*0.7);
					break;
				}
				case 'HD':{
					renderer.setPixelRatio(window.devicePixelRatio);
					break;
				}
				default:{
					renderer.setPixelRatio(window.devicePixelRatio*0.7);
					break;
				}
			}
			renderer.physicallyCorrectLights=true;

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
			escenaro1=true;
			escenaro2=false;
			escenaro3=false;
			loadSpecialItems(1);
			keyNumber=1;
			
		}
		
//ESCENARIO1//
	
if (escenaro1)
{
	//TODO: PROBAR LOS ESCENARIOS
	modelosN1(scene,loader,monsterMixers);
}


//ESCENARIO 2//	


if (escenaro2)
{
	modelosN2(scene,loader,monsterMixers);
}



//ESCENARIO 3//


if (escenaro3){
	modelosN3(scene,loader);
}


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
		var keysArray=new Array();
		for (let i=0;i<keysNumber;i++){
			loader.load('gameAssets/3dModels/druida/Druida.fbx', (model)=>{
				model.scale.multiplyScalar(0.09);
				//model.rotation.y=THREE.Math.degToRad(-180); 
				const mixer=new THREE.AnimationMixer(model);
				loader.load('gameAssets/3dModels/druida/animations/Druida@Idle.fbx',(animacion1)=>{
					const idleanimation=animacion1.animations[0];
					druidAnim= mixer.clipAction(idleanimation);;
					druidAnim.play();
					model.name='Key'+i;
					model.position.set(pos.x,pos.y,pos.z);
					let x=Math.floor(Math.random()*itemsPosition.length); 
					model.position.x=itemsPosition[x].x;
					model.position.z=itemsPosition[x].z;
					model.matrixAutoUpdate = true;
					itemsCollectable.push(model);
					scene.add(model);
					keysArray.push(model);
					druidMixers.push(mixer);
				});
			});
		}
		
	}

}
function loadDruidKeys(keysNumber){
	var itemArray=new Array();
	loader.load('gameAssets/3dModels/druida/Druida.fbx', (model)=>{
		model.scale.multiplyScalar(0.09);
		model.rotation.y=THREE.Math.degToRad(-180); 
		objEnemy.handler=model;
		objEnemy.mixer=new THREE.AnimationMixer(objEnemy.handler);
		loader.load('gameAssets/3dModels/druida/animations/Druida@Idle.fbx',(animacion1)=>{
			const idleanimation=animacion1.animations[0];
			objEnemy.idle=objEnemy.mixer.clipAction(idleanimation);
			objEnemy.idle.play();
		});
		model.name=baseName;
		model.position.set(basePosition.x,basePosition.y,basePosition.z);
		itemArray.push(model);
	});
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
	loader.load('gameAssets/3dModels/druida/Druida.fbx', (model)=>{
		model.scale.multiplyScalar(0.09);
		model.rotation.y=THREE.Math.degToRad(-180); 
		objEnemy.handler=model;
		objEnemy.mixer=new THREE.AnimationMixer(objEnemy.handler);
		loader.load('gameAssets/3dModels/druida/animations/Druida@Idle.fbx',(animacion1)=>{
			const idleanimation=animacion1.animations[0];
			objEnemy.idle=objEnemy.mixer.clipAction(idleanimation);
			objEnemy.idle.play();
		});
		model.name=baseName;
		model.position.set(basePosition.x,basePosition.y,basePosition.z);
		itemArray.push(model);
	});
	if(model!=null){
		model.scale.multiplyScalar(0.09);
		model.rotation.y=THREE.Math.degToRad(-180); 
		player.handler=model;
		player.mixer=new THREE.AnimationMixer(player.handler);
		const animation=loader.load('gameAssets/3dModels/druida/animations/Druida@Idle.fbx',(animacion1)=>{
			const idleanimation=animacion1.animations[0];
			return idleanimation;
		});
		player.idle=player.mixer.clipAction(animation);
		player.idle.play(); //reproducir animacion
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
		
	}
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
			model.position.set(posicion.x,posicion.y,posicion.z);
			player.yaw=0;
			player.forward=0;
			
			//model.add(camera);
			//camera.position.set(0,25,0);
			scene.add(model);

		});
			
	}else if (type=="Leshy"){
		loader.load('gameAssets/3dModels/wendigo/wendigo.fbx',(model)=>{
			model.scale.multiplyScalar(0.096);
			model.rotation.y=THREE.Math.degToRad(-180); 
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
			player.typeplyer='Leshy';
        	
			

		});

	}
		
}
function loadPlayerS(playernumber,playertype){
	if(playernumber==1){ //si solo es un jugador
		var pos= new THREE.Vector3(0.0,17.5,5);
		completeLoadPlayer(playertype,"Jugador",pos,player);
	}else{
		
				var pos= new THREE.Vector3(-2.0,17.5,5);
				completeLoadPlayer(playertype,"Jugador1",pos,player);
				player.yaw=0;
				player.forward=0;
				players.push(player);
			
				let pos2= new THREE.Vector3(2.0,17.5,5.0);
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
	if(localStorageInfo.gameMode=="Solitario"){//Multijugador
		window.addEventListener( 'resize', onWindowResize );
		onStartParticles();
	}else{
	
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
	if(player.typeplyer=="Druida"){
		childDeath.play();
	}
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
	if(player.typeplyer=="Leshy"){
		for(let i=0;i<druidMixers.length;i++){
			let obj=druidMixers[i].getRoot();
			if (obj.name==colArray[0].object.parent.name){
				druidMixers.splice(i,1);
			}
		}
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
		if(player.typeplyer=="Druida"){
			childDeath.play();
		}
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
function setFinalBothPlayers(player){
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
		if(loadedAssets>=8){
			
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
		if(!players[1].victory){//si no ha ganado el amigo
			if(players[1].death){ //si no ha ganado y ya perdio el amigo tambien
				setFinalSinglePlayer(players[0]);
			}else{
				//show dead message
			}
		}
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
		if(loadedAssets>8){
			
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
		if(!players[0].victory){//si no ha ganado el amigo
			if(players[0].death){ //si no ha ganado y ya perdio el amigo tambien
				setFinalSinglePlayer(players[1]);
			}else{
				//show dead message
			}
		}
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
function updateDruidas(deltaTime){
	if(itemsCollectable.length>0){
		druidMixers.forEach((mixer)=>{
			mixer.update(deltaTime);
		});
	}
}
function updateEnemies(deltaTime){
	if(monsterMixers.length>0){
		monsterMixers.forEach((mixer)=>{
			mixer.update(deltaTime);
		});
	}
}
function onUpdateSingle(deltaTime){
	 onUpdateSinglePlayer(deltaTime); 
	 if(localStorageInfo.typeOfPlayer=="Druida"){
		updateItems(deltaTime,camera);
		updateEnemies(deltaTime);
	 }else{
		updateDruidas(deltaTime);
	 }
	 updateParticles(deltaTime);
}
function onUpdateMulti(deltaTime){
	onUpdateTwoPlayers(deltaTime);
	if(localStorageInfo.typeOfPlayer=="Druida"){
		updateEnemies(deltaTime);
	 }else{
		updateDruidas(deltaTime);
	 }

}
function render(){

		if(isPaused){
			clock.stop();
			if(keys['R']){
				isPaused=false;
				clock.start();
			
			}
			
		}else{
			//colisiones
			const Vcolision= (player.forward * deltaTime *-1)-.5;
			if (escenaro1)
			{
			singleLevel1Enemy(deltaTime,Vcolision,scene);
			singleLevel1Colision(deltaTime,Vcolision,scene,player,0);
			}
			if (escenaro2)
			{
				singleLevel2Enemy(deltaTime,Vcolision,scene);
				singleLevel2Colision(deltaTime,Vcolision,scene,player,0);

			}
			if (escenaro3)
			{
				singleLevel3(deltaTime,Vcolision,scene,player,0);
			}
			requestAnimationFrame(render);
			deltaTime = clock.getDelta();
			if(loadedAssets>=12){
				onUpdateSingle(deltaTime);
				const time = performance.now() * 0.001;	
				var Wat= scene.getObjectByName("Awita");
				Wat.material.uniforms[ 'time' ].value += 1.0 / 60.0;
				renderer.render(scene,camera);
			}
		}
		


}
function renderTwo(){
		if(isPaused){
			clock.stop();
			if(keys['R']){
				isPaused=false;
				clock.start();
			}
		}else{
			const Vcolision= (players[0].forward * deltaTime *-1)-.5;
			const Vcolision2= (players[1].forward * deltaTime *-1)-.5;
			singleLevel1Enemy(deltaTime,Vcolision,scene);
			singleLevel1Colision(deltaTime,Vcolision,scene,players[0],1);
			singleLevel1Colision(deltaTime,Vcolision2,scene,players[1],2);

			requestAnimationFrame(renderTwo);
			deltaTime = clock.getDelta();

			if(loadedAssets>=8){
				onUpdateMulti(deltaTime);
				
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

$(document).ready(function(){
	if(localStorageInfo.gameMode=="Solitario"){
		render();
	}else{
		renderTwo();
	}
});

/**render de prueba
 * function render(){
	* if(isNotPaused){
	* renderer.render(scene,camera);
	* requestAnimationFrame(render);
	* }
 * }
 */
