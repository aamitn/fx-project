IF NOT EXISTS (SELECT name FROM master.sys.databases WHERE name = 'FurnxDb')
BEGIN
    CREATE DATABASE FurnxDb;
END
GO

USE [FurnxDb]
GO

/****** Object:  Table [dbo].[Materials]    Script Date: Friday - 09 - 05 - 2025 08:30:32 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Materials](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [MaterialType] [nvarchar](max) NOT NULL,
    [SpecificHeat] [float] NOT NULL,
 CONSTRAINT [PK_Materials] PRIMARY KEY CLUSTERED
(
    [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO