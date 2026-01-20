/**
 * FITXER: js/funcions.js
 * VERSIÓ: FINAL PROFESSIONAL
 */

$(document).ready(function() {

    // 1. NAVEGACIÓ I MENÚS
    $(document).on('click', '#user-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('#user-dropdown').toggleClass('show');
    });

    $(document).on('click', function() {
        $('#user-dropdown').removeClass('show');
    });

    $(document).on('click', '#user-dropdown', function(e) {
        e.stopPropagation();
    });

    $(document).on('click', '.nav-link, .logo-link', async function(e) {
        if ($(this).attr('href') && $(this).attr('href').indexOf('index.php') !== -1) {
            e.preventDefault();
            const url = $(this).attr('href');
            try {
                const resposta = await fetch(url);
                const html = await resposta.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.querySelector('#main-content');
                if (newContent) {
                    $('#main-content').html(newContent.innerHTML);
                    window.history.pushState({}, '', url);
                }
            } catch (error) { console.error("Error navegació:", error); }
        }
    });

    // 2. AUTENTICACIÓ
    $(document).on('submit', '.auth-form-login', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        try {
            const resposta = await fetch('controladors/c_login.php', { method: 'POST', body: formData });
            const dades = await resposta.json();
            if (dades.success) window.location.reload();
            else alert(dades.message);
        } catch (error) { alert("Hi ha hagut un error en iniciar sessió. Torna-ho a provar."); }
    });

    $(document).on('submit', '.auth-form-register', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        try {
            const resposta = await fetch('controladors/c_signup.php', { method: 'POST', body: formData });
            const dades = await resposta.json();
            if (dades.success) window.location.reload();
            else alert(dades.message);
        } catch (error) { alert("Hi ha hagut un error en registrar-se."); }
    });

    // 3. CERCADOR
    $(document).on('click', '#search-toggle', function(e) {
        e.preventDefault();
        var wrapper = $('#search-wrapper');
        var input = wrapper.find('.search-input');
        if (!wrapper.hasClass('active')) {
            wrapper.addClass('active');
            setTimeout(function(){ input.focus(); }, 100);
        } else if (input.val().trim() !== "") {
            $('#search-form').submit();
        } else {
            wrapper.removeClass('active');
        }
    });

    $(document).on('input', '.search-input', function() {
        var clearBtn = $('#search-clear');
        $(this).val().trim() !== "" ? clearBtn.show() : clearBtn.hide();
    });

    $(document).on('click', '#search-clear', function() {
        var input = $('.search-input');
        input.val(''); $(this).hide(); input.focus(); $('#search-form').submit(); 
    });

    if ($('.search-input').val() && $('.search-input').val().trim() !== "") {
        $('#search-wrapper').addClass('active'); $('#search-clear').show();
    }

    // 4. FILTRES
    $(document).on('submit', '.filters-sidebar form', function(e) {
        e.preventDefault();
        var form = $(this);
        var url = 'controladors/c_productes.php';
        var dades = form.serialize() + '&ajax=true';
        $.ajax({
            type: "GET", url: url, data: dades,
            success: function(html) { $('.products-grid').html(html); },
            error: function() { alert("No s'han pogut filtrar els productes."); }
        });
    });
    
    $(document).on('change', 'select[name="orden"]', function() {
        $('.filters-sidebar form').submit();
    });

    // 5. CARRETÓ
    $(document).on('click', '#cart-btn', function() {
        document.getElementById('cart-dialog').showModal();
        carregarCarret();
    });

    $(document).on('click', '#modal-add-to-cart-btn', function(e) {
        e.preventDefault();
        var productId = $(this).data('id'); 
        if (!productId) return;

        $.ajax({
            url: 'controladors/c_cart.php', type: 'POST',
            data: { action: 'add', product_id: productId, quantity: 1 },
            success: function(totalItems) {
                document.getElementById('product-dialog').close();
                if($('#cart-count').length) $('#cart-count').text(totalItems).show();
                alert("Producte afegit al carretó correctly.");
            },
            error: function() { alert("No s'ha pogut afegir el producte."); }
        });
    });

    $(document).on('click', '.cart-remove-btn', function() {
        actualitzarCarret('remove', $(this).data('id'), 0);
    });

    $(document).on('click', '.qty-btn.plus', function() {
        var id = $(this).data('id');
        var input = $(this).siblings('.qty-input');
        actualitzarCarret('update', id, parseInt(input.val()) + 1);
    });

    $(document).on('click', '.qty-btn.minus', function() {
        var id = $(this).data('id');
        var input = $(this).siblings('.qty-input');
        var qty = parseInt(input.val());
        qty > 1 ? actualitzarCarret('update', id, qty - 1) : actualitzarCarret('remove', id, 0);
    });

    // CHECKOUT (FINALITZAR COMPRA)
    $(document).on('click', '.checkout-btn', function(e) {
        e.preventDefault();
        if(!confirm("Vols finalitzar la comanda ara?")) return;

        $.ajax({
            url: 'controladors/c_cart.php', type: 'POST', data: { action: 'checkout' }, dataType: 'json',
            success: function(res) {
                if (res.success) {
                    alert("Comanda realitzada amb èxit!");
                    document.getElementById('cart-dialog').close();
                    if($('#cart-count').length) $('#cart-count').hide().text('0');
                } else {
                    if (res.message === 'login_required') {
                        alert("Has d'iniciar sessió per comprar.");
                        document.getElementById('cart-dialog').close();
                        openAuthModal();
                    } else if (res.message === 'empty_cart') {
                        alert("El carretó és buit.");
                    } else {
                        alert("Hi ha hagut un error en processar la comanda.");
                    }
                }
            },
            error: function(xhr) {
                console.error("Error Checkout:", xhr.responseText);
                alert("Hi ha hagut un error inesperat en comunicar amb el servidor.");
            }
        });
    });

    // 6. PERFIL D'USUARI
    $(document).on('click', '#btn-open-profile', function(e) {
        e.preventDefault();
        $.ajax({
            url: 'controladors/c_profile.php', type: 'GET', dataType: 'json',
            success: function(res) {
                if (res.success) {
                    const u = res.data;
                    $('#prof_name').val(u.name); $('#prof_email').val(u.email);
                    $('#prof_address').val(u.address); $('#prof_location').val(u.location);
                    $('#prof_postcode').val(u.postcode);
                    const img = u.avatar ? u.avatar : 'default.png';
                    $('#profile-preview').attr('src', './assets/img_usuaris/' + img);
                    document.getElementById('profile-dialog').showModal();
                } else alert(res.message);
            },
            error: function() { alert("No s'ha pogut carregar el perfil."); }
        });
    });

    $(document).on('submit', '#profile-form', function(e) {
        e.preventDefault();
        $.ajax({
            url: 'controladors/c_profile.php', type: 'POST', data: new FormData(this),
            contentType: false, processData: false, dataType: 'json',
            success: function(res) {
                if (res.success) { alert("Perfil actualitzat!"); document.getElementById('profile-dialog').close(); }
                else alert(res.message);
            },
            error: function() { alert("Error al guardar el perfil."); }
        });
    });

    $(document).on('change', '#profile-upload', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) { $('#profile-preview').attr('src', e.target.result); }
            reader.readAsDataURL(file);
        }
    });

    // 7. HISTORIAL DE COMANDES
    $(document).on('click', '#btn-orders', function(e) {
        e.preventDefault();
        const dialog = document.getElementById('orders-dialog');
        const container = $('#orders-list');
        
        container.html('<p style="text-align:center">Carregant...</p>');
        dialog.showModal();

        $.ajax({
            url: 'controladors/c_orders.php', type: 'GET', data: { action: 'list' }, dataType: 'json',
            success: function(res) {
                if (res.success && res.comandes && res.comandes.length > 0) {
                    let html = '';
                    res.comandes.forEach(function(order) {
                        html += `
                            <div class="order-card" onclick="toggleOrderDetails(this, '${order.comanda_id}')">
                                <div class="order-header">
                                    <div>
                                        <span style="font-weight:bold; color:#333;">${order.data_creació}</span>
                                        <span style="font-size:0.85rem; color:#666; margin-left:10px;">(${order.número_elements} articles)</span>
                                    </div>
                                    <div style="font-weight:bold; color:#009B4D;">${parseFloat(order.import_total).toFixed(2)} €</div>
                                </div>
                                <div id="details-${order.comanda_id}" class="order-details-mini" style="display:none; margin-top:10px; border-top:1px solid #eee; padding-top:5px; font-size:0.9rem;">
                                    Carregant productes...
                                </div>
                            </div>
                        `;
                    });
                    container.html(html);
                } else container.html('<p style="text-align:center; padding:20px;">Encara no has fet cap comanda.</p>');
            },
            error: function() { container.html('<p style="text-align:center; color:red">No s\'ha pogut carregar l\'historial.</p>'); }
        });
    });

    // Clic producte grid
    $(document).on('click', '.product-link', function(e) {
        e.preventDefault();
        carregarProducte($(this).attr('id'));
    });

}); // FI READY

