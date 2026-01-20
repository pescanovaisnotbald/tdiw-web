<?php
session_start();
header('Content-Type: application/json');

include_once __DIR__ . '/../models/m_connectaBD.php';
include_once __DIR__ . '/../models/m_usuaris.php';

$connexio = connectaBD();

$name = $_POST['name'];
$email = $_POST['email'];
$password = $_POST['password'];
$adreca = $_POST['adreca'];
$poblacio = $_POST['poblacio'];
$cp = $_POST['cp'];

if (obtenirUsuariPerEmail($connexio, $email)) {
    echo json_encode(['success' => false, 'message' => 'Aquest email ja esta registrat']);
    exit;
}

$dades_usuari = [
    'email' => $email,
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'address' => $adreca,
    'location' => $poblacio,
    'postcode' => $cp,
    'name' => $name
];

$resultat = crearUsuari($connexio, $dades_usuari);

if ($resultat) {
    $usuari = obtenirUsuariPerEmail($connexio, $email);
    if ($usuari) {
        $_SESSION['usuari_id'] = $usuari['usuari_id'];
        $_SESSION['name'] = $usuari['name'];
        $_SESSION['email'] = $usuari['email'];
        
        echo json_encode(['success' => true]);
        exit;
    }
}

echo json_encode(['success' => false, 'message' => 'Error al registrar']);
exit;
?>