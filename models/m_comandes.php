<?php
// Funció per crear la capçalera de la comanda
function inserirComanda($conn, $usuari_id, $total, $num_elements) {
    // CURRENT_DATE és funció nativa de SQL
    $sql = "INSERT INTO comanda (data_creació, número_elements, import_total, usuari_id) 
            VALUES (CURRENT_DATE, $1, $2, $3) 
            RETURNING comanda_id";
            
    $resultat = pg_query_params($conn, $sql, [
        $num_elements,
        $total,
        $usuari_id
    ]);

    // Retornem l'UUID generat
    return pg_fetch_result($resultat, 0, 0);
}

// Funció per inserir cada línia de producte
function inserirLiniaComanda($conn, $comanda_id, $producte, $quantitat) {
    $preu_total_linia = $producte['preu'] * $quantitat;
    
    // Guardem el nom i preu ACTUALS per si canvien en el futur (snapshot)
    $sql = "INSERT INTO linia_comanda (nom_producte, quantitat, preu_unitari, preu_total, comanda_id, product_id) 
            VALUES ($1, $2, $3, $4, $5, $6)";
            
    return pg_query_params($conn, $sql, [
        $producte['nom'],
        $quantitat,
        $producte['preu'],
        $preu_total_linia,
        $comanda_id,
        $producte['product_id']
    ]);
}
?>