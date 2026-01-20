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

// GET: Obtenir dades
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $dades = obtenirDadesUsuari($conn, $usuari_id);
    if ($dades) {
        unset($dades['password']);
        echo json_encode(['success' => true, 'data' => $dades]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuari no trobat']);
    }
    exit;
}

// POST: Actualitzar dades
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $dades = [
        'name' => $_POST['name'] ?? '',
        'address' => $_POST['address'] ?? '',
        'location' => $_POST['location'] ?? '',
        'postcode' => $_POST['postcode'] ?? ''
    ];

    // --- GESTIÓ DE LA IMATGE ---
    if (isset($_FILES['avatar']) && $_FILES['avatar']['size'] > 0) {
        
        // 1. Mirem si hi ha hagut error de pujada
        if ($_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['success' => false, 'message' => 'Error pujada PHP (Codi: ' . $_FILES['avatar']['error'] . ')']);
            exit;
        }

        $uploadDir = __DIR__ . '/../assets/img_usuaris/';
        
        // 2. Intentem crear la carpeta si no existeix
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                echo json_encode(['success' => false, 'message' => 'No s\'ha pogut crear la carpeta img_usuaris. Revisa permisos.']);
                exit;
            }
        }

        $fileInfo = pathinfo($_FILES['avatar']['name']);
        $extension = strtolower($fileInfo['extension']);
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        // 3. Validem extensió
        if (!in_array($extension, $allowed)) {
            echo json_encode(['success' => false, 'message' => 'Format no vàlid. Només JPG, PNG, GIF o WEBP.']);
            exit;
        }

        // 4. Movem l'arxiu
        $newFileName = 'user_' . $usuari_id . '_' . time() . '.' . $extension;
        $destPath = $uploadDir . $newFileName;

        if (move_uploaded_file($_FILES['avatar']['tmp_name'], $destPath)) {
            $dades['avatar'] = $newFileName;
        } else {
            // Aquest és l'error més comú si fallen els permisos
            echo json_encode(['success' => false, 'message' => 'Error de permisos: No es pot escriure a assets/img_usuaris.']);
            exit;
        }
    }

    // Actualitzem a la BDD
    $resultat = actualitzarUsuari($conn, $usuari_id, $dades);

    if ($resultat) {
        $_SESSION['name'] = $dades['name']; // Actualitzem sessió
        echo json_encode(['success' => true, 'avatar' => $dades['avatar'] ?? null]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error SQL al guardar.']);
    }
    exit;
}