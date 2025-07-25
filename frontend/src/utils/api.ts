/**
 * Utility functions for ASP.NET Core Web API backend communication
 */

// Public API URL ENV Must Start with VITE_
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5227';


// ✅ NEW DTO INTERFACES
/**
 * DTO for the user profile data returned by the GET /profile endpoint.
 */
export interface UserProfileDto {
    fullName: string;
    email: string;
    id:string;
}

/**
 * DTO for updating the user profile. All fields are optional.
 */
export interface UpdateUserDto {
    fullName?: string;
    oldPassword?: string;
    newPassword?: string;
}

// New DTO for admin-initiated user update [ADMIN DTOs]
export interface UserUpdateDto {
    fullName?: string | null;
    organization?: string | null;
    jobTitle?: string | null;
    country?: string | null;
    newPassword?: string | null;
    roles?: string[];
}

// New DTO for admin-initiated user creation
export interface UserCreateDto {
    fullName: string;
    email: string;
    password?: string; // Password can be optional if you have a flow for password reset on first login
    role: string;
}


/**
 * Sends a request to the specified endpoint.
 * @param {string} endpoint The endpoint to send the request to.
 * @param {RequestInit} options The options to use for the request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
const sendRequest = async (endpoint: string, options: RequestInit): Promise<Response> => {
    try {
        const response = await fetch(endpoint, options);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return response;
    } catch (error) {
        console.error(`Error sending request to ${endpoint}:`, error);
        throw error;
    }
};


/**
 * Sends a request to the specified endpoint and send back error response on non-200
 * @param {string} endpoint The endpoint to send the request to.
 * @param {RequestInit} options The options to use for the request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
const sendRequestWithErrors = async (endpoint: string, options: RequestInit): Promise<Response> => {
    try {
        const response = await fetch(endpoint, options);
        return response;
    } catch (error) {
        console.error(`Error sending request to ${endpoint}:`, error);
        throw error;
    }
};



/**
 * Registers a new user. [USES sendRequestWithErrors]
 * @param {string} fullName The full name of the user.
 * @param {string} email The email address of the user.
 * @param {string} password The password of the user.
 * @returns {Promise<any>} A promise that resolves with the registration result.
 */
export const register = async (fullName: string, email: string, password: string): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/register`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
    };

    // ✅ Use the new function: sendRequestWithErrors
    const response = await sendRequestWithErrors(endpoint, options);

    // ✅ Now, handle the response logic here
    if (response.ok) {
        return true;
    } else {
        const errorData = await response.json();
        const errorMessages = errorData.errors?.join(", ") || "An unknown error occurred.";
        throw new Error(errorMessages);
    }
};


/**
 * Confirms a user's email address.
 * @param {string} email The email address of the user.
 * @param {string} token The confirmation token.
 * @returns {Promise<any>} A promise that resolves with the confirmation result.
 */
export const confirmEmail = async (email: string, token: string): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/confirm-email`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
    };
 const response = await sendRequestWithErrors(endpoint, options);

    if (response.ok) {
        return true;
    } else {
        const errorData = await response.json();
        const errorMessages = errorData.errors?.join(", ") || errorData.message || "An unknown error occurred.";
        throw new Error(errorMessages);
    }
};


/**
 * Resends the email confirmation email.
 * @param {string} email The email address of the user.
 * @returns {Promise<any>} A promise that resolves with the resend confirmation result.
 */
export const resendConfirmationEmail = async (email: string): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/resend-confirmation`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    };
    return sendRequest(endpoint, options);
};

/**
 * Logs in a user.
 * @param {string} email The email address of the user.
 * @param {string} password The password of the user.
 * @returns {Promise<any>} A promise that resolves with the login result.
 */
export const login = async (email: string, password: string): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/login`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    };
    return sendRequest(endpoint, options);
};

/**
 * Requests an OTP for login.
 * @param {string} email The email address of the user.
 * @returns {Promise<any>} A promise that resolves with the result.
 */
export const loginEmailOtp = async (email: string): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/login-email-otp`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    };
    return sendRequest(endpoint, options);
};

/**
 * Verifies the 2FA code.
 * @param {string} userId The user ID.
 * @param {string} code The 2FA code.
 * @returns {Promise<any>} A promise that resolves with the result.
 */
export const verify2FA = async (userId: string, code: string): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/2fa-verify`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, code }),
    };
    return sendRequest(endpoint, options);
};

/**
 * Initiates the forgot password process.
 * @param {string} email The email address of the user.
 * @returns {Promise<any>} A promise that resolves with the result.
 */
export const forgotPassword = async (email: string): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/forgot-password`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    };
     const response = await sendRequestWithErrors(endpoint, options);

    if (response.ok) {
        return true;
    } else {
        const errorData = await response.json();
        const errorMessages = errorData.errors?.join(", ") || errorData.message || "An unknown error occurred.";
        throw new Error(errorMessages);
    }
};

/**
 * Resets the user's password.
 * @param {string} email The email address of the user.
 * @param {string} token The reset token.
 * @param {string} newPassword The new password.
 * @returns {Promise<any>} A promise that resolves with the result.
 */
export const resetPassword = async (email: string, token: string, newPassword: string): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/reset-password`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, newPassword }),
    };
    return sendRequest(endpoint, options);
};

