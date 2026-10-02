// ==========================================
// ELEMENTOS DEL HTML
// ==========================================

const productsContainer =
    document.getElementById("products-container");

const productCounter =
    document.getElementById("product-counter");

const cartCount =
    document.querySelector(".cart-count");

const cartButton =
    document.querySelector(".cart-button");

const bottomCart =
    document.getElementById("bottom-cart");

const bottomCartItems =
    document.getElementById("bottom-cart-items");

const bottomCartTotal =
    document.getElementById("bottom-cart-total");

const viewOrderButton =
    document.getElementById("view-order-button");

const cartPanel =
    document.getElementById("cart-panel");

const cartOverlay =
    document.getElementById("cart-overlay");

const closeCartButton =
    document.getElementById("close-cart-button");

const cartProducts =
    document.getElementById("cart-products");

const cartSubtotal =
    document.getElementById("cart-subtotal");

const cartTotal =
    document.getElementById("cart-total");

const continueOrderButton =
    document.getElementById("continue-order-button");

const checkoutView =
    document.getElementById("checkout-view");

const backCartButton =
    document.getElementById("back-cart-button");

const checkoutTotal =
    document.getElementById("checkout-total");

const addressGroup =
    document.getElementById("address-group");

const deliveryNote =
    document.getElementById("delivery-note");

const whatsappButton =
    document.getElementById("whatsapp-button");

const customerName =
    document.getElementById("customer-name");

const customerAddress =
    document.getElementById("customer-address");

const searchInput =
    document.getElementById("search-input");

const categoryButtons =
    document.querySelectorAll(".category-card");


// ==========================================
// ESTADO DE LA TIENDA
// ==========================================

const storeStatus =
    document.getElementById("store-status");

const statusDot =
    document.getElementById("status-dot");

const statusText =
    document.getElementById("status-text");

const statusTime =
    document.getElementById("status-time");


// ==========================================
// CONFIGURACIÓN
// ==========================================

const STORAGE_KEY =
    "comercial_dulanto_carrito";

const NUMERO_WHATSAPP =
    "51965123280";


// Horario en minutos desde medianoche

const HORA_APERTURA =
    (6 * 60) + 30;

const HORA_CIERRE =
    21 * 60;


// ==========================================
// ESTADO DE LA APP
// ==========================================

let carrito = [];

let categoriaSeleccionada =
    "Todos";

let textoBusqueda =
    "";


// ==========================================
// ESTADO ABIERTO / CERRADO
// ==========================================

function actualizarEstadoTienda() {

    const ahora =
        new Date();


    const minutosActuales =
        (ahora.getHours() * 60) +
        ahora.getMinutes();


    const estaAbierto =
        minutosActuales >= HORA_APERTURA &&
        minutosActuales < HORA_CIERRE;


    if (estaAbierto) {

        statusText.textContent =
            "Abierto ahora";


        statusTime.textContent =
            "Pedidos hasta las 9:00 p. m.";


        storeStatus.classList.remove(
            "closed"
        );


        storeStatus.classList.add(
            "open"
        );


    } else {

        statusText.textContent =
            "Cerrado";


        statusTime.textContent =
            "Abrimos a las 6:30 a. m.";


        storeStatus.classList.remove(
            "open"
        );


        storeStatus.classList.add(
            "closed"
        );

    }

}


// ==========================================
// LOCAL STORAGE
// ==========================================

function guardarCarrito() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(carrito)
    );

}


function cargarCarrito() {

    const carritoGuardado =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!carritoGuardado) {

        carrito = [];

        return;

    }


    try {

        const datos =
            JSON.parse(
                carritoGuardado
            );


        if (!Array.isArray(datos)) {

            carrito = [];

            return;

        }


        carrito =
            datos

                .map(itemGuardado => {

                    const productoActual =
                        productos.find(
                            producto =>
                                producto.id ===
                                itemGuardado.id
                        );


                    if (!productoActual) {

                        return null;

                    }


                    const cantidad =
                        Number(
                            itemGuardado.cantidad
                        );


                    if (
                        !Number.isFinite(cantidad) ||
                        cantidad <= 0
                    ) {

                        return null;

                    }


                    return {

                        ...productoActual,

                        cantidad:
                            Math.floor(
                                cantidad
                            )

                    };

                })

                .filter(
                    item =>
                        item !== null
                );


        guardarCarrito();

    } catch (error) {

        console.error(
            "Error al recuperar el carrito:",
            error
        );


        carrito = [];


        localStorage.removeItem(
            STORAGE_KEY
        );

    }

}


