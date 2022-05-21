CREATE DATABASE juegoDruida;

use juegoDruida;

#TABLA
create table JUEGO (
id int not null auto_increment Primary key,
nombreJugador varchar(25) not null, 
tipoJugador varchar(25) not null,
escena INT DEFAULT 1,
modoJuego varchar(25) not null,
victoria boolean DEFAULT false,
puntuacion int,
duracion TIME,
dificultad INT DEFAULT 1,
fecha datetime not null
);

CREATE VIEW JuegoLista AS 
SELECT id, nombreJugador, tipoJugador, escena, modoJuego, dificultad, fecha FROM Juego
WHERE 
Victoria=true 
Order by duracion asc, fecha Desc;