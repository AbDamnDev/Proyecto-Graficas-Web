<?php
include_once("controller.php");
//$data = json_decode( file_get_contents('php://input'),true );
    if(isset($_POST["accion"])&&strcmp($_POST["accion"],"insertNewPlayer")==0){
        $nombrejugador = $_POST["username"];
        $tipojugador = $_POST["typePlayer"];
        $scene = $_POST["scene"];
        $modoJuego = $_POST["gameMode"];
        $dificultad = $_POST["gameDifficulty"];
        $players=1;
        //la fecha se pone sola
        if(strcmp($modoJuego,"Multijugador")==0){
            $nombrejugador2=$_POST["username2"];
            $players=2;
        }
        $idsarray=array();
        for($i=0;$i<$players;$i++){
            if($i==0){
                $createplayer = Controller::constcreatePlayer($nombrejugador,$tipojugador,$scene,$modoJuego ,$dificultad);
            }else{
                $createplayer = Controller::constcreatePlayer($nombrejugador2,$tipojugador,$scene,$modoJuego ,$dificultad);
            }
            $Response=$createplayer->createPlayer();
            array_push($idsarray,$Response);
        }
        $failed=false;
        foreach($idsarray as $idA){
            if(strcmp($idA,"0")==0){
                $failed=true;
            }
        }
       
        if(!$failed){
            echo json_encode(array('result'=>'true','playerNumber'=>sizeof($idsarray),'ids'=>$idsarray));
        }else{
            echo json_encode(array('result'=>'false'));
        }
    }else if(isset($data["accion"])&&strcmp($data["accion"],"updateScore")==0){

    }
   
?>