// ==========================================
// CANTIDAD DE PRODUCTO
// ==========================================

function obtenerCantidadEnCarrito(
    idProducto
) {

    const item =
        carrito.find(
            producto =>
                producto.id ===
                idProducto
        );


    return item
        ? item.cantidad
        : 0;

}


// ==========================================
// CREAR PRODUCTO
// ==========================================

function crearProducto(
    producto
) {

    const cantidad =
        obtenerCantidadEnCarrito(
            producto.id
        );


    let controlCantidad = "";


    if (cantidad === 0) {

        controlCantidad = `
            <button
                class="add-button"
                data-action="agregar"
                data-id="${producto.id}"
                aria-label="Agregar ${producto.nombre}"
            >
                +
            </button>
        `;

    } else {

        controlCantidad = `
            <div class="quantity-control">

                <button
                    class="quantity-button"
                    data-action="restar"
                    data-id="${producto.id}"
                    aria-label="Restar ${producto.nombre}"
                >
                    −
                </button>

                <span class="quantity-number">
                    ${cantidad}
                </span>

                <button
                    class="quantity-button"
                    data-action="agregar"
                    data-id="${producto.id}"
                    aria-label="Agregar ${producto.nombre}"
                >
                    +
                </button>

            </div>
        `;

    }


    return `
        <article class="product-card">

            <div class="product-image">
                ${producto.emoji}
            </div>

            <div class="product-name">
                ${producto.nombre}
            </div>

            <div class="product-size">
                ${producto.presentacion}
            </div>

            <div class="product-bottom">

                <span class="product-price">
                    S/ ${producto.precio.toFixed(2)}
                </span>

                ${controlCantidad}

            </div>

        </article>
    `;

}


// ==========================================
// FILTRAR PRODUCTOS
// ==========================================

function obtenerProductosFiltrados() {

    const texto =
        textoBusqueda
            .trim()
            .toLowerCase();


    return productos.filter(
        producto => {

            const coincideCategoria =
                categoriaSeleccionada === "Todos" ||
                producto.categoria ===
                    categoriaSeleccionada;


            const coincideBusqueda =

                producto.nombre
                    .toLowerCase()
                    .includes(texto)

                ||

                producto.presentacion
                    .toLowerCase()
                    .includes(texto)

                ||

                producto.categoria
                    .toLowerCase()
                    .includes(texto);


            return (
                coincideCategoria &&
                coincideBusqueda
            );

        }
    );

}


// ==========================================
// MOSTRAR PRODUCTOS
// ==========================================

function mostrarProductos() {

    const lista =
        obtenerProductosFiltrados();


    productsContainer.innerHTML =
        "";


    if (lista.length === 0) {

        productsContainer.innerHTML = `
            <div class="no-products">

                No encontramos productos.

            </div>
        `;

    } else {

        lista.forEach(
            producto => {

                productsContainer.innerHTML +=
                    crearProducto(
                        producto
                    );

            }
        );

    }


    productCounter.textContent =
        `${lista.length} producto${lista.length !== 1 ? "s" : ""}`;


    activarControlesCantidad();

}


// ==========================================
// BOTONES DE PRODUCTOS
// ==========================================

function activarControlesCantidad() {

    const botones =
        document.querySelectorAll(
            "[data-action]"
        );


    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const idProducto =
                        Number(
                            boton.dataset.id
                        );


                    const accion =
                        boton.dataset.action;


                    if (
                        accion === "agregar"
                    ) {

                        agregarAlCarrito(
                            idProducto
                        );

                    }


                    if (
                        accion === "restar"
                    ) {

                        restarDelCarrito(
                            idProducto
                        );

                    }

                }
            );

        }
    );

}


