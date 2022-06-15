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
            $scene=1; //todo el multijugador va a ser en la escena 1
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
    }else if(isset($_POST["accion"])&&strcmp($_POST["accion"],"updateScore")==0){
        $idjugador = $_POST["playerid"];
        $score = $_POST["score"];
        $isvictory = $_POST["victory"];
        if($isvictory=="false"){
            $isvictory=0;
        }else{
            $isvictory=1;
        }
        $totaltime = $_POST["time"];

        $players=$_POST['playerNumber'];

        
        $results=array();
        for($i=0;$i<$players;$i++){
            if($i==0){
                $player = Controller::constUpdatePlayer($idjugador,$isvictory,$score,$totaltime);
            }else{
                $idjugador2 = $_POST["playerid2"];
                $score2 = $_POST["score2"];
                $isvictory2 = $_POST["victory2"];
                if($isvictory2=="false"){
                    $isvictory2=0;
                }else{
                    $isvictory2=1;
                }
                $totaltime2 = $_POST["time2"];
                $player = Controller::constUpdatePlayer($idjugador2,$isvictory2,$score2,$totaltime2);
            }
            $Response=$player->upPlayer();
            array_push($results,$Response);
        }
        $failed=false;
        foreach($results as $res){
            if(!$res){
                $failed=true;
            }
        }
       
        if(!$failed){
            echo json_encode(array('result'=>'true'));
        }else{
            echo json_encode(array('result'=>'false'));
        }

        //constUpdatePlayer
        /*$player = Controller::constUpdatePlayer($idjugador,$isvictory,$score,$totaltime);
        $response=$player->upPlayer();
        echo json_encode(array('result'=>$response));*/
        
    }else if(isset($_POST["accion"])&&strcmp($_POST["accion"],"getScores")==0){
        $tipojugador = $_POST["typePlayer"];
        $nivel = $_POST["level"];
        $modoJuego = $_POST["gameMode"];

        $scores=Controller::consGetScores($tipojugador,$nivel,$modoJuego);
        $finalresponse=$scores->obtainScores();
        echo json_encode($finalresponse);
    }
   
?>