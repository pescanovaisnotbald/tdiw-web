/**
 * FITXER: js/funcions.js
 * VERSIÓ: COMPLETA I DEFINITIVA
 */

$(document).ready(function() {

    // ======================================================
    // 1. NAVEGACIÓ I MENÚS
    // ======================================================

    // Menú Usuari (Dropdown)
    $(document).on('click', '#user-btn', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('#user-dropdown').toggleClass('show');
    });

    $(document).on('click', '#user-dropdown', function(e) {
        e.stopPropagation(); // Evita que es tanqui si cliques a dins
    });

    $(document).on('click', function() {
        $('#user-dropdown').removeClass('show'); // Tanca si cliques a fora
    });

    // Navegació AJAX (Càrrega de pàgines sense recarregar)
    $(document).on('click', '.nav-link, .logo-link', async function(e) {
        // Només interceptem si és un enllaç intern a index.php
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
                    // Actualitzem la URL del navegador sense recarregar
                    window.history.pushState({}, '', url);
                }
            } catch (error) {
                console.error("Error carregant pàgina:", error);
            }
        }
    });


    // ======================================================
    // 2. AUTENTICACIÓ (LOGIN / REGISTRE)
    // ======================================================

    // Login
    $(document).on('submit', '.auth-form-login', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        try {
            const resposta = await fetch('controladors/c_login.php', {
                method: 'POST',
                body: formData
            });
            const dades = await resposta.json();
            
            if (dades.success) {
                window.location.reload();
            } else {
                alert(dades.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error al fer login. Si us plau, revisa que no hi hagi espais o '?>' al final dels fitxers PHP.");
        }
    });

    // Registre
    $(document).on('submit', '.auth-form-register', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        try {
            const resposta = await fetch('controladors/c_signup.php', {
                method: 'POST',
                body: formData
            });
            const dades = await resposta.json();
            
            if (dades.success) {
                window.location.reload();
            } else {
                alert(dades.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error al registrar.");
        }
    });


    // ======================================================
    // 3. CERCADOR HEADER (LUPA + X)
    // ======================================================
    
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
        if ($(this).val().trim() !== "") {
            clearBtn.show();
        } else {
            clearBtn.hide();
        }
    });

    $(document).on('click', '#search-clear', function() {
        var input = $('.search-input');
        input.val(''); 
        $(this).hide(); 
        input.focus(); 
        $('#search-form').submit(); 
    });

    // Inicialització visual si ja hi ha text (en carregar)
    if ($('.search-input').val() && $('.search-input').val().trim() !== "") {
        $('#search-wrapper').addClass('active');
        $('#search-clear').show();
    }


    // ======================================================
    // 4. FILTRES LATERALS (AJAX)
    // ======================================================

    $(document).on('submit', '.filters-sidebar form', function(e) {
        e.preventDefault();
        
        var form = $(this);
        var url = 'controladors/c_productes.php';
        // Afegim ajax=true perquè el PHP només torni les targetes
        var dades = form.serialize() + '&ajax=true';

        $.ajax({
            type: "GET",
            url: url,
            data: dades,
            success: function(respostaHTML) {
                $('.products-grid').html(respostaHTML);
            },
            error: function() {
                alert("Error filtrant productes.");
            }
        });
    });
    
    // Ordre automàtic en canviar el desplegable
    $(document).on('change', 'select[name="orden"]', function() {
        $('.filters-sidebar form').submit();
    });


    // ======================================================
    // 5. CARRETÓ DE LA COMPRA
    // ======================================================

    // Obrir Modal Carretó
    $(document).on('click', '#cart-btn', function() {
        var dialog = document.getElementById('cart-dialog');
        dialog.showModal();
        carregarCarret();
    });

    // AFEGIR PRODUCTE (Des del modal de detall)
    $(document).on('click', '#modal-add-to-cart-btn', function(e) {
        e.preventDefault();
        
        var btn = $(this);
        var productId = btn.data('id'); 
        
        if (!productId) {
            alert("Error: No s'ha trobat la ID del producte.");
            return;
        }

        $.ajax({
            url: 'controladors/c_cart.php',
            type: 'POST',
            data: { action: 'add', product_id: productId, quantity: 1 },
            success: function(totalItems) {
                document.getElementById('product-dialog').close();
                // Si tens el badge al header, descomenta això:
                // if($('#cart-count').length) $('#cart-count').text(totalItems).show();
                alert("Producte afegit al carretó!");
            },
            error: function() {
                alert("Error de connexió afegint al carretó.");
            }
        });
    });

    // Eliminar del carretó
    $(document).on('click', '.cart-remove-btn', function() {
        var id = $(this).data('id');
        actualitzarCarret('remove', id, 0);
    });

    // Incrementar quantitat
    $(document).on('click', '.qty-btn.plus', function() {
        var id = $(this).data('id');
        var input = $(this).siblings('.qty-input');
        var currentQty = parseInt(input.val());
        actualitzarCarret('update', id, currentQty + 1);
    });

    // Decrementar quantitat
    $(document).on('click', '.qty-btn.minus', function() {
        var id = $(this).data('id');
        var input = $(this).siblings('.qty-input');
        var currentQty = parseInt(input.val());
        
        if (currentQty > 1) {
            actualitzarCarret('update', id, currentQty - 1);
        } else {
             actualitzarCarret('remove', id, 0);
        }
    });

    // FINALITZAR COMPRA (CHECKOUT)
    $(document).on('click', '.checkout-btn', function(e) {
        e.preventDefault();
        
        if(!confirm("Vols finalitzar la comanda ara?")) return;

        $.ajax({
            url: 'controladors/c_cart.php',
            type: 'POST',
            data: { action: 'checkout' },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    alert("Comanda realitzada amb èxit!");
                    document.getElementById('cart-dialog').close();
                    if($('#cart-count').length) $('#cart-count').hide().text('0');
                } else {
                    if (response.message === 'login_required') {
                        alert("Has d'iniciar sessió per comprar.");
                        document.getElementById('cart-dialog').close();
                        openAuthModal();
                    } else if (response.message === 'empty_cart') {
                        alert("El carretó és buit.");
                    } else {
                        alert("Error al guardar la comanda.");
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error("Error checkout:", error);
                alert("Error de comunicació. Revisa que hagis tret els '?>' dels fitxers PHP.");
            }
        });
    });


    // ======================================================
    // 6. PERFIL D'USUARI (MI CUENTA)
    // ======================================================

    // Obrir Modal (IMPORTANT: Usem el nou ID #btn-open-profile)
    $(document).on('click', '#btn-open-profile', function(e) {
        e.preventDefault();
        console.log("Intentant carregar perfil..."); // Per depurar

        const dialog = document.getElementById('profile-dialog');
        
        $.ajax({
            url: 'controladors/c_profile.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    const u = response.data;
                    
                    $('#prof_name').val(u.name);
                    $('#prof_email').val(u.email);
                    $('#prof_address').val(u.address);
                    $('#prof_location').val(u.location);
                    $('#prof_postcode').val(u.postcode);
                    
                    // Si no hi ha avatar, posem default.png
                    const img = u.avatar ? u.avatar : 'default.png';
                    $('#profile-preview').attr('src', './assets/img_usuaris/' + img);
                    
                    dialog.showModal();
                } else {
                    alert("Error: " + response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error AJAX Perfil:", xhr.responseText);
                alert("Error carregant el perfil. Revisa la consola (F12). \nProbablement tens '?>' al final dels fitxers PHP.");
            }
        });
    });

    // Previsualitzar foto
    $(document).on('change', '#profile-upload', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#profile-preview').attr('src', e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    // Guardar canvis perfil
    $(document).on('submit', '#profile-form', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        $.ajax({
            url: 'controladors/c_profile.php',
            type: 'POST',
            data: formData,
            contentType: false, 
            processData: false, 
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    alert("Perfil actualitzat correctament!");
                    document.getElementById('profile-dialog').close();
                } else {
                    alert("Error: " + response.message);
                }
            },
            error: function(xhr) {
                console.error("Error perfil:", xhr.responseText);
                alert("Error al guardar el perfil.");
            }
        });
    });

    // Clic en un producte del llistat (Grid)
    $(document).on('click', '.product-link', function(e) {
        e.preventDefault();
        const productId = $(this).attr('id');
        carregarProducte(productId);
    });

    // ======================================================
    // 7. HISTORIAL DE COMANDES (NOU)
    // ======================================================

    // Obrir modal de comandes
    $(document).on('click', '#btn-orders', function(e) {
        e.preventDefault();
        const dialog = document.getElementById('orders-dialog');
        const container = $('#orders-list');
        
        container.html('<p style="text-align:center">Carregant...</p>');
        dialog.showModal();

        // Demanem la llista al servidor
        $.ajax({
            url: 'controladors/c_orders.php',
            type: 'GET',
            data: { action: 'list' },
            dataType: 'json',
            success: function(response) {
                if (response.success && response.comandes && response.comandes.length > 0) {
                    let html = '';
                    response.comandes.forEach(function(order) {
                        // Creem una targeta per cada comanda
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
                } else {
                    container.html('<p style="text-align:center; padding:20px;">Encara no has fet cap comanda.</p>');
                }
            },
            error: function() {
                container.html('<p style="color:red; text-align:center;">Error carregant comandes.</p>');
            }
        });
    });

}); // FI DEL $(document).ready


