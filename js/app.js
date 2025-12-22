const API_KEY = '8dfe2f8c6dd101a8de35789615f4c1fa';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

const queryInput = document.getElementById('queryInput');
const searchType = document.getElementById('searchType');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('results');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const suggestionsBox = document.getElementById('suggestions');

let isSuggestionOpen = false;
let savedCards = JSON.parse(localStorage.getItem('lastfmCards')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;


function saveCards() {
  localStorage.setItem('lastfmCards', JSON.stringify(savedCards));
}

function loadSavedCards() {
  if (savedCards.length === 0) {
    resultsContainer.innerHTML = '<p class="empty">Добавьте свой первый альбом или трек!</p>';
    return;
  }

  resultsContainer.innerHTML = '';
  savedCards.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.type = item.type;
    card.dataset.artist = item.artist;
    card.dataset.title = item.title;

    card.innerHTML = `
      <div class="card-delete" onclick="event.stopPropagation(); removeCard(this)">×</div>
      <img src="${item.image}" onerror="this.src='https://via.placeholder.com/180?text=No+Cover'" />
      <h3>${item.title}</h3>
      <p>${item.artist}</p>
    `;

    if (item.type === 'album') {
      card.onclick = () => openAlbumModal(item.data);
    } else {
      card.onclick = () => openTrackModal(item.data);
    }

    resultsContainer.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', loadSavedCards);






async function fetchArtistSuggestions(query) {
  try {
    const url = `${BASE_URL}?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=5`;
    const response = await fetch(url);
    const data = await response.json();
    const artists = data.results?.artistmatches?.artist || [];
    showSuggestions(artists);
  } catch (err) {
    console.error('Ошибка подсказок:', err);
    hideSuggestions();
  }
}

function showSuggestions(artists) {
  if (artists.length === 0) {
    hideSuggestions();
    return;
  }

  suggestionsBox.innerHTML = '';
  artists.forEach(artist => {
    const div = document.createElement('div');
    div.textContent = artist.name;
    div.onclick = () => selectSuggestion(artist.name);
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = 'block';
  isSuggestionOpen = true;
}

function hideSuggestions() {
  suggestionsBox.style.display = 'none';
  isSuggestionOpen = false;
}

function selectSuggestion(artistName) {
  queryInput.value = artistName;
  hideSuggestions();
  autoSearchByArtist(artistName);
}



async function autoSearchByArtist(artist) {
  if (resultsContainer.querySelector('.empty')) {
    resultsContainer.innerHTML = '<p>Загрузка...</p>';
  }

  if (searchType.value === 'album') {
    await fetchTopAlbum(artist);
  } else {
    await fetchTopTrack(artist);
  }
}

async function fetchTopAlbum(artist) {
  try {
    const url = `${BASE_URL}?method=artist.gettopalbums&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&format=json&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    const album = data.topalbums?.album?.[0];
    if (!album) throw new Error('Нет альбомов');
    await fetchAlbum(artist, album.name);
  } catch (err) {
    alert(`Не удалось найти альбомы для ${artist}`);
    if (resultsContainer.innerHTML.includes('<p>')) {
      resultsContainer.innerHTML = '<p class="empty">Добавьте карточку</p>';
    }
  }
}

async function fetchTopTrack(artist) {
  try {
    const url = `${BASE_URL}?method=artist.gettoptracks&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&format=json&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    const track = data.toptracks?.track?.[0];
    if (!track) throw new Error('Нет треков');
    await fetchTrack(artist, track.name);
  } catch (err) {
    alert(`Не удалось найти треки для ${artist}`);
    if (resultsContainer.innerHTML.includes('<p>')) {
      resultsContainer.innerHTML = '<p class="empty">Добавьте карточку</p>';
    }
  }
}



async function fetchAlbum(artist, album) {
  try {
    const url = `${BASE_URL}?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json&lang=ru`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      alert(`Альбом не найден: ${data.message}`);
      return;
    }

    renderAlbum(data.album);
  } catch (err) {
    console.error(err);
    alert(`Ошибка: ${err.message}`);
  }
}

async function fetchTrack(artist, track) {
  try {
    const url = `${BASE_URL}?method=track.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json&lang=ru`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      alert(`Трек не найден: ${data.message}`);
      return;
    }

    renderTrack(data.track);
  } catch (err) {
    console.error(err);
    alert(`Ошибка: ${err.message}`);
  }
}



function getCoverImage(imageArray) {
  if (!imageArray) return 'https://via.placeholder.com/180?text=No+Cover';
  const imgObj = imageArray.find(img => img.size === 'extralarge');
  return imgObj && imgObj['#text'] ? imgObj['#text'] : 'https://via.placeholder.com/180?text=No+Cover';
}

function renderAlbum(album) {
  const cover = getCoverImage(album.image);
  const name = album.name || 'Без названия';
  const artist = album.artist || 'Неизвестный';

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-delete" onclick="event.stopPropagation(); removeCard(this)">×</div>
    <img src="${cover}" onerror="this.src='https://via.placeholder.com/180?text=No+Cover'" />
    <h3>${name}</h3>
    <p>${artist}</p>
  `;
  card.onclick = () => openAlbumModal(album);
  resultsContainer.appendChild(card);

  savedCards.push({ type: 'album', artist, title: name, image: cover, data: album });
  saveCards();
}

function renderTrack(track) {
  const cover = getCoverImage(track.album?.image || track.image);
  const name = track.name || 'Без названия';
  const artist = track.artist?.name || 'Неизвестный';

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-delete" onclick="event.stopPropagation(); removeCard(this)">×</div>
    <img src="${cover}" onerror="this.src='https://via.placeholder.com/180?text=No+Cover'" />
    <h3>${name}</h3>
    <p>${artist}</p>
  `;
  card.onclick = () => openTrackModal(track);
  resultsContainer.appendChild(card);

  savedCards.push({ type: 'track', artist, title: name, image: cover, data: track });
  saveCards();
}




function removeCard(btn) {
  const card = btn.closest('.card');
  if (!card) return;

  const artist = card.dataset.artist;
  const title = card.dataset.title;
  const type = card.dataset.type;

  savedCards = savedCards.filter(item =>
    !(item.artist === artist && item.title === title && item.type === type)
  );
  saveCards();

  card.remove();

  if (resultsContainer.children.length === 0) {
    resultsContainer.innerHTML = '<p class="empty">Добавьте свой первый альбом или трек!</p>';
  }
}




function openAlbumModal(album) {
  const cover = getCoverImage(album.image);
  const fullDesc = album.wiki?.content || 'Описание недоступно.';
  const url = album.url || '#';
  let tracklist = '';
  if (album.tracks?.track) {
    const tracks = Array.isArray(album.tracks.track) ? album.tracks.track : [album.tracks.track];
    tracklist = `<h3>Трек-лист:</h3><ol>${tracks.map(t => `<li>${t.name}</li>`).join('')}</ol>`;
  }
  modalContent.innerHTML = `
    <img src="${cover}" style="float:right; width:120px; height:120px; object-fit:cover; margin:0 0 15px 15px;" onerror="this.style.display='none'"/>
    <h2>${album.artist} — ${album.name}</h2>
    <p>${fullDesc}</p>
    ${tracklist}
    <p><a href="${url}" target="_blank">Послушать на Last.fm</a></p>
  `;
  modalOverlay.style.display = 'flex';
}

function openTrackModal(track) {
  const cover = getCoverImage(track.album?.image || track.image);
  const fullDesc = track.wiki?.content || 'Описание недоступно.';
  const url = track.url || '#';
  modalContent.innerHTML = `
    <img src="${cover}" style="float:right; width:120px; height:120px; object-fit:cover; margin:0 0 15px 15px;" onerror="this.style.display='none'"/>
    <h2>${track.artist.name} — ${track.name}</h2>
    <p>${fullDesc}</p>
    <p><a href="${url}" target="_blank">Послушать на Last.fm</a></p>
  `;
  modalOverlay.style.display = 'flex';
}

function closeModal() {
  modalOverlay.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('click', (e) => {
  if (!queryInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
    hideSuggestions();
  }
});



function updateAuthUI() {
  const authButtons = document.querySelector('.auth-buttons');
  if (currentUser) {
    authButtons.innerHTML = `<span style="color:#d1b3ff">Привет, ${currentUser.username}!</span>`;
  } else {
    authButtons.innerHTML = `
      <button id="loginBtn" class="btn auth-btn">Войти</button>
      <button id="registerBtn" class="btn auth-btn">Регистрация</button>
    `;
    document.getElementById('loginBtn')?.addEventListener('click', openLoginModal);
    document.getElementById('registerBtn')?.addEventListener('click', openRegisterModal);
  }
}


function openLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('loginError').style.display = 'none';
}

function openRegisterModal() {
  document.getElementById('registerModal').style.display = 'flex';
}

function closeRegisterModal() {
  document.getElementById('registerModal').style.display = 'none';
  document.getElementById('registerError').style.display = 'none';
}


document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    currentUser = { username: user.username };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeLoginModal();
    updateAuthUI();
  } else {
    document.getElementById('loginError').textContent = 'Неверный логин или пароль';
    document.getElementById('loginError').style.display = 'block';
  }
});

