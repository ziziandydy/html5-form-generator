export type AdSize = "300x600" | "320x480" | "970x250"
export type CtaPlacement = "center" | "bottom-center" | "bottom-right"

export interface FormField {
  id: string
  type: "text" | "email" | "tel" | "textarea"
  label: string
  placeholder: string
  required: boolean
  enabled: boolean
}

export interface FormSettings {
  // Ad Page Settings
  landingPageEnabled: boolean
  landingPageImage: string | null
  landingPageCtaText: string
  landingPageCtaPlacement: CtaPlacement

  // Form Settings
  adSize: AdSize
  backgroundColor: string
  formTitle: string
  submitButtonText: string
  submitButtonColor: string
  websiteName: string
  fields: FormField[]

  // Thank You Page Settings
  thankYouTitle: string
  thankYouMessage: string
  ctaButtonText: string
  ctaButtonUrl: string
  trackingUrl: string
}
