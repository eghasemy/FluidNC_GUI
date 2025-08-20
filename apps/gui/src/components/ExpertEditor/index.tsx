import React, { useState } from 'react';
import { FluidNCConfig } from '@fluidnc-gui/core';
import { ConfigTree } from './ConfigTree';
import { ConfigForm } from './ConfigForm';
import { ConfigActions } from './ConfigActions';
import './ExpertEditor.css';

export interface ExpertEditorProps {
  config: FluidNCConfig;
  onConfigChange: (config: FluidNCConfig) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const ExpertEditor: React.FC<ExpertEditorProps> = ({
  config,
  onConfigChange,
  onValidationChange,
}) => {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  return (
    <div className="expert-editor">
      <div className="expert-editor-header">
        <h2>Expert Configuration Editor</h2>
        <p>Edit any configuration key using schema-driven forms</p>
      </div>
      
      <ConfigActions 
        config={config}
        onConfigChange={onConfigChange}
      />
      
      <div className="expert-editor-content">
        <div className="expert-editor-tree">
          <ConfigTree
            config={config}
            selectedPath={selectedPath}
            onPathSelect={setSelectedPath}
          />
        </div>
        
        <div className="expert-editor-form">
          <ConfigForm
            config={config}
            selectedPath={selectedPath}
            onConfigChange={onConfigChange}
            {...(onValidationChange && { onValidationChange })}
          />
        </div>
      </div>
    </div>
  );
};