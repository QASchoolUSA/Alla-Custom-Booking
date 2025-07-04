import React, { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

interface NewClientFormProps {
  name: string;
  email: string;
  phone: string;
  onUpdate: (field: 'name' | 'email' | 'phone', value: string) => void;
}

const NewClientForm = memo(function NewClientForm({
  name,
  email,
  phone,
  onUpdate
}: NewClientFormProps) {
  const t = useTranslations('booking');

  return (
    <div className="space-y-3 border-t pt-4">
      <div>
        <Label htmlFor="client-name">{t('name')}</Label>
        <Input
          id="client-name"
          value={name}
          onChange={(e) => onUpdate('name', e.target.value)}
          placeholder={t('name')}
        />
      </div>
      <div>
        <Label htmlFor="client-email">{t('email')}</Label>
        <Input
          id="client-email"
          type="email"
          value={email}
          onChange={(e) => onUpdate('email', e.target.value)}
          placeholder={t('email')}
        />
      </div>
      <div>
        <Label htmlFor="client-phone">{t('phone')}</Label>
        <Input
          id="client-phone"
          value={phone}
          onChange={(e) => onUpdate('phone', e.target.value)}
          placeholder={t('phone')}
        />
      </div>
    </div>
  );
});

NewClientForm.displayName = 'New Client Form';

export default NewClientForm;