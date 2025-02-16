document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("tableBody");
    const marcasSelect = document.getElementById("marcas");
    const tiposSelect = document.getElementById("producto");

    try {
        const response = await fetch("https://localhost:44379/api/Producto");
        const data = await response.json();
        populateTable(data, tableBody);
        
        await loadMarcas(marcasSelect);
        await loadTipos(tiposSelect);
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }

    const statusEdit = localStorage.getItem('status-producto-editado');
    const statusAdd = localStorage.getItem('status-producto-agregado');
    {
        if (statusEdit && statusEdit === "200") {
            mostrarToast("Producto editado", "bg-success");
            localStorage.removeItem('status-producto-editado');
          } else if(statusEdit && statusEdit === "400") {
            mostrarToast("Error al editar el producto");
            localStorage.removeItem('status-producto-editado');
        }

        if(statusAdd && statusAdd === "200"){
            mostrarToast("Producto agregado", "bg-success");
            localStorage.removeItem('status-producto-agregado');
        }else if(statusAdd && statusAdd === "500"){
            mostrarToast("Error al agregar el producto");
            localStorage.removeItem('status-producto-agregado');
        }


          
          
      }


    
});

function mostrarToast(mensaje, color = 'bg-danger', duracion = 3000) {
    const toastElement = document.getElementById("pedidoToast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = mensaje;
    toastElement.className = `toast align-items-center text-white ${color} border-0`;

    const toast = new bootstrap.Toast(toastElement, { delay: duracion });
    toast.show();
}

let deleteProductId = null; 

document.addEventListener("DOMContentLoaded", function () {
    const addMedBtn = document.getElementById("addProdBtn");
    addMedBtn.addEventListener("click", function () {
        window.location.href = "/pages/Productos/AddProducto.html";
    });
});

function populateTable(products, tableBody) {
    tableBody.innerHTML = ""; 
    products.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="d-none">${product.idProducto}</td>
            <td>${product.nombre}</td>
            <td>${product.idMarcaNavigation.nombreMarca}</td>
            <td>${product.tipoProductoNavigation.tipoProducto}</td>
            <td>${product.descripcion}</td>
            <td>$${product.precio}</td>
            <td>${product.activo ? "Activo" : "Inactivo"}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-2" onclick="editProduct(${product.idProducto})">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="showDeleteToast(${product.idProducto})">
                    <i class="bi bi-x-circle"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

document.getElementById("searchProd").addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value;
    const marca = document.getElementById("marcas").value;
    const tipoProd = document.getElementById("producto").value;
    const active = document.getElementById("active").checked;
    const tableBody = document.getElementById("tableBody");


    const url = new URL("https://localhost:44379/api/Producto/filtros");
    if (nombre) url.searchParams.append("nombre", nombre);
    if (marca && marca !== "Seleccionar") url.searchParams.append("marca", marca);
    if (tipoProd && tipoProd !== "Seleccionar") url.searchParams.append("tipoProd", tipoProd);
    url.searchParams.append("active", active);

    try {
        const response = await fetch(url);
        const data = await response.json();
        populateTable(data, tableBody);
    } catch (error) {
        console.error("Error al buscar productos:", error);
    }
});

async function loadMarcas(select, selectedId = null) {
    let  marcas = [];
    await fetch("https://localhost:44379/api/Producto")
        .then(response => response.json())
        .then(data => {
            data.forEach(item =>{
                marcas.push(item.idMarcaNavigation.idMarca)
            })

            marcas = [...new Set(marcas)];

            select.innerHTML = '<option selected>Seleccionar</option>';
            data.forEach(item => {
                if (marcas.includes(item.idMarcaNavigation.idMarca)) {
                    const option = document.createElement("option");
                    option.value = item.idMarcaNavigation.idMarca; 
                    option.textContent = item.idMarcaNavigation.nombreMarca; 
                    select.appendChild(option);
                    marcas = marcas.filter(m => m !== item.idMarcaNavigation.nombreMarca);
                }
            });
            if (selectedId) {
                select.value = selectedId;
            }
        })
        .catch(error => console.error("Error al cargar opciones de marcas:", error));
}



async function loadTipos(select, selectedId = null) {
    await fetch("https://localhost:44379/api/TipoProducto")
        .then(response => response.json())
        .then(data => {
            select.innerHTML = '<option selected>Seleccionar</option>';
            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.idTipoProducto; 
                option.textContent = item.tipoProducto; 
                select.appendChild(option);
            });
            if (selectedId) {
                select.value = selectedId;
            }
        })
        .catch(error => console.error("Error al cargar opciones de tipos de producto:", error));
}

function editProduct(productId) {
    window.location.href = `/pages/Productos/EditProducto.html?id=${productId}`;
}

const toast = new bootstrap.Toast(document.getElementById("deleteToast"));

function showDeleteToast(productId) {
    deleteProductId = productId;
    console.log(deleteProductId)
    
    toast.show();
}
async function deleteProduct() {
    if (deleteProductId !== null) {
        try {
            await fetch(`https://localhost:44379/api/Producto/?id=${deleteProductId}`, { method: "DELETE" });
            const row = document.querySelector(`tr[data-product-id="${deleteProductId}"]`);
            if (row) row.remove();
            deleteProductId = null;
            const tableBody = document.getElementById("tableBody");
            const response = await fetch("https://localhost:44379/api/Producto");
            const data = await response.json();
            populateTable(data, tableBody);
            toast.hide();
            mostrarToast("Producto eliminado correctamente.");
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    }
}

document.getElementById("confirmDelete").addEventListener("click", deleteProduct);

function mostrarToast(mensaje, color = 'bg-success') {
    const toastElement = document.getElementById("facturaToast");
    const toastMessage = document.getElementById("toastMessage");


    toastMessage.textContent = mensaje;
    toastElement.className = `toast align-items-center text-white ${color} border-0`;


    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}