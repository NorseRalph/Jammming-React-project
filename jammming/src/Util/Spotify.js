let accessToken;
const clientId = '57dc91ca9d1a404e8cabb4f5fef89bfe'
const redirectUri = 'http://localhost:3000/callback/';
const Spotify = {

    async search(term) {
        const accessToken = Spotify.getAccessToken();
         const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const jsonResponse = await response.json();
        if (!jsonResponse.tracks) {
            return [];
        }
        return jsonResponse.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
        }));
     },

    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/)
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/)
    

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1])
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;

        }

    },

    async savePlaylist(playlistName, tracksUri) {
        if (!(playlistName && tracksUri)) return;
    
        let userId = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((response) => response.json())
          .then((jsonResponse) => jsonResponse.id)
          .catch((error) => {
            console.log("User id Fetch error");
          });
    
        
        let playlistId = await fetch(
          `https://api.spotify.com/v1/users/${userId}/playlists`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: playlistName,
            }),
            json: true,
          }
        )
          .then((response) => response.json())
          .then((jsonResponse) => jsonResponse.id)
          .catch((error) => {
            console.log("Create Playlist error");
          });
    
        await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: tracksUri,
          }),
        })
          .then((response) => {
            console.log("Songs added to playlist");
          })
          .catch((error) => {
            console.log("Fetch error while adding songs to the playlist");
          });
      },
    };

export default Spotify;