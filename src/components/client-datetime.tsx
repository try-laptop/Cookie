// src/components/client-datetime.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface ClientDateTimeProps {
  date: Date | string;
  dateFormat?: string;
}

export function ClientDateTime({ date, dateFormat = "MMMM d, yyyy 'at' h:mm a" }: ClientDateTimeProps) {
  const [mounted, setMounted] = useState(false);
  const [displayDate, setDisplayDate] = useState('');

  useEffect(() => {
    setMounted(true);
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
        setDisplayDate(format(parsedDate, dateFormat));
      } else {
        setDisplayDate('Invalid Date');
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      setDisplayDate('Error');
    }
  }, [date, dateFormat]);

  if (!mounted) {
    // Render a placeholder or nothing during server render / initial client render before hydration
    return null; 
  }

  return <>{displayDate}</>;
}
