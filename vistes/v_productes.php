<div class="products-layout">
    
    <aside class="filters-sidebar">
        <form action="index.php" method="GET">
            <input type="hidden" name="accio" value="resource_products">
            
            <?php if (!empty($_GET['q'])): ?>
                <input type="hidden" name="q" value="<?php echo htmlspecialchars($_GET['q']); ?>">
                <div class="filter-group" style="border-bottom:none; margin-bottom:10px; padding-bottom:0;">
                    <p style="font-size:13px; color:#888; margin:0;">
                        Resultats per: <strong>"<?php echo htmlspecialchars($_GET['q']); ?>"</strong>
                    </p>
                </div>
            <?php endif; ?>
            
            <div class="filter-group">
                <h3>Categories</h3>
                <label>
                    <input type="radio" name="id_categoria" value="" <?php echo empty($_GET['id_categoria']) ? 'checked' : ''; ?>> 
                    Totes
                </label>
                <?php if (!empty($llistaCategories)): ?>
                    <?php foreach ($llistaCategories as $cat): ?>
                        <label>
                            <input type="radio" name="id_categoria" value="<?php echo $cat['category_id']; ?>" <?php echo (($_GET['id_categoria'] ?? '') == $cat['category_id']) ? 'checked' : ''; ?>>
                            <?php echo htmlspecialchars($cat['nom']); ?>
                        </label>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <div class="filter-group">
                <h3>Preu (€)</h3>
                <input type="number" name="min_preu" class="filter-input" placeholder="Min" min="0" value="<?php echo htmlspecialchars($_GET['min_preu'] ?? ''); ?>">
                <input type="number" name="max_preu" class="filter-input" placeholder="Max" min="0" value="<?php echo htmlspecialchars($_GET['max_preu'] ?? ''); ?>">
            </div>

            <div class="filter-group">
                <h3>Ordenar per</h3>
                <select name="orden" class="filter-input">
                    <option value="">Defecte</option>
                    <option value="preu_asc" <?php echo (($_GET['orden'] ?? '') == 'preu_asc') ? 'selected' : ''; ?>>Més barats primer</option>
                    <option value="preu_desc" <?php echo (($_GET['orden'] ?? '') == 'preu_desc') ? 'selected' : ''; ?>>Més cars primer</option>
                    <option value="nom" <?php echo (($_GET['orden'] ?? '') == 'nom') ? 'selected' : ''; ?>>Nom (A-Z)</option>
                </select>
            </div>

            <button type="submit" class="btn-apply">Aplicar Filtres</button>
            
            <?php if(!empty($_GET['id_categoria']) || !empty($_GET['min_preu']) || !empty($_GET['max_preu'])): ?>
                <div style="margin-top:10px; text-align:center;">
                    <a href="index.php?accio=resource_products" style="font-size:12px; color:#666;">Esborrar filtres</a>
                </div>
            <?php endif; ?>
        </form>
    </aside>

    <section class="products-grid">
        <?php if (!empty($productes)) { ?>
            <?php foreach ($productes as $fila) { ?>
                <div class="product-card">
                    <div id="<?php echo $fila['product_id'] ?>" class="product-link">
                        <img class="product-image" src="./assets/productes/<?php echo $fila['imatge']; ?>" alt="<?php echo htmlspecialchars($fila['nom']); ?>">
                        <div class="product-info">
                            <h2 class="product-title"><?php echo htmlspecialchars($fila['nom']); ?></h2>
                            <p class="product-price"><?php echo $fila['preu']; ?> €</p>
                        </div>
                    </div>
                </div>
            <?php } ?>
        <?php } else { ?>   
            <div style="width:100%; text-align:center; padding: 40px; grid-column: 1 / -1;">
                <h3>Vaja! No hem trobat res.</h3>
                <p>Prova de canviar els filtres.</p>
            </div>
        <?php } ?>
    </section>

</div>

<dialog id="product-dialog" class="product-dialog">
    <form method="dialog" class="product-dialog-close-wrapper">
        <button class="product-dialog-close" aria-label="Tanca">&times;</button>
    </form>
    
    <div class="product-details-wrapper">
        <div id="product-content" class="product-content">
            <div class="product-image-section">
                <img id="modal-product-image" src="" alt="Product" class="modal-product-img">
            </div>
            <div class="product-info-section">
                <h2 id="modal-product-title" class="modal-product-title"></h2>
                <p id="modal-product-price" class="modal-product-price"></p>
                <p id="modal-product-description" class="modal-product-description"></p>
                
                <div class="modal-product-actions" style="display:flex; align-items:center; gap:10px;">
                    <div class="qty-selector" style="border:1px solid #ddd; border-radius:5px; display:flex;">
                        <button type="button" id="modal-qty-minus" class="qty-btn" style="padding:5px 10px; border:none; background:#f9f9f9; cursor:pointer;">-</button>
                        <input type="text" id="modal-qty-input" readonly value="1" class="qty-input" style="width:30px; text-align:center; border:none; border-left:1px solid #ddd; border-right:1px solid #ddd;">
                        <button type="button" id="modal-qty-plus" class="qty-btn" style="padding:5px 10px; border:none; background:#f9f9f9; cursor:pointer;">+</button>
                    </div>

                    <button id="modal-add-to-cart-btn" class="modal-btn-add-cart">
                        <i class="fa fa-shopping-cart"></i> Afegir
                    </button>
                </div>

            </div>
        </div>
    </div>
</dialog>