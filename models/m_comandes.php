<?php
function inserirComanda($conn, $usuari_id, $total, $num_elements) {
    $sql = "INSERT INTO comanda (data_creació, número_elements, import_total, usuari_id) 
            VALUES (CURRENT_DATE, $1, $2, $3) 
            RETURNING comanda_id";
    $resultat = pg_query_params($conn, $sql, [$num_elements, $total, $usuari_id]);
    return pg_fetch_result($resultat, 0, 0);
}

function inserirLiniaComanda($conn, $comanda_id, $producte, $quantitat) {
    $preu_total_linia = $producte['preu'] * $quantitat;
    $sql = "INSERT INTO linia_comanda (nom_producte, quantitat, preu_unitari, preu_total, comanda_id, product_id) 
            VALUES ($1, $2, $3, $4, $5, $6)";
    return pg_query_params($conn, $sql, [
        $producte['nom'], $quantitat, $producte['preu'], 
        $preu_total_linia, $comanda_id, $producte['product_id']
    ]);
}

function getComandesUsuari($conn, $usuari_id) {
    $sql = "SELECT comanda_id, data_creació, import_total, número_elements FROM comanda WHERE usuari_id = $1 ORDER BY data_creació DESC";
    $resultat = pg_query_params($conn, $sql, [$usuari_id]);
    return pg_fetch_all($resultat);
}

function getLiniesComanda($conn, $comanda_id) {
    $sql = "SELECT nom_producte, quantitat, preu_unitari, preu_total FROM linia_comanda WHERE comanda_id = $1";
    $resultat = pg_query_params($conn, $sql, [$comanda_id]);
    return pg_fetch_all($resultat);
}