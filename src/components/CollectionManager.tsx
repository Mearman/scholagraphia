import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PlusCircle, Trash2, Copy, Scissors, MoveRight, Share2 } from 'lucide-react';
import { generateShareableLink, generateShareableMultiCollectionLink } from '../utils/idSharing';

const CollectionManager: React.FC = () => {
  const {
    collections,
    setCollections,
    activeCollectionId,
    setActiveCollectionId,
    createNewCollection,
    mergeCollections,
    cloneCollection,
    splitCollection,
  } = useAppContext();

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const handleNameChange = (id: string, newName: string) => {
    setCollections(
      collections.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
    setIsEditing(null);
  };

  const handleDelete = (id: string) => {
    if (collections.length > 1) {
      setCollections(collections.filter((c) => c.id !== id));
      if (activeCollectionId === id) {
        setActiveCollectionId(collections.find((c) => c.id !== id)!.id);
      }
    } else {
      alert("You can't delete the last collection.");
    }
  };

  const handleMerge = () => {
    if (selectedCollections.length > 1) {
      mergeCollections(selectedCollections);
      setSelectedCollections([]);
    } else {
      alert('Please select at least two collections to merge.');
    }
  };

  const handleSplit = (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    if (collection && collection.entities.length > 1) {
      const halfLength = Math.ceil(collection.entities.length / 2);
      const entityIdsToSplit = collection.entities
        .slice(0, halfLength)
        .map((e) => e.id);
      splitCollection(collectionId, entityIdsToSplit);
    } else {
      alert('The collection must have at least two entities to split.');
    }
  };

  const handleShareCollection = (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    if (collection) {
      const ids = collection.entities.map(entity => entity.id);
      const link = generateShareableLink(ids, collection.name);
      navigator.clipboard.writeText(link).then(() => {
        alert(`Shareable link for "${collection.name}" copied to clipboard!`);
      }).catch(err => {
        console.error('Failed to copy link: ', err);
        alert('Failed to copy link. You can manually copy it from the console.');
        console.log('Shareable link:', link);
      });
    }
  };

  const handleShareAllCollections = () => {
    const collectionsData = collections.map(collection => ({
      name: collection.name,
      ids: collection.entities.map(entity => entity.id)
    }));
    const link = generateShareableMultiCollectionLink(collectionsData);
    navigator.clipboard.writeText(link).then(() => {
      alert('Shareable link for all collections copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      alert('Failed to copy link. You can manually copy it from the console.');
      console.log('Shareable link:', link);
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Collections</h2>
      <div className="space-y-2">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className={`flex items-center justify-between p-2 rounded ${
              activeCollectionId === collection.id
                ? 'bg-blue-100 dark:bg-blue-900'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCollections.includes(collection.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCollections([...selectedCollections, collection.id]);
                  } else {
                    setSelectedCollections(selectedCollections.filter((id) => id !== collection.id));
                  }
                }}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              {isEditing === collection.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleNameChange(collection.id, editName)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleNameChange(collection.id, editName);
                    }
                  }}
                  className="border rounded px-2 py-1 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  autoFocus
                />
              ) : (
                <span
                  onClick={() => {
                    setActiveCollectionId(collection.id);
                  }}
                  className="cursor-pointer text-gray-900 dark:text-white"
                >
                  {collection.name} ({collection.entities.length})
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsEditing(collection.id);
                  setEditName(collection.name);
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Edit
              </button>
              <button
                onClick={() => cloneCollection(collection.id)}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={() => handleSplit(collection.id)}
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
              >
                <Scissors size={18} />
              </button>
              <button
                onClick={() => handleShareCollection(collection.id)}
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(collection.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex space-x-4">
        <button
          onClick={createNewCollection}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
        >
          <PlusCircle size={18} className="mr-2" />
          New Collection
        </button>
        <button
          onClick={handleMerge}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
          disabled={selectedCollections.length < 2}
        >
          <MoveRight size={18} className="mr-2" />
          Merge Selected
        </button>
        <button
          onClick={handleShareAllCollections}
          className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors duration-200"
        >
          <Share2 size={18} className="mr-2" />
          Share All Collections
        </button>
      </div>
    </div>
  );
};

export default CollectionManager;