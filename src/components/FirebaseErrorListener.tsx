
'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export const FirebaseErrorListener: React.FC = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Contextual Firestore Error:', error);
      
      const readablePath = error.context.path.split('/').join(' / ');
      
      toast({
        variant: 'destructive',
        title: 'Firestore Permission Error',
        description: (
          <div className="text-xs">
            <p>The following request was denied by security rules:</p>
            <ul className="mt-2 list-disc list-inside">
              <li><strong>Operation:</strong> {error.context.operation}</li>
              <li><strong>Path:</strong> {readablePath}</li>
              {error.context.requestResourceData && (
                <li><strong>Data:</strong> <pre className="whitespace-pre-wrap">{JSON.stringify(error.context.requestResourceData, null, 2)}</pre></li>
              )}
            </ul>
            <p className="mt-2">Check your browser console and Firestore security rules.</p>
          </div>
        ),
        duration: 20000,
      });

      // For Next.js development overlay
      if (process.env.NODE_ENV === 'development') {
          throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
};
