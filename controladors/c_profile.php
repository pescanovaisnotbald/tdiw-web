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

// Para GET, obtenemos los datos del usuario
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

// Para POST, actualizamos los datos
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $dades = [
        'name' => $_POST['name'] ?? '',
        'address' => $_POST['address'] ?? '',
        'location' => $_POST['location'] ?? '',
        'postcode' => $_POST['postcode'] ?? ''
    ];

    // Manejamos la subida de imagen
    if (isset($_FILES['avatar']) && $_FILES['avatar']['size'] > 0) {
        
        // Comprobamos si hay error en la subida
        if ($_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['success' => false, 'message' => 'Error pujada PHP (Codi: ' . $_FILES['avatar']['error'] . ')']);
            exit;
        }

        $uploadDir = __DIR__ . '/../assets/img_usuaris/';
        
        // Creamos la carpeta si no existe
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                echo json_encode(['success' => false, 'message' => 'No s\'ha pogut crear la carpeta img_usuaris. Revisa permisos.']);
                exit;
            }
        }

        $fileInfo = pathinfo($_FILES['avatar']['name']);
        $extension = strtolower($fileInfo['extension']);
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        // Validamos la extensión del archivo
        if (!in_array($extension, $allowed)) {
            echo json_encode(['success' => false, 'message' => 'Format no vàlid. Només JPG, PNG, GIF o WEBP.']);
            exit;
        }

        // Movemos el archivo a la carpeta
        $newFileName = 'user_' . $usuari_id . '_' . time() . '.' . $extension;
        $destPath = $uploadDir . $newFileName;

        if (move_uploaded_file($_FILES['avatar']['tmp_name'], $destPath)) {
            $dades['avatar'] = $newFileName;
        } else {
            // Error común por permisos
            echo json_encode(['success' => false, 'message' => 'Error de permisos: No es pot escriure a assets/img_usuaris.']);
            exit;
        }
    }

    // Actualizamos en la base de datos
    $resultat = actualitzarUsuari($conn, $usuari_id, $dades);

    if ($resultat) {
        $_SESSION['name'] = $dades['name']; // Actualizamos la sesión
        echo json_encode(['success' => true, 'avatar' => $dades['avatar'] ?? null]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error SQL al guardar.']);
    }
    exit;
}