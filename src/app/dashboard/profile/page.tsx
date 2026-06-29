'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Phone, ShieldCheck, Camera } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/features/auth/authSlice';
import profileService from '@/services/profile.service';
import authService from '@/services/auth.service';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

// Validation Schemas
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const mobileSchema = z.object({
  mobile: z.string().length(10, 'Mobile must be exactly 10 digits'),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

type ProfileValues = z.infer<typeof profileSchema>;
type MobileValues = z.infer<typeof mobileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function UserProfileSettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Forms registration
  const { register: regProf, handleSubmit: subProf, formState: { errors: errProf } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  });

  const { register: regMob, handleSubmit: subMob, formState: { errors: errMob } } = useForm<MobileValues>({
    resolver: zodResolver(mobileSchema),
    defaultValues: { mobile: user?.mobile || '' },
  });

  const { register: regPass, handleSubmit: subPass, reset: resPass, formState: { errors: errPass } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (values: ProfileValues) => {
    setLoading(true);
    try {
      const updated = await profileService.updateProfile(values);
      dispatch(updateUser(updated));
      toast.success('Profile name updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile name.');
    } finally {
      setLoading(false);
    }
  };

  const onMobileSubmit = async (values: MobileValues) => {
    setLoading(true);
    try {
      const updated = await profileService.changeMobile(values);
      dispatch(updateUser(updated));
      toast.success('Mobile number updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update mobile number.');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordValues) => {
    setLoading(true);
    try {
      await authService.changePassword(values);
      toast.success('Password changed successfully!');
      resPass();
    } catch (err: any) {
      toast.error(err.message || 'Password update failed. Check old password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const data = await profileService.uploadAvatar(formData);
      dispatch(updateUser(data.user));
      toast.success('Avatar photo updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload avatar.');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">
          Profile & Security Settings
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">
          Edit profile details and manage account credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Avatar and details */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col items-center justify-center text-center p-6 gap-4">
            {/* Avatar Photo Frame */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gamePurple border-2 border-white/5 flex items-center justify-center text-white text-3xl font-black overflow-hidden relative">
                {avatarLoading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-gameAccent border-white/5" />
                ) : user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-gameCard border border-white/10 hover:border-gameAccent/50 rounded-full cursor-pointer text-gray-400 hover:text-white transition-all duration-200">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            <div>
              <h3 className="text-base font-black text-white">{user?.name}</h3>
              <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">{user?.email}</p>
            </div>

            <div className="flex flex-col gap-2 w-full text-xs font-semibold text-gray-400 border-t border-white/5 pt-4">
              <div className="flex justify-between">
                <span>Account Role:</span>
                <span className="text-gamePurple font-bold uppercase">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Mobile Status:</span>
                <span className={user?.mobileVerified ? "text-green-400 flex items-center gap-1 font-bold" : "text-amber-500 flex items-center gap-1 font-bold"}>
                  <ShieldCheck size={12} />
                  <span>{user?.mobileVerified ? 'Verified' : 'Unverified'}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Email Status:</span>
                <span className={user?.emailVerified ? "text-green-400 flex items-center gap-1 font-bold" : "text-amber-500 flex items-center gap-1 font-bold"}>
                  <ShieldCheck size={12} />
                  <span>{user?.emailVerified ? 'Verified' : 'Unverified'}</span>
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right columns - Forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* General Information */}
          <Card>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-4">
              General Information
            </h3>
            <form onSubmit={subProf(onProfileSubmit)} className="flex flex-col gap-4">
              <Input label="Display Name" error={errProf.name?.message} {...regProf('name')} />
              <Button type="submit" variant="primary" isLoading={loading} className="self-start font-bold uppercase text-xs">
                Save Name Settings
              </Button>
            </form>
          </Card>

          {/* Change Mobile */}
          <Card>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-4">
              Change Mobile Number
            </h3>
            <form onSubmit={subMob(onMobileSubmit)} className="flex flex-col gap-4">
              <Input label="Mobile Number" type="tel" maxLength={10} error={errMob.mobile?.message} {...regMob('mobile')} />
              <Button type="submit" variant="primary" isLoading={loading} className="self-start font-bold uppercase text-xs">
                Update Mobile Number
              </Button>
            </form>
          </Card>

          {/* Security Credentials */}
          <Card>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-4">
              Change Password Credentials
            </h3>
            <form onSubmit={subPass(onPasswordSubmit)} className="flex flex-col gap-4">
              <Input label="Current Password" type="password" error={errPass.oldPassword?.message} {...regPass('oldPassword')} />
              <Input label="New Password" type="password" error={errPass.newPassword?.message} {...regPass('newPassword')} />
              <Button type="submit" variant="primary" isLoading={loading} className="self-start font-bold uppercase text-xs">
                Update Password Credentials
              </Button>
            </form>
          </Card>

          {/* Security & Privacy Settings Hooks */}
          <Card>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-4">
              Security & Privacy Upgrades
            </h3>
            <div className="flex flex-col gap-4 text-xs font-semibold text-gray-400">
              <div className="flex justify-between items-center bg-gameCard/30 p-3 rounded-lg border border-white/5">
                <div>
                  <h4 className="text-white font-bold">Two-Factor Authentication (2FA)</h4>
                  <p className="text-gray-500 text-[10px] uppercase font-bold mt-0.5">Add an extra layer of security using Google Authenticator</p>
                </div>
                <span className="text-gameAccent font-bold uppercase text-[10px] tracking-wider bg-gameAccent/10 px-2.5 py-1 rounded cursor-pointer hover:bg-gameAccent/20 transition-colors duration-200">Configure</span>
              </div>
              <div className="flex justify-between items-center bg-gameCard/30 p-3 rounded-lg border border-white/5">
                <div>
                  <h4 className="text-white font-bold">Active Sessions Log</h4>
                  <p className="text-gray-500 text-[10px] uppercase font-bold mt-0.5">Track devices and IP addresses logged into your account</p>
                </div>
                <span className="text-gameAccent font-bold uppercase text-[10px] tracking-wider bg-gameAccent/10 px-2.5 py-1 rounded cursor-pointer hover:bg-gameAccent/20 transition-colors duration-200">View History</span>
              </div>
              <div className="flex justify-between items-center bg-gameCard/30 p-3 rounded-lg border border-white/5">
                <div>
                  <h4 className="text-white font-bold">Account Deactivation</h4>
                  <p className="text-gray-500 text-[10px] uppercase font-bold mt-0.5">Temporarily disable or permanently delete your account</p>
                </div>
                <span className="text-red-400 font-bold uppercase text-[10px] tracking-wider bg-red-400/10 px-2.5 py-1 rounded cursor-pointer hover:bg-red-400/20 transition-colors duration-200">Deactivate</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
