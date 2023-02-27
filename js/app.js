function iniciarApp(){

    const panelRecetas = document.querySelector('#resultado');
    const selectCategorias = document.querySelector('#categorias');

    if(selectCategorias){
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    }
    const favoritosDiv = document.querySelector('.favoritos');
    if(favoritosDiv){
        obtenerFavoritos();
    }

    
    const modal = new bootstrap.Modal('#modal', {});

    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'

        fetch(url)
        .then( respuesta => respuesta.json() )
        .then( resultado => mostrarCategorias(resultado.categories))
    }

    function mostrarCategorias( categorias = []){
        categorias.forEach( categoria =>{
            const option = document.createElement('OPTION');
            option.value = categoria.strCategory;
            option.textContent = categoria.strCategory;
            selectCategorias.appendChild(option);
        });
    }

    function seleccionarCategoria(e){
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        fetch(url)
            .then( respuesta => respuesta.json())
            .then( resultado => mostrarRecetas(resultado.meals))
    }

    function mostrarRecetas(recetas = []){

        limpiarHTML(resultado)
        const heading = document.createElement('H2');

        heading.classList.add('text-center', 'text-black', 'my-3');
        heading.textContent = recetas.length ? 'Resultados' : 'No hay recetas';

        resultado.appendChild(heading);

        recetas.forEach( receta =>{

            const { idMeal, strMeal, strMealThumb } = receta;

            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');
            
            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4', 'shadow');

            const imgCard = document.createElement('IMG');
            imgCard.classList.add('card-img-top');
            imgCard.alt = `Imagen de la erceta de ${strMeal ?? receta.title}`
            imgCard.src = strMealThumb ?? receta.url;

            const cardBody = document.createElement('DIV');
            cardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H4');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.title;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-warning', 'bg-gradient', 'w-100', 'text-white');
            recetaButton.textContent = 'Ver receta';

            // recetaButton.dataset.bsTarget = "#modal";
            // recetaButton.dataset.bsToggle = "modal";

            recetaButton.onclick = function(){
                seleccionarReceta(idMeal ?? receta.id)
            }



            cardBody.appendChild(recetaHeading);
            cardBody.appendChild(recetaButton);

            recetaCard.appendChild(imgCard);
            recetaCard.appendChild(cardBody);

            recetaContenedor.appendChild(recetaCard);

            panelRecetas.appendChild(recetaContenedor)
        })
    }

    function seleccionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then( respuesta => respuesta.json())
            .then( resultado => mostrarRecetaModal(resultado.meals[0]))
    }

    function mostrarRecetaModal(receta){
        
        const { idMeal, strInstructions, strMeal, strMealThumb, strYoutube } = receta;

        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="receta de ${strMeal}" />
            <h3 class="my-2">PASOS</h3>
            <p class="">${strInstructions}</p>
            <a class="h4 font-bold my-2 text-white  bg-primary bg-gradient rounded-2 border-0 py-2 px-5 text-center text-decoration-none d-block" target="_blank shadow" href=${strYoutube}>Ver video</a>
            <h3 class="my-3">Cantidades e instrucciones</h3>
        `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        for(let i = 1 ; i <= 20 ; i++){

            if(receta[`strIngredient${i}`]){
                const ingredientes = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredientsLi = document.createElement('LI');
                ingredientsLi.classList.add('list-group-item');
                ingredientsLi.textContent = `${ingredientes} - ${cantidad}`;

                
                listGroup.appendChild(ingredientsLi);
            }
        }

        modalBody.appendChild(listGroup);
        const modalFooter = document.querySelector('.modal-footer');
        limpiarHTML(modalFooter);

        const btnGuardar = document.createElement('BUTTON')
        if(existeStorage(idMeal)){
            btnGuardar.classList.add('btn', 'btn-warning', 'btn-gradient', 'col', 'text-white');    
        }else{
            btnGuardar.classList.add('btn', 'btn-info', 'btn-gradient', 'col', 'text-white');
        }
        btnGuardar.textContent = existeStorage(idMeal) ? 'Eliminar de mis favoritos' : 'Guardar favorito';

        btnGuardar.onclick = function(){

            if(existeStorage(idMeal)){
                eliminarFavorito(idMeal);
                btnGuardar.textContent = 'Guardar favorito';
                alerta('Eliminado de tus favoritos!')
                modal.hide();
                iniciarApp();
                return
            } 

            agregadoFavorito({
                id: idMeal,
                title: strMeal,
                url: strMealThumb
            })
            alerta('Agregado a tus favoritos!')
            btnGuardar.textContent = 'Eliminar de mis favoritos';
            btnGuardar.classList.add('btn', 'btn-warning', 'btn-gradient', 'col')
        }

        const btnCerrar = document.createElement('BUTTON')
        btnCerrar.classList.add('btn', 'btn-danger', 'btn-gradient', 'col')
        btnCerrar.textContent = 'Cerrar';
        btnCerrar.onclick = function(){
            modal.hide();
        }

        modalFooter.appendChild(btnGuardar);
        modalFooter.appendChild(btnCerrar);

        modal.show();
    }

    function agregadoFavorito(receta){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
        modal.hide();
    }

    function eliminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter( favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }

    function existeStorage(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some( favorito => favorito.id === id);
    }

    function alerta(mensaje){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show()
    }

    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length){
            mostrarRecetas(favoritos);
            return
        }
        const nohayFavoritos = document.createElement('P')
        nohayFavoritos.textContent = 'No hay favoritos aún';
        nohayFavoritos.classList.add('h1', 'text-center', 'font-bold', 'mt-5');
        favoritosDiv.appendChild(nohayFavoritos);
    }

    function limpiarHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }

}

document.addEventListener('DOMContentLoaded', iniciarApp)