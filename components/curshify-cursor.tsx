'use client'; // Ensure this is a client component
import { useEffect } from 'react';

const CurshifyCursor = () => {
  useEffect(() => {
    // Create the cursor element
    const cursor = document.createElement('div');
    cursor.className = 'curshify-cursor'; // Use the CSS class defined in globals.css
    document.body.appendChild(cursor);

    const updateCursor = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', updateCursor);

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      document.body.removeChild(cursor);
    };
  }, []);

  return null; // This component does not render anything visible
};

export default CurshifyCursor; 