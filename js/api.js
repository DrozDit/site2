window.app.api = {
  async fetchArtistSuggestions(query) {
    const { API_KEY, BASE_URL } = window.app.config;
    try {
      const url = `${BASE_URL}?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=5`;
      const response = await fetch(url);
      const data = await response.json();
      return data.results?.artistmatches?.artist || [];
    } catch (err) {
      console.error('API Error (artist search):', err);
      return [];
    }
  },



  async fetchAlbum(artist, album) {
    const { API_KEY, BASE_URL } = window.app.config;
    try {
      const url = `${BASE_URL}?method=album.getinfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&api_key=${API_KEY}&format=json&lang=ru`;
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      console.error('API Error (album):', err);
      throw err;
    }
  },



  async fetchTrack(artist, track) {
    const { API_KEY, BASE_URL } = window.app.config;
    try {
      const url = `${BASE_URL}?method=track.getinfo&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${API_KEY}&format=json&lang=ru`;
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      console.error('API Error (track):', err);
      throw err;
    }
  }
};