'use client';
import React from 'react';
import { useLocality } from '@/contexts/LocalityContext';
import { MapPin, Package } from 'lucide-react';

export default function LocalityBar() {
    const { locality, setLocality } = useLocality();

    return (
        <div className="locality-bar">
            <div className="locality-selector">
                <button
                    className={`locality-tab ${locality === 'bh' ? 'active' : ''}`}
                    onClick={() => setLocality('bh')}
                    id="locality-bh"
                >
                    <MapPin size={14} /> Sou de BH e região
                </button>
                <button
                    className={`locality-tab ${locality === 'fora' ? 'active' : ''}`}
                    onClick={() => setLocality('fora')}
                    id="locality-fora"
                >
                    <Package size={14} /> Sou de fora (outros estados)
                </button>
            </div>
        </div>
    );
}
