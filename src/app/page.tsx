import ColorAccessibilityTool from '@/components/ColorAccessibilityTool'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8 text-center">Pallete Generator</h1>
        <ColorAccessibilityTool />
      </main>
      <Footer />
    </div>
  )
}
