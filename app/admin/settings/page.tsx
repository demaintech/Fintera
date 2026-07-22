'use client';

import React, { useEffect, useState } from 'react';
import { Building, User, Palette, Bell, Save, KeyRound, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { isValidName, isValidPassword, sanitizeInput } from '@/lib/validation';

// --- Reusable UI Components ---

type Notice = { type: 'success' | 'error'; text: string } | null;

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 sm:p-6 border-b border-gray-200/80 dark:border-slate-700/50">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{children}</p>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const CardFooter = ({ children }: { children: React.ReactNode }) => (
    <div className="p-4 sm:p-6 border-t border-gray-200/80 dark:border-slate-700/50 flex justify-end">{children}</div>
);

const Button = ({ children, variant = 'default', className, ...props }: { children: React.ReactNode, variant?: 'default' | 'outline', className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const baseStyle = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    const variantStyles = {
        default: "bg-slate-900 text-white hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        outline: "border border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100/50 dark:hover:bg-slate-800/50",
    };
    return <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>{children}</button>;
};

const Label = ({ children, ...props }: { children: React.ReactNode } & React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300" {...props}>{children}</label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        {...props}
    />
);

const Switch = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`${
            checked ? 'bg-slate-900 dark:bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
        } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2`}
    >
        <span
            aria-hidden="true"
            className={`${
                checked ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const NoticeBox = ({ notice }: { notice: Notice }) => {
  if (!notice) return null;

  const isSuccess = notice.type === 'success';

  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${isSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300'}`}>
      {isSuccess ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
      <span>{notice.text}</span>
    </div>
  );
};

const SettingsPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('farm');

  const [farmName, setFarmName] = useState('Fintera Aqua Farms');
  const [farmAddress, setFarmAddress] = useState('123 Fishery Lane, Oceanview');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileNotice, setProfileNotice] = useState<Notice>(null);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);

  useEffect(() => {
    if (user) {
      setUserName(user.name || '');
      setUserEmail(user.email || '');
    }
  }, [user]);

  const tabs = [
    { id: 'farm', label: 'Farm Management', icon: Building },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'system', label: 'System', icon: Palette },
  ];

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = sanitizeInput(userName);

    if (!trimmedName) {
      setProfileNotice({ type: 'error', text: 'Please enter your full name.' });
      return;
    }

    if (!isValidName(trimmedName)) {
      setProfileNotice({ type: 'error', text: 'Please use letters and spaces only for your full name.' });
      return;
    }

    setIsSavingProfile(true);
    setProfileNotice(null);

    try {
      await updateProfile(trimmedName);
      setProfileNotice({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setProfileNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentPassword.trim()) {
      setPasswordNotice({ type: 'error', text: 'Please enter your current password.' });
      return;
    }

    if (!newPassword.trim()) {
      setPasswordNotice({ type: 'error', text: 'Please enter a new password.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', text: 'The new password confirmation does not match.' });
      return;
    }

    if (!isValidPassword(newPassword)) {
      setPasswordNotice({ type: 'error', text: 'New password must be at least 8 characters and include upper, lower, and numeric characters.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordNotice(null);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordNotice({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to update password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Settings</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Manage your farm, profile, and system preferences.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs Navigation */}
        <aside className="lg:w-1/4 xl:w-1/5">
          <nav className="flex flex-row lg:flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all w-full text-left ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white dark:bg-blue-600"
                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'farm' && (
            <Card>
              <CardHeader>
                <CardTitle>Farm Details</CardTitle>
                <CardDescription>Update your farm's information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input id="farmName" type="text" value={farmName} onChange={e => setFarmName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="farmAddress">Farm Address</Label>
                  <Input id="farmAddress" type="text" value={farmAddress} onChange={e => setFarmAddress(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button className='h-10 w-50'><Save className="w-4 h-4 mr-2" />Save Changes</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card>
                <form onSubmit={handleProfileSave}>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="userName">Full Name</Label>
                      <Input id="userName" type="text" value={userName} onChange={e => setUserName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="userEmail">Email Address</Label>
                      <Input id="userEmail" type="email" value={userEmail} readOnly className="bg-gray-100 dark:bg-slate-800/50 cursor-not-allowed" />
                    </div>
                    <NoticeBox notice={profileNotice} />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className='h-10 w-50' disabled={isSavingProfile}>
                      {isSavingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Update Profile</>}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
              <Card>
                <form onSubmit={handlePasswordChange}>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    <NoticeBox notice={passwordNotice} />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className='h-10 w-50' disabled={isChangingPassword}>
                      {isChangingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : <><KeyRound className="w-4 h-4 mr-2" />Change Password</>}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Theme</Label>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Toggle between light and dark mode.</p>
                    </div>
                    <ThemeToggle />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Switch checked={emailNotifications} onChange={setEmailNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <Switch checked={pushNotifications} onChange={setPushNotifications} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;