// FUNCIONS GLOBALS
window.carregarProducte = function(id) {
    $.ajax({
        url: 'controladors/c_productes.php', type: 'GET', data: { product_id: id },
        success: function(res) {
            const p = typeof res === 'object' ? res : JSON.parse(res);
            $('#modal-product-title').text(p.nom);
            $('#modal-product-price').text(p.preu + ' €');
            $('#modal-product-description').text(p.descripcio);
            $('#modal-product-image').attr('src', './assets/productes/' + p.imatge);
            $('#modal-add-to-cart-btn').data('id', p.product_id);
            document.getElementById('product-dialog').showModal();
        }
    });
};

window.carregarCarret = function() {
    $.ajax({ url: 'controladors/c_cart.php', type: 'GET', data: { action: 'view' }, success: function(html) { $('#cart-items-container').html(html); } });
};

window.actualitzarCarret = function(act, id, qty) {
    $.ajax({ url: 'controladors/c_cart.php', type: 'POST', data: { action: act, product_id: id, quantity: qty }, success: function(html) { $('#cart-items-container').html(html); } });
};

window.toggleOrderDetails = function(card, orderId) {
    const detailsDiv = $(card).find('.order-details-mini');
    if (detailsDiv.is(':visible')) { detailsDiv.slideUp(); return; }
    detailsDiv.slideDown();
    if (detailsDiv.text().includes('Carregant...')) {
        $.ajax({
            url: 'controladors/c_orders.php', type: 'GET', data: { action: 'details', id: orderId }, dataType: 'json',
            success: function(res) {
                if (res.success && res.detalls) {
                    let html = '';
                    res.detalls.forEach(p => {
                        html += `<div style="display:flex; justify-content:space-between; padding:2px 0; color:#555;"><span>${p.quantitat}x ${p.nom_producte}</span><span>${parseFloat(p.preu_total).toFixed(2)} €</span></div>`;
                    });
                    detailsDiv.html(html);
                }
            }
        });
    }
};

window.openAuthModal = function() { const d = document.getElementById('auth-dialog'); d.classList.remove('show-register'); if (!d.open) d.showModal(); };
window.showRegister = function() { document.getElementById('auth-dialog').classList.add('show-register'); };
window.showLogin = function() { document.getElementById('auth-dialog').classList.remove('show-register'); };