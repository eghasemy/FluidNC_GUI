import React, { useMemo } from 'react';
import { FluidNCConfig, diffConfigurations, formatValue, formatPath, toYAML } from '@fluidnc-gui/core';
import './YamlDiffViewer.css';

export interface YamlDiffViewerProps {
  beforeConfig: FluidNCConfig;
  afterConfig: FluidNCConfig;
  title?: string;
}

export const YamlDiffViewer: React.FC<YamlDiffViewerProps> = ({
  beforeConfig,
  afterConfig,
  title = "Configuration Diff"
}) => {
  const { diffs, beforeYaml, afterYaml } = useMemo(() => {
    const configDiffs = diffConfigurations(beforeConfig, afterConfig);
    const beforeYamlText = toYAML(beforeConfig);
    const afterYamlText = toYAML(afterConfig);
    
    return {
      diffs: configDiffs,
      beforeYaml: beforeYamlText,
      afterYaml: afterYamlText
    };
  }, [beforeConfig, afterConfig]);

  const getDiffIcon = (type: string) => {
    switch (type) {
      case 'added': return '+';
      case 'removed': return '-';
      case 'changed': return '~';
      default: return '';
    }
  };

  const getDiffClass = (type: string) => {
    switch (type) {
      case 'added': return 'diff-added';
      case 'removed': return 'diff-removed';
      case 'changed': return 'diff-changed';
      default: return '';
    }
  };

  return (
    <div className="yaml-diff-viewer">
      <div className="diff-header">
        <h3>{title}</h3>
        <div className="diff-summary">
          {diffs.length === 0 ? (
            <span className="no-changes">No changes detected</span>
          ) : (
            <span className="changes-count">
              {diffs.length} change{diffs.length === 1 ? '' : 's'} detected
            </span>
          )}
        </div>
      </div>

      {diffs.length > 0 && (
        <div className="diff-changes">
          <div className="changes-header">
            <h4>Changes Summary</h4>
          </div>
          <div className="changes-list">
            {diffs.map((diff, index) => (
              <div key={index} className={`change-item ${getDiffClass(diff.type)}`}>
                <div className="change-icon">
                  {getDiffIcon(diff.type)}
                </div>
                <div className="change-details">
                  <div className="change-path">
                    <code>{formatPath(diff.path)}</code>
                  </div>
                  <div className="change-values">
                    {diff.type === 'added' && (
                      <div className="value-new">
                        Added: <code>{formatValue(diff.newValue)}</code>
                      </div>
                    )}
                    {diff.type === 'removed' && (
                      <div className="value-old">
                        Removed: <code>{formatValue(diff.oldValue)}</code>
                      </div>
                    )}
                    {diff.type === 'changed' && (
                      <>
                        <div className="value-old">
                          From: <code>{formatValue(diff.oldValue)}</code>
                        </div>
                        <div className="value-new">
                          To: <code>{formatValue(diff.newValue)}</code>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="diff-yaml-view">
        <div className="yaml-section">
          <div className="yaml-header">
            <h4>Before</h4>
          </div>
          <pre className="yaml-content">
            <code>{beforeYaml}</code>
          </pre>
        </div>
        
        <div className="yaml-section">
          <div className="yaml-header">
            <h4>After</h4>
          </div>
          <pre className="yaml-content">
            <code>{afterYaml}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};