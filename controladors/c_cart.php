<?php
session_start();
include_once __DIR__ . '/../models/m_connectaBD.php';
include_once __DIR__ . '/../models/m_productes.php';
include_once __DIR__ . '/../models/m_comandes.php'; // <--- AQUESTA ÉS LA LÍNIA QUE FALTAVA!

$connexio = connectaBD();
$accio = $_REQUEST['action'] ?? 'view';

// Inicialitzem el carretó si no existeix
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

switch ($accio) {
    case 'add':
        $product_id = $_POST['product_id'];
        $quantitat = (int)($_POST['quantity'] ?? 1);
        
        if (isset($_SESSION['cart'][$product_id])) {
            $_SESSION['cart'][$product_id] += $quantitat;
        } else {
            $_SESSION['cart'][$product_id] = $quantitat;
        }
        
        echo array_sum($_SESSION['cart']); 
        break;
    
    case 'checkout':
        // 1. Verifiquem si l'usuari està loguejat
        if (!isset($_SESSION['usuari_id'])) {
            echo json_encode(['success' => false, 'message' => 'login_required']);
            exit;
        }

        // 2. Verifiquem si el carretó està buit
        if (empty($_SESSION['cart'])) {
            echo json_encode(['success' => false, 'message' => 'empty_cart']);
            exit;
        }

        // 3. Calculem totals
        $total_import = 0;
        $total_elements = 0;
        $linies_per_inserir = [];

        foreach ($_SESSION['cart'] as $prod_id => $qty) {
            $infoProd = infoProducte($connexio, $prod_id);
            if ($infoProd) {
                $total_import += ($infoProd['preu'] * $qty);
                $total_elements += $qty;
                $linies_per_inserir[] = ['producte' => $infoProd, 'qty' => $qty];
            }
        }

        // 4. Inserim la Comanda (Capçalera)
        // Aquesta funció és la que donava error perquè no teníem el fitxer inclòs
        $comanda_id = inserirComanda($connexio, $_SESSION['usuari_id'], $total_import, $total_elements);

        if ($comanda_id) {
            // 5. Inserim les línies
            foreach ($linies_per_inserir as $linia) {
                inserirLiniaComanda($connexio, $comanda_id, $linia['producte'], $linia['qty']);
            }

            // 6. Buidem el carretó
            $_SESSION['cart'] = [];
            
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'error_bd']);
        }
        break;
    
    case 'update':
        $product_id = $_POST['product_id'];
        $quantitat = (int)$_POST['quantity'];
        
        if ($quantitat <= 0) {
            unset($_SESSION['cart'][$product_id]);
        } else {
            $_SESSION['cart'][$product_id] = $quantitat;
        }
        mostrarCarret($connexio);
        break;

    case 'remove':
        $product_id = $_POST['product_id'];
        unset($_SESSION['cart'][$product_id]);
        mostrarCarret($connexio);
        break;

    case 'view':
    default:
        mostrarCarret($connexio);
        break;
}

function mostrarCarret($connexio) {
    if (empty($_SESSION['cart'])) {
        echo '<div class="empty-cart-message">';
        echo '  <i class="fa fa-shopping-basket" style="font-size: 3rem; color: #ddd; margin-bottom: 10px;"></i>';
        echo '  <p>El teu carretó està buit.</p>';
        echo '</div>';
        return;
    }

    $total_preu = 0;
    
    foreach ($_SESSION['cart'] as $id => $qty) {
        $producte = infoProducte($connexio, $id);
        if (!$producte) continue;

        $subtotal = $producte['preu'] * $qty;
        $total_preu += $subtotal;

        ?>
        <div class="cart-item">
            <div class="cart-img-wrapper">
                <img src="./assets/productes/<?php echo $producte['imatge']; ?>" alt="<?php echo htmlspecialchars($producte['nom']); ?>">
            </div>
            
            <div class="cart-info">
                <h4><?php echo htmlspecialchars($producte['nom']); ?></h4>
                <p class="cart-price"><?php echo $producte['preu']; ?> €</p>
            </div>

            <div class="cart-controls">
                <div class="qty-selector">
                    <button type="button" class="qty-btn minus" data-id="<?php echo $id; ?>">-</button>
                    <input type="text" readonly value="<?php echo $qty; ?>" class="qty-input">
                    <button type="button" class="qty-btn plus" data-id="<?php echo $id; ?>">+</button>
                </div>
            </div>

            <button type="button" class="cart-remove-btn" data-id="<?php echo $id; ?>">
                <i class="fa fa-trash"></i>
            </button>
        </div>
        <?php
    }

    echo '<div class="cart-footer">';
    echo '  <div class="cart-total-row">';
    echo '      <span>Total:</span>';
    echo '      <span class="total-amount">' . number_format($total_preu, 2) . ' €</span>';
    echo '  </div>';
    echo '  <button class="checkout-btn">Finalitzar Comanda</button>';
    echo '</div>';
}
// RECORDA: NO TANQUIS AMB ?> AL FINAL