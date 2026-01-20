<?php
    function consultaCategories($connexio){
    $sql = "SELECT * FROM categoria";
    $consulta = pg_query($connexio, $sql) or die('La consulta ha fallat');
    $missatges = pg_fetch_all($consulta);
    return ($missatges);
    }
?>