// ==========================================
// AGREGAR PRODUCTO
// ==========================================

function agregarAlCarrito(
    idProducto
) {

    const producto =
        productos.find(
            producto =>
                producto.id ===
                idProducto
        );


    if (!producto) {

        return;

    }


    const existente =
        carrito.find(
            item =>
                item.id ===
                idProducto
        );


    if (existente) {

        existente.cantidad++;

    } else {

        carrito.push({

            ...producto,

            cantidad: 1

        });

    }


    guardarCarrito();

    actualizarInterfaz();

}


// ==========================================
// RESTAR PRODUCTO
// ==========================================

function restarDelCarrito(
    idProducto
) {

    const existente =
        carrito.find(
            item =>
                item.id ===
                idProducto
        );


    if (!existente) {

        return;

    }


    existente.cantidad--;


    if (
        existente.cantidad <= 0
    ) {

        carrito =
            carrito.filter(
                item =>
                    item.id !==
                    idProducto
            );

    }


    guardarCarrito();

    actualizarInterfaz();

}


// ==========================================
// TOTALES
// ==========================================

function calcularTotal() {

    return carrito.reduce(

        (
            total,
            producto
        ) =>

            total +
            (
                producto.precio *
                producto.cantidad
            ),

        0

    );

}


function calcularCantidadTotal() {

    return carrito.reduce(

        (
            total,
            producto
        ) =>

            total +
            producto.cantidad,

        0

    );

}


// ==========================================
// ACTUALIZAR INTERFAZ
// ==========================================

function actualizarInterfaz() {

    actualizarContadorCarrito();

    mostrarProductos();


    if (
        cartPanel.classList.contains(
            "active"
        ) &&
        !checkoutView.classList.contains(
            "active"
        )
    ) {

        renderizarCarrito();

    }


    if (
        checkoutView.classList.contains(
            "active"
        )
    ) {

        checkoutTotal.textContent =
            `S/ ${calcularTotal().toFixed(2)}`;

    }

}


// ==========================================
// CONTADOR Y BARRA INFERIOR
// ==========================================

function actualizarContadorCarrito() {

    const cantidadTotal =
        calcularCantidadTotal();


    const totalCompra =
        calcularTotal();


    cartCount.textContent =
        cantidadTotal;


    bottomCartItems.textContent =
        `${cantidadTotal} producto${cantidadTotal !== 1 ? "s" : ""}`;


    bottomCartTotal.textContent =
        `S/ ${totalCompra.toFixed(2)}`;


    if (
        cantidadTotal > 0 &&
        !cartPanel.classList.contains(
            "active"
        )
    ) {

        bottomCart.style.display =
            "flex";

    } else {

        bottomCart.style.display =
            "none";

    }

}


// ==========================================
// ABRIR CARRITO
// ==========================================

function abrirCarrito() {

    if (
        carrito.length === 0
    ) {

        return;

    }


    mostrarVistaCarrito();

    renderizarCarrito();


    cartPanel.classList.add(
        "active"
    );


    cartOverlay.classList.add(
        "active"
    );


    bottomCart.style.display =
        "none";


    document.body.classList.add(
        "panel-open"
    );

}


// ==========================================
// CERRAR CARRITO
// ==========================================

function cerrarCarrito() {

    cartPanel.classList.remove(
        "active"
    );


    cartOverlay.classList.remove(
        "active"
    );


    checkoutView.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "panel-open"
    );


    actualizarContadorCarrito();

}


// ==========================================
// MOSTRAR VISTA CARRITO
// ==========================================

function mostrarVistaCarrito() {

    checkoutView.classList.remove(
        "active"
    );


    document
        .querySelector(
            ".cart-panel-header"
        )
        .style.display =
        "flex";


    cartProducts.style.display =
        "block";


    document
        .querySelector(
            ".cart-summary"
        )
        .style.display =
        "block";

}


// ==========================================
// RENDERIZAR CARRITO
// ==========================================

