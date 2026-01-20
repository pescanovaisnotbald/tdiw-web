<?php
    function connectaBD(){
        $servidor = "deic-docencia.uab.cat";
        $port = "5432";
        $DBnom = "tdiw-i10";
        $usuari = "tdiw-i10";
        $clau = "kLMXqBFy";
        $connexio = pg_connect("host=$servidor port=$port dbname=$DBnom user=$usuari password=$clau") or die("Error connexio DB");
        return($connexio);
    }
?>
