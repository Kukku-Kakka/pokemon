addEventListener("DOMContentLoaded", fetchPokemonList());
let popup = document.getElementById('popup');   

function showPopup(id) {
  fetchPokemonDetails(id);
  popup.style.display = "block";
  popup.classList.add("animation-popup");
}

document.getElementById('close-btn').addEventListener('click', () => {
  popup.classList.remove(".animation-popup");
  popup.style.display = "none";

});

let allPokemon = [];

function fetchPokemonList(page = 0, limit = 20) {
    const offset = page * limit;
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
      .then(res => res.json())
      .then(data => {
        const fetches = data.results.map(p => fetch(p.url).then(res => res.json()));
        Promise.all(fetches).then(pokemonData => {
          allPokemon = pokemonData;
          renderPokemon(pokemonData);
        });
      });
  }


function renderPokemon(pokemonList) {
    let grid = document.querySelector(".mainGrid");
    grid.innerHTML = "";
  
    pokemonList.forEach(pokemon => {
      const img = pokemon.sprites.other?.['official-artwork']?.front_default
               || "https://via.placeholder.com/96?text=No+Image";
      const types = pokemon.types.map(t => capitalize(t.type.name)).join(", ");
  
      grid.innerHTML += `
        <div class="grid" onclick="showPopup(${pokemon.id})">
          <img src="${img}" alt="${pokemon.name}">
          <h3>${capitalize(pokemon.name)}</h3>
          <h4>${types}</h4>
        </div>
      `;
    });
  }

function filterPokemon() {
    const nameInput = document.getElementById("filterByName").value.toLowerCase();
    const typeInput = document.getElementById("filterByType").value;
  
    const filtered = allPokemon.filter(pokemon => {
      const nameMatch = pokemon.name.toLowerCase().includes(nameInput);
      const typeMatch = typeInput === "" || pokemon.types.some(t => t.type.name === typeInput);
      return nameMatch && typeMatch;
    });
  
    renderPokemon(filtered);
  }

function getIdFromUrl(url) {
    const parts = url.split("/").filter(Boolean); // removes empty strings
    return parseInt(parts[parts.length - 1]); // last part is the ID
}

let page = 0;

function firstPage(){
    page = 0;
    fetchPokemonList(page);
    renderPageNumber();
}

function lastPage(){
    page = 4;
    fetchPokemonList(page);
    renderPageNumber();
}

function nextPage(){
    if (page == 4){
        return;
    }
    page++;
    fetchPokemonList(page);
    renderPageNumber();
}

function renderPageNumber(){
    document.getElementById("pageNumber").textContent = page+1;
}
  
function prevPage(){
    if (page == 0){
        return;
    }
    page--;
    fetchPokemonList(page);
    renderPageNumber();

}

function capitalize(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function fetchPokemonDetails(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('pokemonId').textContent = `#${data.id}`;
        document.getElementById('pokemon_name').textContent = capitalize(data.name);
        
        // IMAGE
        const pokemonImage = document.querySelector('.pokemon-image');
        pokemonImage.innerHTML = '';
        const img = document.createElement('img');
        img.src = data.sprites.other?.['official-artwork']?.front_default || 
              "https://via.placeholder.com/200?text=No+Image";
        img.alt = data.name;
        pokemonImage.appendChild(img);

        // TYPES
        const typeContainer = document.getElementById('pokemon-type');
        typeContainer.innerHTML = '';
          
        const typeColors = {
            normal: '#A8A878',
            fire: '#F08030',
            water: '#6890F0',
            grass: '#78C850',
            electric: '#F8D030',
            ice: '#98D8D8',
            fighting: '#C03028',
            poison: '#A040A0',
            ground: '#E0C068',
            flying: '#A890F0',
            psychic: '#F85888',
            bug: '#A8B820',
            rock: '#B8A038',
            ghost: '#705898',
            dragon: '#7038F8',
            dark: '#705848',
            steel: '#B8B8D0',
            fairy: '#EE99AC'
        };
      
        data.types.forEach(t => {
            const type = t.type.name;
            const typeElement = document.createElement('p');
            typeElement.classList.add('type');
            typeElement.textContent = capitalize(type);
            typeElement.style.backgroundColor = typeColors[type] || '#777777';
            typeElement.style.color = 'white';
            typeContainer.appendChild(typeElement);
        });

        // STATS
        document.getElementById('hp').textContent = `HP: ${data.stats[0].base_stat}`;
        document.getElementById('atk').textContent = `Attack: ${data.stats[1].base_stat}`;
        document.getElementById('def').textContent = `Defense: ${data.stats[2].base_stat}`;
        document.getElementById('special-attack').textContent = `Sp. Atk: ${data.stats[3].base_stat}`;
        document.getElementById('special-defense').textContent = `Sp. Def: ${data.stats[4].base_stat}`;
        document.getElementById('speed').textContent = `Speed: ${data.stats[5].base_stat}`;
        

        // DESCRIPTION
        fetch(data.species.url)
        .then(res => res.json())
        .then(speciesData => {
          const description = speciesData.flavor_text_entries.find(
            entry => entry.language.name === "en"
          );
        
          document.getElementById('description').textContent = description
            ? description.flavor_text.replace(/\f/g, ' ')
            : "No description found";
        
          // REGION
          let regionFound = 'Unknown';
          if (speciesData.generation) {
            const generation = speciesData.generation.name.split('-')[1].toUpperCase();
            const regions = {
              'I': 'Kanto',
              'II': 'Johto',
              'III': 'Hoenn',
              'IV': 'Sinnoh',
              'V': 'Unova',
              'VI': 'Kalos',
              'VII': 'Alola',
              'VIII': 'Galar',
              'IX': 'Paldea'
            };
            regionFound = regions[generation] || `Generation ${generation}`;
          }
        
          document.getElementById('region').textContent = `Region: ${regionFound}`;
        });
        

      
    });
}