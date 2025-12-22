window.app.ui = {
  savedCards: JSON.parse(localStorage.getItem('lastfmCards')) || [],

  saveCards() {
    localStorage.setItem('lastfmCards', JSON.stringify(this.savedCards));
  },

  getCoverImage(imageArray) {
    if (!imageArray) return 'https://via.placeholder.com/180?text=No+Cover';
    const imgObj = imageArray.find(img => img.size === 'extralarge');
    return imgObj && imgObj['#text'] ? imgObj['#text'] : 'https://via.placeholder.com/180?text=No+Cover';
  },

  renderAlbum(album) {
    const cover = this.getCoverImage(album.image);
    const name = album.name || 'Без названия';
    const artist = album.artist || 'Неизвестный';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-delete" onclick="event.stopPropagation(); window.app.ui.removeCard(this)">×</div>
      <img src="${cover}" onerror="this.src='https://via.placeholder.com/180?text=No+Cover'" />
      <h3>${name}</h3>
      <p>${artist}</p>
    `;
    card.onclick = () => window.app.ui.openAlbumModal(album);

    document.getElementById('results').appendChild(card);

    this.savedCards.push({ type: 'album', artist, title: name, image: cover, data: album });
    this.saveCards();
  },

  renderTrack(track) {
    const cover = this.getCoverImage(track.album?.image || track.image);
    const name = track.name || 'Без названия';
    const artist = track.artist?.name || 'Неизвестный';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-delete" onclick="event.stopPropagation(); window.app.ui.removeCard(this)">×</div>
      <img src="${cover}" onerror="this.src='https://via.placeholder.com/180?text=No+Cover'" />
      <h3>${name}</h3>
      <p>${artist}</p>
    `;
    card.onclick = () => window.app.ui.openTrackModal(track);

    document.getElementById('results').appendChild(card);

    this.savedCards.push({ type: 'track', artist, title: name, image: cover, data: track });
    this.saveCards();
  },

  removeCard(btn) {
    const card = btn.closest('.card');
    if (!card) return;

    const artist = card.querySelector('p').textContent;
    const title = card.querySelector('h3').textContent;

    this.savedCards = this.savedCards.filter(item =>
      !(item.artist === artist && item.title === title)
    );
    this.saveCards();

    card.remove();

    if (document.getElementById('results').children.length === 0) {
      document.getElementById('results').innerHTML = '<p class="empty">Добавьте свой первый альбом или трек!</p>';
    }
  },


  openAlbumModal(album) {
    const cover = this.getCoverImage(album.image);
    const fullDesc = album.wiki?.content || 'Описание недоступно.';
    const url = album.url || '#';
    let tracklist = '';
    if (album.tracks?.track) {
      const tracks = Array.isArray(album.tracks.track) ? album.tracks.track : [album.tracks.track];
      tracklist = `<h3>Трек-лист:</h3><ol>${tracks.map(t => `<li>${t.name}</li>`).join('')}</ol>`;
    }
    document.getElementById('modalContent').innerHTML = `
      <img src="${cover}" style="float:right; width:130px; height:130px; object-fit:cover; margin:0 0 15px 15px;" onerror="this.style.display='none'"/>
      <h2>${album.artist} — ${album.name}</h2>
      <p>${fullDesc}</p>
      ${tracklist}
      <p><a href="${url}" target="_blank">Послушать на Last.fm</a></p>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
  },

 
  openTrackModal(track) {
    const cover = this.getCoverImage(track.album?.image || track.image);
    const fullDesc = track.wiki?.content || 'Описание недоступно.';
    const url = track.url || '#';
    document.getElementById('modalContent').innerHTML = `
      <img src="${cover}" style="float:right; width:130px; height:130px; object-fit:cover; margin:0 0 15px 15px;" onerror="this.style.display='none'"/>
      <h2>${track.artist.name} — ${track.name}</h2>
      <p>${fullDesc}</p>
      <p><a href="${url}" target="_blank">Послушать на Last.fm</a></p>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
  },


  closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
  },


  loadSavedCards() {
    const container = document.getElementById('results');
    if (this.savedCards.length === 0) {
      container.innerHTML = '<p class="empty">Добавьте свой первый альбом или трек!</p>';
      return;
    }

    container.innerHTML = '';
    this.savedCards.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-delete" onclick="event.stopPropagation(); window.app.ui.removeCard(this)">×</div>
        <img src="${item.image}" onerror="this.src='https://via.placeholder.com/180?text=No+Cover'" />
        <h3>${item.title}</h3>
        <p>${item.artist}</p>
      `;

      if (item.type === 'album') {
        card.onclick = () => this.openAlbumModal(item.data);
      } else {
        card.onclick = () => this.openTrackModal(item.data);
      }

      container.appendChild(card);
    });
  }
};