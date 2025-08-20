import React, { useState } from 'react';
import { FluidNCConfig } from '@fluidnc-gui/core';

export interface ConfigTreeProps {
  config: FluidNCConfig;
  selectedPath: string[];
  onPathSelect: (path: string[]) => void;
}

interface TreeNode {
  key: string;
  value: unknown;
  children?: TreeNode[];
  isExpanded?: boolean;
}

export const ConfigTree: React.FC<ConfigTreeProps> = ({
  config,
  selectedPath,
  onPathSelect,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['']));

  const buildTree = (obj: unknown, path: string[] = []): TreeNode[] => {
    if (typeof obj !== 'object' || obj === null) {
      return [];
    }

    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...path, key];
      const pathKey = currentPath.join('.');
      
      return {
        key,
        value,
        children: (typeof value === 'object' && value !== null) 
          ? buildTree(value, currentPath) 
          : undefined,
        isExpanded: expandedPaths.has(pathKey),
      } as TreeNode;
    });
  };

  const toggleExpanded = (path: string[]) => {
    const pathKey = path.join('.');
    const newExpanded = new Set(expandedPaths);
    
    if (newExpanded.has(pathKey)) {
      newExpanded.delete(pathKey);
    } else {
      newExpanded.add(pathKey);
    }
    
    setExpandedPaths(newExpanded);
  };

  const isSelected = (path: string[]) => {
    return path.join('.') === selectedPath.join('.');
  };

  const renderNode = (node: TreeNode, path: string[] = []): React.ReactNode => {
    const currentPath = [...path, node.key];
    const hasChildren = node.children && node.children.length > 0;
    const isNodeExpanded = expandedPaths.has(currentPath.join('.'));
    const selected = isSelected(currentPath);

    return (
      <div key={currentPath.join('.')} className="tree-node">
        <div 
          className={`tree-node-label ${selected ? 'selected' : ''}`}
          onClick={() => onPathSelect(currentPath)}
        >
          {hasChildren && (
            <button
              className="tree-node-toggle"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(currentPath);
              }}
            >
              {isNodeExpanded ? '▼' : '▶'}
            </button>
          )}
          <span className="tree-node-key">{node.key}</span>
          {!hasChildren && (
            <span className="tree-node-value">
              {typeof node.value === 'string' 
                ? `"${node.value}"` 
                : String(node.value)
              }
            </span>
          )}
        </div>
        
        {hasChildren && isNodeExpanded && (
          <div className="tree-node-children">
            {node.children!.map(child => renderNode(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(config);

  return (
    <div className="config-tree">
      <div className="tree-header">
        <h3>Configuration Structure</h3>
        <button
          className="tree-add-key"
          onClick={() => onPathSelect([])}
        >
          + Add Root Key
        </button>
      </div>
      
      <div className="tree-content">
        {tree.map(node => renderNode(node))}
      </div>
    </div>
  );
};