/**
* Gets the authenticator setup details.
* @returns {Promise<any>} A promise that resolves with the result.
*/
export const setupAuthenticator = async (): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/2fa/setup-authenticator`;
    const token = localStorage.getItem('token');

    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
    return sendRequest(endpoint, options);
};

/**
 * Enables the authenticator.
 * @param {string} code The authenticator code.
 * @returns {Promise<any>} A promise that resolves with the result.
 */
export const enableAuthenticator = async (code: string): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/2fa/enable-authenticator`;
    const token = localStorage.getItem('token');
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
    };
    return sendRequest(endpoint, options);
};

/**
* Disables 2FA.
* @param {string} password The password to confirm identity.
* @returns {Promise<any>} A promise that resolves with the result.
*/
export const disable2FA = async (password: string): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/2fa/disable`;
    const token = localStorage.getItem('token');
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
    };
    return sendRequest(endpoint, options);
};

/**
* Sends an email OTP for 2FA.
* @returns {Promise<any>} A promise that resolves with the result.
*/
export const sendEmailOtp = async (): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/2fa/send-email-otp`;
    const token = localStorage.getItem('token');
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
    return sendRequest(endpoint, options);
};

/**
* Sends calculation data to the backend API
* @param {string} calculationType The type of calculation being performed
* @param {Record<string, any>} calculationData The calculation input data
* @returns {Promise<any>} Promise with the calculation results
*/

