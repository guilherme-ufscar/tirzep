'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Locality = 'bh' | 'fora';

interface LocalityContextType {
    locality: Locality;
    setLocality: (l: Locality) => void;
}

const LocalityContext = createContext<LocalityContextType>({
    locality: 'bh',
    setLocality: () => { },
});

export function LocalityProvider({ children }: { children: ReactNode }) {
    const [locality, setLocalityState] = useState<Locality>('bh');

    useEffect(() => {
        const saved = localStorage.getItem('tg_locality') as Locality | null;
        if (saved === 'bh' || saved === 'fora') setLocalityState(saved);
    }, []);

    const setLocality = useCallback((l: Locality) => {
        setLocalityState(l);
        localStorage.setItem('tg_locality', l);
    }, []);

    return (
        <LocalityContext.Provider value={{ locality, setLocality }}>
            {children}
        </LocalityContext.Provider>
    );
}

export function useLocality() {
    return useContext(LocalityContext);
}
