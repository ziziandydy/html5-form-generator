"use client"

import JSZip from "jszip"
import saveAs from "file-saver"
import type { FormSettings } from "./types"

function generateTrackingScript(trackingUrl: string): string {
  return `
  <script>
    // Generate unique session ID
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
  </script>`
}

export async function downloadAdAsZip(settings: FormSettings) {
  const zip = new JSZip()

  // Generate HTML content for each page
  if (settings.landingPageEnabled) {
    const adPageContent = generateAdPageContent(settings)
    zip.file("ad-page.html", adPageContent)
  }

  const formPageContent = generateFormPageContent(settings)
  zip.file("form-page.html", formPageContent)

  const thankYouPageContent = generateThankYouPageContent(settings)
  zip.file("thank-you-page.html", thankYouPageContent)

  // Generate main index file that starts with the appropriate page
  const indexContent = generateIndexContent(settings)
  zip.file("index.html", indexContent)

  // Generate the zip file
  const content = await zip.generateAsync({ type: "blob" })

  // Save the zip file
  saveAs(content, `form-ad-${settings.adSize}.zip`)
}

function generateIndexContent(settings: FormSettings): string {
  const [width, height] = settings.adSize.split("x")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form Ad</title>
  <style>
    body {
      width: ${width}px;
      height: ${height}px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  </style>
</head>
<body>
  <script>
    // Redirect to the appropriate starting page
    ${
      settings.landingPageEnabled
        ? 'window.location.href = "ad-page.html";'
        : 'window.location.href = "form-page.html";'
    }
  </script>
</body>
</html>`
}

function generateAdPageContent(settings: FormSettings): string {
  const [width, height] = settings.adSize.split("x")

  const getCtaPositionClasses = () => {
    switch (settings.landingPageCtaPlacement) {
      case "center":
        return "display: flex; flex-direction: column; align-items: center; justify-content: center;"
      case "bottom-center":
        return "display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 48px;"
      case "bottom-right":
        return "display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; padding-bottom: 16px; padding-right: 16px;"
      default:
        return "display: flex; flex-direction: column; align-items: center; justify-content: center;"
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ad Page</title>
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
      ${getCtaPositionClasses()}
      background-size: cover;
      background-position: center;
      ${settings.landingPageImage ? `background-image: url('${settings.landingPageImage}');` : `background-color: ${settings.backgroundColor};`}
    }
    
    .cta-button {
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
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }
    
    .cta-button:hover {
      opacity: 0.9;
    }
  </style>
  ${generateTrackingScript(settings.trackingUrl)}
</head>
<body>
  <a href="form-page.html" class="cta-button" onclick="sendTracking('ad_page', 'cta_click')">${settings.landingPageCtaText}</a>
</body>
</html>`
}

function generateFormPageContent(settings: FormSettings): string {
  const [width, height] = settings.adSize.split("x")
  const enabledFields = settings.fields.filter((field) => field.enabled)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form Page</title>
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
      background-color: ${settings.backgroundColor};
      padding: ${settings.adSize === "970x250" ? "12px" : "16px"};
    }
    
    h2 {
      font-size: ${settings.adSize === "970x250" ? "16px" : "18px"};
      font-weight: bold;
      margin-bottom: ${settings.adSize === "970x250" ? "12px" : "16px"};
      text-align: center;
    }

    .form-container {
      ${settings.adSize === "970x250" ? "display: grid; grid-template-columns: 1fr 1fr; gap: 16px 12px;" : ""}
      height: calc(100% - ${settings.adSize === "970x250" ? "28px" : "34px"});
      overflow: auto;
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
    }
    
    input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }
    
    textarea {
      resize: vertical;
      min-height: 60px;
    }
    
    .required {
      color: #e53e3e;
      margin-left: 2px;
    }
    
    button {
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
  </style>
  ${generateTrackingScript(settings.trackingUrl)}
</head>
<body>
  <h2>${settings.formTitle}</h2>
  <form class="form-container" onsubmit="handleSubmit(event)">
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
      <button type="submit">${settings.submitButtonText}</button>
    </div>
  </form>

  <script>
    function handleSubmit(event) {
      event.preventDefault();
      sendTracking('form_page', 'form_submit');
      setTimeout(function() {
        window.location.href = "thank-you-page.html";
      }, 100);
    }
  </script>
</body>
</html>`
}

function generateThankYouPageContent(settings: FormSettings): string {
  const [width, height] = settings.adSize.split("x")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You Page</title>
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
      background-color: ${settings.backgroundColor};
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 16px;
    }
    
    h2 {
      font-size: ${settings.adSize === "970x250" ? "16px" : "18px"};
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    p {
      margin-bottom: 16px;
      font-size: 14px;
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
    }
  </style>
  ${generateTrackingScript(settings.trackingUrl)}
</head>
<body>
  <h2>${settings.thankYouTitle}</h2>
  <p>${settings.thankYouMessage}</p>
  <a href="${settings.ctaButtonUrl}" class="cta-button" target="_blank" onclick="sendTracking('thank_you_page', 'visit_website_click')">${settings.ctaButtonText}</a>
</body>
</html>`
}
