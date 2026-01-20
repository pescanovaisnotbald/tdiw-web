<?php
include_once __DIR__.'/../models/m_connectaBD.php';
include_once __DIR__.'/../models/m_productes.php';
include_once __DIR__.'/../models/m_categories.php'; // AFEGIT: Necessari pel menú lateral

$connexio = connectaBD();

// Si és una petició AJAX per veure el detall del producte (Modal)
if (isset($_GET['product_id']) && !empty($_GET['product_id'])) {      
    $product_id = $_GET['product_id'];
    $producte = infoProducte($connexio, $product_id);
    
    if ($producte) {
        echo json_encode($producte);
    }
    exit;
}

// 1. Obtenim totes les categories per dibuixar el menú lateral
$llistaCategories = consultaCategories($connexio);

// 2. Recollim tots els possibles filtres que vinguin per URL
$filtres = [
    'categoria' => $_GET['id_categoria'] ?? null,
    'busqueda'  => $_GET['q'] ?? null,
    'min_preu'  => $_GET['min_preu'] ?? null,
    'max_preu'  => $_GET['max_preu'] ?? null,
    'orden'     => $_GET['orden'] ?? null
];

// 3. Demanem al model els productes que compleixin aquests filtres
$productes = consultaProductesFiltrats($connexio, $filtres);

// 4. Carreguem la vista
include __DIR__.'/../vistes/v_productes.php';
?>