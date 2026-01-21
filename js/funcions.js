$(document).ready(function() {

    // Navegación
    $(document).on('click', '#user-btn', function(e) {
        e.preventDefault(); e.stopPropagation(); $('#user-dropdown').toggleClass('show');
    });
    $(document).on('click', function() { $('#user-dropdown').removeClass('show'); });
    $(document).on('click', '#user-dropdown', function(e) { e.stopPropagation(); });

    $(document).on('click', '.nav-link, .logo-link', async function(e) {
        if ($(this).attr('href') && $(this).attr('href').indexOf('index.php') !== -1) {
            e.preventDefault();
            const url = $(this).attr('href');
            try {
                const res = await fetch(url);
                const html = await res.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const content = doc.querySelector('#main-content');
                if (content) {
                    $('#main-content').html(content.innerHTML);
                    window.history.pushState({}, '', url);
                }
            } catch (err) { console.error(err); }
        }
    });

    // Autenticación
    $(document).on('submit', '.auth-form-login', async function(e) {
        e.preventDefault();
        try {
            const res = await fetch('controladors/c_login.php', { method: 'POST', body: new FormData(this) });
            const d = await res.json();
            d.success ? window.location.reload() : alert(d.message);
        } catch (e) { alert("Error al login."); }
    });

    $(document).on('submit', '.auth-form-register', async function(e) {
        e.preventDefault();
        try {
            const res = await fetch('controladors/c_signup.php', { method: 'POST', body: new FormData(this) });
            const d = await res.json();
            d.success ? window.location.reload() : alert(d.message);
        } catch (e) { alert("Error al registre."); }
    });

    // Buscador
    $(document).on('click', '#search-toggle', function(e) {
        e.preventDefault();
        const w = $('#search-wrapper'), i = w.find('.search-input');
        !w.hasClass('active') ? (w.addClass('active'), setTimeout(()=>i.focus(), 100)) : (i.val().trim() !== "" ? $('#search-form').submit() : w.removeClass('active'));
    });
    $(document).on('input', '.search-input', function() { $(this).val().trim() !== "" ? $('#search-clear').show() : $('#search-clear').hide(); });
    $(document).on('click', '#search-clear', function() { $('.search-input').val(''); $(this).hide(); $('#search-form').submit(); });
    if ($('.search-input').val()?.trim()) { $('#search-wrapper').addClass('active'); $('#search-clear').show(); }

    // Filtros
    $(document).on('submit', '.filters-sidebar form', function(e) {
        e.preventDefault();
        $.ajax({ type: "GET", url: 'controladors/c_productes.php', data: $(this).serialize() + '&ajax=true', success: h => $('.products-grid').html(h) });
    });
    $(document).on('change', 'select[name="orden"]', function() { $('.filters-sidebar form').submit(); });

    // Carrito
    $(document).on('click', '#cart-btn', function() { document.getElementById('cart-dialog').showModal(); carregarCarret(); });
    
    // Nueva lógica para seleccionar cantidad en el modal
    $(document).on('click', '#modal-qty-plus', function() {
        var input = $('#modal-qty-input');
        input.val(parseInt(input.val()) + 1);
    });
    $(document).on('click', '#modal-qty-minus', function() {
        var input = $('#modal-qty-input');
        var val = parseInt(input.val());
        if (val > 1) input.val(val - 1);
    });

    // Ahora añadimos la cantidad seleccionada al carrito
    $(document).on('click', '#modal-add-to-cart-btn', function(e) {
        e.preventDefault();
        const pid = $(this).data('id');
        const qty = $('#modal-qty-input').val(); // Cogemos la cantidad del input
        
        if(!pid) return;
        $.ajax({
            url: 'controladors/c_cart.php', type: 'POST', 
            data: { action: 'add', product_id: pid, quantity: qty }, // Enviamos la cantidad
            success: function(t) { 
                document.getElementById('product-dialog').close(); 
                if($('#cart-count').length) $('#cart-count').text(t).show(); 
                alert("S'han afegit " + qty + " productes al carretó!"); 
            }
        });
    });

    $(document).on('click', '.cart-remove-btn', function() { actualitzarCarret('remove', $(this).data('id'), 0); });
    $(document).on('click', '.qty-btn.plus', function() { 
        const i = $(this).siblings('.qty-input'); 
        actualitzarCarret('update', $(this).data('id'), parseInt(i.val()) + 1); 
    });
    $(document).on('click', '.qty-btn.minus', function() { 
        const i = $(this).siblings('.qty-input'), v = parseInt(i.val()); 
        v > 1 ? actualitzarCarret('update', $(this).data('id'), v - 1) : actualitzarCarret('remove', $(this).data('id'), 0); 
    });

    $(document).on('click', '.checkout-btn', function(e) {
        e.preventDefault();
        if(!confirm("Finalitzar comanda?")) return;
        $.ajax({
            url: 'controladors/c_cart.php', type: 'POST', data: { action: 'checkout' }, dataType: 'json',
            success: function(r) { 
                if(r.success) { alert("Comanda feta!"); document.getElementById('cart-dialog').close(); if($('#cart-count').length) $('#cart-count').hide().text('0'); }
                else if(r.message === 'login_required') { document.getElementById('cart-dialog').close(); openAuthModal(); }
                else alert(r.message === 'empty_cart' ? "Carretó buit" : "Error al guardar");
            },
            error: function() { alert("Error al checkout."); }
        });
    });

    // Perfil
    $(document).on('click', '#btn-open-profile', function(e) {
        e.preventDefault();
        $.ajax({
            url: 'controladors/c_profile.php', type: 'GET', dataType: 'json',
            success: function(r) {
                if(r.success) {
                    const u = r.data;
                    $('#prof_name').val(u.name); $('#prof_email').val(u.email);
                    $('#prof_address').val(u.address); $('#prof_location').val(u.location); $('#prof_postcode').val(u.postcode);
                    $('#profile-preview').attr('src', './assets/img_usuaris/' + (u.avatar || 'default.png'));
                    document.getElementById('profile-dialog').showModal();
                } else alert(r.message);
            },
            error: function() { alert("Error al carregar perfil."); }
        });
    });

    $(document).on('submit', '#profile-form', function(e) {
        e.preventDefault();
        $.ajax({
            url: 'controladors/c_profile.php', type: 'POST', data: new FormData(this), contentType: false, processData: false, dataType: 'json',
            success: function(r) { r.success ? (alert("Perfil actualitzat!"), document.getElementById('profile-dialog').close()) : alert("Error: " + r.message); },
            error: function(x) { console.error(x.responseText); alert("Error tècnic al guardar."); }
        });
    });

    $(document).on('change', '#profile-upload', function() {
        const f = this.files[0];
        if (f) { const r = new FileReader(); r.onload = e => $('#profile-preview').attr('src', e.target.result); r.readAsDataURL(f); }
    });

    // Historial de órdenes
    $(document).on('click', '#btn-orders', function(e) {
        e.preventDefault();
        const c = $('#orders-list');
        c.html('<p style="text-align:center">Carregant...</p>');
        document.getElementById('orders-dialog').showModal();
        $.ajax({
            url: 'controladors/c_orders.php', type: 'GET', data: { action: 'list' }, dataType: 'json',
            success: function(r) {
                if (r.success && r.comandes?.length) {
                    let h = '';
                    r.comandes.forEach(o => {
                        h += `<div class="order-card" onclick="toggleOrderDetails(this, '${o.comanda_id}')">
                                <div class="order-header">
                                    <div><b>${o.data_creació}</b> <span style="font-size:0.9rem">(${o.número_elements} items)</span></div>
                                    <div style="color:#009B4D;font-weight:bold">${parseFloat(o.import_total).toFixed(2)} €</div>
                                </div>
                                <div class="order-details-mini" style="display:none;margin-top:10px;border-top:1px dashed #eee;padding-top:5px"></div>
                              </div>`;
                    });
                    c.html(h);
                } else c.html('<p style="text-align:center;padding:20px">No hi ha comandes.</p>');
            },
            error: function() { c.html('<p style="color:red;text-align:center">Error carregant llista.</p>'); }
        });
    });

    $(document).on('click', '.product-link', function(e) {
        e.preventDefault();
        carregarProducte($(this).attr('id'));
    });

});

