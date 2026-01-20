<?php
    // Funció principal per filtrar productes (Cercador + Categories + Preu + Ordre)
    function consultaProductesFiltrats($connexio, $filtres){
        $sql = "SELECT * FROM producte WHERE 1=1";
        $params = [];
        $contador = 1;

        // 1. Filtre per Categoria
        if (!empty($filtres['categoria'])) {
            $sql .= " AND category_id = $" . $contador;
            $params[] = $filtres['categoria'];
            $contador++;
        }

        // 2. Filtre per Búsqueda (nom del producte)
        if (!empty($filtres['busqueda'])) {
            $sql .= " AND nom ILIKE $" . $contador; // ILIKE ignora majúscules/minúscules
            $params[] = '%' . $filtres['busqueda'] . '%';
            $contador++;
        }

        // 3. Filtre Preu Mínim
        if (!empty($filtres['min_preu'])) {
            $sql .= " AND preu >= $" . $contador;
            $params[] = $filtres['min_preu'];
            $contador++;
        }

        // 4. Filtre Preu Màxim
        if (!empty($filtres['max_preu'])) {
            $sql .= " AND preu <= $" . $contador;
            $params[] = $filtres['max_preu'];
            $contador++;
        }

        // 5. Ordenació
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

    // Funció per obtenir detalls d'un sol producte (pel modal)
    function infoProducte($connexio, $product_id) {
        $sql = "SELECT product_id, nom, imatge, preu, descripcio FROM producte WHERE product_id = $1";
        $resultat = pg_query_params($connexio, $sql, [$product_id]);
        return pg_fetch_assoc($resultat);
    }
    
    // Mantenim aquesta per compatibilitat si la uses al Home, però ja no s'usa aquí
    function consultaProductes($connexio){
        $sql = "SELECT * FROM producte";
        $consulta = pg_query($connexio, $sql);
        return pg_fetch_all($consulta);
    }
?>