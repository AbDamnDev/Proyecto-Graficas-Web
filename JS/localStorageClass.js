class gamePlayerConfig{
			constructor(){
				this.name=pnombre;
				this.correo=pcorreo;
				this.tel=ptel;
			}

		}
		//esto nomas es una plantilla pal local storage
		var LSobject={
			typeOfPlayer: value, //niño o monstruo
			gameScene: value, //escenario 1, 2 o 3
			gameMode: value, // single or multiplayer
			soundEnable: value, //si habra sonido o no
			soundLevel: value, //cuanto volumen
			graphicsConfig: value, //bajo, medio, hd
			nameofPlayer: value,
			keys: value, //1,2,3 o 4 dependiendo del nivel, si es monstruo, son los jugadores que atrapó
			invisCap: value, //true or false, es un item especial, para que los enemigos no te vean
			blindEye: value, //true or false, aplica para jugadores niños, es para que no haya enemigos en 1 minuto
			taranisBoots: value, //true or false, aplica para jugadores niños, es para velocidad
			endGame: value, //victory or fail
			totalTime: value, //tiempo total de juego
		};

		varPlayer={
			death: false,
		    victory: false,
		    mixer: null, //objeto de threejs que permite manejar animaciones
		    handler: null, //valor que permite manejar la rotacion, animacion, etc
		    actions: {
		        idle: null,
		        walking: null,
	        },
			playerName: value,
			typeOfPlayer: value,
			keys: value, //1,2,3 o 4 dependiendo del nivel, si es monstruo, son los jugadores que atrapó
			invisCap: value, //true or false, es un item especial, para que los enemigos no te vean
			blindEye: value, //true or false, aplica para jugadores niños, es para que no haya enemigos en 1 minuto
			taranisBoots: value, //true or false, aplica para jugadores niños, es para velocidad
		};