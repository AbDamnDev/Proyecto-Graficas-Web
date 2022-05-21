<?php
include_once("Conexion.php");
class DAO extends Conexion{
    
    protected function sign_in($user,$password){
        $result;
        $stmt = $this->connect()->prepare('CALL LOGIN(?,?)');
        if(!$stmt->execute(array($user,$password))){
            $stmt = null;
            $result="stmtfailed";
           
        }

        if($stmt->rowCount() == 0){ 
            $stmt = null;
          
            $result="userNotFound";
           
        }else{
            session_start();
            $queryResult = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $_SESSION["ID_USER"] =$queryResult[0]["USER_ID"];
            $_SESSION["USERNAME"] =$queryResult[0]["FULL_NAME"];
          
            $stmt = null;
           
            $result="true";
            
        }
        $stmt = null;
        return $result;
        
    }
    protected function inVideo($path,$name,$type,$size,$user){
        $stmt = $this->connect()->prepare('CALL INSERTVIDEO(?,?,?,?,?)');
        if(!$stmt->execute(array($path,$name,$type,$size,$user))){
            $stmt = null;
            return false;
           
        }
        $stmt = null;
        return true;
    }
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

    

}
?>