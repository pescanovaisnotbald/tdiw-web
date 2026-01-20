<section class="categories-grid">

    <?php if(!empty($categories)){?>
        <?php foreach($categories as $fila){?>
            
            <div class="category-card" style="background-image: url('./assets/categories/<?php echo $fila['img']; ?>');">

                <a href="index.php?accio=resource_products&id_categoria=<?php echo $fila['category_id']; ?>" class="category-link nav-link">

                    <h2 class="category-title"><?php echo $fila['nom'];  ?></h2>

                </a>

            </div>
        
        <?php } ?>
    <?php } else { ?>

        <p>Encara no hi ha categories disponibles.</p>
    
    <?php }?>
</section>
