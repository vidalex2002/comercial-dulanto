const adminProducts =
    document.getElementById("admin-products");

const adminSearchInput =
    document.getElementById("admin-search-input");

const newProductButton =
    document.getElementById("new-product-button");

const productEditor =
    document.getElementById("product-editor");

const adminOverlay =
    document.getElementById("admin-overlay");

const closeEditorButton =
    document.getElementById("close-editor-button");

const cancelButton =
    document.getElementById("cancel-button");

const productForm =
    document.getElementById("product-form");

const editorTitle =
    document.getElementById("editor-title");

const productId =
    document.getElementById("product-id");

const productName =
    document.getElementById("product-name");

const productCategory =
    document.getElementById("product-category");

const productPresentation =
    document.getElementById("product-presentation");

const productPrice =
    document.getElementById("product-price");

const productStock =
    document.getElementById("product-stock");

const productEmoji =
    document.getElementById("product-emoji");

const productAvailable =
    document.getElementById("product-available");


const ADMIN_STORAGE_KEY =
    "comercial_dulanto_admin_products";


let adminProductList = [];


function prepararProductos() {

    const saved =
        localStorage.getItem(
            ADMIN_STORAGE_KEY
        );


    if (saved) {

        try {

            adminProductList =
                JSON.parse(saved);

            return;

        } catch (error) {

            console.error(
                "Error leyendo productos del panel",
                error
            );

        }

    }


    adminProductList =
        productos.map(
            producto => ({

                ...producto,

                stock: 10,

                disponible: true

            })
        );


    guardarProductos();

}


function guardarProductos() {

    localStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify(
            adminProductList
        )
    );

}


function obtenerProductosFiltrados() {

    const texto =
        adminSearchInput.value
            .trim()
            .toLowerCase();


    return adminProductList.filter(
        producto =>

            producto.nombre
                .toLowerCase()
                .includes(texto)

            ||

            producto.categoria
                .toLowerCase()
                .includes(texto)

    );

}


function renderizarProductos() {

    const lista =
        obtenerProductosFiltrados();


    adminProducts.innerHTML =
        "";


    lista.forEach(
        producto => {

            const claseEstado =
                producto.disponible
                    ? "status-available"
                    : "status-unavailable";


            const textoEstado =
                producto.disponible
                    ? "Disponible"
                    : "Agotado";


            adminProducts.innerHTML += `
                <article class="admin-product-card">

                    <div class="admin-product-image">
                        ${producto.emoji || "📦"}
                    </div>


                    <div class="admin-product-info">

                        <h3>
                            ${producto.nombre}
                        </h3>


                        <p>
                            ${producto.presentacion}
                            ·
                            ${producto.categoria}
                        </p>


                        <div class="admin-product-meta">

                            <strong>
                                S/ ${Number(
                                    producto.precio
                                ).toFixed(2)}
                            </strong>


                            <span>
                                Stock:
                                ${producto.stock}
                            </span>


                            <span class="${claseEstado}">
                                ${textoEstado}
                            </span>

                        </div>

                    </div>


                    <div class="admin-product-actions">

                        <button
                            class="edit-product-button"
                            data-edit-id="${producto.id}"
                        >
                            Editar
                        </button>


                        <button
                            class="toggle-product-button"
                            data-toggle-id="${producto.id}"
                        >
                            ${
                                producto.disponible
                                    ? "Marcar agotado"
                                    : "Activar"
                            }
                        </button>

                    </div>

                </article>
            `;

        }
    );


    activarBotones();

}


function activarBotones() {

    document
        .querySelectorAll(
            "[data-edit-id]"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        abrirEditor(
                            Number(
                                boton.dataset.editId
                            )
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-toggle-id]"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        cambiarDisponibilidad(
                            Number(
                                boton.dataset.toggleId
                            )
                        );

                    }
                );

            }
        );

}


function abrirEditor(id = null) {

    if (id === null) {

        editorTitle.textContent =
            "Nuevo producto";


        productId.value =
            "";


        productName.value =
            "";


        productCategory.value =
            "Bebidas";


        productPresentation.value =
            "";


        productPrice.value =
            "";


        productStock.value =
            "0";


        productEmoji.value =
            "📦";


        productAvailable.checked =
            true;


    } else {

        const producto =
            adminProductList.find(
                item =>
                    item.id === id
            );


        if (!producto) {

            return;

        }


        editorTitle.textContent =
            "Editar producto";


        productId.value =
            producto.id;


        productName.value =
            producto.nombre;


        productCategory.value =
            producto.categoria;


        productPresentation.value =
            producto.presentacion;


        productPrice.value =
            producto.precio;


        productStock.value =
            producto.stock;


        productEmoji.value =
            producto.emoji || "📦";


        productAvailable.checked =
            producto.disponible;

    }


    productEditor.classList.add(
        "active"
    );


    adminOverlay.classList.add(
        "active"
    );

}


function cerrarEditor() {

    productEditor.classList.remove(
        "active"
    );


    adminOverlay.classList.remove(
        "active"
    );

}


function cambiarDisponibilidad(id) {

    const producto =
        adminProductList.find(
            item =>
                item.id === id
        );


    if (!producto) {

        return;

    }


    producto.disponible =
        !producto.disponible;


    guardarProductos();

    renderizarProductos();

}


function guardarFormulario(event) {

    event.preventDefault();


    const id =
        Number(
            productId.value
        );


    const datosProducto = {

        nombre:
            productName.value.trim(),

        categoria:
            productCategory.value,

        presentacion:
            productPresentation.value.trim(),

        precio:
            Number(
                productPrice.value
            ),

        stock:
            Number(
                productStock.value
            ),

        emoji:
            productEmoji.value.trim()
            || "📦",

        disponible:
            productAvailable.checked

    };


    if (!id) {

        const nuevoId =
            adminProductList.length > 0
                ? Math.max(
                    ...adminProductList.map(
                        producto =>
                            producto.id
                    )
                ) + 1
                : 1;


        adminProductList.push({

            id: nuevoId,

            ...datosProducto

        });


    } else {

        const producto =
            adminProductList.find(
                item =>
                    item.id === id
            );


        if (!producto) {

            return;

        }


        Object.assign(
            producto,
            datosProducto
        );

    }


    guardarProductos();

    renderizarProductos();

    cerrarEditor();

}


adminSearchInput.addEventListener(
    "input",
    renderizarProductos
);


newProductButton.addEventListener(
    "click",
    () => {

        abrirEditor();

    }
);


closeEditorButton.addEventListener(
    "click",
    cerrarEditor
);


cancelButton.addEventListener(
    "click",
    cerrarEditor
);


adminOverlay.addEventListener(
    "click",
    cerrarEditor
);


productForm.addEventListener(
    "submit",
    guardarFormulario
);


prepararProductos();

renderizarProductos();