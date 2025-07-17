import { create } from 'zustand';
import { QuoteSelection } from '@/types/global-quotation/globalQuotation';

interface GlobalQuoteSelectionState {
  quoteSelection: QuoteSelection;
  selectQuote: (partNumberId: string, quotationId: string) => void;
  deselectQuote: (partNumberId: string, quotationId: string) => void;
  clearPartNumberSelection: (partNumberId: string) => void;
  clearAllSelections: () => void;
  isQuoteSelected: (partNumberId: string, quotationId: string) => boolean;
  getSelectedQuotesForPartNumber: (partNumberId: string) => string[];
  getTotalSelectedQuotes: () => number;
  hasAnySelections: () => boolean;
  getPartNumbersWithSelections: () => string[];
}

export const useGlobalQuoteSelection = create<GlobalQuoteSelectionState>((set, get) => ({
  quoteSelection: {},

  selectQuote: (partNumberId: string, quotationId: string) => {
    set((state) => ({
      quoteSelection: {
        ...state.quoteSelection,
        [partNumberId]: [...(state.quoteSelection[partNumberId] || []), quotationId]
      }
    }));
  },

  deselectQuote: (partNumberId: string, quotationId: string) => {
    set((state) => {
      const updatedQuotes = (state.quoteSelection[partNumberId] || []).filter(id => id !== quotationId);
      
      // If no quotes remain for this part number, remove the part number entry entirely
      if (updatedQuotes.length === 0) {
        const newSelection = { ...state.quoteSelection };
        delete newSelection[partNumberId];
        return { quoteSelection: newSelection };
      }
      
      // Otherwise, update the quotes array for this part number
      return {
        quoteSelection: {
          ...state.quoteSelection,
          [partNumberId]: updatedQuotes
        }
      };
    });
  },

  clearPartNumberSelection: (partNumberId: string) => {
    set((state) => {
      const newSelection = { ...state.quoteSelection };
      delete newSelection[partNumberId];
      return { quoteSelection: newSelection };
    });
  },

  clearAllSelections: () => {
    set({ quoteSelection: {} });
  },

  isQuoteSelected: (partNumberId: string, quotationId: string) => {
    const state = get();
    return (state.quoteSelection[partNumberId] || []).includes(quotationId);
  },

  getSelectedQuotesForPartNumber: (partNumberId: string) => {
    const state = get();
    return state.quoteSelection[partNumberId] || [];
  },

  getTotalSelectedQuotes: () => {
    const state = get();
    return Object.values(state.quoteSelection).reduce((total, quotes) => total + quotes.length, 0);
  },

  hasAnySelections: () => {
    const state = get();
    return Object.keys(state.quoteSelection).length > 0;
  },

  getPartNumbersWithSelections: () => {
    const state = get();
    return Object.keys(state.quoteSelection);
  }
})); 