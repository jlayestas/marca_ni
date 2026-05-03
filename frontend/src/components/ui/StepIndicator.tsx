import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  currentStep: number
  steps: string[]
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center w-full mb-8">
      {steps.map((label, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep

        return (
          <div key={stepNum} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                  isCompleted && 'border-navy bg-navy text-white',
                  isActive && 'border-navy bg-white text-navy shadow-md',
                  !isCompleted && !isActive && 'border-gray-300 bg-white text-gray-400'
                )}
              >
                {isCompleted ? <Check size={16} strokeWidth={2.5} /> : stepNum}
              </div>
              <span
                className={cn(
                  'mt-1.5 text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-navy' : isCompleted ? 'text-navy/70' : 'text-gray-400'
                )}
              >
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mb-5 transition-all',
                  isCompleted ? 'bg-navy' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
