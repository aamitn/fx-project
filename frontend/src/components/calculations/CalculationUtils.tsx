export const getToastMessage = (calculationType: string): string => {
  const messages: Record<string, string> = {
    "personnel-protection": "Personnel Protection calculation added",
    "condensation-control": "Condensation Control calculation added",
    "environmental-impact": "Environmental Impact calculation added",
    "efficiency": "Efficiency calculation added",
    "heat-loss": "Heat Loss calculation added"
  };
  
  return messages[calculationType] || "Calculation added";
};