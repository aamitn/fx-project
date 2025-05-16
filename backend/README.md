# FurnX Backend

## Overview

The FurnX Backend is a .NET 9.0 WebAPI (OpenAPI Compatible) application providing the backend services for use with the FurnX platform.

## Prerequisites

-   .NET SDK 9.0 or later
-   Entity Framework Core , Designer
-   MS SQL Server DB

## Prebuilt Binary for Windows
- Download the prebuilt zip distribution from [here](https://github.com/aamitn/furnx-backend/releases/download/0.0.1/prebuilt.zip)
- Extract the `.zip` and run `fx-backend.exe`
- Alternatively run the `.dll` using `fx-backend.dll` 

## Building the Project

To build the project, navigate to the root directory containing the `fx-backend.csproj` file and run the following command:

```bash
dotnet clean
dotnet build
```

This command compiles the source code and generates the necessary binaries in the `bin` directory.

## Running the Project

After successfully building the project, you can run it using the following command:

```bash
dotnet run --project fx-backend
OR
dotnet run // If inside fx-backend directory
```

- This command starts the application, which listens for incoming requests on the configured port (typically 5227)
- Visit [http://localhost:5227/api/HeatQuantity](http://localhost:5227/api/HeatQuantity) to check.


## Debugging the Project

To debug the project, you can use Visual Studio Code or any other compatible IDE.

### Visual Studio Code

1.  Open the project folder in Visual Studio Code.
2.  Ensure that the C# extension is installed.
3.  Create a `.vscode` folder in the project root (if it doesn't exist).
4.  Create a `launch.json` file inside the `.vscode` folder with the following configuration:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": ".NET Core Launch (console)",
            "type": "coreclr",
            "request": "launch",
            "preLaunchTask": "build",
            "program": "${workspaceFolder}/fx-backend/bin/Debug/net9.0/fx-backend.dll",
            "args": [],
            "cwd": "${workspaceFolder}/fx-backend",
            "stopAtEntry": false,
            "console": "internalConsole"
        },
        {
            "name": ".NET Core Attach",
            "type": "coreclr",
            "request": "attach"
        }
    ]
}
```

5.  Press F5 to start debugging.

## Database Migrations

### Generating Migrations

To generate a new migration, use the following command:

```bash
dotnet ef migrations add <MigrationName> --project fx-backend --startup-project fx-backend
OR 
dotnet ef migrations add <MigrationName>  // If inside fx-backend directory

```

Replace `<MigrationName>` with a descriptive name for the migration. This command creates a new migration file in the `Migrations` directory.

### Applying Migrations

To apply migrations to the database, use the following command:

```bash
dotnet ef database update --project fx-backend --startup-project fx-backend
OR
dotnet ef database update  // If inside fx-backend directory
```

This command updates the database schema to match the latest migration.

## API Endpoints

#### Test API Endpint fr checking status

-   **Endpoint:** `GET api/HeatQuantity`
-   **Description:** Test Endpoint that returns data if api is running


-   **Example Request:**

```bash
curl --location --request GET 'http://localhost:5227/api/HeatQuantity'
```



#### Heat Quantity Calculation 

-   **Endpoint:** `POST /api/HeatQuantity/calculate`
-   **Description:** Calculates Heat Quantity(Q) with formula Q = mCp∆T
-   **Request Body:**

```json
{
  "mass": 5,
  "initialTemperature": 20,
  "finalTemperature": 1200,
  "MaterialType" : "wood"
}
```

-   **Example Request:**

```bash
curl --location --request POST 'http://localhost:5227/api/HeatQuantity/calculate' \
--header 'Content-Type: application/json' \
--data '{
  "mass": 5,
  "initialTemperature": 20,
  "finalTemperature": 1200,
  "MaterialType" : "oak wood"
}'
```



## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

- [Apache License](https://www.apache.org/licenses/LICENSE-2.0), Version 2.0 
- Repo Maintained by [Bitmutex Technologies](https://bitmutex.com)