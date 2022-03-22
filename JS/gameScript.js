import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js'
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/FBXLoader.js';
import * as LSManager from '../JS/localStorageManager.js';
//global variables
var scene;
var camera;
var loader; //variable que sirve como cargador FBX
var renderer;
var clock;
var deltaTime;
var listener; //cargador para audio
var keys={}; //variable para almacenar las teclas presionadas
let loadedAssets=0; //cuantos assets cargan
const totalAssets=0; //cuantos deben cargar antes de obtener el deltatime
var objects = []; //variable para almacenar los objetos a colisionar
var localStorageInfo; //variable para acceder a las llaves del local storage, sera un objeto literal
const rayFloor=new THREE.Vector3(0, -1, 0);
const rayCasterDown= new THREE.Raycaster();
var target = new THREE.Vector3();
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
const player={
    death: false,
    victory: false,
    mixer: null, //objeto de threejs que permite manejar animaciones
    handler: null, //valor que permite manejar la rotacion, animacion, etc
    actions: {
        idle: null,
        walking: null,
        death: null
    }
};
const terrain={
	handler:null
}
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
function SetUpScene(){
	scene=new THREE.Scene(); //crea la escena
	camera= new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1, 1000);
	loader=new FBXLoader();
	renderer= new THREE.WebGLRenderer();
	clock= new THREE.Clock();
	listener = new THREE.AudioListener(); //cargador de audio
	camera.add( listener );
	const monsterSound = new THREE.Audio(listener); //añadir sonido de monstruos/ruido de fondo
	const runningChild = new THREE.Audio(listener);
	const gameOverSound = new THREE.Audio(listener); //añadir sonido de derrota
	const victorySound = new THREE.Audio(listener); //añadir sonido de victoria
	renderer.setClearColor(new THREE.Color(1,1,1)); //setea el color a blanco
	var ambientLight = new THREE.AmbientLight(new THREE.Color(1, 1, 1), 1.0);
			scene.add(ambientLight);

			var directionalLight = new THREE.DirectionalLight(new THREE.Color(1, 1, 0), 0.4);
			directionalLight.position.set(0, 0, 1);
			scene.add(directionalLight);
	renderer.setSize(window.innerWidth,window.innerHeight);
	//añadirlo al html
	document.body.appendChild(renderer.domElement); //indica que el canvas en html es nuestro lienzo donde renderizamos

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

function onStartFloor(bumpmap,blendmap,basemap,redmap,greenmap,bluemap){ //esta funcion tambien hay que optimizarla para que cargue otras cosas
	const textureLoader=new THREE.TextureLoader();
    const textureRepeat=100;
    const bumpScale=200;
    textureLoader.load(bumpmap,(bump)=>{
    	//bump.wrapS=bump.wrapT=THREE.RepeatWrapping; tampoco se repite
    	//bump.repeat.multiplyScalar(textureRepeat); el bump no se repite lol
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
							var myplane = new THREE.Mesh(planeGeo, customMaterial );
							myplane.name="terreno";
							myplane.rotation.x = -Math.PI / 2;
							myplane.position.y = -130;
							terrenoColision.push(myplane);
							scene.add( myplane );
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

}

function onStartPlayer(){
	loader.load('gameAssets/3dModels/kid/character.fbx', (model)=>{
		model.scale.multiplyScalar(0.1);
		player.handler=model;
		model.name="Jugador";
		model.position.set(0.0,25,0);
		var terrain=scene.getObjectByName("terreno");
		scene.add(model);
		var position=new THREE.Vector3();
		position.copy(player.handler.position);
		//var yHeight=getYonTerrain(position,rayFloor);
		//alert(player.handler.position.y);
		/*var model = scene.getObjectByName("Jugador");
		var terrain = scene.getObjectByName("terreno");
		//model.position.y=getYonTerrain(model,rayFloor,terrain);
		scene.updateMatrixWorld(true);
		var position = new THREE.Vector3();
		position.setFromMatrixPosition( model.matrixWorld );
		//alert(position.x + ',' + position.y + ',' + position.z);
		alert("model position is: "+ position.x + ',' + position.y + ',' + position.z);*/
	});

}
function getYonTerrain(player,raydown){

	rayCasterDown.set(player, raydown);
	var collisionResults = rayCasterDown.intersectObject(terrenoColision[0],true);

	if (collisionResults.length > 0 && collisionResults[0].distance > 0){
	   const pointHeight = collisionResults[0].point.y;
	   const relativeHeight = player.position.y - pointHeight;
	   return relativeHeight;
	}else{
		return 0.0;
	}

}
function onStartEnemies(){


}

function onStart(){
	SetUpScene();
	onStartSkybox('gameAssets/terrainTextures/sky/',[ 'px.jpg', 'nx.jpg','py.jpg', 'ny.jpg','pz.jpg', 'nz.jpg']);
	onStartFloor('gameAssets/terrainTextures/terrain/altura3.jpg','gameAssets/terrainTextures/terrain/blendMap1.jpg',
	'gameAssets/terrainTextures/terrain/soil.jpg','gameAssets/terrainTextures/terrain/Piedras.jpg',	
	'gameAssets/terrainTextures/terrain/piso.jpg','gameAssets/terrainTextures/terrain/moss.jpg');
	setItemsOnGame();
	onStartPlayer();
	onStartEnemies();
	window.addEventListener( 'resize', onWindowResize );
	camera.position.set(0.0,25.0,5);
	
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

function render(){

	 	var miterreno=scene.getObjectByName("terreno");
		requestAnimationFrame(render);
		deltaTime = clock.getDelta();
		var yaw = 0;
		var forward = 0;
		
			if (keys["A"]) {
				yaw = 10;
			} else if (keys["D"]) {
				yaw = -10;
			}
			if (keys["W"]) {
				forward = -20;
			} else if (keys["S"]) {
				forward = 20;
			}	
			camera.rotation.y += yaw * deltaTime;
			camera.translateZ(3*forward * deltaTime);
			/*
			target.x += ( mouseX - target.x ) * .2;
    		target.y += ( - mouseY - target.y ) * .2;
    		target.z = camera.position.z; // assuming the camera is located at ( 0, 0, z );

    		camera.lookAt( target );
    		*/

		renderer.render(scene,camera);

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
render();
