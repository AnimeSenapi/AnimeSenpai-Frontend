'use client'

import { useState, useRef } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/toast'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Download,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react'

interface ImportStep {
  id: string
  title: string
  description: string
  completed: boolean
}

interface ImportedAnime {
  title: string
  titleEnglish?: string
  status: 'watching' | 'completed' | 'plan-to-watch' | 'on-hold' | 'dropped'
  score?: number
  progress?: number
  notes?: string
  malId?: string
  anilistId?: string
}

interface ListImportWizardProps {
  onImport: (anime: ImportedAnime[]) => Promise<void>
  onCancel?: () => void
  isOpen?: boolean
  onClose?: () => void
}

export function ListImportWizard({
  onImport,
  onCancel,
  isOpen = false,
  onClose
}: ListImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [importedData, setImportedData] = useState<ImportedAnime[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  const steps: ImportStep[] = [
    {
      id: 'source',
      title: 'Choose Import Source',
      description: 'Select where you want to import from',
      completed: currentStep > 0
    },
    {
      id: 'upload',
      title: 'Upload File',
      description: 'Upload your anime list file',
      completed: currentStep > 1
    },
    {
      id: 'review',
      title: 'Review & Confirm',
      description: 'Review imported data and confirm',
      completed: currentStep > 2
    },
    {
      id: 'import',
      title: 'Import Complete',
      description: 'Your list has been imported',
      completed: currentStep > 3
    }
  ]

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      const text = await file.text()
      const data = parseImportFile(text, file.name)
      setImportedData(data)
      setCurrentStep(2)
      addToast({
        title: 'File processed!',
        description: `Found ${data.length} anime entries.`,
        variant: 'success',
      })
    } catch (err) {
      console.error('Failed to process file:', err)
      setError(err instanceof Error ? err.message : 'Failed to process file')
      addToast({
        title: 'Import failed',
        description: 'Please check your file format and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const parseImportFile = (content: string, filename: string): ImportedAnime[] => {
    const extension = filename.split('.').pop()?.toLowerCase()
    
    if (extension === 'json') {
      return parseJSON(content)
    } else if (extension === 'csv') {
      return parseCSV(content)
    } else if (extension === 'xml') {
      return parseXML(content)
    } else {
      throw new Error('Unsupported file format. Please use JSON, CSV, or XML.')
    }
  }

  const parseJSON = (content: string): ImportedAnime[] => {
    try {
      const data = JSON.parse(content)
      
      // Handle different JSON formats
      if (Array.isArray(data)) {
        return data.map(item => ({
          title: item.title || item.name || '',
          titleEnglish: item.titleEnglish || item.english_title,
          status: mapStatus(item.status || item.watch_status || 'plan-to-watch'),
          score: item.score || item.rating,
          progress: item.progress || item.episodes_watched || 0,
          notes: item.notes || item.comments,
          malId: item.mal_id || item.malId,
          anilistId: item.anilist_id || item.anilistId
        }))
      } else if (data.anime || data.list) {
        const list = data.anime || data.list
        return list.map((item: any) => ({
          title: item.title || item.name || '',
          titleEnglish: item.titleEnglish || item.english_title,
          status: mapStatus(item.status || item.watch_status || 'plan-to-watch'),
          score: item.score || item.rating,
          progress: item.progress || item.episodes_watched || 0,
          notes: item.notes || item.comments,
          malId: item.mal_id || item.malId,
          anilistId: item.anilist_id || item.anilistId
        }))
      } else {
        throw new Error('Invalid JSON format')
      }
    } catch (err) {
      throw new Error('Invalid JSON file')
    }
  }

  const parseCSV = (content: string): ImportedAnime[] => {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length < 2) throw new Error('CSV file must have at least a header and one data row')
    
    const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) ?? []
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      return row
    })

    return data.map(row => ({
      title: row.title || row.name || '',
      titleEnglish: row.title_english || row.english_title,
      status: mapStatus(row.status || row.watch_status || 'plan-to-watch'),
      score: row.score ? parseInt(row.score) : undefined,
      progress: row.progress ? parseInt(row.progress) : 0,
      notes: row.notes || row.comments,
      malId: row.mal_id || row.malid,
      anilistId: row.anilist_id || row.anilistid
    }))
  }

  const parseXML = (content: string): ImportedAnime[] => {
    // Basic XML parsing for MyAnimeList format
    const parser = new DOMParser()
    const xml = parser.parseFromString(content, 'text/xml')
    const errors = xml.getElementsByTagName('parsererror')
    if (errors.length > 0) throw new Error('Invalid XML file')

    const animeElements = xml.getElementsByTagName('anime')
    return Array.from(animeElements).map(anime => ({
      title: anime.getElementsByTagName('series_title')[0]?.textContent || '',
      titleEnglish: anime.getElementsByTagName('series_title_eng')[0]?.textContent,
      status: mapStatus(anime.getElementsByTagName('my_status')[0]?.textContent || 'plan-to-watch'),
      score: anime.getElementsByTagName('my_score')[0]?.textContent ? 
        parseInt(anime.getElementsByTagName('my_score')[0]?.textContent ?? '0') : undefined,
      progress: anime.getElementsByTagName('my_watched_episodes')[0]?.textContent ? 
        parseInt(anime.getElementsByTagName('my_watched_episodes')[0]?.textContent ?? '0') : 0,
      notes: anime.getElementsByTagName('my_comments')[0]?.textContent,
      malId: anime.getElementsByTagName('series_animedb_id')[0]?.textContent
    }))
  }

  const mapStatus = (status: string): ImportedAnime['status'] => {
    const statusMap: Record<string, ImportedAnime['status']> = {
      'watching': 'watching',
      'completed': 'completed',
      'plan to watch': 'plan-to-watch',
      'plan-to-watch': 'plan-to-watch',
      'on hold': 'on-hold',
      'on-hold': 'on-hold',
      'dropped': 'dropped',
      '1': 'watching',
      '2': 'completed',
      '3': 'on-hold',
      '4': 'dropped',
      '6': 'plan-to-watch'
    }
    return statusMap[status.toLowerCase()] || 'plan-to-watch'
  }

  const handleImport = async () => {
    setIsProcessing(true)
    try {
      await onImport(importedData)
      setCurrentStep(3)
      addToast({
        title: 'Import successful!',
        description: `Imported ${importedData.length} anime to your list.`,
        variant: 'success',
      })
    } catch (err) {
      console.error('Failed to import:', err)
      addToast({
        title: 'Import failed',
        description: 'Some anime could not be imported. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
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
    setImportedData([])
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
                <Upload className="h-6 w-6 text-violet-400" />
                Import Anime List
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
                  <h3 className="text-lg font-semibold text-white mb-2">Choose Import Source</h3>
                  <p className="text-gray-400 mb-6">Select where you want to import your anime list from.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-gray-600 bg-gray-700/50 hover:bg-gray-700/70 cursor-pointer transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-6 w-6 text-blue-400" />
                        <h4 className="font-semibold text-white">File Upload</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Upload a JSON, CSV, or XML file from MyAnimeList, AniList, or other sources.
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                        variant="outline"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-600 bg-gray-700/50 hover:bg-gray-700/70 cursor-pointer transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <ExternalLink className="h-6 w-6 text-green-400" />
                        <h4 className="font-semibold text-white">External Services</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Connect directly to MyAnimeList or AniList to import your list.
                      </p>
                      <Button
                        onClick={() => {
                          addToast({
        title: 'Coming Soon',
        description: 'Direct service integration will be available soon.',
        variant: 'default',
      })
                        }}
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect Service
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Your File</h3>
                  <p className="text-gray-400 mb-6">Choose a file to import your anime list from.</p>
                </div>

                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-semibold text-white mb-2">Drop your file here</h4>
                  <p className="text-gray-400 mb-4">
                    Supported formats: JSON, CSV, XML
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-600 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex items-center gap-2 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                    <span className="text-blue-300 text-sm">Processing file...</span>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Review Imported Data</h3>
                  <p className="text-gray-400 mb-6">
                    Review the {importedData.length} anime entries that will be imported.
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-600 rounded-lg">
                  <div className="grid grid-cols-1 gap-2 p-4">
                    {importedData.slice(0, 10).map((anime, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{anime.title}</p>
                          {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                            <p className="text-sm text-gray-400 truncate">{anime.titleEnglish}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="secondary" className="bg-violet-900/30 text-violet-300">
                            {anime.status.replace('-', ' ')}
                          </Badge>
                          {anime.score && (
                            <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-300">
                              {anime.score}/10
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {importedData.length > 10 && (
                      <div className="text-center py-2 text-gray-400 text-sm">
                        ... and {importedData.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-semibold text-white mb-2">Import Complete!</h3>
                <p className="text-gray-400 mb-6">
                  Successfully imported {importedData.length} anime to your list.
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
            {currentStep < 3 && (
              <div className="flex justify-between pt-6 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={currentStep === 0 ? handleClose : handlePrevious}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {currentStep === 0 ? 'Cancel' : 'Previous'}
                </Button>
                
                {currentStep === 1 && importedData.length > 0 && (
                  <Button
                    onClick={handleNext}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                
                {currentStep === 2 && (
                  <Button
                    onClick={handleImport}
                    disabled={isProcessing}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Import {importedData.length} Anime
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv,.xml"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileUpload(file)
          }
        }}
        className="hidden"
      />
    </div>
  )
}