document.getElementById('registerForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const password2 = document.getElementById('regPassword2').value;

  const errorEl = document.getElementById('registerError');


  if (!email.includes('@')) {
    errorEl.textContent = 'Некорректный email';
    errorEl.style.display = 'block';
    return;
  }
  if (password !== password2) {
    errorEl.textContent = 'Пароли не совпадают';
    errorEl.style.display = 'block';
    return;
  }
  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.some(u => u.username === username)) {
    errorEl.textContent = 'Логин уже занят';
    errorEl.style.display = 'block';
    return;
  }
  users.push({ email, username, password });
  localStorage.setItem('users', JSON.stringify(users));
  currentUser = { username };
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  closeRegisterModal();
  updateAuthUI();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLoginModal();
    closeRegisterModal();
    closeModal(); 
  }
});


document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

  document.getElementById('loginBtn')?.addEventListener('click', openLoginModal);
  document.getElementById('registerBtn')?.addEventListener('click', openRegisterModal);
});


function openAddModal() {
  document.getElementById('addModal').style.display = 'flex';
  document.getElementById('addError').style.display = 'none';
}

function closeAddModal() {
  document.getElementById('addModal').style.display = 'none';
  document.getElementById('addError').style.display = 'none';
}

document.getElementById('addTrackBtn')?.addEventListener('click', openAddModal);

document.getElementById('addForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const query = document.getElementById('addQuery').value.trim();
  const type = document.getElementById('addType').value;

  if (!query.includes('—') && !query.includes('-')) {
    showError('Введите в формате: Исполнитель — Название');
    return;
  }

  const parts = query.split(/—|-/).map(s => s.trim());
  const artist = parts[0];
  const title = parts.slice(1).join(' ').trim();

  if (!artist || !title) {
    showError('Укажите и исполнителя, и название');
    return;
  }

  if (resultsContainer.querySelector('.empty')) {
    resultsContainer.innerHTML = '<p>Загрузка...</p>';
  }

  if (type === 'album') {
    fetchAlbum(artist, title);
  } else {
    fetchTrack(artist, title);
  }

  closeAddModal();
});

function showError(message) {
  const errorEl = document.getElementById('addError');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAddModal();
  }
});