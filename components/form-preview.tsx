"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { FormSettings } from "@/lib/types"

interface FormPreviewProps {
  settings: FormSettings
}

export function FormPreview({ settings }: FormPreviewProps) {
  const [currentPage, setCurrentPage] = useState<"landing" | "form" | "thankyou">(() =>
    settings.landingPageEnabled ? "landing" : "form",
  )

  const [dimensions, setDimensions] = useState(() => {
    const [width, height] = settings.adSize.split("x").map(Number)
    return { width, height }
  })

  // Update dimensions when ad size changes
  useEffect(() => {
    const [width, height] = settings.adSize.split("x").map(Number)
    setDimensions({ width, height })
  }, [settings.adSize])

  // Reset to appropriate page when ad page setting changes
  useEffect(() => {
    if (!settings.landingPageEnabled && currentPage === "landing") {
      setCurrentPage("form")
    }
  }, [settings.landingPageEnabled, currentPage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage("thankyou")
  }

  const goToForm = () => {
    setCurrentPage("form")
  }

  const enabledFields = settings.fields.filter((field) => field.enabled)

  // Get available pages based on settings
  const getAvailablePages = () => {
    const pages = []
    if (settings.landingPageEnabled) {
      pages.push({ key: "landing", label: "Ad Page" })
    }
    pages.push({ key: "form", label: "Form Page" })
    pages.push({ key: "thankyou", label: "Thank You Page" })
    return pages
  }

  const availablePages = getAvailablePages()

  // Get CTA button positioning classes
  const getCtaPositionClasses = () => {
    switch (settings.landingPageCtaPlacement) {
      case "center":
        return "flex flex-col items-center justify-center"
      case "bottom-center":
        return "flex flex-col justify-end items-center pb-12"
      case "bottom-right":
        return "flex flex-col justify-end items-end pb-4 pr-4"
      default:
        return "flex flex-col items-center justify-center"
    }
  }

  return (
    <div className="space-y-4">
      {/* Page Navigation Controls */}
      <div className="flex gap-2 justify-center">
        {availablePages.map((page) => (
          <Button
            key={page.key}
            variant={currentPage === page.key ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(page.key as "landing" | "form" | "thankyou")}
          >
            {page.label}
          </Button>
        ))}
      </div>

      {/* Preview Container */}
      <div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: settings.backgroundColor,
          overflow: "hidden",
        }}
        className="mx-auto relative shadow-lg"
      >
        <div className="w-full h-full">
          {/* Ad Page */}
          {currentPage === "landing" && settings.landingPageEnabled && (
            <div
              className={`w-full h-full relative ${getCtaPositionClasses()}`}
              style={{
                backgroundImage: settings.landingPageImage ? `url(${settings.landingPageImage})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="relative z-10 text-center">
                <button
                  onClick={goToForm}
                  style={{ backgroundColor: settings.submitButtonColor }}
                  className="py-3 px-6 text-white rounded-md font-medium text-lg shadow-lg hover:opacity-90 transition-opacity"
                >
                  {settings.landingPageCtaText}
                </button>
              </div>
            </div>
          )}

          {/* Form Page */}
          {currentPage === "form" && (
            <div className={`h-full overflow-auto ${settings.adSize === "970x250" ? "p-3" : "p-4"}`}>
              <h2 className={`font-bold mb-3 text-center ${settings.adSize === "970x250" ? "text-base" : "text-lg"}`}>
                {settings.formTitle}
              </h2>
              <form
                onSubmit={handleSubmit}
                className={settings.adSize === "970x250" ? "grid grid-cols-2 gap-x-4 gap-y-2" : "space-y-3"}
              >
                {enabledFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`space-y-1 ${settings.adSize === "970x250" && field.type === "textarea" ? "col-span-2" : ""}`}
                  >
                    <label className="block text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full p-2 border rounded-md text-sm"
                        rows={settings.adSize === "970x250" ? 2 : 3}
                      />
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full p-2 border rounded-md text-sm"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  style={{ backgroundColor: settings.submitButtonColor }}
                  className={`text-white rounded-md font-medium ${
                    settings.adSize === "970x250" ? "col-span-2 py-2 px-4 mt-2" : "w-full py-2 px-4 mt-4"
                  }`}
                >
                  {settings.submitButtonText}
                </button>
              </form>
            </div>
          )}

          {/* Thank You Page */}
          {currentPage === "thankyou" && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <h2 className={`font-bold mb-2 ${settings.adSize === "970x250" ? "text-base" : "text-lg"}`}>
                {settings.thankYouTitle}
              </h2>
              <p className="mb-4 text-sm">{settings.thankYouMessage}</p>
              <a
                href={settings.ctaButtonUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: settings.submitButtonColor }}
                className="py-2 px-4 text-white rounded-md font-medium text-sm"
              >
                {settings.ctaButtonText}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
