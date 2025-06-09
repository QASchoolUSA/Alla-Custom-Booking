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
});

type ClientInfoFormValues = z.infer<typeof clientInfoSchema>;

interface ClientInfoProps {
  onSubmit: (data: ClientInfoFormValues) => void;
}

export default function ClientInfo({ onSubmit }: ClientInfoProps) {
  const t = useTranslations('booking');
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useForm<ClientInfoFormValues>({
    resolver: zodResolver(clientInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  return (
    <Card className="w-full max-w-[600px] mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Your Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1 (XXX) XXX-XXXX"
                      ref={inputRef}
                      value={field.value}
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
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-lg transition-colors"
            >
              {t('continue')}
            </button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
