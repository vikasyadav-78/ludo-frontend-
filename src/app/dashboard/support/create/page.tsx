'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Ticket } from 'lucide-react';
import supportService from '@/services/support.service';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';

const ticketSchema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['PAYMENT', 'BATTLE', 'TECHNICAL', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function CreateTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: 'TECHNICAL',
      priority: 'LOW',
    },
  });

  const onSubmit = async (values: TicketFormValues) => {
    setLoading(true);
    try {
      await supportService.createTicket(values);
      toast.success('Support ticket created successfully!');
      router.push('/dashboard/support');
    } catch (err: any) {
      toast.error(err.message || 'Failed to file support ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/support"
          className="p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg text-gray-400 hover:text-white transition-all duration-200"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider">
            Create Support Ticket
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Describe details of concern for moderator review
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Builder Card Form */}
        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="Subject / Ticket Title"
              placeholder="e.g. Balance not credited on deposit"
              error={errors.title?.message}
              {...register('title')}
            />

            <Select
              label="Category"
              options={[
                { label: 'Payment Deposit / Withdrawal Issues', value: 'PAYMENT' },
                { label: 'Battle / Disputed Match Reports', value: 'BATTLE' },
                { label: 'Technical App Concerns', value: 'TECHNICAL' },
                { label: 'Other Inquiries', value: 'OTHER' },
              ]}
              error={errors.category?.message}
              {...register('category')}
            />

            <Select
              label="Ticket Priority"
              options={[
                { label: 'Low - General inquiries', value: 'LOW' },
                { label: 'Medium - Normal concerns', value: 'MEDIUM' },
                { label: 'High - Immediate wage issues', value: 'HIGH' },
              ]}
              error={errors.priority?.message}
              {...register('priority')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
                Describe Problem Details
              </label>
              <textarea
                rows={5}
                placeholder="Include transaction IDs, UTR references, or dispute details..."
                className="w-full px-4 py-2.5 bg-gameCard/50 border border-white/5 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gameAccent/50 transition-colors duration-200"
                {...register('description')}
              />
              {errors.description && (
                <span className="text-xs text-red-400">{errors.description.message}</span>
              )}
            </div>

            <Button type="submit" variant="primary" isLoading={loading} className="w-full mt-2 font-bold uppercase text-xs flex items-center gap-2">
              <Ticket size={16} />
              <span>Submit Ticket Request</span>
            </Button>
          </form>
        </Card>

        {/* Support instructions */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Before Submitting
            </h3>
            <ul className="text-xs text-gray-400 leading-relaxed font-semibold flex flex-col gap-2.5 list-disc list-inside">
              <li>Ensure you have checked recent deposit/withdrawal history status updates first.</li>
              <li>Support tickets are typically resolved by moderators within 2 to 4 hours.</li>
              <li>Providing transaction hashes speeds up resolution pipelines.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
