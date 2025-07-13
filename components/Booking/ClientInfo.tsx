"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from 'next-intl';

const clientInfoSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+1 \(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid US phone number."),
  workRequest: z.string().min(5, "Please briefly describe what you'd like to work on."),
});

type ClientInfoFormValues = z.infer<typeof clientInfoSchema>;

interface ClientInfoProps {
  onSubmit: (data: ClientInfoFormValues) => void;
}

export default function ClientInfo({ onSubmit }: ClientInfoProps) {
  const t = useTranslations('booking');
  const inputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const form = useForm<ClientInfoFormValues>({
    resolver: zodResolver(clientInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  // No scrolling behavior needed - desktop doesn't scroll, mobile uses sticky buttons

  return (
    <Card className="w-full max-w-[600px] mx-auto" data-testid="client-info-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center" data-testid="client-info-title">
          {t('yourInformation')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            id="client-info-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            data-testid="client-info-form"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('firstName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('firstNamePlaceholder')} {...field} data-testid="first-name-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lastName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('lastNamePlaceholder')} {...field} data-testid="last-name-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      {...field}
                      data-testid="email-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('phoneNumber')}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder={t('phonePlaceholder')}
                        ref={inputRef}
                        value={field.value}
                        data-testid="phone-input"
                        onChange={e => {
                        let value = e.target.value;
                        // Remove all non-digit characters except leading +
                        value = value.replace(/[^\d+]/g, "");
                        // Remove leading + if present and not followed by 1
                        if (value.startsWith("+") && !value.startsWith("+1")) {
                          value = value.replace(/^\+/, "");
                        }
                        // Remove leading 1 if present (for US numbers)
                        if (value.startsWith("+1")) {
                          value = value.slice(2);
                        } else if (value.startsWith("1")) {
                          value = value.slice(1);
                        }
                        // Only keep up to 10 digits
                        value = value.replace(/\D/g, "").slice(0, 10);
                        let formatted = "";
                        if (value.length > 0) formatted = "+1 (";
                        if (value.length >= 1) formatted += value.slice(0, 3);
                        if (value.length >= 4) formatted += ") ";
                        if (value.length >= 4) formatted += value.slice(3, 6);
                        if (value.length >= 7) formatted += "-";
                        if (value.length >= 7) formatted += value.slice(6, 10);
                        field.onChange(formatted);
                      }}
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workRequest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('workRequest')}</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full min-h-[80px] rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      placeholder={t('workRequestPlaceholder')}
                      {...field}
                      data-testid="work-request-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Desktop Submit Button */}
            <button
              ref={submitButtonRef}
              type="submit"
              className="hidden md:block w-full text-white hover:opacity-90 py-2 px-4 rounded-lg transition-colors bg-alla-purple"
              data-testid="client-info-submit-btn"
            >
              {t('continue')}
            </button>
          </form>
        </Form>
      </CardContent>
      
      {/* Mobile Sticky Submit Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
        <button
          type="submit"
          form="client-info-form"
          className="w-full text-white hover:opacity-90 py-4 px-4 rounded-lg transition-colors text-lg font-medium bg-alla-purple"
          data-testid="client-info-submit-btn-mobile"
        >
          {t('continue')}
        </button>
      </div>
      
      {/* Mobile spacer to prevent content from being hidden behind sticky button */}
      <div className="md:hidden h-20"></div>
    </Card>
  );
}
