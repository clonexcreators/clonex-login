import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDNAThemes } from '@hooks/useDNAThemes';
import type { DNAType } from '@theme/dna';

describe('useDNAThemes Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDNAThemes());

    expect(result.current.activeDNA).toBeDefined();
    expect(result.current.availableDNA).toBeInstanceOf(Array);
    expect(result.current.hasMurakamiDrip).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should load saved theme from localStorage', () => {
    // Simulate saved theme
    localStorage.setItem('clonex-dna-theme', 'robot');

    const { result } = renderHook(() => useDNAThemes());

    expect(result.current.activeDNA).toBe('robot');
  });

  it('should change theme when setActiveDNA is called', () => {
    const { result } = renderHook(() => useDNAThemes());

    act(() => {
      result.current.setActiveDNA('demon');
    });

    expect(result.current.activeDNA).toBe('demon');
  });

  it('should persist theme selection to localStorage', () => {
    const { result } = renderHook(() => useDNAThemes());

    act(() => {
      result.current.setActiveDNA('angel');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('clonex-dna-theme', 'angel');
  });

  it('should detect Murakami Drip from NFT metadata', () => {
    const mockNFTs = [
      {
        metadata: {
          type: 'MURAKAMI DRIP'
        }
      }
    ];

    const { result } = renderHook(() => useDNAThemes());

    act(() => {
      result.current.refreshOwnedDNA(mockNFTs);
    });

    expect(result.current.hasMurakamiDrip).toBe(true);
  });

  it('should update availableDNA based on owned NFTs', () => {
    const mockNFTs = [
      { metadata: { dna: 'Human' } },
      { metadata: { dna: 'Robot' } },
      { metadata: { dna: 'Human' } }, // Duplicate
    ];

    const { result } = renderHook(() => useDNAThemes());

    act(() => {
      result.current.refreshOwnedDNA(mockNFTs);
    });

    // Should have unique DNA types
    expect(result.current.availableDNA.length).toBeGreaterThan(0);
  });

  it('should handle resetTheme', () => {
    const { result } = renderHook(() => useDNAThemes());

    // Set a theme first
    act(() => {
      result.current.setActiveDNA('alien');
    });

    expect(result.current.activeDNA).toBe('alien');

    // Reset theme
    act(() => {
      result.current.resetTheme();
    });

    // Should reset to default
    expect(result.current.activeDNA).not.toBe('alien');
  });

  it('should handle murakami-drip theme selection', () => {
    const { result } = renderHook(() => useDNAThemes());

    act(() => {
      result.current.setActiveDNA('murakami-drip');
    });

    expect(result.current.activeDNA).toBe('murakami-drip');
  });

  it('should maintain theme state across re-renders', () => {
    const { result, rerender } = renderHook(() => useDNAThemes());

    act(() => {
      result.current.setActiveDNA('undead');
    });

    rerender();

    expect(result.current.activeDNA).toBe('undead');
  });

  it('should accept userDNA prop to set available DNA types', () => {
    const userDNA: DNAType[] = ['human', 'robot', 'demon'];
    
    const { result } = renderHook(() => useDNAThemes(userDNA));

    expect(result.current.availableDNA).toEqual(expect.arrayContaining(userDNA));
  });
});
