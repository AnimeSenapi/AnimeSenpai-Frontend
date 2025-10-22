'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/toast'
import { 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  ArrowLeft,
  X,
  Settings,
  Filter
} from 'lucide-react'

interface ExportStep {
  id: string
  title: string
  description: string
  completed: boolean
}

interface ExportOptions {
  format: 'json' | 'csv' | 'xml'
  includePrivate: boolean
  includeNotes: boolean
  includeScores: boolean
  includeProgress: boolean
  dateRange: {
    start?: string
    end?: string
  }
}

interface ListExportWizardProps {
  onExport: (options: ExportOptions) => Promise<Blob>
  onCancel?: () => void
  isOpen?: boolean
  onClose?: () => void
}

export function ListExportWizard({
  onExport,
  onCancel,
  isOpen = false,
  onClose
}: ListExportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includePrivate: false,
    includeNotes: true,
    includeScores: true,
    includeProgress: true,
    dateRange: {}
  })
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const steps: ExportStep[] = [
    {
      id: 'format',
      title: 'Choose Format',
      description: 'Select export format and options',
      completed: currentStep > 0
    },
    {
      id: 'options',
      title: 'Export Options',
      description: 'Configure what to include',
      completed: currentStep > 1
    },
    {
      id: 'export',
      title: 'Export Complete',
      description: 'Your list has been exported',
      completed: currentStep > 2
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)

    try {
      const blob = await onExport(exportOptions)
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `anime-list-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setCurrentStep(2)
      toast({
        title: 'Export successful!',
        message: 'Your anime list has been downloaded.',
        type: 'success',
      })
    } catch (err) {
      console.error('Failed to export:', err)
      setError(err instanceof Error ? err.message : 'Failed to export list')
      toast({
        title: 'Export failed',
        message: 'Please try again.',
        type: 'error',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(0)
    setExportOptions({
      format: 'json',
      includePrivate: false,
      includeNotes: true,
      includeScores: true,
      includeProgress: true,
      dateRange: {}
    })
    setError(null)
    onClose?.()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Download className="h-6 w-6 text-violet-400" />
                Export Anime List
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                    ${step.completed 
                      ? 'bg-violet-600 border-violet-600 text-white' 
                      : index === currentStep
                      ? 'border-violet-500 text-violet-500'
                      : 'border-gray-600 text-gray-400'
                    }
                  `}>
                    {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className={`text-sm font-medium ${step.completed || index === currentStep ? 'text-white' : 'text-gray-400'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-px bg-gray-600 mx-4" />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Choose Export Format</h3>
                  <p className="text-gray-400 mb-6">Select the format for your exported anime list.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card 
                    className={`border-2 cursor-pointer transition-colors ${
                      exportOptions.format === 'json' 
                        ? 'border-violet-500 bg-violet-900/20' 
                        : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: 'json' }))}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-6 w-6 text-blue-400" />
                        <h4 className="font-semibold text-white">JSON</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Structured data format, best for importing to other applications.
                      </p>
                      <Badge variant="secondary" className="bg-blue-900/30 text-blue-300">
                        Recommended
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`border-2 cursor-pointer transition-colors ${
                      exportOptions.format === 'csv' 
                        ? 'border-violet-500 bg-violet-900/20' 
                        : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: 'csv' }))}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-6 w-6 text-green-400" />
                        <h4 className="font-semibold text-white">CSV</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Spreadsheet format, compatible with Excel and Google Sheets.
                      </p>
                      <Badge variant="secondary" className="bg-green-900/30 text-green-300">
                        Spreadsheet
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`border-2 cursor-pointer transition-colors ${
                      exportOptions.format === 'xml' 
                        ? 'border-violet-500 bg-violet-900/20' 
                        : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: 'xml' }))}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-6 w-6 text-orange-400" />
                        <h4 className="font-semibold text-white">XML</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        MyAnimeList compatible format for easy migration.
                      </p>
                      <Badge variant="secondary" className="bg-orange-900/30 text-orange-300">
                        MyAnimeList
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Export Options</h3>
                  <p className="text-gray-400 mb-6">Configure what data to include in your export.</p>
                </div>

                <div className="space-y-6">
                  {/* Privacy Settings */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Privacy</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includePrivate}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includePrivate: e.target.checked }))}
                          className="w-4 h-4 text-violet-600 bg-gray-700 border-gray-600 rounded focus:ring-violet-500"
                        />
                        <span className="text-gray-300">Include private anime</span>
                        <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                          Personal lists
                        </Badge>
                      </label>
                    </div>
                  </div>

                  {/* Data Options */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Data to Include</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeNotes}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeNotes: e.target.checked }))}
                          className="w-4 h-4 text-violet-600 bg-gray-700 border-gray-600 rounded focus:ring-violet-500"
                        />
                        <span className="text-gray-300">Personal notes</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeScores}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeScores: e.target.checked }))}
                          className="w-4 h-4 text-violet-600 bg-gray-700 border-gray-600 rounded focus:ring-violet-500"
                        />
                        <span className="text-gray-300">Ratings and scores</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeProgress}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeProgress: e.target.checked }))}
                          className="w-4 h-4 text-violet-600 bg-gray-700 border-gray-600 rounded focus:ring-violet-500"
                        />
                        <span className="text-gray-300">Watch progress</span>
                      </label>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Date Range (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">From Date</label>
                        <input
                          type="date"
                          value={exportOptions.dateRange.start || ''}
                          onChange={(e) => setExportOptions(prev => ({ 
                            ...prev, 
                            dateRange: { ...prev.dateRange, start: e.target.value || undefined }
                          }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">To Date</label>
                        <input
                          type="date"
                          value={exportOptions.dateRange.end || ''}
                          onChange={(e) => setExportOptions(prev => ({ 
                            ...prev, 
                            dateRange: { ...prev.dateRange, end: e.target.value || undefined }
                          }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-semibold text-white mb-2">Export Complete!</h3>
                <p className="text-gray-400 mb-6">
                  Your anime list has been exported and downloaded.
                </p>
                <Button
                  onClick={handleClose}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Done
                </Button>
              </div>
            )}

            {/* Navigation */}
            {currentStep < 2 && (
              <div className="flex justify-between pt-6 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={currentStep === 0 ? handleClose : handlePrevious}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {currentStep === 0 ? 'Cancel' : 'Previous'}
                </Button>
                
                {currentStep === 1 && (
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export List
                  </Button>
                )}
                
                {currentStep === 0 && (
                  <Button
                    onClick={handleNext}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-600 rounded-lg mt-4">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
