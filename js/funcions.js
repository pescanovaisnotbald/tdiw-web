$(document).ready(function() {
  
  $(document).on('click', '#user-btn', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#user-dropdown').toggleClass('show');
  });

  $(document).on('click', '#user-dropdown', function(e) {
    e.stopPropagation();
  });

  $(document).on('click', function() {
    $('#user-dropdown').removeClass('show');
  });

  $(document).on('click', '.product-link', function(e) {
    e.preventDefault();
    const productId = $(this).attr('id');
    carregarProducte(productId);
  });

  $('.auth-form-login').on('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
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
  });

  $('.auth-form-register').on('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
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
  });

  $(document).on('click', '.nav-link, .logo-link', async function(e) {
    e.preventDefault();
    const url = $(this).attr('href');
    
    const resposta = await fetch(url);
    const html = await resposta.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newContent = doc.querySelector('#main-content');
    
    if (newContent) {
      $('#main-content').html(newContent.innerHTML);
    }
  });

  // --- LÒGICA DEL BUSCADOR (AMB 'X') ---
    var wrapper = $('#search-wrapper');
    var input = wrapper.find('.search-input');
    var clearBtn = $('#search-clear');

    // 1. Si ja venim d'una cerca (hi ha text), deixem el buscador obert
    if (input.val().trim() !== "") {
        wrapper.addClass('active');
        clearBtn.show();
    }

    // 2. Click a la Lupa
    $('#search-toggle').click(function(e) {
        e.preventDefault();
        
        // Si està tancat, l'obrim
        if (!wrapper.hasClass('active')) {
            wrapper.addClass('active');
            setTimeout(function(){ input.focus(); }, 100);
        } 
        // Si està obert i té text, fem submit
        else if (input.val().trim() !== "") {
            $('#search-form').submit();
        } 
        // Si està obert però buit, el tanquem
        else {
            wrapper.removeClass('active');
        }
    });

    // 3. Mostrar/Amagar la 'X' mentre escrivim
    input.on('input', function() {
        if ($(this).val().trim() !== "") {
            clearBtn.show();
        } else {
            clearBtn.hide();
        }
    });

    // 4. Click a la 'X'
    clearBtn.click(function() {
        input.val(''); // Esborrar text visualment
        clearBtn.hide(); // Amagar la X
        input.focus(); // Mantenir el focus

        // OPCIONAL: Si vols que al clicar la X es recarregui la pàgina mostrant TOTS els productes automàticament:
        // window.location.href = 'index.php?accio=resource_products';
        
        // O si prefereixes que només esborri i l'usuari decideixi si tancar o buscar una altra cosa, deixa l'opció de dalt comentada.
        // Si estem en una cerca activa i l'usuari clica X, potser sí vol "cancel·lar cerca".
        // Jo recomano fer un submit buit per "netejar":
        $('#search-form').submit(); 
    });

    $('.filters-sidebar form').on('submit', function(e) {
        e.preventDefault(); // 1. ATUREM la recàrrega de la pàgina (el comportament per defecte)

        var form = $(this);
        var url = 'controladors/c_productes.php'; // On enviem la petició
        
        // 2. Agafem totes les dades del formulari (categories, preu, cerca oculta...)
        // I afegim '&ajax=true' perquè el PHP sàpiga què ha de fer
        var dades = form.serialize() + '&ajax=true';

        // 3. Fem la màgia (AJAX)
        $.ajax({
            type: "GET",
            url: url,
            data: dades,
            success: function(respostaHTML) {
                // 4. Quan el servidor respon, buidem el grid actual i posem el nou contingut
                $('.products-grid').html(respostaHTML);
            },
            error: function() {
                alert("Hi ha hagut un error al filtrar els productes.");
            }
        });
    });

    // Opcional: Si vols que quan canviïn l'ordre (select) també sigui automàtic sense botó:
    $('select[name="orden"]').change(function() {
        $('.filters-sidebar form').submit(); // Dispara l'esdeveniment de dalt
    });

    // ==========================================
    // LÒGICA DEL CARRETÓ (SHOPPING CART)
    // ==========================================

    // 1. Obrir el Modal del Carretó
    $('#cart-btn').click(function() {
        var dialog = document.getElementById('cart-dialog');
        dialog.showModal();
        carregarCarret(); // Cridem la funció per obtenir l'HTML
    });

    // 2. Afegir al Carretó (Des del modal de producte)
    // CORRECCIÓ: Fem servir $(document).on(...) perquè el botó funcioni 
    // encara que canviïs de pàgina o recarreguis contingut.
    $(document).on('click', '#modal-add-to-cart-btn', function(e) {
        e.preventDefault();
        
        var btn = $(this);
        var productId = btn.data('id'); 
        
        console.log("Afegint producte ID:", productId); // Per depurar

        if (!productId) {
            alert("Error: No s'ha trobat el producte.");
            return;
        }

        $.ajax({
            url: 'controladors/c_cart.php',
            type: 'POST',
            data: { action: 'add', product_id: productId, quantity: 1 },
            success: function(totalItems) {
                // Tanquem el modal de producte
                document.getElementById('product-dialog').close();
                
                // Actualitzem el contador visual del header
                if(totalItems > 0) {
                    $('#cart-count').text(totalItems).show();
                }
                
                alert("Producte afegit al carretó!");
            },
            error: function() {
                alert("Error de connexió amb el servidor.");
            }
        });
    });

    // --- FUNCIONS DINÀMIQUES DINS DEL CARRETÓ ---
    // Com que l'HTML del carretó ve per AJAX, hem de fer servir delegació (.on)

    // 3. Botó Eliminar (Paperera)
    $('#cart-items-container').on('click', '.cart-remove-btn', function() {
        var id = $(this).data('id');
        actualitzarCarret('remove', id, 0);
    });

    // 4. Botó Més (+)
    $('#cart-items-container').on('click', '.qty-btn.plus', function() {
        var id = $(this).data('id');
        var input = $(this).siblings('.qty-input');
        var currentQty = parseInt(input.val());
        actualitzarCarret('update', id, currentQty + 1);
    });

    // 5. Botó Menys (-)
    $('#cart-items-container').on('click', '.qty-btn.minus', function() {
        var id = $(this).data('id');
        var input = $(this).siblings('.qty-input');
        var currentQty = parseInt(input.val());
        
        if (currentQty > 1) {
            actualitzarCarret('update', id, currentQty - 1);
        } else {
            // Si és 1 i baixem, preguntem si vol eliminar o ho fem directe
             actualitzarCarret('remove', id, 0);
        }
    });

    // --- FUNCIONS AUXILIARS ---

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
                // El PHP ens retorna el carretó sencer actualitzat, així que el pintem de nou
                $('#cart-items-container').html(html);
            }
        });
    }

});

function carregarProducte(productId) {
    $.ajax({
        url: 'controladors/c_productes.php',
        type: 'GET',
        data: { product_id: productId },
        success: function(response) {
            var p = JSON.parse(response);

            // Omplim títol, preu, etc...
            $('#modal-product-title').text(p.nom);
            $('#modal-product-price').text(p.preu + " €");
            $('#modal-product-description').text(p.descripcio);
            $('#modal-product-image').attr('src', './assets/productes/' + p.imatge);
            
            // --- IMPORTANTÍSSIM: GUARDAR LA ID AL BOTÓ ---
            // Això enllaça el botó amb el producte actual
            $('#modal-add-to-cart-btn').data('id', p.product_id); 
            // ---------------------------------------------

            document.getElementById('product-dialog').showModal();
        },
        error: function() { alert('Error carregarProducte'); }
    });
}

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
