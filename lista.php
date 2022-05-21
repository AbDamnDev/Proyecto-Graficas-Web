<?php
include("conexion.php");

$query = "SELECT * FROM  juegodDruida WHERE id = 1 ORDER BY puntuacion des;";
$resultado = mysqli_query($conexion, $query);

if(!$resultado){
    die("Error");
}else{
    while ($data = mysqli_fetch_assoc($resultado)){
        $arreglo["data"][] = array_map("utf8_encode", $data);
    }
    json_encode($arreglo);
}

mysqli_free_result($resultado);
mysqli_close($conexion);