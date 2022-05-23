<?php 
include_once("Class.php");
class Controller extends DAO{

    private $idplayer;
    private $isvictory;
    private $score;
    private $time;
    private $username;
    private $tipojugador;
    private $scene;
    private $modoJuego; 
    private $dificultad;

   public function __construct(){
        
   }
   
   public static function constcreatePlayer($username,$tipojugador,$scene,$modoJuego ,$dificultad){
    $instance = new self();
    $instance->username=$username;
    $instance->tipojugador=$tipojugador;
    $instance->scene=$scene;
    $instance->modoJuego=$modoJuego;
    $instance->dificultad=$dificultad;
    return $instance;
   }
   public static function constUpdatePlayer($id,$isvictory,$score,$time){
    $instance = new self();
    $instance->idplayer=$id;
    $instance->isvictory=$isvictory;
    $instance->score=$score;
    $instance->time=$time;
    return $instance;
   }
   public static function consGetScores($tipojugador,$scene,$modoJuego){
    $instance = new self();
    $instance->tipojugador=$tipojugador;
    $instance->scene=$scene;
    $instance->modoJuego=$modoJuego;
    return $instance;
   }

   public function createPlayer(){
       $result=$this->insertPlayer($this->username,$this->tipojugador,$this->scene,$this->modoJuego ,$this->dificultad);
        return $result;
       
   }
   public function upPlayer(){
        $result=$this->updatePlayer($this->isvictory,$this->score,$this->time,$this->idplayer);
        return $result;
   }
   public function obtainScores(){
        $result=$this->getScores($this->tipojugador,$this->modoJuego,$this->scene);
        return $result;
   }

}
?>