export const materialManagementContent = `
# Managing Insulation Materials

The Materials tab allows you to maintain a comprehensive database of insulation materials.

## Material Properties:

Each material entry includes:

* **Material Type**: The common name or product designation (e.g., "B & W SR 99 (3300F)").
* **Manufacturer**: The company that produces the material.
* **Product Class**: Categorization (e.g., "Firebrick", "Board", "Castable").
* **Max Temperature Limit**: The maximum operating temperature in °C.
* **Density**: The material's density in kg/m³.
* **Specific Heat**: The specific heat capacity in J/kg·K.
* **Conductivities**: A series of thermal conductivity values (W/m·K) at predefined temperatures (200, 500, 1000, 1500, 2000, 2500, 3000 °C).

## Actions:

| Action            | Description                                       |
| :---------------- | :------------------------------------------------ |
| **Add Material** | Manually add a new material entry.                |
| **Edit Material** | Modify an existing material's properties.         |
| **Delete Material**| Remove a single material from the database.       |
| **Bulk Delete** | Delete multiple selected materials.               |
| **View Plot** | Visualize the conductivity curve for a material.  |

### Admin-Only Feature:

**Import Materials from Excel**: As an administrator, you can upload an Excel file to bulk import or update material data. Ensure your Excel file follows the specified format. A sample template is available for download in the upload dialog.
`;