"use client";

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-right" 
      toastOptions={{
        duration: 4000,
        success: {
          style: {
            background: '#ECFDF5',
            color: '#047857',
            border: '1px solid #D1FAE5',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#ECFDF5',
          }
        },
        error: {
          style: {
            background: '#FFF1F2',
            color: '#BE123C',
            border: '1px solid #FFE4E6',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#F43F5E',
            secondary: '#FFF1F2',
          }
        }
      }} 
    />
  );
}
