
import React from "react";

interface ValidationErrorProps {
  error: string;
}

const ValidationError = ({ error }: ValidationErrorProps) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 text-red-800 p-3 rounded-md text-right border border-red-200">
      {error}
    </div>
  );
};

export default ValidationError;
