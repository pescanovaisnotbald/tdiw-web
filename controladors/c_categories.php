<?php
    include_once __DIR__.'/../models/m_connectaBD.php';
    include_once __DIR__.'/../models/m_categories.php';
    $connexio = connectaBD();
    $categories = consultaCategories($connexio);
    include __DIR__.'/../vistes/v_categories.php';
?>