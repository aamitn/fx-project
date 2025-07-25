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

- To build the project, navigate to the root directory containing the `fx-backend.csproj` file and run the following command:

```bash
dotnet clean
dotnet build 
```
- Build with Configuration 
```bash
dotnet build -c debug
OR
dotnet build -c release
```
- Publish for Deployment
```bash
dotnet publish
OR
dotnet publish -c debug
OR
dotnet publish -c release
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
- Visit [http://localhost:5227/api/heat-quantity](http://localhost:5227/api/heat-quantity) to check.


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

## API Documantaion

- OpenAPI Documantation at : [http://localhost:5227/openapi/v1.json](http://localhost:5227/openapi/v1.json)
- Swagger UI at : [http://localhost:5227/api-docs/](http://localhost:5227/api-docs)

## API Endpoints

All Endpoint info at `./fx-backend/fx-backend.http`


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

- [Apache License](https://www.apache.org/licenses/LICENSE-2.0), Version 2.0 
- Repo Maintained by [Bitmutex Technologies](https://bitmutex.com)