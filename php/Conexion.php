<?php
class Conexion{

    protected function connect(){
        try{

            $server="localhost"; 
            $username="root"; 
            $password="Vc20201877$#"; //esta es la que puede cambiar
            $database="juegoDruida";

            $conn = new PDO("mysql:host=$server;dbname=$database;",$username,$password);
            return $conn;
        }
        catch(PDOException $error){
            die("Connection failed " . $error->getMessage());
        }
    }
}
?>