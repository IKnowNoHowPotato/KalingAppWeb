import React, { useState } from 'react'
import { ImageWithFallback } from './ImageWithFallback'
import { saveFigmaPage, loadFigmaPage } from '../../services/firestoreService'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { toast } from 'sonner'

export function FigmaPage({ name = 'default', onClose }: { name?: string; onClose?: () => void }) {
  const [title, setTitle] = useState('My Figma Page')
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d')

  const handleSave = async () => {
    try {
      await saveFigmaPage(name, { title, imageUrl })
      toast.success('Figma page saved')
    } catch (err) {
      toast.error('Failed to save page')
    }
  }

  const handleLoad = async () => {
    try {
      const data = await loadFigmaPage(name)
      if (data) {
        setTitle(data.title || '')
        setImageUrl(data.imageUrl || '')
        toast.success('Loaded page from cloud')
      } else {
        toast('No saved page found')
      }
    } catch (err) {
      toast.error('Failed to load page')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-2" />
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </div>

      <div className="mb-4 w-full h-64 bg-gray-50 rounded-lg overflow-hidden">
        <ImageWithFallback src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave}>Save to Cloud</Button>
        <Button onClick={handleLoad}>Load from Cloud</Button>
        <Button onClick={() => onClose && onClose()} variant="secondary">Close</Button>
      </div>
    </div>
  )
}

export default FigmaPage