function renderizarCarrito() {

    cartProducts.innerHTML =
        "";


    carrito.forEach(
        producto => {

            const subtotal =
                producto.precio *
                producto.cantidad;


            cartProducts.innerHTML += `
                <div class="cart-item">

                    <div class="cart-item-image">
                        ${producto.emoji}
                    </div>

                    <div class="cart-item-info">

                        <div class="cart-item-name">
                            ${producto.nombre}
                        </div>

                        <div class="cart-item-size">
                            ${producto.presentacion}
                        </div>

                        <div class="cart-item-bottom">

                            <span class="cart-item-price">
                                S/ ${subtotal.toFixed(2)}
                            </span>

                            <div class="cart-item-quantity">

                                <button
                                    data-cart-action="restar"
                                    data-id="${producto.id}"
                                >
                                    −
                                </button>

                                <span>
                                    ${producto.cantidad}
                                </span>

                                <button
                                    data-cart-action="agregar"
                                    data-id="${producto.id}"
                                >
                                    +
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            `;

        }
    );


    const total =
        calcularTotal();


    cartSubtotal.textContent =
        `S/ ${total.toFixed(2)}`;


    cartTotal.textContent =
        `S/ ${total.toFixed(2)}`;


    activarControlesCarrito();

}


// ==========================================
// CONTROLES DEL CARRITO
// ==========================================

function activarControlesCarrito() {

    const botones =
        document.querySelectorAll(
            "[data-cart-action]"
        );


    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const idProducto =
                        Number(
                            boton.dataset.id
                        );


                    const accion =
                        boton.dataset.cartAction;


                    if (
                        accion === "agregar"
                    ) {

                        agregarAlCarrito(
                            idProducto
                        );

                    }


                    if (
                        accion === "restar"
                    ) {

                        restarDelCarrito(
                            idProducto
                        );

                    }

                }
            );

        }
    );

}


// ==========================================
// CHECKOUT
// ==========================================

function abrirCheckout() {

    if (
        carrito.length === 0
    ) {

        return;

    }


    document
        .querySelector(
            ".cart-panel-header"
        )
        .style.display =
        "none";


    cartProducts.style.display =
        "none";


    document
        .querySelector(
            ".cart-summary"
        )
        .style.display =
        "none";


    checkoutView.classList.add(
        "active"
    );


    checkoutView.scrollTop =
        0;


    checkoutTotal.textContent =
        `S/ ${calcularTotal().toFixed(2)}`;


    actualizarTipoEntrega();

}


function volverAlCarrito() {

    mostrarVistaCarrito();

    renderizarCarrito();

}


// ==========================================
// ENTREGA
// ==========================================

function obtenerTipoEntrega() {

    const seleccionado =
        document.querySelector(
            'input[name="delivery-type"]:checked'
        );


    return seleccionado
        ? seleccionado.value
        : "";

}


function actualizarTipoEntrega() {

    const tipoEntrega =
        obtenerTipoEntrega();


    if (
        tipoEntrega === "Delivery"
    ) {

        addressGroup.style.display =
            "flex";


        deliveryNote.style.display =
            "block";

    } else {

        addressGroup.style.display =
            "none";


        deliveryNote.style.display =
            "none";

    }

}


// ==========================================
// MÉTODO DE PAGO
// ==========================================

function obtenerMetodoPago() {

    const seleccionado =
        document.querySelector(
            'input[name="payment-method"]:checked'
        );


    return seleccionado
        ? seleccionado.value
        : "";

}


// ==========================================
// MENSAJE WHATSAPP
// ==========================================

