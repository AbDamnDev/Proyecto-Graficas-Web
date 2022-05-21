<?php 
include_once("Class.php");
class Controller extends DAO{


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

   public function createPlayer(){
       $result=$this->insertPlayer($this->username,$this->tipojugador,$this->scene,$this->modoJuego ,$this->dificultad);
        return $result;
       
   }
   
   private function emptyInputs(){
       $result;
       if( empty($this->username) || empty($this->pwd) ){
           $result = false;
       }else{
           $result = true;
       }
       return $result;
   }

}
?>