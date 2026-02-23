"use client";
import { useUser } from "./hooks/UseUser";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PositionSelector from './components/PositionSelector';
import VideoAnalysis from './components/VideoAnalysis';
import StatInput from './components/StatInput';
import RatingResult from './components/RatingResult';


export default function Home() {
  const user = useUser();
  const router = useRouter();
  const [step, setStep] = useState('position');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [prefillStats, setPrefillStats] = useState({});
  const [stats, setStats] = useState(null);

useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  if (!user) return null;

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
    setStep('video');                  // ← go to video analysis first
  };

  const handleStatsExtracted = (extractedStats) => {
    setPrefillStats(extractedStats);   // ← pre-fill StatInput with AI stats
    setStep('stats');
  };

  const handleSkipVideo = () => {
    setPrefillStats({});               // ← no pre-fill, manual entry
    setStep('stats');
  };

  const handleStatsComplete = (statValues) => {
    setStats(statValues);
    setStep('result');
  };

  const handleReset = () => {
    setStep('position');
    setSelectedPosition(null);
    setPrefillStats({});
    setStats(null);
  };

  const handleBackToPosition = () => {
    setStep('position');
    setSelectedPosition(null);
    setPrefillStats({});
  };

  if (step === 'position') {
    return <PositionSelector onSelect={handlePositionSelect} />;
  }

  if (step === 'video') {
    return (
      <VideoAnalysis
        position={selectedPosition}
        onStatsExtracted={handleStatsExtracted}
        onSkip={handleSkipVideo}
      />
    );
  }

  if (step === 'stats') {
    return (
      <StatInput
        position={selectedPosition}
        initialValues={prefillStats}   // ← StatInput uses this to seed values
        onComplete={handleStatsComplete}
        onPrev={() => setStep('video')}
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