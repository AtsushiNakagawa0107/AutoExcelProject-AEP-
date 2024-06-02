import React from 'react';
import './LoadingModal.scss';

interface ModalProps {
  loading: boolean;
  progress: number;
  completed: boolean;
}

const LoadingModal: React.FC<ModalProps> = ({ loading, progress, completed }) => {
  if (!loading) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        {!completed ? (
          <>
            <p>処理中...</p>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </>
        ) : (
          <p className="modal-completed">送信が完了しました</p>
        )}
      </div>
    </div>
  );
};

export default LoadingModal;
