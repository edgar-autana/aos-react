import { useState, useEffect, useCallback } from 'react';

interface QuotationCalculationData {
  cost_of_plate: number | null;
  rm_cnc_margin: number | null;
  rm_cnc_scrap: number | null;
  machine_cost_per_hour: number | null;
  cycle_time_sec: number | null;
  total_price: number | null;
}

interface QuotationCalculations {
  rm_cnc_piece_price: number | null;
  piece_weight_rm_cnc_percentage: number | null;
  piece_price_cnc_no_scrap: number | null;
  piece_price_cnc_scrap: number | null;
  piece_weight_cnc_percentage: number | null;
  total: number | null;
}

export function useQuotationCalculations(data: QuotationCalculationData) {
  const [calculations, setCalculations] = useState<QuotationCalculations>({
    rm_cnc_piece_price: null,
    piece_weight_rm_cnc_percentage: null,
    piece_price_cnc_no_scrap: null,
    piece_price_cnc_scrap: null,
    piece_weight_cnc_percentage: null,
    total: null
  });

  // Calculate Piece Price (RM)
  const calculatePiecePrice = useCallback((costOfPlate: number | null, margin: number | null): number | null => {
    if (costOfPlate === null || margin === null) return null;
    return costOfPlate * (1 + margin);
  }, []);

  // Calculate CNC Piece Price (No Scrap)
  const calculateCNCPiecePriceNoScrap = useCallback((cycleTimeSec: number | null, machineCostPerHour: number | null): number | null => {
    if (cycleTimeSec === null || machineCostPerHour === null) return null;
    return (cycleTimeSec / 3600) * machineCostPerHour;
  }, []);

  // Calculate CNC Scrap Cost
  const calculateCNCScrapCost = useCallback((costOfPlate: number | null, rmCncScrap: number | null): number | null => {
    if (costOfPlate === null || rmCncScrap === null) return null;
    // rmCncScrap is a percentage (e.g., 0.05 for 5%), so multiply by cost_of_plate
    return costOfPlate * rmCncScrap;
  }, []);

  // Calculate CNC Piece Price (With Scrap)
  const calculateCNCPiecePriceWithScrap = useCallback((cncNoScrap: number | null, cncScrapCost: number | null): number | null => {
    if (cncNoScrap === null || cncScrapCost === null) return null;
    return cncNoScrap + cncScrapCost;
  }, []);

  // Calculate Weight Percentage
  const calculateWeightPercentage = useCallback((piecePrice: number | null, total: number | null): number | null => {
    if (piecePrice === null || total === null || total === 0) return null;
    return (piecePrice / total) * 100;
  }, []);

  // Update calculations when data changes
  useEffect(() => {
    const { 
      cost_of_plate, 
      rm_cnc_margin, 
      rm_cnc_scrap, 
      machine_cost_per_hour, 
      cycle_time_sec 
    } = data;

    // Calculate Raw Material Piece Price
    const rmPiecePrice = calculatePiecePrice(cost_of_plate, rm_cnc_margin);

    // Calculate CNC Piece Price (No Scrap)
    const cncNoScrap = calculateCNCPiecePriceNoScrap(cycle_time_sec, machine_cost_per_hour);

    // Calculate CNC Scrap Cost
    const cncScrapCost = calculateCNCScrapCost(cost_of_plate, rm_cnc_scrap);

    // Calculate CNC Piece Price (With Scrap)
    const cncWithScrap = calculateCNCPiecePriceWithScrap(cncNoScrap, cncScrapCost);

    // Calculate Total (RM + CNC)
    const total = (rmPiecePrice || 0) + (cncWithScrap || 0);

    // Calculate Weight Percentages only if total is greater than 0
    const rmWeightPercentage = total > 0 ? calculateWeightPercentage(rmPiecePrice, total) : null;
    const cncWeightPercentage = total > 0 ? calculateWeightPercentage(cncWithScrap, total) : null;

    // Debug logging (remove in production)
    console.log('Calculation Debug:', {
      cost_of_plate: data.cost_of_plate,
      rm_cnc_margin: data.rm_cnc_margin,
      rm_cnc_scrap: data.rm_cnc_scrap,
      machine_cost_per_hour: data.machine_cost_per_hour,
      cycle_time_sec: data.cycle_time_sec,
      rmPiecePrice,
      cncNoScrap,
      cncScrapCost,
      cncWithScrap,
      total,
      rmWeightPercentage,
      cncWeightPercentage
    });

    setCalculations({
      rm_cnc_piece_price: rmPiecePrice,
      piece_weight_rm_cnc_percentage: rmWeightPercentage,
      piece_price_cnc_no_scrap: cncNoScrap,
      piece_price_cnc_scrap: cncWithScrap,
      piece_weight_cnc_percentage: cncWeightPercentage,
      total
    });
  }, [data, calculatePiecePrice, calculateCNCPiecePriceNoScrap, calculateCNCScrapCost, calculateCNCPiecePriceWithScrap, calculateWeightPercentage]);

  return {
    calculations,
    calculatePiecePrice,
    calculateCNCPiecePriceNoScrap,
    calculateCNCScrapCost,
    calculateCNCPiecePriceWithScrap,
    calculateWeightPercentage
  };
} 