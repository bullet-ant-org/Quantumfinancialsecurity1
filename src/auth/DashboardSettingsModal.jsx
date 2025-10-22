import React, { useState, useEffect, useRef } from 'react';
import './DashboardSettingsModal.css';

const DashboardSettingsModal = ({ components, onSave, onClose }) => {
  const [localComponents, setLocalComponents] = useState([]);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    setLocalComponents([...components]);
  }, [components]);

  const handleVisibilityChange = (id) => {
    setLocalComponents(prev =>
      prev.map(c => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    const newComponents = [...localComponents];
    const draggedItemContent = newComponents.splice(dragItem.current, 1)[0];
    newComponents.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setLocalComponents(newComponents);
  };

  const handleSave = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSave = () => {
    onSave(localComponents);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Customize Dashboard</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <p className="settings-description">
            Toggle visibility and reorder the components on your dashboard.
          </p>
          <ul className="settings-list">
            {localComponents.map((component, index) => (
              <li
                key={component.id}
                className="settings-item"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <i className="bi bi-grip-vertical drag-handle"></i>
                <div className="settings-item-main">
                  <input type="checkbox" id={`vis-${component.id}`} checked={component.visible} onChange={() => handleVisibilityChange(component.id)} />
                  <label htmlFor={`vis-${component.id}`}>{component.title}</label>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="modal-footer">
          {!showConfirmation ? (
            <button onClick={handleSave} className="btn-save-settings">
              Save Changes
            </button>
          ) : (
            <div className="confirmation-view">
              <span>Are you sure?</span>
              <div className="confirmation-buttons">
                <button onClick={() => setShowConfirmation(false)} className="btn-setting-action btn-cancel">
                  Cancel
                </button>
                <button onClick={handleConfirmSave} className="btn-setting-action btn-confirm">
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSettingsModal;