<?php
include_once("Conexion.php");
class DAO extends Conexion{
    
    protected function insertPlayer($username,$tipojugador,$scene,$modoJuego ,$dificultad){
        try{
        $dbo= $this->connect();
        $stmt = $dbo->prepare('INSERT INTO JUEGO(nombreJugador, tipoJugador, escena, modoJuego, dificultad, fecha)VALUES (?, ?, ?, ?, ?, now());');
        $stmt->execute(array($username,$tipojugador,$scene,$modoJuego ,$dificultad));
        $idplayer=$dbo->lastInsertId();
        
        }catch(PDOException $e){
            echo $e->getMessage();
            $idplayer=0;
        }
        
        $stmt = null;
        return $idplayer;
    }
    protected function updatePlayer($victoria,$puntuacion,$tiempo,$id){
        try{
            $stmt= $this->connect()->prepare('UPDATE JUEGO SET victoria = :victory ,puntuacion = :score ,duracion = :stime WHERE  id = :spid;');
            $stmt->bindValue(':victory', (int)$victoria, PDO::PARAM_BOOL);
            $stmt->bindValue(':score', $puntuacion, PDO::PARAM_INT);
            $stmt->bindValue(':stime', $tiempo);
            $stmt->bindValue(':spid', $id, PDO::PARAM_INT);
            if(!$stmt->execute()){
                $idplayer=false;
            }else{
                $idplayer=true;
            }
            
            }catch(PDOException $e){
                echo $e->getMessage();
                $idplayer=false;
            }
            $stmt = null;
            return $idplayer;
    }
    protected function getScores($typeplayer,$gamemode,$level){
            $stmt= $this->connect()->prepare('SELECT* FROM JuegoLista WHERE tipoJugador=? AND modoJuego=? AND dificultad=? LIMIT 10;');
            if(!$stmt->execute(array($typeplayer,$gamemode,$level))){
                $result=array('result'=>'false');
            }else{
                $idplayer=true;
                if($stmt->rowCount()>0){
                    $queryResult = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $select= $queryResult;
                    $result=array('result'=>'true','queries'=>$select);
                }else{
                    $result=array('result'=>'false');
                }
                
            }
            $stmt = null;
            return $result;

    }

    

}
?>