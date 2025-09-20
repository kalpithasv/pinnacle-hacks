import StartupSubmissionForm from '@/components/StartupSubmissionForm'

export default function SubmitStartup() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Submit Your AgriTech Startup</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join the Innovation Voucher Programme and get AI-powered insights about 
          Geographical Indication potential for your agricultural innovation.
        </p>
      </div>
      
      <StartupSubmissionForm />
    </div>
  )
}

