<?php
include_once __DIR__.'/../models/m_connectaBD.php';
include_once __DIR__.'/../models/m_productes.php';
include_once __DIR__.'/../models/m_categories.php';

$connexio = connectaBD();

// --- CAS 1: DETALL PRODUCTE (JSON per al Modal) ---
if (isset($_GET['product_id']) && !empty($_GET['product_id'])) {      
    $product_id = $_GET['product_id'];
    $producte = infoProducte($connexio, $product_id);
    if ($producte) echo json_encode($producte);
    exit;
}

// Recollim filtres
$filtres = [
    'categoria' => $_GET['id_categoria'] ?? null,
    'busqueda'  => $_GET['q'] ?? null,
    'min_preu'  => $_GET['min_preu'] ?? null,
    'max_preu'  => $_GET['max_preu'] ?? null,
    'orden'     => $_GET['orden'] ?? null
];

// Consultem productes
$productes = consultaProductesFiltrats($connexio, $filtres);

// --- CAS 2: FILTRATGE VIA AJAX (Retornem només l'HTML de les targetes) ---
if (isset($_GET['ajax'])) {
    if (!empty($productes)) {
        foreach ($productes as $fila) {
            // Generem l'HTML de cada carta directament aquí
            echo '<div class="product-card">';
            echo '  <div id="' . $fila['product_id'] . '" class="product-link">';
            echo '      <img class="product-image" src="./assets/productes/' . $fila['imatge'] . '" alt="' . htmlspecialchars($fila['nom']) . '">';
            echo '      <div class="product-info">';
            echo '          <h2 class="product-title">' . htmlspecialchars($fila['nom']) . '</h2>';
            echo '          <p class="product-price">' . $fila['preu'] . ' €</p>';
            echo '      </div>';
            echo '  </div>';
            echo '</div>';
        }
    } else {
        echo '<div style="width:100%; text-align:center; padding: 40px; grid-column: 1 / -1;">';
        echo '  <h3>Vaja! No hem trobat res.</h3>';
        echo '  <p>Prova de canviar els filtres.</p>';
        echo '</div>';
    }
    exit; // IMPORTANT: Parem aquí per no carregar la resta de la pàgina
}

// --- CAS 3: CÀRREGA NORMAL (Tota la pàgina) ---
$llistaCategories = consultaCategories($connexio);
include __DIR__.'/../vistes/v_productes.php';
?>