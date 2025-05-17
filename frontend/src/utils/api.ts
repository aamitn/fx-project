
/**
 * Utility functions for ASP.NET Core Web API backend communication
 */

/**
 * Send calculation data to the backend API
 * @param calculationType The type of calculation being performed
 * @param calculationData The calculation input data
 * @returns Promise with the calculation results
 */
export const sendCalculation = async (
  calculationType: string,
  calculationData: Record<string, any>
): Promise<any> => {
  try {
    // For development/testing: return mock data if the API is not available
    // This helps prevent network errors when the backend is not running
    const useMockData = false; // Set to false in production
    
    if (useMockData) {
      console.log(`Sending calculation data to API (mock): ${calculationType}`, calculationData);
      return getMockResults(calculationType);
    }
    console.log(`Calculation Type:`,  calculationType);
    console.log(`Calculation Data:`,  calculationData);
    
    // const response = await fetch(`http://localhost:5000/${calculationType}`, {
    const response = await fetch(`http://localhost:5227/api/${calculationType}/calculate`, {
   //const response = await fetch(`https://furnx-backend.bitmutex.com/api/${calculationType}/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calculationData),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending calculation:", error);
    throw error;
  }
};

/**
 * Generate mock results for development/testing when backend is not available
 * @param calculationType The type of calculation
 * @returns Mock calculation results
 */
const getMockResults = (calculationType: string): Record<string, any> => {
  switch (calculationType) {
    case 'personnel-protection':
      return {
        "Required Thickness": "50 mm",
        "Surface Temperature": "35.2 °C",
        "Heat Loss": "150.5 W/m²",
        "Safety Factor": "1.2"
      };
    case 'condensation-control':
      return {
        "Minimum Thickness": "25 mm",
        "Surface Temperature": "18.5 °C",
        "Dew Point Safety Margin": "5.7 °C",
        "Condensation Risk": "Low"
      };
    case 'environmental-impact':
      return {
        "CO₂ Emissions Saved": "12.5 tons/year",
        "Energy Savings": "45000 kWh/year",
        "Fuel Reduction": "4200 m³/year",
        "Environmental Impact Score": "Good"
      };
    case 'efficiency':
      return {
        "Annual Cost Savings": "$5,250",
        "ROI": "35%",
        "Payback Period": "2.8 years",
        "Energy Savings": "45000 kWh/yr",
        "CO₂ Reduction": "12.5 tons/yr"
      };
    default:
      return {
        "Result": "No data available for this calculation type"
      };
  }
};


export const fetchMaterialOptions = async () => {
  try {
    const response = await fetch('http://localhost:5227/api/heat-quantity/materials');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not fetch material options:", error);
    return ["Error1", "Error2"]; // Default list on error
  }
};