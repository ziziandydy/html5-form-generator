"use client"

import JSZip from "jszip"
import saveAs from "file-saver"
import type { FormSettings } from "./types"

function generateTrackingScript(trackingUrl: string): string {
  return `// Generate unique session ID
const gid = 'gid_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

function sendTracking(pageName, eventName) {
  const timestamp = Date.now();
  const trackingParams = new URLSearchParams({
    timestamp: timestamp.toString(),
    gid: gid,
    page: pageName,
    event: eventName
  });
  
  const trackingUrl = '${trackingUrl}' + '&' + trackingParams.toString();
  
  // Send tracking request
  const img = new Image();
  img.src = trackingUrl;
}

// Track page view on load
window.addEventListener('load', function() {
  sendTracking(document.title.toLowerCase().replace(' ', '_'), 'page_view');
});

// Navigation functions
function showForm() {
  const landingPage = document.getElementById('landing-page');
  const formPage = document.getElementById('form-page');
  if (landingPage) landingPage.style.display = 'none';
  if (formPage) formPage.style.display = 'block';
  sendTracking('ad_page', 'cta_click');
}

function showThankYou() {
  const formPage = document.getElementById('form-page');
  const thankYouPage = document.getElementById('thank-you-page');
  if (formPage) formPage.style.display = 'none';
  if (thankYouPage) thankYouPage.style.display = 'block';
  sendTracking('form_page', 'form_submit');
}

function visitWebsite(url) {
  sendTracking('thank_you_page', 'visit_website_click');
  window.open(url, '_blank');
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('ad-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      showThankYou();
    });
  }
});`
}

async function compressImage(dataUrl: string, maxSizeKB = 400): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      let { width, height } = img
      const maxDimension = 1200

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else {
          width = (width * maxDimension) / height
          height = maxDimension
        }
      }

      canvas.width = width
      canvas.height = height

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        let quality = 0.8
        let compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
        const estimatedSize = (compressedDataUrl.length * 0.75) / 1024

        if (estimatedSize > maxSizeKB && quality > 0.3) {
          quality = Math.max(0.3, (maxSizeKB / estimatedSize) * quality)
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
        }

        resolve(compressedDataUrl)
      } else {
        resolve(dataUrl)
      }
    }

    img.src = dataUrl
  })
}

export async function downloadAdAsZip(settings: FormSettings) {
  const zip = new JSZip()
  const [width, height] = settings.adSize.split("x")

  // Create images folder
  const imagesFolder = zip.folder("images")

  // Handle background image
  let backgroundImagePath = ""
  if (settings.landingPageImage) {
    try {
      const compressedImage = await compressImage(settings.landingPageImage, 400)
      const imageData = compressedImage.split(",")[1]
      backgroundImagePath = "images/background.jpg"
      imagesFolder?.file("background.jpg", imageData, { base64: true })
    } catch (error) {
      console.warn("Failed to compress image:", error)
    }
  }

  // Generate JavaScript file
  const jsContent = generateTrackingScript(settings.trackingUrl)
  zip.file(`${settings.adSize}.js`, jsContent)

  // Generate HTML content
  const htmlContent = generateHtmlContent(settings, backgroundImagePath)
  zip.file(`${settings.adSize}.html`, htmlContent)

  // Generate the zip file
  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  })

  // Check file size
  const maxSize = 5 * 1024 * 1024
  if (content.size > maxSize) {
    alert(`Warning: Generated file size (${(content.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit.`)
  }

  saveAs(content, `${settings.adSize}.zip`)
}

