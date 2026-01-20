/**
 * FITXER: js/funcions.js
 * VERSIÓ: Final Consolidada
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
        // Només interceptem si no és un enllaç de descàrrega o extern
        if ($(this).attr('href').indexOf('index.php') !== -1) {
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
                    // Actualitzem la URL del navegador
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

    $('.auth-form-login').on('submit', async function(e) {
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
            alert("Error de connexió al fer login.");
        }
    });

    $('.auth-form-register').on('submit', async function(e) {
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
            alert("Error de connexió al registrar.");
        }
    });


    // ======================================================
    // 3. CERCADOR HEADER (LUPA + X)
    // ======================================================
    
    // Delegació per si el header es recarrega
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

    // Mostrar/Amagar la X
    $(document).on('input', '.search-input', function() {
        var clearBtn = $('#search-clear');
        if ($(this).val().trim() !== "") {
            clearBtn.show();
        } else {
            clearBtn.hide();
        }
    });

    // Botó X (Netejar)
    $(document).on('click', '#search-clear', function() {
        var input = $('.search-input');
        input.val(''); 
        $(this).hide(); 
        input.focus(); 
        $('#search-form').submit(); // Opcional: recarregar resultats buits
    });

    // Inicialització visual si ja hi ha text
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
    
    // Ordre automàtic
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
    // Fem servir .on() per assegurar que funciona encara que canviïs de pàgina
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
                
                // Actualitzar badge (opcional)
                /* if(totalItems > 0) $('#cart-count').text(totalItems).show(); */
                
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

    // Incrementar quantitat (+)
    $(document).on('click', '.qty-btn.plus', function() {
        var id = $(this).data('id');
        var input = $(this).siblings('.qty-input');
        var currentQty = parseInt(input.val());
        actualitzarCarret('update', id, currentQty + 1);
    });

    // Decrementar quantitat (-)
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
                    $('#cart-count').hide().text('0');
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
                alert("Error de comunicació. Revisa que no hi hagi espais al final dels fitxers PHP (Models).");
            }
        });
    });


    // ======================================================
    // 6. PERFIL D'USUARI (MI CUENTA)
    // ======================================================

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

    // Clic en un producte del llistat
    $(document).on('click', '.product-link', function(e) {
        e.preventDefault();
        const productId = $(this).attr('id');
        carregarProducte(productId);
    });

    $(document).on('click', '#btn-open-profile', function(e) {
        e.preventDefault();
        
        console.log("Obrint perfil..."); // Para ver si funciona en consola
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
                    
                    const img = u.avatar ? u.avatar : 'default.png';
                    $('#profile-preview').attr('src', './assets/img_usuaris/' + img);
                    
                    dialog.showModal();
                } else {
                    alert("Error: " + response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error AJAX Perfil:", error);
                // Si sale este error, es que NO has borrado los ?> de los PHP
                alert("Error de comunicación. ¡Asegúrate de haber borrado los '?>' finales en m_usuaris.php!");
            }
        });
    });

}); // FI DEL $(document).ready


// ======================================================
// FUNCIONS GLOBALS (FORA DEL READY)
// ======================================================

// Funció per carregar detalls del producte al modal
function carregarProducte(productId) {
    $.ajax({
        url: 'controladors/c_productes.php',
        type: 'GET',
        data: { product_id: productId },
        success: function(response) {
            // Intentem parsejar per si de cas arriba text brut
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

// Funció per carregar l'HTML del carretó
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

// Funció per actualitzar ítems del carretó
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

// Funció per obrir el modal de perfil i carregar dades
function openProfileModal() {
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
                
                const img = u.avatar ? u.avatar : 'default.png';
                $('#profile-preview').attr('src', './assets/img_usuaris/' + img);
                
                dialog.showModal();
            } else {
                alert("Error: " + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error("Error AJAX Perfil:", error);
            console.log("Resposta rebuda:", xhr.responseText);
            alert("No s'han pogut carregar les dades. Revisa la consola.");
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