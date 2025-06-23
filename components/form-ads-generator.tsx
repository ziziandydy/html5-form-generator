"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FormPreview } from "./form-preview"
import { downloadAdAsZip } from "@/lib/download-helper"
import type { FormField, FormSettings } from "@/lib/types"

export default function FormAdsGenerator() {
  const [settings, setSettings] = useState<FormSettings>({
    // Ad Page Settings
    landingPageEnabled: true,
    landingPageImage: null,
    landingPageCtaText: "Register",
    landingPageCtaPlacement: "center",

    // Form Settings
    adSize: "300x600",
    backgroundColor: "#ffffff",
    formTitle: "Contact Us",
    submitButtonText: "Submit",
    submitButtonColor: "#4f46e5",
    websiteName: "Example.com",
    fields: [
      { id: "1", type: "text", label: "Name", placeholder: "Enter your name", required: true, enabled: true },
      { id: "2", type: "email", label: "Email", placeholder: "Enter your email", required: true, enabled: true },
      { id: "3", type: "tel", label: "Mobile", placeholder: "Enter your mobile number", required: true, enabled: true },
      {
        id: "4",
        type: "textarea",
        label: "Description",
        placeholder: "Tell us more...",
        required: false,
        enabled: true,
      },
    ],

    // Thank You Page Settings
    thankYouTitle: "Thank you for submitting",
    thankYouMessage: "View our website for more information.",
    ctaButtonText: "Visit Website",
    ctaButtonUrl: "https://example.com",
    trackingUrl: "https://pioneer.ghtinc.com/cm?cn=groundhog",
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSettings((prev) => ({
          ...prev,
          landingPageImage: result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFieldChange = (id: string, field: Partial<FormField>) => {
    setSettings((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...field } : f)),
    }))
  }

  const handleSettingChange = (key: keyof FormSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <Card className="h-fit">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Form Settings</h2>

          <Tabs defaultValue="adpage">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="adpage" className="flex-1">
                Ad Page
              </TabsTrigger>
              <TabsTrigger value="form" className="flex-1">
                Form Page
              </TabsTrigger>
              <TabsTrigger value="thankyou" className="flex-1">
                Thank You Page
              </TabsTrigger>
            </TabsList>

            <TabsContent value="adpage" className="space-y-4">
              <div>
                <Label htmlFor="adSize">Ad Size</Label>
                <Select value={settings.adSize} onValueChange={(value) => handleSettingChange("adSize", value)}>
                  <SelectTrigger id="adSize">
                    <SelectValue placeholder="Select ad size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300x600">300 x 600</SelectItem>
                    <SelectItem value="320x480">320 x 480</SelectItem>
                    <SelectItem value="970x250">970 x 250</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="landingPageEnabled"
                  checked={settings.landingPageEnabled}
                  onCheckedChange={(checked) => handleSettingChange("landingPageEnabled", checked)}
                />
                <Label htmlFor="landingPageEnabled">Enable Ad Page</Label>
              </div>

              {settings.landingPageEnabled && (
                <>
                  <div>
                    <Label htmlFor="landingPageImage">Ad Image</Label>
                    <Input
                      id="landingPageImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-1"
                    />
                    {settings.landingPageImage && (
                      <div className="mt-2">
                        <img
                          src={settings.landingPageImage || "/placeholder.svg"}
                          alt="Ad page image"
                          className="w-full h-32 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="landingPageCtaText">CTA Button Text</Label>
                    <Input
                      id="landingPageCtaText"
                      value={settings.landingPageCtaText}
                      onChange={(e) => handleSettingChange("landingPageCtaText", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="landingPageCtaPlacement">CTA Button Position</Label>
                    <Select
                      value={settings.landingPageCtaPlacement}
                      onValueChange={(value) => handleSettingChange("landingPageCtaPlacement", value)}
                    >
                      <SelectTrigger id="landingPageCtaPlacement">
                        <SelectValue placeholder="Select button position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="bottom-center">Bottom Center</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="submitButtonColor">Button Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="submitButtonColor"
                        type="color"
                        value={settings.submitButtonColor}
                        onChange={(e) => handleSettingChange("submitButtonColor", e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={settings.submitButtonColor}
                        onChange={(e) => handleSettingChange("submitButtonColor", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="form" className="space-y-6">
              {/* General Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">General Settings</h3>

                <div className={settings.adSize === "970x250" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => handleSettingChange("backgroundColor", e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) => handleSettingChange("backgroundColor", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="formTitle">Form Title</Label>
                    <Input
                      id="formTitle"
                      value={settings.formTitle}
                      onChange={(e) => handleSettingChange("formTitle", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="submitButtonText">Submit Button Text</Label>
                    <Input
                      id="submitButtonText"
                      value={settings.submitButtonText}
                      onChange={(e) => handleSettingChange("submitButtonText", e.target.value)}
                    />
                  </div>

                  <div className={settings.adSize === "970x250" ? "col-span-2" : ""}>
                    <Label htmlFor="websiteName">Website Name</Label>
                    <Input
                      id="websiteName"
                      value={settings.websiteName}
                      onChange={(e) => handleSettingChange("websiteName", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Form Fields</h3>

                <div className={settings.adSize === "970x250" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
                  {settings.fields.map((field) => (
                    <div key={field.id} className="p-4 border rounded-md">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Field {field.id}</h4>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`enabled-${field.id}`} className="text-sm">
                            Enabled
                          </Label>
                          <Switch
                            id={`enabled-${field.id}`}
                            checked={field.enabled}
                            onCheckedChange={(checked) => handleFieldChange(field.id, { enabled: checked })}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`label-${field.id}`}>Label</Label>
                          <Input
                            id={`label-${field.id}`}
                            value={field.label}
                            onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
                            disabled={!field.enabled}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`type-${field.id}`}>Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => handleFieldChange(field.id, { type: value })}
                            disabled={!field.enabled}
                          >
                            <SelectTrigger id={`type-${field.id}`}>
                              <SelectValue placeholder="Select field type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="tel">Telephone</SelectItem>
                              <SelectItem value="textarea">Text Area</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                          <Input
                            id={`placeholder-${field.id}`}
                            value={field.placeholder}
                            onChange={(e) => handleFieldChange(field.id, { placeholder: e.target.value })}
                            disabled={!field.enabled}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            id={`required-${field.id}`}
                            checked={field.required}
                            onCheckedChange={(checked) => handleFieldChange(field.id, { required: checked })}
                            disabled={!field.enabled}
                          />
                          <Label htmlFor={`required-${field.id}`}>Required</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="thankyou" className="space-y-4">
              <div>
                <Label htmlFor="thankYouTitle">Thank You Title</Label>
                <Input
                  id="thankYouTitle"
                  value={settings.thankYouTitle}
                  onChange={(e) => handleSettingChange("thankYouTitle", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="thankYouMessage">Thank You Message</Label>
                <Textarea
                  id="thankYouMessage"
                  value={settings.thankYouMessage}
                  onChange={(e) => handleSettingChange("thankYouMessage", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ctaButtonText">CTA Button Text</Label>
                <Input
                  id="ctaButtonText"
                  value={settings.ctaButtonText}
                  onChange={(e) => handleSettingChange("ctaButtonText", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ctaButtonUrl">CTA Button URL</Label>
                <Input
                  id="ctaButtonUrl"
                  value={settings.ctaButtonUrl}
                  onChange={(e) => handleSettingChange("ctaButtonUrl", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="trackingUrl">Tracking URL</Label>
                <Input
                  id="trackingUrl"
                  value={settings.trackingUrl}
                  onChange={(e) => handleSettingChange("trackingUrl", e.target.value)}
                  placeholder="https://pioneer.ghtinc.com/cm?cn=groundhog"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button onClick={() => downloadAdAsZip(settings)} className="w-full">
              Download ZIP File
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="sticky top-4">
        <h2 className="text-xl font-bold mb-4">Preview</h2>
        <div className="border rounded-md overflow-hidden bg-gray-50 p-4 flex items-center justify-center min-h-[400px]">
          <FormPreview settings={settings} />
        </div>
      </div>
    </div>
  )
}
