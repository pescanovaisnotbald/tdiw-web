<?php
session_start();
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>TemUAB</title>
    <link rel="icon" href="./assets/LogoTemUAB.png">
    <link rel="stylesheet" type="text/css" href="./css/index.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="./js/funcions.js"></script>
</head>
<body>
    <header class="navbar">
        <div class="navbar-pill">
            <a class="nav-link">
                <img class="logo-img" src="./assets/LogoTemUABlargo-sinfondo.png" alt="TemUAB">
            </a>

            <nav class="nav-links">
                <a href="index.php?accio=resource_home" class="nav-link">Home</a>
                <a href="index.php?accio=resource_categories" class="nav-link">Categories</a>
                <a href="index.php?accio=resource_products" class="nav-link">All Products</a>
                <a href="index.php?accio=resource_home#about-us" class="nav-link">About Us</a>
            </nav>
            <div class="nav-btns">
                <div id="search-wrapper" class="search-wrapper">
                    <form action="index.php" method="GET" id="search-form">
                        <input type="hidden" name="accio" value="resource_products">
                        
                        <div class="search-box">
                            <input type="text" name="q" class="search-input" 
                                placeholder="Buscar..." 
                                autocomplete="off"
                                value="<?php echo htmlspecialchars($_GET['q'] ?? ''); ?>">
                            
                            <button type="button" id="search-clear" class="search-clear-btn" 
                                    style="<?php echo empty($_GET['q']) ? 'display:none;' : 'display:block;'; ?>">
                                <i class="fa fa-times"></i>
                            </button>
                        </div>
                    </form>

                    <button class="icon-btn" type="button" id="search-toggle">
                        <i class="fa fa-search" aria-hidden="true"></i>
                    </button>
                </div>

                <div id="user-wrapper" class="user-wrapper">
                    <button class="icon-btn" type="button" id="user-btn">
                        <i class="fa fa-user-circle-o" aria-hidden="true"></i>
                    </button>
                    <div class="dropdown-menu" id="user-dropdown">
                        <?php if (isset($_SESSION['usuari_id'])) { ?>
                            <button class="dropdown-btn" id="btn-open-profile">El meu Compte</button>
                            <Button class="dropdown-btn">My Orders (soon)</Button>
                            <Button class="dropdown-btn" onclick="window.location.href='controladors/c_logout.php'" >Log Out</Button>
                        <?php } else { ?>
                            <Button class="dropdown-btn" onclick="openAuthModal()">Log In</Button>
                        <?php } ?>
                    </div>
                </div>

                <div id="cart-wrapper">
                    <button class="icon-btn" type="button" id="cart-btn">
                        <i class="fa fa-shopping-cart" aria-hidden="true"></i>
                        <span id="cart-count" class="cart-badge" style="display:none;">0</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
    
    <dialog id="auth-dialog" class="auth-dialog">
        <form method="dialog" class="auth-dialog-close-wrapper">
            <button class="auth-dialog-close" aria-label="Tanca">&times;</button>
        </form>

        <div class="auth-forms-wrapper">
            <form method="post" class="auth-form auth-form-login">
                <h2>Good To See You Back!</h2>
                <label for="login_email">Email</label>
                <input type="email" id="login_email" name="email" required>
                <label for="login_password">Password</label>
                <input type="password" id="login_password" name="password" required pattern="[A-Za-zÀ-ÿ0-9\s]+">
                <button type="submit" class="auth-submit">Log In</button>
                <p class="auth-switch">
                    Don't have an account yet?
                    <button type="button" class="auth-switch-btn" onclick="showRegister()">Sign Up</button>
                </p>
            </form>

            <form method="post" class="auth-form auth-form-register">
                <h2>Enjoy 20% discount for new users!</h2>
                <label for="reg_name">Name</label>
                <input type="text" id="reg_name" name="name" required pattern="[A-Za-zÀ-ÿ\s]+" maxlength="30">
                <label for="reg_email">Email</label>
                <input type="email" id="reg_email" name="email" required>
                <label for="reg_password">Password</label>
                <input type="password" id="reg_password" name="password" required pattern="[A-Za-zÀ-ÿ0-9\s]+">
                <label for="reg_address">Address</label>
                <input type="text" id="reg_address" name="adreca" required maxlength="30">
                <label for="reg_poblacio">Location</label>
                <input type="text" id="reg_poblacio" name="poblacio" required maxlength="30">
                <label for="reg_postal">Postal Code</label>
                <input type="text" id="reg_postal" name="cp" pattern="^\d{5}$" maxlength="5" required>
                <button type="submit" class="auth-submit">Sign Up</button>
                <p class="auth-switch">
                    Already have an account?
                    <button type="button" class="auth-switch-btn" onclick="showLogin()">Log In</button>
                </p>
            </form>
        </div>
    </dialog>

    <div id="main-content">
        <?php
        switch ($_GET['accio'] ?? 'resource_home') {
            case 'resource_products':
                include __DIR__.'/resource_products.php';
                break;
            case 'resource_categories':
                include __DIR__.'/resource_categories.php';
                break;
            default:
                include __DIR__.'/resource_home.php';
                break;
        }
        ?>
    </div>
  
    <footer class="footer">
        <p>TemUAB&reg; - Tots els drets reservats</p>
    </footer>

    <dialog id="cart-dialog" class="cart-dialog">
    <div class="cart-header">
        <h2>El meu Carretó</h2>
        <form method="dialog">
            <button class="cart-close-btn">&times;</button>
        </form>
    </div>

    <div id="cart-items-container" class="cart-body">
        <p>Carregant...</p>
    </div>
</dialog>

<dialog id="profile-dialog" class="auth-dialog"> <form method="dialog" class="auth-dialog-close-wrapper">
        <button class="auth-dialog-close">&times;</button>
    </form>

    <div class="profile-content">
        <h2>El meu Compte</h2>
        
        <form id="profile-form" enctype="multipart/form-data">
            <div class="profile-img-section">
                <div class="profile-img-wrapper">
                    <img id="profile-preview" src="./assets/img_usuaris/default.png" alt="Foto perfil">
                </div>
                <label for="profile-upload" class="profile-upload-btn">Canviar Foto</label>
                <input type="file" id="profile-upload" name="avatar" accept="image/*" style="display:none;">
            </div>

            <div class="auth-form" style="display:flex;">
                <label>Nom Complet</label>
                <input type="text" id="prof_name" name="name" required>

                <label>Email (No editable)</label>
                <input type="email" id="prof_email" disabled style="background:#f0f0f0; color:#666;">

                <label>Adreça</label>
                <input type="text" id="prof_address" name="address" required>

                <label>Població</label>
                <input type="text" id="prof_location" name="location" required>

                <label>Codi Postal</label>
                <input type="text" id="prof_postcode" name="postcode" required pattern="^\d{5}$">

                <button type="submit" class="auth-submit">Guardar Canvis</button>
            </div>
        </form>
    </div>
</dialog>
</body>
</html>
