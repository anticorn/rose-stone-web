import React, { useState } from 'react';

interface IconPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (icon: string) => void;
  currentIcon: string;
  isDarkMode: boolean;
}

const availableIcons = [
  '🍕', '🍔', '🍟', '🌮', '🍜', '🍱', '🍰', '☕', '🥤', '🍺',
  '🚗', '🚌', '🚕', '🚲', '✈️', '🚇', '⛽', '🅿️', '🚢', '🚁',
  '🛍️', '👕', '👖', '👟', '👜', '💄', '💍', '⌚', '📱', '💻',
  '🎬', '🎮', '🎵', '🎨', '📚', '🎪', '🎭', '🎯', '🎲', '🎸',
  '💡', '🔌', '📺', '❄️', '🔥', '💧', '🏠', '🏢', '🏪', '🏦',
  '🏥', '💊', '🩺', '🧴', '🦷', '👁️', '🩹', '💉', '🩸', '🧬',
  '📝', '📄', '📊', '📈', '📉', '💰', '💳', '🏧', '💎', '🎁',
  '🎂', '🎈', '🎉', '🎊', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️',
  '🌍', '🌎', '🌏', '🗺️', '🏔️', '🌋', '🏖️', '🏝️', '🏜️', '🏞️',
  '🐕', '🐈', '🐢', '🐠', '🐦', '🐝', '🦋', '🐛', '🐞', '🦗'
];

export const IconPicker: React.FC<IconPickerProps> = ({
  isVisible,
  onClose,
  onSelect,
  currentIcon,
  isDarkMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const textStyle = {
    color: isDarkMode ? '#f1f5f9' : '#0f172a',
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
  };

  const filteredIcons = availableIcons.filter(icon =>
    icon.includes(searchTerm) || 
    // You could add more sophisticated search here
    searchTerm === ''
  );

  const handleIconSelect = (icon: string) => {
    onSelect(icon);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content icon-picker-modal" style={cardStyle}>
        <h3 className="modal-title" style={textStyle}>Choose an Icon</h3>
        
        <div className="icon-search">
          <input
            type="text"
            className="form-input"
            style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="icon-grid">
          {filteredIcons.map((icon, index) => (
            <button
              key={index}
              className={`icon-option ${currentIcon === icon ? 'selected' : ''}`}
              onClick={() => handleIconSelect(icon)}
              style={{
                backgroundColor: currentIcon === icon 
                  ? (isDarkMode ? '#334155' : '#e2e8f0') 
                  : 'transparent',
                borderColor: isDarkMode ? '#334155' : '#e2e8f0'
              }}
            >
              <span className="icon-display">{icon}</span>
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button
            className="modal-button cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
