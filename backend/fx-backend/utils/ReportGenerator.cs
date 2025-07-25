using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using fx_backend.Models.DTOs;
using System.IO;
using System.Diagnostics;

namespace fx_backend.Utils
{
    public static class ReportGenerator
    {
        public static byte[] GenerateHeatQuantityPdf(HeatReportRequestDto request, byte[]? imageBytes = null)
        {
            using var ms = new MemoryStream();
            var document = new PdfDocument();
            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);

            // Define fonts
            var font = new XFont("Verdana", 11);
            var boldFont = new XFont("Verdana", 11, XFontStyle.Bold);
            var headerFont = new XFont("Verdana", 16, XFontStyle.Bold);
            var sectionFont = new XFont("Verdana", 13, XFontStyle.BoldItalic);

            // Initial position
            double y = 40;
            double left = 40;
            double pageWidth = page.Width;
            double pageHeight = page.Height;

            // Helper function to draw a line
            void DrawLine(double lineY) => gfx.DrawLine(XPens.LightGray, left, lineY, pageWidth - left, lineY);

            // Company Header and Logo Section
            double right = pageWidth - left;
            double headerHeight = 0;


            bool useLocalImage = true; // Use Logo from local file or online URL
            string logoPath = Path.Combine("Images", "logo.png");
            string logoUrl = "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_dark_2x_r5.png";
            XImage logo = null;

