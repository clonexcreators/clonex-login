/**
 * CloneX Avatar Picker Component
 * Modal for selecting NFT avatars from user's collection
 * Version: 1.0.0
 * Phase: 2.2 - Avatar Picker & Uploader
 */

import React, { useState, useEffect } from 'react';
import { avatarService, AvatarOption, NFTAvatar } from '../../services/avatarService';

interface AvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nft: NFTAvatar) => void;
  walletAddress: string;
  currentAvatarId?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  walletAddress,
  currentAvatarId
}) => {
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewNFT, setPreviewNFT] = useState<NFTAvatar | null>(null);

  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchAvatars();
    }
  }, [isOpen, walletAddress]);

  useEffect(() => {
    if (currentAvatarId) {
      setSelectedId(currentAvatarId);
    }
  }, [currentAvatarId]);

  const fetchAvatars = async () => {
    setLoading(true);
    setError(null);

    try {
      const options = await avatarService.getAvatarOptions(walletAddress);
      setAvatars(options);

      if (options.length === 0) {
        setError('No eligible NFTs found in your collection');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load avatars');
      console.error('Avatar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (avatar: AvatarOption) => {
    setSelectedId(avatar.id);
    setPreviewNFT(avatar.nft);
  };

  const handleConfirm = () => {
    if (previewNFT) {
      onSelect(previewNFT);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    setPreviewNFT(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose NFT Avatar</h2>
              <p className="text-sm text-gray-600 mt-1">
                Select from your CloneX or Animus collection
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading your NFTs...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium mb-2">{error}</p>
                <button
                  onClick={fetchAvatars}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && avatars.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No NFTs Available</h3>
                <p className="text-gray-600">
                  You need at least one CloneX or Animus NFT to use as an avatar
                </p>
              </div>
            )}

            {/* Avatar Grid */}
            {!loading && !error && avatars.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {avatars.length} NFT{avatars.length !== 1 ? 's' : ''} available
                  </p>
                  {selectedId && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {avatars.map((avatar) => {
                    const isSelected = avatar.id === selectedId;
                    const isCurrent = avatar.id === currentAvatarId;

                    return (
                      <button
                        key={avatar.id}
                        onClick={() => handleSelect(avatar)}
                        className={`relative group aspect-square rounded-xl overflow-hidden transition-all ${
                          isSelected
                            ? 'ring-4 ring-blue-500 ring-offset-2'
                            : 'hover:ring-2 hover:ring-gray-300'
                        }`}
                      >
                        {/* NFT Image */}
                        <img
                          src={avatar.thumbnailUrl}
                          alt={avatar.nft.displayName || avatar.nft.name || 'NFT'}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-xs font-semibold truncate">
                              {avatar.nft.displayName || avatar.nft.name || `#${avatar.nft.tokenId}`}
                            </p>
                            <p className="text-white/80 text-xs capitalize">
                              {avatar.nft.collection}
                            </p>
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}

                        {/* Current Badge */}
                        {isCurrent && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            Current
                          </div>
                        )}

                        {/* Ownership Badge */}
                        {avatar.nft.ownershipType === 'delegated' && (
                          <div className="absolute bottom-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            Delegated
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Preview Section */}
                {previewNFT && (
                  <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <img
                        src={previewNFT.image || ''}
                        alt={previewNFT.displayName || 'Preview'}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {previewNFT.displayName || previewNFT.name || `#${previewNFT.tokenId}`}
                        </h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {previewNFT.collection} • {previewNFT.ownershipType}
                        </p>
                      </div>
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedId || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select Avatar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvatarPicker;