// Funciones globales
window.carregarProducte = function(id) {
    $.ajax({
        url: 'controladors/c_productes.php', type: 'GET', data: { product_id: id },
        success: function(res) {
            const p = typeof res === 'object' ? res : JSON.parse(res);
            $('#modal-product-title').text(p.nom); $('#modal-product-price').text(p.preu + ' €');
            $('#modal-product-description').text(p.descripcio); $('#modal-product-image').attr('src', './assets/productes/' + p.imatge);
            
            // Guardamos datos para el botón de añadir
            $('#modal-add-to-cart-btn').data('id', p.product_id); 
            // Reseteamos la cantidad a 1 al abrir el modal
            $('#modal-qty-input').val(1); 

            document.getElementById('product-dialog').showModal();
        }
    });
};

window.carregarCarret = function() { $.ajax({ url: 'controladors/c_cart.php', data: { action: 'view' }, success: h => $('#cart-items-container').html(h) }); };
window.actualitzarCarret = function(a, id, q) { $.ajax({ url: 'controladors/c_cart.php', type: 'POST', data: { action: a, product_id: id, quantity: q }, success: h => $('#cart-items-container').html(h) }); };

// Corrección: mostramos precio unitario
window.toggleOrderDetails = function(card, oid) {
    const d = $(card).find('.order-details-mini');
    if (d.is(':visible')) { d.slideUp(); return; }
    d.slideDown();
    
    if (d.hasClass('loaded')) return;
    
    d.html('Carregant productes...');
    $.ajax({
        url: 'controladors/c_orders.php', data: { action: 'details', id: oid }, dataType: 'json',
        success: function(r) {
            if (r.success && r.detalls) {
                let h = '';
                r.detalls.forEach(p => {
                    // Aquí mostramos el precio unitario
                    h += `<div style="display:flex;justify-content:space-between;font-size:0.9rem;color:#555;padding:2px 0">
                            <span>${p.quantitat}x ${p.nom_producte}</span>
                            <span>${parseFloat(p.preu_unitari).toFixed(2)} €/u</span> 
                          </div>`;
                });
                d.html(h || 'Sense detalls.').addClass('loaded');
            }
        },
        error: function() { d.html('<span style="color:red">Error.</span>'); }
    });
};

window.openAuthModal = function() { const d = document.getElementById('auth-dialog'); d.classList.remove('show-register'); if(!d.open) d.showModal(); };
window.showRegister = function() { document.getElementById('auth-dialog').classList.add('show-register'); };
window.showLogin = function() { document.getElementById('auth-dialog').classList.remove('show-register'); };