            try
            {
                if (useLocalImage)
                {
                    // Load image from a local file
                    if (File.Exists(logoPath))
                    {
                        var logoBytes = File.ReadAllBytes(logoPath);
                        using (var logoStream = new MemoryStream(logoBytes))
                        {
                            logo = XImage.FromStream(() => new MemoryStream(logoBytes));
                        }
                    }
                }
                else
                {
                    // Load image from an online URL
                    using (var httpClient = new HttpClient())
                    {
                        var logoBytes = httpClient.GetByteArrayAsync(logoUrl).Result;
                        using (var logoStream = new MemoryStream(logoBytes))
                        {
                            logo = XImage.FromStream(() => new MemoryStream(logoBytes));
                        }
                    }
                }

                if (logo != null)
                {
                    var logoHeight = 50;
                    var logoWidth = logo.PixelWidth * (logoHeight / (double)logo.PixelHeight);
                    double logoX = right - logoWidth;
                    double logoY = y - 20;

                    if (logoX > 0 && y > 0)
                    {
                        gfx.DrawImage(logo, logoX, logoY, logoWidth, logoHeight);
                        headerHeight = logoHeight;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
            }


            // Draw company info
            double companyInfoY = y;
            gfx.DrawString("Bitmutex Technologies", boldFont, XBrushes.Black, left, companyInfoY);
            gfx.DrawString("Kolkata,India", font, XBrushes.Black, left, companyInfoY += 15);
            gfx.DrawString("Phone: (555) 555-5555 | Website: www.bitmutex.com", font, XBrushes.Black, left, companyInfoY += 15);

            // Adjust y to be below the header section
            y = y + (headerHeight > (companyInfoY - y) ? headerHeight : (companyInfoY - y)) + 10;

            // Report Title
            gfx.DrawString("Heat Loss Analysis Report", headerFont, XBrushes.Black,
                new XRect(0, y, pageWidth, 40), XStringFormats.Center);
            y += 40;
            DrawLine(y);
            y += 10;

            // Section: Surface Info
            gfx.DrawString("Surface Information", sectionFont, XBrushes.DarkBlue, left, y);
            y += 25;
            gfx.DrawString($"Surface Name: {request.SurfaceName}", boldFont, XBrushes.Black, left, y);
            y += 10;
            DrawLine(y += 10);

            // Section: Assumptions
            gfx.DrawString("Assumptions", sectionFont, XBrushes.DarkBlue, left, y += 20);
            y += 20;
            gfx.DrawString($"Hot Side Temp: {request.HotSideTemp} °F", font, XBrushes.Black, left, y); y += 18;
            gfx.DrawString($"Ambient Temp: {request.AmbientTemp} °F", font, XBrushes.Black, left, y); y += 18;
            gfx.DrawString($"Velocity: {request.Velocity} ft/s", font, XBrushes.Black, left, y); y += 18;
            gfx.DrawString($"Emissivity: {request.Emissivity}", font, XBrushes.Black, left, y); y += 18;
            gfx.DrawString($"Freeze Plane Temp: {request.FreezePlaneTemp} °F", font, XBrushes.Black, left, y); y += 18;
            gfx.DrawString($"Area: {request.Area} in²", font, XBrushes.Black, left, y); y += 10;
            DrawLine(y += 10);

            // Section: Layers
            gfx.DrawString("Layer Configuration", sectionFont, XBrushes.DarkBlue, left, y += 20);
            y += 25;
            var colX = new[] { left, 90, 180, 320, 410, 500, 600 };
            var headers = new[] { "Layer #", "Thickness (in)", "Product", "Max Limit (°F)", "HS Temp", "CS Temp", "Limit Exceeded" };
            for (int i = 0; i < headers.Length; i++)
                gfx.DrawString(headers[i], boldFont, XBrushes.Black, colX[i], y);
            y += 20;

            if (request.Layers != null)
            {
                foreach (var layer in request.Layers)
                {
                    gfx.DrawString(layer.LayerNumber.ToString(), font, XBrushes.Black, colX[0], y);
                    gfx.DrawString(layer.Thickness.ToString("F2"), font, XBrushes.Black, colX[1], y);
                    gfx.DrawString(layer.Product, font, XBrushes.Black, colX[2], y);
                    gfx.DrawString(layer.MaxLimitTemp.ToString("F0"), font, XBrushes.Black, colX[3], y);
                    gfx.DrawString(layer.HotSideTemp.ToString("F0"), font, XBrushes.Black, colX[4], y);
                    gfx.DrawString(layer.ColdSideTemp.ToString("F0"), font, XBrushes.Black, colX[5], y);
                    gfx.DrawString(layer.LimitExceeded ? "Yes" : "No", font, XBrushes.Black, colX[6], y);
                    y += 18;
                }
            }
            DrawLine(y += 10);

            // Section: Results
            gfx.DrawString("Calculation Results", sectionFont, XBrushes.DarkBlue, left, y += 25);
            y += 20;
            gfx.DrawString($"Cold Face Temp: {request.ColdFaceTemp} °F", font, XBrushes.Black, left, y); y += 18;
            gfx.DrawString($"Heat Loss: {request.HeatLoss} btu/hr/ft²", font, XBrushes.Black, left, y); y += 18;
            gfx.DrawString($"Total Heat Loss: {request.TotalHeatLoss:N2} btu/hr", font, XBrushes.Black, left, y); y += 18;
            gfx.DrawString($"Freeze Plane Depth: {request.FreezePlaneDepth} in", font, XBrushes.Black, left, y); y += 10;
            DrawLine(y += 10);

            // Attach additional image if provided
            if (imageBytes != null)
            {
                try
                {
                    using var imageStream = new MemoryStream(imageBytes);
                    var image = XImage.FromStream(() => imageStream);
                    double imageWidth = pageWidth * 0.7;
                    double imageHeight = image.PixelHeight * (imageWidth / image.PixelWidth);
                    double imageX = (page.Width - imageWidth) / 2;
                    if (y + imageHeight > page.Height)
                    {
                        page = document.AddPage();
                        gfx = XGraphics.FromPdfPage(page);
                        y = 40;
                    }
                    gfx.DrawString("Analysis Graph:", boldFont, XBrushes.Black, left, y);
                    y += 10;
                    gfx.DrawImage(image, imageX, y, imageWidth, imageHeight);
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Failed to add image to PDF: {ex.Message}");
                }
            }

            document.Save(ms);
            return ms.ToArray();
        }
    }
}
