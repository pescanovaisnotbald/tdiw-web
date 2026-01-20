<?php
function obtenirUsuariPerEmail($conn, $email) {
    $sql = 'SELECT * FROM usuari WHERE email = $1';
    $result = pg_query_params($conn, $sql, [$email]);
    
    return pg_fetch_assoc($result);
}

function crearUsuari($connexio, $dades) {
    $sql = 'INSERT INTO usuari (email, password, address, location, postcode, name) VALUES ($1, $2, $3, $4, $5, $6)';
    
    return pg_query_params($connexio, $sql, [
        $dades['email'],
        $dades['password_hash'],
        $dades['address'],
        $dades['location'],
        (int)$dades['postcode'],
        $dades['name']
    ]);
}

function obtenirDadesUsuari($conn, $id) {
    $sql = "SELECT * FROM usuari WHERE usuari_id = $1";
    $result = pg_query_params($conn, $sql, [$id]);
    return pg_fetch_assoc($result);
}

function actualitzarUsuari($conn, $id, $dades) {
    // Si hi ha avatar, actualitzem tot, si no, mantenim la foto antiga
    if (isset($dades['avatar'])) {
        $sql = "UPDATE usuari SET name=$1, address=$2, location=$3, postcode=$4, avatar=$5 WHERE usuari_id=$6";
        $params = [
            $dades['name'], 
            $dades['address'], 
            $dades['location'], 
            (int)$dades['postcode'], 
            $dades['avatar'], 
            $id
        ];
    } else {
        $sql = "UPDATE usuari SET name=$1, address=$2, location=$3, postcode=$4 WHERE usuari_id=$5";
        $params = [
            $dades['name'], 
            $dades['address'], 
            $dades['location'], 
            (int)$dades['postcode'], 
            $id
        ];
    }
    
    return pg_query_params($conn, $sql, $params);
}

?>

