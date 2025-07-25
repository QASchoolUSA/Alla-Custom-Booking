'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface NewClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: (client: NewClientData) => void;
}

export default function NewClientModal({
  isOpen,
  onClose,
  onClientAdded
}: NewClientModalProps) {
  const tAdmin = useTranslations('admin');
  const [formData, setFormData] = useState<NewClientData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof NewClientData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error(tAdmin('pleaseFillAllFields'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(tAdmin('pleaseEnterValidEmail'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Pass the client data back to parent component
      onClientAdded(formData);
      toast.success(tAdmin('clientAddedSuccessfully'));
      onClose();
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error(tAdmin('failedToAddClient'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form when closing
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{tAdmin('addNewClientTitle')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{tAdmin('firstName')}</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder={tAdmin('enterFirstName')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">{tAdmin('lastName')}</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder={tAdmin('enterLastName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{tAdmin('email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={tAdmin('enterEmailAddress')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{tAdmin('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={tAdmin('enterPhoneNumber')}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {tAdmin('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? tAdmin('adding') : tAdmin('addClient')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}