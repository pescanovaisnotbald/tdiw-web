<?php
session_start();
header('Content-Type: application/json');

include_once __DIR__ . '/../models/m_connectaBD.php';
include_once __DIR__ . '/../models/m_usuaris.php';

$connexio = connectaBD();

$email    = $_POST['email'];
$password = $_POST['password'];

$usuari = obtenirUsuariPerEmail($connexio, $email);

if ($usuari && password_verify($password, $usuari['password'])) {
    $_SESSION['usuari_id']   = $usuari['usuari_id'];
    $_SESSION['name']  = $usuari['name'];
    $_SESSION['email']= $usuari['email'];
    
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Credencials incorrectes']);
}
exit;

?>
