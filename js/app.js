// ==========================================
// ELEMENTOS
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

const storeStatus =
    document.getElementById("store-status");

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

const HORA_APERTURA =
    (6 * 60) + 30;

const HORA_CIERRE =
    21 * 60;


// ==========================================
// ESTADO
// ==========================================

let productos = [];

let carrito = [];

let categoriaSeleccionada =
    "Todos";

let textoBusqueda =
    "";


// ==========================================
// CARGAR PRODUCTOS DESDE SUPABASE
// ==========================================

async function cargarProductos() {

    productsContainer.innerHTML = `
        <div class="no-products">
            Cargando productos...
        </div>
    `;


    productCounter.textContent =
        "Cargando...";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("productos")
            .select(
                "id,nombre,categoria,presentacion,precio,stock,disponible,emoji"
            )
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Error cargando productos:",
            error
        );


        productsContainer.innerHTML = `
            <div class="no-products">
                No se pudieron cargar los productos.
            </div>
        `;


        productCounter.textContent =
            "Error";


        return false;

    }


    productos =
        data.map(
            producto => ({

                ...producto,

                precio:
                    Number(
                        producto.precio
                    ),

                stock:
                    Number(
                        producto.stock
                    )

            })
        );


    cargarCarrito();

    mostrarProductos();

    actualizarContadorCarrito();


    return true;
}


// ==========================================
// HORARIO
// ==========================================

function actualizarEstadoTienda() {

    const ahora =
        new Date();


    const minutosActuales =
        (
            ahora.getHours() *
            60
        ) +
        ahora.getMinutes();


    const estaAbierto =
        minutosActuales >=
            HORA_APERTURA
        &&
        minutosActuales <
            HORA_CIERRE;


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

    const guardado =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!guardado) {

        carrito = [];

        return;

    }


    try {

        const datos =
            JSON.parse(
                guardado
            );


        if (!Array.isArray(datos)) {

            carrito = [];

            return;

        }


        carrito =
            datos

                .map(
                    itemGuardado => {

                        const producto =
                            productos.find(
                                item =>
                                    item.id ===
                                    Number(
                                        itemGuardado.id
                                    )
                            );


                        if (!producto) {

                            return null;

                        }


                        /*
                            Si un producto fue agotado
                            desde administración,
                            ya no permanece comprable
                            en un carrito antiguo.
                        */

                        if (
                            !producto.disponible ||
                            producto.stock <= 0
                        ) {

                            return null;

                        }


                        let cantidad =
                            Number(
                                itemGuardado.cantidad
                            );


                        if (
                            !Number.isFinite(
                                cantidad
                            ) ||
                            cantidad <= 0
                        ) {

                            return null;

                        }


                        cantidad =
                            Math.floor(
                                cantidad
                            );


                        /*
                            Evitamos tener más unidades
                            que el stock actual.
                        */

                        cantidad =
                            Math.min(
                                cantidad,
                                producto.stock
                            );


                        return {

                            ...producto,

                            cantidad

                        };

                    }
                )

                .filter(
                    item =>
                        item !== null
                );


        guardarCarrito();

    } catch (error) {

        console.error(
            "Error recuperando carrito:",
            error
        );


        carrito = [];


        localStorage.removeItem(
            STORAGE_KEY
        );

    }

}


// ==========================================
// CANTIDAD
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
// TARJETA PRODUCTO
// ==========================================

