import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Landmark, 
  Users, 
  DollarSign, 
  Github, 
  Twitter, 
  Globe,
  Upload,
  CheckCircle
} from 'lucide-react'

const startupSchema = z.object({
  name: z.string().min(1, 'Startup name is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  businessModel: z.string().min(1, 'Business model is required'),
  targetMarket: z.string().min(1, 'Target market is required'),
  expectedRevenue: z.number().positive().optional(),
  fundingRequired: z.number().positive().optional(),
  teamSize: z.number().positive().default(1),
  stage: z.enum(['idea', 'prototype', 'mvp', 'early', 'growth']),
  
  // Land Details
  landLocation: z.string().min(1, 'Land location is required'),
  landArea: z.number().positive('Land area must be positive'),
  landOwnership: z.enum(['owned', 'leased', 'partnership']),
  landType: z.enum(['agricultural', 'horticultural', 'livestock', 'mixed', 'other']),
  
  // Technical Integration
  githubUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  
  tags: z.array(z.string()).optional()
})

type StartupFormData = z.infer<typeof startupSchema>

export default function StartupSubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<StartupFormData>({
    resolver: zodResolver(startupSchema),
    defaultValues: {
      teamSize: 1,
      stage: 'idea',
      landOwnership: 'owned',
      landType: 'agricultural',
      tags: []
    }
  })

  const availableTags = [
    'Organic Farming', 'Precision Agriculture', 'IoT Sensors', 'Drone Technology',
    'Hydroponics', 'Vertical Farming', 'Livestock Management', 'Crop Monitoring',
    'Weather Prediction', 'Soil Analysis', 'Supply Chain', 'Marketplace',
    'AI/ML', 'Blockchain', 'Mobile App', 'Web Platform'
  ]

  const onSubmit = async (data: StartupFormData) => {
    setIsSubmitting(true)
    try {
      // Submit to API
      const response = await fetch('/api/startups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...data,
          tags: selectedTags
        })
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        throw new Error('Failed to submit startup')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit startup. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Startup Submitted Successfully!</h2>
          <p className="text-muted-foreground mb-4">
            Your AgriTech startup has been submitted for review. Our AI will analyze your 
            land details and provide Geographical Indication insights.
          </p>
          <Button onClick={() => setSubmitted(false)}>
            Submit Another Startup
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Your AgriTech Startup</CardTitle>
          <CardDescription>
            Share your agricultural innovation with investors and get AI-powered insights 
            about Geographical Indication potential for your region.
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Startup Name *</label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., GreenTech Solutions"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Development Stage *</label>
                <select
                  {...register('stage')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="idea">Idea Stage</option>
                  <option value="prototype">Prototype</option>
                  <option value="mvp">MVP</option>
                  <option value="early">Early Stage</option>
                  <option value="growth">Growth Stage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your AgriTech innovation, the problem it solves, and your unique approach..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Model *</label>
                <input
                  {...register('businessModel')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., B2B SaaS, Marketplace, Direct Sales"
                />
                {errors.businessModel && <p className="text-red-500 text-sm mt-1">{errors.businessModel.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Market *</label>
                <input
                  {...register('targetMarket')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Small farmers, Agricultural cooperatives"
                />
                {errors.targetMarket && <p className="text-red-500 text-sm mt-1">{errors.targetMarket.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Land Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Land Details</span>
            </CardTitle>
            <CardDescription>
              Provide details about your agricultural land for GI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Land Location *</label>
                <input
                  {...register('landLocation')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Punjab, India"
                />
                {errors.landLocation && <p className="text-red-500 text-sm mt-1">{errors.landLocation.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Land Area (acres) *</label>
                <input
                  {...register('landArea', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 5.5"
                />
                {errors.landArea && <p className="text-red-500 text-sm mt-1">{errors.landArea.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Land Ownership *</label>
                <select
                  {...register('landOwnership')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="owned">Owned</option>
                  <option value="leased">Leased</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Land Type *</label>
                <select
                  {...register('landType')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="agricultural">Agricultural</option>
                  <option value="horticultural">Horticultural</option>
                  <option value="livestock">Livestock</option>
                  <option value="mixed">Mixed</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Business Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team Size</label>
                <input
                  {...register('teamSize', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expected Revenue (₹)</label>
                <input
                  {...register('expectedRevenue', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 1000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Funding Required (₹)</label>
                <input
                  {...register('fundingRequired', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 500000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Technical Links (Optional)</span>
            </CardTitle>
            <CardDescription>
              Add your GitHub, Twitter, and website for enhanced scoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">GitHub URL</label>
                <input
                  {...register('githubUrl')}
                  type="url"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Twitter URL</label>
                <input
                  {...register('twitterUrl')}
                  type="url"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website URL</label>
                <input
                  {...register('website')}
                  type="url"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://yourstartup.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Select relevant tags to help investors find your startup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting}
            className="px-8"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Startup'}
          </Button>
        </div>
      </form>
    </div>
  )
}

