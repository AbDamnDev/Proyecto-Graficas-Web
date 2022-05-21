<!-- <?php
$mysqli = new mysqli('localhost', 'root', 'Zim11223344', 'TablaJuego');
if($mysqli ->connect_errno):
    echo "Error al  conectarse con MySQL debido al  error:".$mysqli->connect_error;
endif;
?> -->

<?php 
$server = "localhost";
$user = "root";
$password = "Zim11223344";
$bd = "TablaJuego";

$conexion = mysqli_connect($server, $user, $password, $bd);
if(!$conexion){
    die('Error de conexion:'.mysqli_connect_errbi());
}
?>