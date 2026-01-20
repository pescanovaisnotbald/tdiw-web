<?php
session_start();
header('Content-Type: application/json');
include_once __DIR__ . '/../models/m_connectaBD.php';
include_once __DIR__ . '/../models/m_comandes.php';

if (!isset($_SESSION['usuari_id'])) {
    echo json_encode(['success' => false, 'message' => 'No loguejat']);
    exit;
}

$conn = connectaBD();
$action = $_GET['action'] ?? 'list';

if ($action === 'list') {
    $comandes = getComandesUsuari($conn, $_SESSION['usuari_id']);
    echo json_encode(['success' => true, 'comandes' => $comandes]);
} elseif ($action === 'details' && isset($_GET['id'])) {
    $detalls = getLiniesComanda($conn, $_GET['id']);
    echo json_encode(['success' => true, 'detalls' => $detalls]);
}