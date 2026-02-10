'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { RegistryPackage } from '@/app/market/types';
import ToolSelector from './ToolSelector';
import McpSelector from './McpSelector';
import SkillSelector from './SkillSelector';
import TokenInput from './TokenInput';
import ConfigOutput from './ConfigOutput';
import CliCommand from './CliCommand';

interface SetupStepperProps {
  packages: RegistryPackage[];
}

const STEPS = [
  { number: 1, label: '도구 선택' },
  { number: 2, label: 'MCP 선택' },
  { number: 3, label: 'Skill 선택' },
  { number: 4, label: '토큰 입력' },
  { number: 5, label: '설정 완료' },
];

export default function SetupStepper({ packages }: SetupStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedMcps, setSelectedMcps] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [envValues, setEnvValues] = useState<
    Record<string, Record<string, string>>
  >({});

  // Initialize env values with defaults when MCPs change
  const handleMcpChange = useCallback(
    (mcps: string[]) => {
      setSelectedMcps(mcps);

      // Pre-fill defaults for newly selected MCPs
      const newEnvValues = { ...envValues };
      for (const mcpId of mcps) {
        if (!newEnvValues[mcpId]) {
          const pkg = packages.find((p) => p.id === mcpId);
          if (pkg?.envFields) {
            const defaults: Record<string, string> = {};
            for (const field of pkg.envFields) {
              if (field.default) {
                defaults[field.key] = field.default;
              }
            }
            newEnvValues[mcpId] = defaults;
          }
        }
      }
      setEnvValues(newEnvValues);
    },
    [envValues, packages]
  );

  // When tool selection changes, clean up incompatible MCP/Skill selections
  const handleToolChange = useCallback(
    (tools: string[]) => {
      setSelectedTools(tools);

      // Remove MCPs that are no longer compatible with any selected tool
      setSelectedMcps((prev) =>
        prev.filter((mcpId) => {
          const pkg = packages.find((p) => p.id === mcpId);
          if (!pkg) return false;
          return tools.some((tool) => pkg.compatibility[tool]);
        })
      );

      // Remove Skills that are no longer compatible
      setSelectedSkills((prev) =>
        prev.filter((skillId) => {
          const pkg = packages.find((p) => p.id === skillId);
          if (!pkg) return false;
          return tools.some((tool) => pkg.compatibility[tool]);
        })
      );
    },
    [packages]
  );

  const canProceed = () => {
    if (currentStep === 1) return selectedTools.length > 0;
    return true;
  };

  const goNext = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <nav className="flex items-center justify-center">
        <ol className="flex items-center gap-0">
          {STEPS.map((step, idx) => (
            <li key={step.number} className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  // Only allow jumping to completed steps or the current step
                  if (step.number <= currentStep) {
                    setCurrentStep(step.number);
                  }
                }}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors sm:px-3',
                  step.number === currentStep
                    ? 'text-neutral-50'
                    : step.number < currentStep
                      ? 'cursor-pointer text-neutral-400 hover:text-neutral-200'
                      : 'cursor-default text-neutral-600'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                    step.number === currentStep
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : step.number < currentStep
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                        : 'border-neutral-700 bg-neutral-800 text-neutral-500'
                  )}
                >
                  {step.number < currentStep ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-px w-6 sm:w-10',
                    step.number < currentStep
                      ? 'bg-emerald-500/40'
                      : 'bg-neutral-800'
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {currentStep === 1 && (
          <ToolSelector selected={selectedTools} onChange={handleToolChange} />
        )}
        {currentStep === 2 && (
          <McpSelector
            packages={packages}
            selectedTools={selectedTools}
            selected={selectedMcps}
            onChange={handleMcpChange}
          />
        )}
        {currentStep === 3 && (
          <SkillSelector
            packages={packages}
            selectedTools={selectedTools}
            selected={selectedSkills}
            onChange={setSelectedSkills}
          />
        )}
        {currentStep === 4 && (
          <TokenInput
            packages={packages}
            selectedMcps={selectedMcps}
            envValues={envValues}
            onChange={setEnvValues}
          />
        )}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-50">
                설정이 완료되었습니다
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                아래 설정을 복사하여 프로젝트에 적용하세요
              </p>
            </div>

            <ConfigOutput
              packages={packages}
              selectedTools={selectedTools}
              selectedMcps={selectedMcps}
              envValues={envValues}
            />

            <CliCommand selectedSkills={selectedSkills} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-neutral-800 pt-6">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={currentStep === 1}
          className="gap-2 text-neutral-400 hover:text-neutral-100 disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" />
          이전
        </Button>

        <span className="text-xs text-neutral-600">
          {currentStep} / {STEPS.length}
        </span>

        {currentStep < 5 ? (
          <Button
            onClick={goNext}
            disabled={!canProceed()}
            className="gap-2 bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-30"
          >
            다음
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-20" />
        )}
      </div>
    </div>
  );
}
