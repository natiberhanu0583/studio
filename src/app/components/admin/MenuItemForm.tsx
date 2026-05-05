'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { upsertMenuItem } from '@/app/actions';
import { useCafe } from '@/context/CafeContext';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface MenuItemFormProps {
  item?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuItemForm({ item, isOpen, onClose }: MenuItemFormProps) {
  const { refetch } = useCafe();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    category: 'Food',
    imageId: ''
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        cost: (item.cost || 0).toString(),
        category: item.category,
        imageId: item.imageId || ''
      });
      setPreview(null);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        cost: '',
        category: 'Food',
        imageId: ''
      });
      setPreview(null);
    }
  }, [item, isOpen]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // MOCK UPLOAD TO CLOUDINARY (since we need signed/unsigned setup)
    // In a real app, you'd use the Cloudinary upload API here.
    // For now, we'll store the base64 or a mock ID.
    try {
      // simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store the base64 data URL in imageId
      setFormData(prev => ({ ...prev, imageId: reader.result as string }));
      toast({ title: 'Image Uploaded', description: 'Preview ready.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertMenuItem({
        id: item?.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        category: formData.category,
        imageId: formData.imageId || item?.imageId
      });
      await refetch();
      toast({ title: item ? 'Updated!' : 'Created!', description: 'Menu item saved successfully.' });
      onClose();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-gradient">
            {item ? 'Edit Menu Item' : 'Add New Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* DRAG & DROP IMAGE UPLOAD */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden ${
              preview || formData.imageId ? 'border-primary/50' : 'border-muted-foreground/20 hover:border-primary/50'
            }`}
          >
            {preview ? (
              <Image src={preview} alt="Preview" fill className="object-cover" />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 mb-2" />
                    <p className="text-xs">Drag & Drop or Click to Upload</p>
                  </>
                )
              }
              </div>
            )}
            <Input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={onFileChange}
              accept="image/*"
            />
            {(preview || formData.imageId) && !uploading && (
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={() => { setPreview(null); setFormData(p => ({ ...p, imageId: '' })); }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Item Name</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Classic Burger"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Input 
                required 
                value={formData.description} 
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief details about the dish..."
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={v => setFormData(p => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Drink">Drink</SelectItem>
                  <SelectItem value="Dessert">Dessert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price (ETB)</Label>
              <Input 
                type="number" 
                required 
                value={formData.price} 
                onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cost (ETB)</Label>
              <Input 
                type="number" 
                required 
                value={formData.cost} 
                onChange={e => setFormData(p => ({ ...p, cost: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || uploading} className="bg-primary hover:bg-primary/90 rounded-full px-8">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {item ? 'Save Changes' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
