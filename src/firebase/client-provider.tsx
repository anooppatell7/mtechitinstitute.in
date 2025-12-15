
'use client';

import React from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { auth, db, storage, app } from '@/firebase';

export const FirebaseClientProvider = ({ children }: { children: React.ReactNode }) => {
  const firebaseServices = { app, auth, db, storage };

  return <FirebaseProvider value={firebaseServices}>{children}</FirebaseProvider>;
};
