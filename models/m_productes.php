<?php
    // Filtramos productos por búsqueda, categoría, precio y orden
    function consultaProductesFiltrats($connexio, $filtres){
        $sql = "SELECT * FROM producte WHERE 1=1";
        $params = [];
        $contador = 1;

        // Filtramos por categoría
        if (!empty($filtres['categoria'])) {
            $sql .= " AND category_id = $" . $contador;
            $params[] = $filtres['categoria'];
            $contador++;
        }

        // Filtramos por búsqueda (nombre del producto)
        if (!empty($filtres['busqueda'])) {
            $sql .= " AND nom ILIKE $" . $contador; // Ignoramos mayúsculas/minúsculas
            $params[] = '%' . $filtres['busqueda'] . '%';
            $contador++;
        }

        // Filtramos por precio mínimo
        if (!empty($filtres['min_preu'])) {
            $sql .= " AND preu >= $" . $contador;
            $params[] = $filtres['min_preu'];
            $contador++;
        }

        // Filtramos por precio máximo
        if (!empty($filtres['max_preu'])) {
            $sql .= " AND preu <= $" . $contador;
            $params[] = $filtres['max_preu'];
            $contador++;
        }

        // Ordenamos los resultados
        if (!empty($filtres['orden'])) {
            switch ($filtres['orden']) {
                case 'preu_asc':
                    $sql .= " ORDER BY preu ASC";
                    break;
                case 'preu_desc':
                    $sql .= " ORDER BY preu DESC";
                    break;
                case 'nom':
                    $sql .= " ORDER BY nom ASC";
                    break;
                default:
                    $sql .= " ORDER BY product_id ASC";
            }
        } else {
            $sql .= " ORDER BY product_id ASC";
        }

        $consulta = pg_query_params($connexio, $sql, $params) or die('La consulta ha fallat: ' . pg_last_error());
        return pg_fetch_all($consulta);
    }

    // Obtenemos detalles de un producto para el modal
    function infoProducte($connexio, $product_id) {
        $sql = "SELECT product_id, nom, imatge, preu, descripcio FROM producte WHERE product_id = $1";
        $resultat = pg_query_params($connexio, $sql, [$product_id]);
        return pg_fetch_assoc($resultat);
    }
    
    // Mantenemos esta por compatibilidad, pero ya no se usa aquí
    function consultaProductes($connexio){
        $sql = "SELECT * FROM producte";
        $consulta = pg_query($connexio, $sql);
        return pg_fetch_all($consulta);
    }
?>