function generarMensajePedido() {

    const nombre =
        customerName.value.trim();


    const direccion =
        customerAddress.value.trim();


    const tipoEntrega =
        obtenerTipoEntrega();


    const metodoPago =
        obtenerMetodoPago();


    let mensaje =
        "Hola, quiero realizar este pedido:\n\n";


    carrito.forEach(
        producto => {

            const subtotal =
                producto.precio *
                producto.cantidad;


            mensaje +=
                `${producto.cantidad} x ${producto.nombre} ${producto.presentacion} - S/ ${subtotal.toFixed(2)}\n`;

        }
    );


    mensaje +=
        `\nTotal productos: S/ ${calcularTotal().toFixed(2)}\n`;


    mensaje +=
        `\nNombre: ${nombre}\n`;


    mensaje +=
        `Entrega: ${tipoEntrega}\n`;


    if (
        tipoEntrega === "Delivery"
    ) {

        mensaje +=
            `Dirección: ${direccion}\n`;


        mensaje +=
            "Costo de delivery: a confirmar por WhatsApp\n";

    }


    mensaje +=
        `Método de pago: ${metodoPago}`;


    return mensaje;

}


// ==========================================
// ABRIR WHATSAPP
// ==========================================

function enviarPedidoWhatsapp() {

    const nombre =
        customerName.value.trim();


    const direccion =
        customerAddress.value.trim();


    const tipoEntrega =
        obtenerTipoEntrega();


    if (
        nombre === ""
    ) {

        alert(
            "Por favor, ingresa tu nombre."
        );


        customerName.focus();

        return;

    }


    if (
        tipoEntrega === "Delivery" &&
        direccion === ""
    ) {

        alert(
            "Por favor, ingresa la dirección de delivery."
        );


        customerAddress.focus();

        return;

    }


    if (
        carrito.length === 0
    ) {

        alert(
            "Tu carrito está vacío."
        );

        return;

    }


    const mensaje =
        generarMensajePedido();


    const url =
        `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;


    window.open(
        url,
        "_blank"
    );

}


// ==========================================
// BUSCADOR
// ==========================================

searchInput.addEventListener(
    "input",
    () => {

        textoBusqueda =
            searchInput.value;


        mostrarProductos();

    }
);


// ==========================================
// CATEGORÍAS
// ==========================================

categoryButtons.forEach(
    boton => {

        boton.addEventListener(
            "click",
            () => {

                const categoria =
                    boton.dataset.category;


                if (
                    categoriaSeleccionada ===
                    categoria
                ) {

                    categoriaSeleccionada =
                        "Todos";

                } else {

                    categoriaSeleccionada =
                        categoria;

                }


                actualizarEstadoCategorias();

                mostrarProductos();

            }
        );

    }
);


function actualizarEstadoCategorias() {

    categoryButtons.forEach(
        boton => {

            const categoria =
                boton.dataset.category;


            boton.classList.toggle(
                "active-category",
                categoria ===
                    categoriaSeleccionada
            );

        }
    );

}


// ==========================================
// EVENTOS DEL PANEL
// ==========================================

viewOrderButton.addEventListener(
    "click",
    abrirCarrito
);


cartButton.addEventListener(
    "click",
    abrirCarrito
);


closeCartButton.addEventListener(
    "click",
    cerrarCarrito
);


cartOverlay.addEventListener(
    "click",
    cerrarCarrito
);


continueOrderButton.addEventListener(
    "click",
    abrirCheckout
);


backCartButton.addEventListener(
    "click",
    volverAlCarrito
);


whatsappButton.addEventListener(
    "click",
    enviarPedidoWhatsapp
);


// ==========================================
// CAMBIO DE TIPO DE ENTREGA
// ==========================================

document
    .querySelectorAll(
        'input[name="delivery-type"]'
    )
    .forEach(
        radio => {

            radio.addEventListener(
                "change",
                actualizarTipoEntrega
            );

        }
    );


// ==========================================
// ESC PARA CERRAR PANEL EN PC
// ==========================================

document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Escape" &&
            cartPanel.classList.contains(
                "active"
            )
        ) {

            cerrarCarrito();

        }

    }
);


// ==========================================
// INICIAR APP
// ==========================================

cargarCarrito();

mostrarProductos();

actualizarContadorCarrito();

actualizarTipoEntrega();

actualizarEstadoCategorias();

actualizarEstadoTienda();


// Actualizamos el horario cada minuto.

setInterval(
    actualizarEstadoTienda,
    60000
);