import React from 'react';
import './LoadingModal.scss';

interface ModalProps {
  loading: boolean;
  progress: number;
  completed: boolean;
  message: string;
}

const LoadingModal: React.FC<ModalProps> = ({ loading, progress, completed, message }) => {
  if (!loading) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        {!completed ? (
          <>
            <p>{message}</p>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </>
        ) : (
          <p className="modal-completed">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingModal;
