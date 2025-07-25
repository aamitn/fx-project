IF NOT EXISTS (SELECT name FROM master.sys.databases WHERE name = 'FurnxDb')
BEGIN
    CREATE DATABASE FurnxDb;
END
GO

USE [FurnxDb]
GO
/****** Object:  Table [dbo].[Materials]    Script Date: Tuesday - 27 - 05 - 2025 10:50:23 AM ******/
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
SET IDENTITY_INSERT [dbo].[Materials] ON 
GO
INSERT [dbo].[Materials] ([Id], [MaterialType], [SpecificHeat]) VALUES (1, N'Water', 4.184)
GO
INSERT [dbo].[Materials] ([Id], [MaterialType], [SpecificHeat]) VALUES (2, N'Wood', 1.76)
GO
INSERT [dbo].[Materials] ([Id], [MaterialType], [SpecificHeat]) VALUES (3, N'Glass', 0.84)
GO
INSERT [dbo].[Materials] ([Id], [MaterialType], [SpecificHeat]) VALUES (4, N'Silica', 0.83)
GO
INSERT [dbo].[Materials] ([Id], [MaterialType], [SpecificHeat]) VALUES (5, N'Oak Wood', 5)
GO
SET IDENTITY_INSERT [dbo].[Materials] OFF
GO