// ======================================================
// FUNCIONS AUXILIARS GLOBALS
// ======================================================

function carregarProducte(productId) {
    $.ajax({
        url: 'controladors/c_productes.php',
        type: 'GET',
        data: { product_id: productId },
        success: function(response) {
            try {
                var p = typeof response === "object" ? response : JSON.parse(response);
            } catch (e) {
                console.error("Error parsing JSON producte:", e);
                return;
            }

            $('#modal-product-title').text(p.nom);
            $('#modal-product-price').text(p.preu + " €");
            $('#modal-product-description').text(p.descripcio);
            $('#modal-product-image').attr('src', './assets/productes/' + p.imatge);
            
            // GUARDAR ID AL BOTÓ (CLAU PERQUÈ FUNCIONI EL CARRETÓ)
            $('#modal-add-to-cart-btn').data('id', p.product_id); 

            document.getElementById('product-dialog').showModal();
        },
        error: function() { alert('Error carregant informació del producte'); }
    });
}

function carregarCarret() {
    $.ajax({
        url: 'controladors/c_cart.php',
        type: 'GET',
        data: { action: 'view' },
        success: function(html) {
            $('#cart-items-container').html(html);
        }
    });
}

function actualitzarCarret(accio, id, qty) {
    $.ajax({
        url: 'controladors/c_cart.php',
        type: 'POST',
        data: { action: accio, product_id: id, quantity: qty },
        success: function(html) {
            $('#cart-items-container').html(html);
        }
    });
}

// Helpers per modals d'autenticació
function openAuthModal() {
    const dialog = document.getElementById('auth-dialog');
    dialog.classList.remove('show-register');
    if (!dialog.open) dialog.showModal();
}

function showRegister() {
    const dialog = document.getElementById('auth-dialog');
    dialog.classList.add('show-register');
}

function showLogin() {
    const dialog = document.getElementById('auth-dialog');
    dialog.classList.remove('show-register');
}

// Funció per desplegar els detalls d'una comanda (Tipus acordió)
window.toggleOrderDetails = function(card, orderId) {
    // Busquem el div de detalls DINS de la carta clicada
    const detailsDiv = $(card).find('.order-details-mini');
    
    // Si està visible, l'amaguem (toggle)
    if (detailsDiv.is(':visible')) {
        detailsDiv.slideUp();
        return;
    }

    // Si està ocult, el mostrem
    detailsDiv.slideDown();

    // Si encara té el text "Carregant...", fem la petició AJAX
    if (detailsDiv.text().includes('Carregant...')) {
        $.ajax({
            url: 'controladors/c_orders.php',
            type: 'GET',
            data: { action: 'details', id: orderId },
            dataType: 'json',
            success: function(response) {
                if (response.success && response.detalls) {
                    let html = '';
                    response.detalls.forEach(prod => {
                        html += `
                            <div style="display:flex; justify-content:space-between; padding:2px 0; color:#555;">
                                <span>${prod.quantitat}x ${prod.nom_producte}</span>
                                <span>${parseFloat(prod.preu_total).toFixed(2)} €</span>
                            </div>
                        `;
                    });
                    detailsDiv.html(html);
                }
            }
        });
    }
};