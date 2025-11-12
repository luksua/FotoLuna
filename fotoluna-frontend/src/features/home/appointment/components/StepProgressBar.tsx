import React from "react";
import "../styles/progressBar.css";

interface StepProgressBarProps {
    currentStep: number;
    steps: string[];
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({ currentStep, steps }) => {
    return (
        <div className="step-progress-container">
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <div key={index} className="step-item">
                        {/* Línea conectora a la izquierda (menos en el primero) */}
                        {index > 0 && (
                            <div className={`step-line ${isCompleted ? "completed" : ""}`}></div>
                        )}

                        {/* Círculo */}
                        <div
                            className={`step-circle ${isActive ? "active" : isCompleted ? "completed" : ""
                                }`}
                        >
                            {stepNumber}
                        </div>

                        {/* Etiqueta */}
                        <div
                            className={`step-label ${isActive ? "active-label" : isCompleted ? "completed-label" : ""
                                }`}
                        >
                            {label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StepProgressBar;
