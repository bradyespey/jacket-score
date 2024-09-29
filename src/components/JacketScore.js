import React from 'react';

const JacketScore = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 75) return 'bg-blue-700';
    if (score >= 50) return 'bg-blue-500';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-lg mt-4">
      <div className="w-full bg-gray-300 rounded h-6">
        <div
          className={`h-6 rounded ${getScoreColor()}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className="mt-2 text-center">{score}% chance you need a jacket</p>
    </div>
  );
};

export default JacketScore;