export const sendCalculation = async (
    calculationType: string,
    calculationData: Record<string, any>
): Promise<any> => {
    try {
        if (calculationType === 'heat-loss') {
            return sendHeatLossCalculation(calculationData);
        }

        const useMockData = false; // Set to true for development/testing USE MOCK APIs

        if (useMockData) {
            console.log(`Sending calculation data to API (mock): ${calculationType}`, calculationData);
            return getMockResults(calculationType);
        }

        const endpoint = `${baseUrl}/api/${calculationType}/calculate`;

        console.log(`ENDPOINT URL FOR CALCULATE IS: ${endpoint}`);
        console.log(`Calculation Type:`, calculationType);
        console.log(`Calculation Data:`, calculationData);

        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
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

export const fetchMaterialOptions = async () => {
    try {
        const endpoint = `${baseUrl}/api/heat-quantity/materials`;
        console.log(`ENDPOINT URL FOR MATERIAL LIST IS: ${endpoint}`);

        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch material options:", error);
        return ["Phenolic Type III, C1126-13", "Fiberglass", "Mineral Wool", "Polyurethane"]; // Default list on error
    }
};

export const fetchMaterials = async () => {
    try {
        const endpoint = `${baseUrl}/api/material/data`;
        console.log(`ENDPOINT URL FOR MATERIALS IS: ${endpoint}`);

        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch materials:", error);
        return []; // Return empty array on error
    }
};

export const addMaterial = async (materialData: any) => {
    try {
        const endpoint = `${baseUrl}/api/material`;
        console.log(`ENDPOINT URL FOR ADD MATERIAL IS: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(materialData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not add material:", error);
        throw error;
    }
};

export const deleteMaterial = async (materialId: number) => {
    try {
        const endpoint = `${baseUrl}/api/material/${materialId}`;
        console.log(`ENDPOINT URL FOR DELETE MATERIAL IS: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not delete material:", error);
        throw error;
    }
};

export const editMaterial = async (materialId: number, materialData: any) => {
    try {
        const endpoint = `${baseUrl}/api/material/${materialId}`;
        console.log(`ENDPOINT URL FOR EDIT MATERIAL IS: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(materialData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not edit material:", error);
        throw error;
    }
};

export const sendHeatLossCalculation = async (calculationData: Record<string, any>): Promise<any> => {
    try {
        const endpoint = `${baseUrl}/api/heatloss/analyze`;

        const layers = calculationData.layers;
        delete calculationData.layers;

        const requestBody = {
            ...calculationData,
            layers: layers
        };

        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Plot the graph and attach it to the response
        if (data && data.graphPoints) {
            const imageUrl = await plotGraph(data.graphPoints);
            data.graphImageUrl = imageUrl;
        }

        return data;
    } catch (error) {
        console.error("Error sending heat loss calculation:", error);
        throw error;
    }
};

export const plotGraph = async (graphPoints: any[]) => {
    try {
        const endpoint = `${baseUrl}/api/graph/plot`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(graphPoints),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Error plotting graph:", error);
        throw error;
    }
};

export const deleteMaterials = async (ids) => {
    const response = await fetch(`${baseUrl}/api/material/bulk`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ids),
    });
    if (!response.ok) {
        throw new Error('Failed to delete materials');
    }
    return await response.json();
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

        case 'heat-quantity':
            return {
                "Mass": "250",
                "Initial Temperature": "35",
                "Final Temperature": "2.8 years",
                "Material Type": "Wood",
                "Heat Quantity Result": "5000 J"
            };

        default:
            return {
                "Result": "No data available for this calculation type"
            };
    }
};


/**
 * Retrieves the user profile.
 * @returns {Promise<UserProfileDto>} A promise that resolves with the user profile.
 */
export const getProfile = async (): Promise<UserProfileDto> => {
    const endpoint = `${baseUrl}/api/Auth/profile`;
    const token = localStorage.getItem('token');
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
    const response = await sendRequest(endpoint, options);
    return await response.json();
};

/**
 * Updates the user profile.
 * @param {UpdateUserDto} profileData The data to update.
 * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
 */
export const updateProfile = async (profileData: UpdateUserDto): Promise<boolean> => {
    const endpoint = `${baseUrl}/api/Auth/profile`;
    const token = localStorage.getItem('token');

    const options: RequestInit = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
    };

    try {
        await sendRequest(endpoint, options);
        return true;
    } catch (error) {
        return false;
    }
};



export const verifyOtp = async (userId: string, otp: string) => {
  const response = await fetch("/api/Auth/2fa-verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, code: otp }),
  });
  const data = await response.json();
  return data;
};


/**
 * Initiates Google OAuth login by redirecting to Google login page.
 * @returns {void} Redirects the user to the Google login endpoint.
 */
export const loginWithGoogle = (): void => {
    const endpoint = `${baseUrl}/api/Auth/google/login`;
    window.location.href = endpoint;
};

/**
 * Handles Google OAuth callback and retrieves the token.
 * @returns {Promise<any>} A promise that resolves with the Google login result.
 */
export const handleGoogleCallback = async (): Promise<any> => {
    const endpoint = `${baseUrl}/api/Auth/google/response`;
    const options: RequestInit = {
        method: 'GET',
        credentials: 'include', // Include cookies for session handling
    };
    return sendRequest(endpoint, options);
};



/**
 * Provides User Roles
 *
 */
export const fetchUserRoles = async (setUserRoles: (roles: string[]) => void) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/api/Auth/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUserRoles(data.roles || []);
    } catch (error) {
      console.error("Failed to fetch user roles:", error);
      // Optionally handle error - perhaps set roles to empty array or display a message
      setUserRoles([]);
    }
  };

/**
 * Fetches all users.
 * @returns {Promise<any[]>} A promise that resolves with the users.
 */
export const fetchUsers = async (): Promise<any[]> => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found in localStorage");
            return [];
        }
        const response = await fetch("http://localhost:5227/api/users", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: any[] = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
};


/**
 * Deletes a user by their ID.
 * @param {string} userId The ID of the user to delete.
 * @returns {Promise<void>} A promise that resolves on successful deletion.
 */
export const deleteUser = async (userId: string): Promise<void> => { // Changed return type to Promise<void>
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No authentication token found.");
        }
        const endpoint = `${baseUrl}/api/users/${userId}`;
        console.log(`ENDPOINT URL FOR DELETE USER IS: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 204) {
            // Successful deletion with no content
            console.log(`User ${userId} deleted successfully (204 No Content).`);
            return; // Return early, no JSON to parse
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // If it's OK but not 204, it might return some JSON (e.g., a success message)
        // You can choose to return response.json() here if your API might send content on 200 OK
        // For 204, this part will not be reached.
        return; // Or return await response.json(); if your API sometimes returns 200 OK with content for delete
    } catch (error) {
        console.error("Could not delete user:", error);
        throw error;
    }
};

/**
 * Creates a new user (admin functionality).
 * @param {UserCreateDto} userData The data for the new user.
 * @returns {Promise<any>} A promise that resolves with the creation result.
 */
export const createUser = async (userData: UserCreateDto): Promise<any> => {
    const endpoint = `${baseUrl}/api/users`;
    const token = localStorage.getItem('token');
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
    };
    const response = await sendRequestWithErrors(endpoint, options);
    if (response.ok) {
        return await response.json();
    } else {
        const errorData = await response.json();
        const errorMessages = errorData.message || errorData.errors?.join(", ") || "An unknown error occurred.";
        throw new Error(errorMessages);
    }
};

/**
 * Updates an existing user (admin functionality).
 * @param {string} userId The ID of the user to update.
 * @param {UserUpdateDto} userData The data to update.
 * @returns {Promise<any>} A promise that resolves with the update result.
 */
export const updateUser = async (userId: string, userData: UserUpdateDto): Promise<any> => {
    const endpoint = `${baseUrl}/api/users/${userId}`;
    const token = localStorage.getItem('token');
    const options: RequestInit = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
    };
    const response = await sendRequestWithErrors(endpoint, options);
    if (response.ok) {
        return await response.json();
    } else {
        const errorData = await response.json();
        const errorMessages = errorData.message || errorData.errors?.join(", ") || "An unknown error occurred.";
        throw new Error(errorMessages);
    }
};