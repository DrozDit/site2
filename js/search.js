window.app.search = {
  isSuggestionOpen: false,

  init() {
    const input = document.getElementById('addQuery');
    const suggestionsBox = document.getElementById('suggestions');


    input?.addEventListener('input', () => {
      const query = input.value.trim();
      clearTimeout(input.debounceTimer);

      if (query.length < 2) {
        suggestionsBox.style.display = 'none';
        this.isSuggestionOpen = false;
        return;
      }

      input.debounceTimer = setTimeout(async () => {
        const artists = await window.app.api.fetchArtistSuggestions(query);
        suggestionsBox.innerHTML = '';

        if (artists.length > 0) {
          artists.forEach(artist => {
            const div = document.createElement('div');
            div.textContent = artist.name;
            div.onclick = () => {
              input.value = artist.name;
              suggestionsBox.style.display = 'none';
              this.isSuggestionOpen = false;
            };
            suggestionsBox.appendChild(div);
          });
          suggestionsBox.style.display = 'block';
          this.isSuggestionOpen = true;
        } else {
          suggestionsBox.style.display = 'none';
          this.isSuggestionOpen = false;
        }
      }, 300);
    });


    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = 'none';
        this.isSuggestionOpen = false;
      }
    });


    document.getElementById('addForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.isSuggestionOpen) return;

      const query = input.value.trim();
      const type = document.getElementById('addType').value;
      const errorEl = document.getElementById('addError');

      if (!query.includes('—') && !query.includes('-')) {
        errorEl.textContent = 'Формат: Исполнитель — Название';
        errorEl.style.display = 'block';
        return;
      }

      const parts = query.split(/—|-/).map(s => s.trim());
      const artist = parts[0];
      const title = parts.slice(1).join(' ').trim();

      if (!artist || !title) {
        errorEl.textContent = 'Укажите исполнителя и название';
        errorEl.style.display = 'block';
        return;
      }

      errorEl.style.display = 'none';
      document.getElementById('results').innerHTML = '<p>Загрузка...</p>';

      if (type === 'album') {
        this.searchAlbum(artist, title);
      } else {
        this.searchTrack(artist, title);
      }

      document.getElementById('addModal').style.display = 'none';
    });
  },

  async searchAlbum(artist, album) {
    try {
      const data = await window.app.api.fetchAlbum(artist, album);
      if (data.error) throw new Error(data.message);
      window.app.ui.renderAlbum(data.album);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
      if (document.querySelector('.empty') === null) {
        document.getElementById('results').innerHTML = '<p class="empty">Добавьте свой первый альбом или трек!</p>';
      }
    }
  },

  async searchTrack(artist, track) {
    try {
      const data = await window.app.api.fetchTrack(artist, track);
      if (data.error) throw new Error(data.message);
      window.app.ui.renderTrack(data.track);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
      if (document.querySelector('.empty') === null) {
        document.getElementById('results').innerHTML = '<p class="empty">Добавьте свой первый альбом или трек!</p>';
      }
    }
  },


  closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('addError').style.display = 'none';
  },

  openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('addError').style.display = 'none';
  }
};