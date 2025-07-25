using SkiaSharp;
using fx_backend.Models.DTOs;

namespace fx_backend.Utils
{
    public static class GraphPlotter
    {
        public static byte[] GenerateTemperaturePlot(List<GraphPointDto> points, List<string>? layerLabels = null)
        {
            int width = 900;
            int height = 500;
            var imageInfo = new SKImageInfo(width, height);
            using var surface = SKSurface.Create(imageInfo);
            var canvas = surface.Canvas;

            canvas.Clear(SKColors.White);

            float marginLeft = 80;
            float marginRight = 30;
            float marginTop = 50;
            float marginBottom = 60;

            float plotWidth = width - marginLeft - marginRight;
            float plotHeight = height - marginTop - marginBottom;

            if (points == null || points.Count < 2)
            {
                using var emptyData = surface.Snapshot().Encode(SKEncodedImageFormat.Png, 100);
                return emptyData.ToArray();
            }

            float minX = points.Min(p => (float)p.X);
            float maxX = points.Max(p => (float)p.X);
            float minY = 0;
            float maxY = points.Max(p => (float)p.Y);

            if (Math.Abs(maxX - minX) < 0.01f) maxX += 1;
            if (Math.Abs(maxY - minY) < 0.01f) maxY += 1;

            float xScale = plotWidth / (maxX - minX);
            float yScale = plotHeight / (maxY - minY);

            SKColor[] zoneColors = new SKColor[]
            {
                new SKColor(230, 245, 255),
                new SKColor(255, 230, 230),
                new SKColor(220, 255, 240),
                new SKColor(250, 240, 200),
                new SKColor(235, 225, 255),
                new SKColor(240, 250, 230)
            };

            // Define SKPaint objects for labels
            var yAxisPaint = new SKPaint { Color = SKColors.Black, TextSize = 14, IsAntialias = true, TextAlign = SKTextAlign.Right };
            var xAxisPaint = new SKPaint { Color = SKColors.Black, TextSize = 14, IsAntialias = true, TextAlign = SKTextAlign.Center };
            var layerLabelPaint = new SKPaint { Color = SKColors.Black, TextSize = 13, IsAntialias = true, TextAlign = SKTextAlign.Right };
            var titlePaint = new SKPaint { Color = SKColors.Black, TextSize = 16, IsAntialias = true, FakeBoldText = true, TextAlign = SKTextAlign.Center };
            var legendLabelPaint = new SKPaint { Color = SKColors.DarkRed, TextSize = 14, IsAntialias = true, Typeface = SKTypeface.FromFamilyName("Arial", SKFontStyle.Bold),  TextAlign = SKTextAlign.Left};

            // === Dynamic Layer Backgrounds ===
            int numLayers = Math.Min(points.Count / 2, layerLabels?.Count ?? int.MaxValue);

            for (int i = 0; i < numLayers; i++) 
            {
                float layerStartX = (float)points[2 * i].X;
                float layerEndX = (float)points[2 * i + 1].X;
                float thickness = layerEndX - layerStartX;

                float xStart = marginLeft + (layerStartX - minX) * xScale;
                float xEnd = marginLeft + (layerEndX - minX) * xScale;

                var rect = new SKRect(xStart, marginTop, xEnd, marginTop + plotHeight);
                var fillColor = zoneColors[i % zoneColors.Length];
                canvas.DrawRect(rect, new SKPaint { Color = fillColor, Style = SKPaintStyle.Fill });

                // Draw layer label aligned to right edge
                string labelBase = layerLabels != null && layerLabels.Count > i ? layerLabels[i] : $"Layer {i + 1}";
                string label = $"{labelBase} ({Math.Round(thickness, 2)} in)";
                float labelX = xEnd - 5;
                float labelY = marginTop + plotHeight / 2; // You can adjust this if needed
                float layerlabelpadding = labelY-55;

                canvas.Save();
                canvas.Translate(labelX, labelY);
                canvas.RotateDegrees(-90); // Rotate text upward
                canvas.DrawText(label, layerlabelpadding, 0, layerLabelPaint);
                canvas.Restore();
            }

            // === Grid Lines and Labels ===
            var gridPaint = new SKPaint { Color = SKColors.LightGray, StrokeWidth = 1, IsAntialias = true };
            int xTicks = 6;
            int yTicks = 7;

            // Y-axis grid and labels
            for (int i = 0; i <= yTicks; i++)
            {
                float yVal = minY + i * (maxY - minY) / yTicks;
                float y = marginTop + plotHeight - (yVal - minY) * yScale;
                canvas.DrawLine(marginLeft, y, marginLeft + plotWidth, y, gridPaint);
                canvas.DrawText($"{Math.Round(yVal)}", marginLeft - 10, y + 5, yAxisPaint);
            }

            // X-axis grid and labels
            for (int i = 0; i <= xTicks; i++)
            {
                float xVal = minX + i * (maxX - minX) / xTicks;
                float x = marginLeft + (xVal - minX) * xScale;
                canvas.DrawLine(x, marginTop, x, marginTop + plotHeight, gridPaint);
                canvas.DrawText($"{Math.Round(xVal)}", x, marginTop + plotHeight + 25, xAxisPaint);
            }

            // === Axes ===
            var axisPaint = new SKPaint { Color = SKColors.Black, StrokeWidth = 2, IsAntialias = true };
            canvas.DrawLine(marginLeft, marginTop, marginLeft, marginTop + plotHeight, axisPaint); // Y-axis
            canvas.DrawLine(marginLeft, marginTop + plotHeight, marginLeft + plotWidth, marginTop + plotHeight, axisPaint); // X-axis

            // === Axis Titles ===
            canvas.DrawText("Distance [in]", marginLeft + plotWidth / 2, height - 20, titlePaint);
            canvas.Save();
            canvas.RotateDegrees(-90, marginLeft - 50, marginTop + plotHeight / 2);
            canvas.DrawText("Temperature [°F]", marginLeft - 50, marginTop + plotHeight / 2, titlePaint);
            canvas.Restore();

            // === Plot Temperature Line ===
            var linePaint = new SKPaint
            {
                Color = SKColors.Red,
                StrokeWidth = 2,
                IsAntialias = true
            };

            for (int i = 0; i < points.Count - 1; i++)
            {
                float x1 = marginLeft + ((float)points[i].X - minX) * xScale;
                float y1 = marginTop + plotHeight - ((float)points[i].Y - minY) * yScale;
                float x2 = marginLeft + ((float)points[i + 1].X - minX) * xScale;
                float y2 = marginTop + plotHeight - ((float)points[i + 1].Y - minY) * yScale;
                canvas.DrawLine(x1, y1, x2, y2, linePaint);
            }

            // === Legend ===
            var legendPaint = new SKPaint { Color = SKColors.Red, StrokeWidth = 3 };
            float legendX = width - 170; // Legend pos x Adjustment
            float legendY = marginTop - 10; // Legend pos y Adjustment
            canvas.DrawLine(legendX, legendY, legendX + 20, legendY, legendPaint);
            canvas.DrawText("Temperature Line", legendX + 25, legendY + 5, legendLabelPaint);

            // === Output Image ===
            using var image = surface.Snapshot();
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }
    }
}