function generateHtmlContent(settings: FormSettings, backgroundImagePath: string): string {
  const [width, height] = settings.adSize.split("x")
  const enabledFields = settings.fields.filter((field) => field.enabled)

  // Get CTA positioning styles
  const getCtaPositionStyles = () => {
    switch (settings.landingPageCtaPlacement) {
      case "center":
        return "display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;"
      case "bottom-center":
        return "display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; padding-bottom: 48px;"
      case "bottom-right":
        return "display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; height: 100%; padding-bottom: 16px; padding-right: 16px;"
      default:
        return "display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;"
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form Ad ${settings.adSize}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      position: relative;
    }
    
    .page {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    
    /* Landing Page Styles */
    #landing-page {
      ${getCtaPositionStyles()}
      background-color: ${settings.backgroundColor};
      ${backgroundImagePath ? `background-image: url('${backgroundImagePath}');` : ""}
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: ${settings.landingPageEnabled ? "flex" : "none"};
    }
    
    .landing-cta {
      padding: 12px 24px;
      background-color: ${settings.submitButtonColor};
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: opacity 0.2s;
      position: relative;
      z-index: 10;
    }
    
    .landing-cta:hover {
      opacity: 0.9;
    }
    
    /* Form Page Styles */
    #form-page {
      background-color: ${settings.backgroundColor};
      padding: ${settings.adSize === "970x250" ? "12px" : "16px"};
      display: ${settings.landingPageEnabled ? "none" : "block"};
      overflow: auto;
    }
    
    .form-title {
      font-size: ${settings.adSize === "970x250" ? "16px" : "18px"};
      font-weight: bold;
      margin-bottom: ${settings.adSize === "970x250" ? "12px" : "16px"};
      text-align: center;
      color: #000;
    }

    .form-container {
      ${settings.adSize === "970x250" ? "display: grid; grid-template-columns: 1fr 1fr; gap: 16px 12px;" : ""}
      height: calc(100% - ${settings.adSize === "970x250" ? "28px" : "34px"});
    }
    
    .form-group {
      margin-bottom: ${settings.adSize === "970x250" ? "8px" : "12px"};
    }

    .form-group.textarea-field {
      ${settings.adSize === "970x250" ? "grid-column: span 2;" : ""}
    }

    .submit-section {
      ${settings.adSize === "970x250" ? "grid-column: span 2; margin-top: 8px;" : "margin-top: 16px;"}
    }
    
    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
      color: #000;
    }
    
    input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      background: white;
    }
    
    textarea {
      resize: vertical;
      min-height: ${settings.adSize === "970x250" ? "40px" : "60px"};
    }
    
    .required {
      color: #e53e3e;
      margin-left: 2px;
    }
    
    .submit-button {
      width: 100%;
      padding: 8px 16px;
      background-color: ${settings.submitButtonColor};
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    
    .submit-button:hover {
      opacity: 0.9;
    }
    
    /* Thank You Page Styles */
    #thank-you-page {
      background-color: ${settings.backgroundColor};
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      height: 100%;
      padding: 16px;
    }
    
    .thank-you-title {
      font-size: ${settings.adSize === "970x250" ? "16px" : "18px"};
      font-weight: bold;
      margin-bottom: 8px;
      color: #000;
    }
    
    .thank-you-message {
      margin-bottom: 16px;
      font-size: 14px;
      color: #000;
    }
    
    .cta-button {
      display: inline-block;
      padding: 8px 16px;
      background-color: ${settings.submitButtonColor};
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      border: none;
    }
    
    .cta-button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  ${
    settings.landingPageEnabled
      ? `
  <!-- Landing Page -->
  <div id="landing-page" class="page">
    <button class="landing-cta" onclick="showForm()">${settings.landingPageCtaText}</button>
  </div>
  `
      : ""
  }
  
  <!-- Form Page -->
  <div id="form-page" class="page">
    <h2 class="form-title">${settings.formTitle}</h2>
    <form id="ad-form">
      <div class="form-container">
        ${enabledFields
          .map(
            (field) => `
        <div class="form-group ${field.type === "textarea" ? "textarea-field" : ""}">
          <label for="${field.id}">
            ${field.label}${field.required ? '<span class="required">*</span>' : ""}
          </label>
          ${
            field.type === "textarea"
              ? `<textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder}" ${field.required ? "required" : ""} rows="${settings.adSize === "970x250" ? "2" : "3"}"></textarea>`
              : `<input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder}" ${field.required ? "required" : ""}>`
          }
        </div>`,
          )
          .join("")}
        
        <div class="submit-section">
          <button type="submit" class="submit-button">${settings.submitButtonText}</button>
        </div>
      </div>
    </form>
  </div>
  
  <!-- Thank You Page -->
  <div id="thank-you-page" class="page">
    <h2 class="thank-you-title">${settings.thankYouTitle}</h2>
    <p class="thank-you-message">${settings.thankYouMessage}</p>
    <button class="cta-button" onclick="visitWebsite('${settings.ctaButtonUrl}')">${settings.ctaButtonText}</button>
  </div>

  <script src="${settings.adSize}.js"></script>
</body>
</html>`
}
