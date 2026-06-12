"use client";
import { useUser } from "../hooks/UseUser";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PositionSelector from '../components/PositionSelector';
import StatInput from '../components/StatInput';
import RatingResult from '../components/RatingResult';

export default function NewMatch() {
  const user = useUser();
  const router = useRouter();
  const [step, setStep] = useState('position');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) router.push('/login');
  }, []);

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
    setStep('stats');
  };

  const handleStatsComplete = (statValues) => {
    setStats(statValues);
    setStep('result');
  };

  const handleReset = () => {
    setStep('position');
    setSelectedPosition(null);
    setStats(null);
  };

  if (step === 'position') {
    return <PositionSelector onSelect={handlePositionSelect} />;
  }

  if (step === 'stats') {
    return (
      <StatInput
        position={selectedPosition}
        onComplete={handleStatsComplete}
        onPrev={() => setStep('position')}
      />
    );
  }

  if (step === 'result') {
    return (
      <RatingResult
        position={selectedPosition}
        stats={stats}
        onReset={handleReset}
        user={user}
      />
    );
  }
}