function crearProducto(
    producto
) {

    const cantidad =
        obtenerCantidadEnCarrito(
            producto.id
        );


    const agotado =
        !producto.disponible ||
        producto.stock <= 0;


    let controlCantidad = "";


    if (agotado) {

        controlCantidad = `
            <span
                style="
                    font-weight: 700;
                    color: #b91c1c;
                    font-size: 13px;
                "
            >
                Agotado
            </span>
        `;

    }

    else if (cantidad === 0) {

        controlCantidad = `
            <button
                class="add-button"
                data-action="agregar"
                data-id="${producto.id}"
            >
                +
            </button>
        `;

    }

    else {

        controlCantidad = `
            <div class="quantity-control">

                <button
                    class="quantity-button"
                    data-action="restar"
                    data-id="${producto.id}"
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
                >
                    +
                </button>

            </div>
        `;

    }


    return `
        <article class="product-card">

            <div class="product-image">
                ${producto.emoji || "📦"}
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
// FILTROS
// ==========================================

function obtenerProductosFiltrados() {

    const texto =
        textoBusqueda
            .trim()
            .toLowerCase();


    return productos.filter(
        producto => {

            const coincideCategoria =
                categoriaSeleccionada ===
                    "Todos"
                ||
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


    if (
        lista.length === 0
    ) {

        productsContainer.innerHTML = `
            <div class="no-products">
                No encontramos productos.
            </div>
        `;

    }

    else {

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
// CONTROLES PRODUCTOS
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
// AGREGAR
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


    if (
        !producto.disponible ||
        producto.stock <= 0
    ) {

        return;

    }


    const existente =
        carrito.find(
            item =>
                item.id ===
                idProducto
        );


    if (existente) {

        if (
            existente.cantidad >=
            producto.stock
        ) {

            alert(
                "No hay más unidades disponibles de este producto."
            );

            return;

        }


        existente.cantidad++;

    }

    else {

        carrito.push({

            ...producto,

            cantidad: 1

        });

    }


    guardarCarrito();

    actualizarInterfaz();

}


// ==========================================
// RESTAR
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
// INTERFAZ
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
// BARRA CARRITO
// ==========================================

function actualizarContadorCarrito() {

    const cantidadTotal =
        calcularCantidadTotal();


    cartCount.textContent =
        cantidadTotal;


    bottomCartItems.textContent =
        `${cantidadTotal} producto${cantidadTotal !== 1 ? "s" : ""}`;


    bottomCartTotal.textContent =
        `S/ ${calcularTotal().toFixed(2)}`;


    if (
        cantidadTotal > 0 &&
        !cartPanel.classList.contains(
            "active"
        )
    ) {

        bottomCart.style.display =
            "flex";

    }

    else {

        bottomCart.style.display =
            "none";

    }

}


// ==========================================
// ABRIR / CERRAR
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
// VISTA CARRITO
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
                        ${producto.emoji || "📦"}
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
// CONTROLES CARRITO
// ==========================================

function activarControlesCarrito() {

    document
        .querySelectorAll(
            "[data-cart-action]"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                boton.dataset.id
                            );


                        if (
                            boton.dataset.cartAction ===
                            "agregar"
                        ) {

                            agregarAlCarrito(
                                id
                            );

                        }

                        else {

                            restarDelCarrito(
                                id
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

    const tipo =
        obtenerTipoEntrega();


    if (
        tipo === "Delivery"
    ) {

        addressGroup.style.display =
            "flex";


        deliveryNote.style.display =
            "block";

    }

    else {

        addressGroup.style.display =
            "none";


        deliveryNote.style.display =
            "none";

    }

}


// ==========================================
// PAGO
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
// WHATSAPP
// ==========================================

function generarMensajePedido() {

    const nombre =
        customerName.value.trim();


    const direccion =
        customerAddress.value.trim();


    const tipoEntrega =
        obtenerTipoEntrega();


    const pago =
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
        `Método de pago: ${pago}`;


    return mensaje;

}


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

        return;

    }


    if (
        tipoEntrega === "Delivery" &&
        direccion === ""
    ) {

        alert(
            "Por favor, ingresa la dirección."
        );

        return;

    }


    const mensaje =
        generarMensajePedido();


    window.open(
        `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`,
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


                categoriaSeleccionada =
                    categoriaSeleccionada ===
                        categoria
                        ? "Todos"
                        : categoria;


                actualizarEstadoCategorias();

                mostrarProductos();

            }
        );

    }
);


function actualizarEstadoCategorias() {

    categoryButtons.forEach(
        boton => {

            boton.classList.toggle(
                "active-category",

                boton.dataset.category ===
                    categoriaSeleccionada
            );

        }
    );

}


// ==========================================
// EVENTOS
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
// INICIAR
// ==========================================

async function iniciarAplicacion() {

    actualizarEstadoTienda();

    actualizarTipoEntrega();

    actualizarEstadoCategorias();


    await cargarProductos();

}


iniciarAplicacion();


setInterval(
    actualizarEstadoTienda,
    60000
);