import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TimeProviderProps {
  children : ReactNode;
}

const TimeContext = createContext({
  checkInTime: null as Date | null,
  setCheckInTime: (date: Date | null) => {},
  checkOutTime: null as Date | null,
  setCheckOutTime: (date: Date | null) => {}
});


export const  TimeProvider:  React.FC<TimeProviderProps> = ({ children }) => {
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);

  return (
    <TimeContext.Provider value={{ checkInTime, setCheckInTime, checkOutTime, setCheckOutTime}}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTime = () => useContext(TimeContext);