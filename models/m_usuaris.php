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
?>
