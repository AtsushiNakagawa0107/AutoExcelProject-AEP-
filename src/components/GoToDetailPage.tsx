import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GoToDetailPage.scss';

const GoToDetailPage: React.FC = () => {
  const navigate = useNavigate();

  const goToAutoExcelApp = () => {
    navigate('/auto-excel-app');
  };

  return (
    <div>
      <button className='detail-button' onClick={goToAutoExcelApp}>詳細表示</button>
    </div>
  );
}

export default GoToDetailPage;
