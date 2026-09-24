import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Camera,
  Trash2,
  Lock,
  Building,
  GraduationCap,
  Briefcase,
  Users,
  Mail,
  Phone,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  updateProfileApi,
  uploadAvatarApi,
  changePasswordApi,
} from '@/features/auth/api/auth.api';
import { Card, Button, Input, Badge, Spinner, Breadcrumb } from '@/components/ui';
import { useToast } from '@/components/feedback';
import { ROLE_LABELS } from '@/constants';
import { cn, getInitials, formatDate, getErrorMessage } from '@/lib/utils';

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Keep profile form synced if user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const userInitials = getInitials(user.firstName, user.lastName);
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const roleDisplay = ROLE_LABELS[user.role] || user.role;
  const school = user.schoolId;

  // Handle Avatar File Selection & Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again if needed
    e.target.value = '';

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      const err = 'Please upload a valid image file (JPEG, PNG, or WEBP).';
      setAvatarError(err);
      toast.error(err);
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const err = 'Image size must be less than 2MB.';
      setAvatarError(err);
      toast.error(err);
      return;
    }

    setAvatarError('');
    setIsUploadingAvatar(true);

    try {
      // 1. Upload to Cloudinary via backend
      const uploadRes = await uploadAvatarApi(file);
      const avatarUrl = uploadRes?.secureUrl || uploadRes?.url;

      if (!avatarUrl) {
        throw new Error('Failed to retrieve uploaded image URL');
      }

      // 2. Persist avatar on user profile
      const updateRes = await updateProfileApi({ avatar: avatarUrl });
      const updatedUserData = updateRes?.user || { avatar: avatarUrl };
      updateUser(updatedUserData);

      toast.success('Profile avatar updated successfully');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to upload profile picture.');
      setAvatarError(msg);
      toast.error(msg);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Avatar Removal
  const handleRemoveAvatar = async () => {
    if (!user.avatar) return;

    setIsRemovingAvatar(true);
    setAvatarError('');

    try {
      const updateRes = await updateProfileApi({ avatar: null });
      const updatedUserData = updateRes?.user || { avatar: null };
      updateUser(updatedUserData);

      toast.success('Profile avatar removed');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to remove avatar.');
      setAvatarError(msg);
      toast.error(msg);
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  // Handle Profile Update Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setIsUpdatingProfile(true);

    try {
      const updateRes = await updateProfileApi({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim() || undefined,
      });

      const updatedUser = updateRes?.user || profileForm;
      updateUser(updatedUser);
      toast.success('Profile information updated successfully');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update profile.');
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      const msg = 'Please enter your current password.';
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword.length < 8) {
      const msg = 'New password must be at least 8 characters long.';
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      const msg = 'Password must include at least one uppercase letter, one lowercase letter, and one number.';
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'New passwords do not match.';
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePasswordApi({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast.success('Password changed successfully. Please log in with your new credentials.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Session revoked on server: perform clean client-side logout and redirect
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to change password. Please check your current password.');
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Profile' },
        ]}
      />

      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your personal identity, credentials, role attributes, and security preferences.
        </p>
      </div>

      {/* Top Profile Overview Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-28 sm:h-36 w-full relative" />
        <Card.Body className="relative pt-0 px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-14 sm:-mt-16 mb-5">
            {/* Avatar with Camera Trigger */}
            <div className="relative group shrink-0">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-surface bg-surface overflow-hidden shadow-md flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-700 font-bold text-3xl sm:text-4xl">
                    {userInitials}
                  </div>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-slate-900/60 rounded-full flex flex-col items-center justify-center text-white text-xs gap-1">
                    <Spinner size="sm" className="text-white" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar || isRemovingAvatar}
                aria-label="Upload profile photo"
              />
            </div>

            {/* User Title & Badges */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary truncate">
                  {fullName}
                </h2>
                <Badge variant="primary" size="md">
                  {roleDisplay}
                </Badge>
                {user.status && (
                  <Badge
                    variant={user.status === 'ACTIVE' ? 'success' : 'warning'}
                    size="md"
                    dot
                  >
                    {user.status}
                  </Badge>
                )}
              </div>

              {/* Quick Info Items */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-y-1.5 gap-x-4 text-xs sm:text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-text-muted shrink-0" />
                    <span>{user.phone}</span>
                  </span>
                )}
                {user.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-text-muted shrink-0" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Avatar Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                leftIcon={Camera}
                disabled={isUploadingAvatar || isRemovingAvatar}
                isLoading={isUploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
              >
                Change Photo
              </Button>
              {user.avatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                  leftIcon={Trash2}
                  disabled={isUploadingAvatar || isRemovingAvatar}
                  isLoading={isRemovingAvatar}
                  onClick={handleRemoveAvatar}
                  aria-label="Remove avatar photo"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {avatarError && (
            <p className="text-xs text-danger-600 mt-2 text-center sm:text-left">
              {avatarError}
            </p>
          )}
        </Card.Body>
      </Card>

      {/* Institutional Affiliation Card (if schoolId populated) */}
      {school && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-semibold text-text-primary">
                Institutional Affiliation
              </h3>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-muted border border-border-muted">
              <div className="flex items-center gap-3.5">
                {school.logo ? (
                  <img
                    src={school.logo}
                    alt={school.name || 'School Logo'}
                    className="h-12 w-12 object-contain rounded-md border border-border bg-surface shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                    <Building className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-text-primary">
                    {school.name || 'School Institution'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-text-secondary">
                    {school.schoolCode && (
                      <span className="font-mono bg-surface px-2 py-0.5 rounded border border-border">
                        Code: {school.schoolCode}
                      </span>
                    )}
                    {school.slug && (
                      <span className="text-text-muted">
                        Slug: {school.slug}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Badge
                  variant={school.status === 'ACTIVE' ? 'success' : 'warning'}
                  size="sm"
                >
                  {school.status || 'Active'}
                </Badge>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Role-Specific Information Cards */}
      {/* 1. Student Profile */}
      {user.studentProfile && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-semibold text-text-primary">
                Student Academic Record
              </h3>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Admission Number</span>
                <span className="font-semibold text-text-primary text-sm font-mono">
                  {user.studentProfile.admissionNumber || '—'}
                </span>
              </div>
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Roll Number</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.studentProfile.rollNumber || '—'}
                </span>
              </div>
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Class & Section</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.studentProfile.className || '—'}
                  {user.studentProfile.sectionName ? ` (${user.studentProfile.sectionName})` : ''}
                </span>
              </div>
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Academic Session</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.studentProfile.sessionName || '—'}
                </span>
              </div>
              {user.studentProfile.gender && (
                <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                  <span className="block text-xs text-text-muted">Gender</span>
                  <span className="font-semibold text-text-primary text-sm capitalize">
                    {user.studentProfile.gender}
                  </span>
                </div>
              )}
              {user.studentProfile.bloodGroup && (
                <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                  <span className="block text-xs text-text-muted">Blood Group</span>
                  <span className="font-semibold text-text-primary text-sm">
                    {user.studentProfile.bloodGroup}
                  </span>
                </div>
              )}
              {user.studentProfile.guardianName && (
                <div className="p-3 bg-surface-muted rounded-md border border-border-muted sm:col-span-2">
                  <span className="block text-xs text-text-muted">Guardian Information</span>
                  <span className="font-semibold text-text-primary text-sm">
                    {user.studentProfile.guardianName}
                    {user.studentProfile.guardianRelationship ? ` (${user.studentProfile.guardianRelationship})` : ''}
                    {user.studentProfile.guardianPhone ? ` • ${user.studentProfile.guardianPhone}` : ''}
                  </span>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* 2. Teacher Profile */}
      {user.teacherProfile && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-semibold text-text-primary">
                Faculty & Teaching Credentials
              </h3>
            </div>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Employee ID</span>
                <span className="font-semibold text-text-primary text-sm font-mono">
                  {user.teacherProfile.employeeId || '—'}
                </span>
              </div>
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Designation</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.teacherProfile.designation || '—'}
                </span>
              </div>
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Department</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.teacherProfile.department || '—'}
                </span>
              </div>
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Qualification</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.teacherProfile.qualification || '—'}
                </span>
              </div>
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Specialization</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.teacherProfile.specialization || '—'}
                </span>
              </div>
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Joining Date</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.teacherProfile.joiningDate ? formatDate(user.teacherProfile.joiningDate) : '—'}
                </span>
              </div>
            </div>

            {/* Subject / Class Assignments */}
            {user.teacherProfile.assignments && user.teacherProfile.assignments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary-600" />
                  Assigned Teaching Workload
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {user.teacherProfile.assignments.map((assignment, idx) => (
                    <div
                      key={assignment.id || idx}
                      className="p-2.5 rounded-md border border-border bg-surface text-xs"
                    >
                      <span className="font-bold text-text-primary block">
                        {assignment.subject?.name || 'Subject'}
                        {assignment.subject?.code ? ` (${assignment.subject.code})` : ''}
                      </span>
                      <span className="text-text-muted mt-0.5 block">
                        Class: {assignment.class?.name || 'All'}
                        {assignment.section?.name ? ` • Section ${assignment.section.name}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* 3. Parent Profile */}
      {user.parentProfile && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-semibold text-text-primary">
                Parent Profile & Linked Students
              </h3>
            </div>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Primary Phone</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.parentProfile.phone || '—'}
                </span>
              </div>
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Alternate Phone</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.parentProfile.alternatePhone || '—'}
                </span>
              </div>
              <div className="p-3 bg-surface-muted rounded-md border border-border-muted">
                <span className="block text-xs text-text-muted">Occupation</span>
                <span className="font-semibold text-text-primary text-sm">
                  {user.parentProfile.occupation || '—'}
                </span>
              </div>
              {user.parentProfile.address && (
                <div className="p-3 bg-surface-muted rounded-md border border-border-muted sm:col-span-3">
                  <span className="block text-xs text-text-muted">Home Address</span>
                  <span className="font-semibold text-text-primary text-sm">
                    {user.parentProfile.address}
                  </span>
                </div>
              )}
            </div>

            {/* Linked Children */}
            {user.parentProfile.children && user.parentProfile.children.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-primary-600" />
                  Enrolled Children
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.parentProfile.children.map((child, idx) => (
                    <div
                      key={child.id || idx}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface shadow-xs"
                    >
                      {child.profileImage ? (
                        <img
                          src={child.profileImage}
                          alt={child.name}
                          className="h-10 w-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                          {getInitials(child.name, '')}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-text-primary truncate">
                          {child.name}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          Adm #{child.admissionNumber}
                          {child.className ? ` • ${child.className}` : ''}
                          {child.sectionName ? ` (${child.sectionName})` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Edit Profile & Password Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Edit Basic Profile */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-semibold text-text-primary">
                Personal Details
              </h3>
            </div>
            <p className="text-xs text-text-muted">
              Update your name and primary contact telephone number.
            </p>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="firstName"
                  label="First Name"
                  required
                  value={profileForm.firstName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  disabled={isUpdatingProfile}
                />
                <Input
                  id="lastName"
                  label="Last Name"
                  required
                  value={profileForm.lastName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  disabled={isUpdatingProfile}
                />
              </div>

              <Input
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="e.g. +92 300 1234567"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                disabled={isUpdatingProfile}
              />

              <Input
                id="email"
                label="Email Address"
                value={user.email}
                disabled
                helperText="Email address is governed by institutional policy and cannot be altered here."
              />

              {profileError && (
                <p className="text-xs text-danger-600">{profileError}</p>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isUpdatingProfile}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>

        {/* Card 2: Change Password */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-semibold text-text-primary">
                Change Password
              </h3>
            </div>
            <p className="text-xs text-text-muted">
              Ensure your account is protected with a strong, distinct password.
            </p>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                id="currentPassword"
                label="Current Password"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                disabled={isChangingPassword}
              />

              <Input
                id="newPassword"
                label="New Password"
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                helperText="Must be at least 8 characters, containing uppercase, lowercase, and numeric digits."
                disabled={isChangingPassword}
              />

              <Input
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                disabled={isChangingPassword}
              />

              {passwordError && (
                <p className="text-xs text-danger-600">{passwordError}</p>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isChangingPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
