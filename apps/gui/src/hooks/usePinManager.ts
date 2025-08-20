import { useMemo } from 'react';
import { 
  FluidNCConfig, 
  getPinStatus, 
  getPinConflicts, 
  extractAllPinAssignments,
  getBoardDescriptor,
  type PinStatus 
} from '@fluidnc-gui/core';

/**
 * Hook to manage pin status tracking and conflict detection
 */
export function usePinManager(config: FluidNCConfig) {
  // Get the board descriptor for pin validation
  const boardDescriptor = useMemo(() => {
    return config.board ? getBoardDescriptor(config.board) : undefined;
  }, [config.board]);

  // Get all pin assignments
  const pinAssignments = useMemo(() => {
    return extractAllPinAssignments(config);
  }, [config]);

  // Get all conflicts
  const pinConflicts = useMemo(() => {
    return getPinConflicts(config);
  }, [config]);

  // Check if a specific pin has conflicts
  const hasPinConflicts = useMemo(() => {
    return Object.keys(pinConflicts).length > 0;
  }, [pinConflicts]);

  /**
   * Get the status of a specific pin
   */
  const getPinStatusFor = (pin: string): PinStatus => {
    if (!pin || !pin.trim()) {
      return {
        pin: '',
        isValid: true,
        isUsed: false,
        usedBy: [],
        errors: []
      };
    }

    return getPinStatus(pin, config, boardDescriptor);
  };

  /**
   * Check if a pin assignment would be valid for a specific field
   */
  const validatePinAssignment = (pin: string, sourceField: string): { isValid: boolean; errors: string[] } => {
    if (!pin || !pin.trim()) {
      return { isValid: true, errors: [] };
    }

    const status = getPinStatusFor(pin);
    
    // Filter out the current source from conflicts to allow updating existing assignments
    const filteredUsedBy = status.usedBy.filter(source => source !== sourceField);
    const hasConflict = filteredUsedBy.length > 0;

    const errors = [...status.errors];
    if (hasConflict) {
      errors.push(`Pin conflict: would conflict with ${filteredUsedBy.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Get visual status class for a pin input
   */
  const getPinStatusClass = (pin: string, sourceField: string): string => {
    if (!pin || !pin.trim()) {
      return 'pin-status-empty';
    }

    const validation = validatePinAssignment(pin, sourceField);
    
    if (!validation.isValid) {
      return 'pin-status-invalid';
    }

    const status = getPinStatusFor(pin);
    if (status.usedBy.length > 0 && status.usedBy[0] !== sourceField) {
      return 'pin-status-conflict';
    }

    if (status.isUsed) {
      return 'pin-status-used';
    }

    return 'pin-status-available';
  };

  /**
   * Get a descriptive status message for a pin
   */
  const getPinStatusMessage = (pin: string, sourceField: string): string => {
    if (!pin || !pin.trim()) {
      return '';
    }

    const validation = validatePinAssignment(pin, sourceField);
    
    if (!validation.isValid) {
      return validation.errors[0] || 'Invalid pin assignment';
    }

    const status = getPinStatusFor(pin);
    
    if (status.usedBy.length > 1) {
      const otherUsers = status.usedBy.filter(source => source !== sourceField);
      return `Conflict: also used by ${otherUsers.join(', ')}`;
    }

    if (status.usedBy.length === 1 && status.usedBy[0] !== sourceField) {
      return `Used by ${status.usedBy[0]}`;
    }

    if (boardDescriptor && status.boardPin) {
      const caps = status.boardPin.capabilities;
      const capsList = [];
      if (caps.digital) capsList.push('Digital');
      if (caps.analog) capsList.push('Analog');
      if (caps.pwm) capsList.push('PWM');
      
      const notes = caps.notes ? ` - ${caps.notes}` : '';
      return `Available (${capsList.join(', ')})${notes}`;
    }

    return 'Available';
  };

  /**
   * Get available pins for the current board
   */
  const getAvailablePins = (): Array<{ value: string; label: string; capabilities: any }> => {
    if (!boardDescriptor) {
      return [];
    }

    return boardDescriptor.pins.map(pin => ({
      value: `gpio.${pin.gpio}`,
      label: `GPIO ${pin.gpio}`,
      capabilities: pin.capabilities
    }));
  };

  /**
   * Get pins that are currently unassigned
   */
  const getUnassignedPins = (): Array<{ value: string; label: string; capabilities: any }> => {
    const available = getAvailablePins();
    const used = new Set(Object.keys(pinAssignments));
    
    return available.filter(pin => !used.has(pin.value));
  };

  return {
    boardDescriptor,
    pinAssignments,
    pinConflicts,
    hasPinConflicts,
    getPinStatusFor,
    validatePinAssignment,
    getPinStatusClass,
    getPinStatusMessage,
    getAvailablePins,
    getUnassignedPins
  };
}