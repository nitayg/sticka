import React, { useEffect, useState } from 'react';
import { fetchAlbums, saveAlbum } from '../lib/dataService';

const AlbumHeaderActions = () => {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const getAlbums = async () => {
      const fetchedAlbums = await fetchAlbums();
      setAlbums(fetchedAlbums);
    };

    getAlbums();
  }, []);

  const handleSave = async () => {
    const newAlbum = { id: '1', name: 'New Album', totalStickers: 100 };
    await saveAlbum(newAlbum);
    const updatedAlbums = await fetchAlbums();
    setAlbums(updatedAlbums);
  };

  return (
    <div>
      <button onClick={handleSave}>Save Album</button>
      <ul>
        {albums.map(album => (
          <li key={album.id}>{album.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AlbumHeaderActions;
