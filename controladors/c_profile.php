<?php
session_start();
header('Content-Type: application/json');

include_once __DIR__ . '/../models/m_connectaBD.php';
include_once __DIR__ . '/../models/m_usuaris.php';

if (!isset($_SESSION['usuari_id'])) {
    echo json_encode(['success' => false, 'message' => 'No has iniciat sessió']);
    exit;
}

$conn = connectaBD();
$usuari_id = $_SESSION['usuari_id'];

// --- CAS 1: OBTENIR DADES (GET) ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $dades = obtenirDadesUsuari($conn, $usuari_id);
    if ($dades) {
        // No retornem el password per seguretat
        unset($dades['password']);
        echo json_encode(['success' => true, 'data' => $dades]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuari no trobat']);
    }
    exit;
}

// --- CAS 2: ACTUALITZAR DADES (POST) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $dades = [
        'name' => $_POST['name'],
        'address' => $_POST['address'],
        'location' => $_POST['location'],
        'postcode' => $_POST['postcode']
    ];

    // Gestió de la Imatge (PFP)
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../assets/img_usuaris/';
        
        // Crear carpeta si no existeix
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileInfo = pathinfo($_FILES['avatar']['name']);
        $extension = strtolower($fileInfo['extension']);
        
        // Validar extensió
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            // Generem nom únic per evitar conflictes
            $newFileName = 'user_' . $usuari_id . '_' . uniqid() . '.' . $extension;
            $destPath = $uploadDir . $newFileName;

            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $destPath)) {
                $dades['avatar'] = $newFileName;
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al moure la imatge']);
                exit;
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Format d\'imatge no vàlid']);
            exit;
        }
    }

    $resultat = actualitzarUsuari($conn, $usuari_id, $dades);

    if ($resultat) {
        // Actualitzem la sessió perquè el header canviï de nom si cal
        $_SESSION['name'] = $dades['name'];
        echo json_encode(['success' => true, 'avatar' => $dades['avatar'] ?? null]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al guardar a la BDD']);
    }
    exit;
}
?>