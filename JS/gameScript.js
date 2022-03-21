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
uniform sampler2D soilTex;
uniform sampler2D stonesTex;
uniform sampler2D pisoTex;
uniform sampler2D mossTex;

varying vec2 vUV;

varying float vAmount;

void main() 
{	
	vec4 tbBlend = texture2D(blendMap, vUV );

	float tbBaseWeight = 1.0 - max(tbBlend.r, max(tbBlend.g, tbBlend.b));

	vec4 base =  tbBaseWeight * texture2D(stonesTex, vUV * 10.0);
	vec4 soil = tbBlend.r * texture2D(soilTex, vUV * 10.0);
	vec4 piso = tbBlend.g * texture2D(pisoTex, vUV * 10.0);
	vec4 moss = tbBlend.b * texture2D(mossTex, vUV * 10.0);
	vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0) + base + soil + piso + moss;
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

function onStartFloor(){ //esta funcion tambien hay que optimizarla para que cargue otras cosas
	const textureLoader=new THREE.TextureLoader();
    const textureRepeat=100;
    const bumpScale=200;
    textureLoader.load('gameAssets/terrainTextures/terrain/bump2.jpg',(bump)=>{
    	//bump.wrapS=bump.wrapT=THREE.RepeatWrapping; tampoco se repite
    	//bump.repeat.multiplyScalar(textureRepeat); el bump no se repite lol
    	textureLoader.load('gameAssets/terrainTextures/terrain/blendMap1.jpg',(blendmap)=>{
    		textureLoader.load('gameAssets/terrainTextures/terrain/soil.jpg',(soil)=>{ //los demas si se repiten
    			soil.wrapS=soil.wrapT=THREE.RepeatWrapping; 
    			soil.repeat.multiplyScalar(textureRepeat); 
    			textureLoader.load('gameAssets/terrainTextures/terrain/Piedras.jpg',(stones)=>{
    				stones.wrapS=stones.wrapT=THREE.RepeatWrapping; 
    				stones.repeat.multiplyScalar(textureRepeat); 
    				textureLoader.load('gameAssets/terrainTextures/terrain/piso.jpg',(pisoPiedra)=>{
    					pisoPiedra.wrapS=pisoPiedra.wrapT=THREE.RepeatWrapping; 
    					pisoPiedra.repeat.multiplyScalar(textureRepeat); 
    					textureLoader.load('gameAssets/terrainTextures/terrain/moss.jpg',(moss)=>{
    						moss.wrapS=moss.wrapT=THREE.RepeatWrapping; 
    						moss.repeat.multiplyScalar(textureRepeat); 
    						var customUniforms = {
							bumpTex:	{ type: "t", value: bump },
							bumpScale:	{ type: "f", value: bumpScale },
							blendMap:   { type: "t", value: blendmap },
							soilTex:	{ type: "t", value: soil },
							stonesTex:	{ type: "t", value: stones },
							pisoTex:	{ type: "t", value: pisoPiedra },
							mossTex:	{ type: "t", value: moss },
							};

							var customMaterial = new THREE.ShaderMaterial( 
							{
							    uniforms: customUniforms,
								vertexShader:   _VS,
								fragmentShader: _FS,
								// side: THREE.DoubleSide
							});
							var planeGeo = new THREE.PlaneGeometry( 1000, 1000, 100, 100 );
							var plane = new THREE.Mesh(planeGeo, customMaterial );
							plane.rotation.x = -Math.PI / 2;
							plane.position.y = -130;
							scene.add( plane );
							loadedAssets++;
    					});
    				});
    			});
    		});
    	});
    });
}



function onStartSkybox() {
    const ctLoader = new THREE.CubeTextureLoader();
    ctLoader.setPath( 'gameAssets/terrainTextures/sky/' ); //necesitamos el path de la carpeta donde se encuentran todas

    ctLoader.load( [
        'px.jpg', 'nx.jpg',
        'py.jpg', 'ny.jpg',
        'pz.jpg', 'nz.jpg'
    ], (cubeTexture) => {
        scene.background = cubeTexture;
        loadedAssets++;
    });
}
function setItemsOnGame(){
	//en esta funcion vamos a cargar todos los modelos del escenario, el jugador y enemigos se cargan en otra
	//ademas ocupamos información del local storage para saber que escenario cargar

}

function onStartPlayer(){


}
function onStartEnemies(){


}

function onStart(){
	SetUpScene();
	onStartSkybox();
	onStartFloor();
	setItemsOnGame();
	onStartPlayer();
	onStartEnemies();

}

function render(){
		requestAnimationFrame(render);
		deltaTime = clock.getDelta();

		renderer.render(scene,camera);

}



onStart();
render();
