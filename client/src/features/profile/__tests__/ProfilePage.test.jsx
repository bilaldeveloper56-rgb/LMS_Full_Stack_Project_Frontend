import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '@/components/feedback';
import { ProfilePage } from '../pages/ProfilePage';
import * as authContextModule from '@/features/auth/auth.context';
import * as authApiModule from '@/features/auth/api/auth.api';
import { ROLES } from '@/constants';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/features/auth/api/auth.api', () => ({
  updateProfileApi: vi.fn(),
  uploadAvatarApi: vi.fn(),
  changePasswordApi: vi.fn(),
  getMeApi: vi.fn(),
}));

const renderWithProviders = (ui) => {
  return render(
    <ToastProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ToastProvider>
  );
};

describe('ProfilePage Component', () => {
  const mockUpdateUser = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders general profile details for authenticated user', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'usr-1',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex.morgan@example.com',
        phone: '+92 300 1112233',
        role: ROLES.SCHOOL_ADMIN,
        status: 'ACTIVE',
        createdAt: '2025-01-15T00:00:00.000Z',
      },
      updateUser: mockUpdateUser,
      logout: mockLogout,
    });

    renderWithProviders(<ProfilePage />);

    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText('alex.morgan@example.com')).toBeInTheDocument();
    expect(screen.getByText('+92 300 1112233')).toBeInTheDocument();
    expect(screen.getByText('School Admin')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('renders institutional affiliation when schoolId is attached', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'usr-2',
        firstName: 'Jane',
        lastName: 'Teacher',
        email: 'jane@greenwood.edu',
        role: ROLES.TEACHER,
        status: 'ACTIVE',
        schoolId: {
          name: 'Greenwood International',
          schoolCode: 'GW-001',
          slug: 'greenwood',
          status: 'ACTIVE',
        },
      },
      updateUser: mockUpdateUser,
      logout: mockLogout,
    });

    renderWithProviders(<ProfilePage />);

    expect(screen.getByText('Institutional Affiliation')).toBeInTheDocument();
    expect(screen.getByText('Greenwood International')).toBeInTheDocument();
    expect(screen.getByText(/Code: GW-001/i)).toBeInTheDocument();
  });

  it('renders student-specific academic information when studentProfile is present', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'usr-student',
        firstName: 'Tom',
        lastName: 'Brown',
        email: 'tom@student.com',
        role: ROLES.STUDENT,
        studentProfile: {
          admissionNumber: 'ADM-9988',
          rollNumber: '24',
          className: 'Grade 10',
          sectionName: 'A',
          sessionName: '2025-2026',
          gender: 'male',
          bloodGroup: 'O+',
        },
      },
      updateUser: mockUpdateUser,
      logout: mockLogout,
    });

    renderWithProviders(<ProfilePage />);

    expect(screen.getByText('Student Academic Record')).toBeInTheDocument();
    expect(screen.getByText('ADM-9988')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText(/Grade 10 \(A\)/i)).toBeInTheDocument();
    expect(screen.getByText('2025-2026')).toBeInTheDocument();
  });

  it('renders teacher-specific credentials and assigned teaching workload', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'usr-teacher',
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah@teacher.com',
        role: ROLES.TEACHER,
        teacherProfile: {
          employeeId: 'EMP-7711',
          designation: 'Senior Faculty',
          department: 'Science',
          qualification: 'M.Sc Physics',
          specialization: 'Quantum Mechanics',
          assignments: [
            {
              id: 'asg-1',
              subject: { name: 'Physics I', code: 'PHY-101' },
              class: { name: 'Grade 11' },
              section: { name: 'A' },
            },
          ],
        },
      },
      updateUser: mockUpdateUser,
      logout: mockLogout,
    });

    renderWithProviders(<ProfilePage />);

    expect(screen.getByText('Faculty & Teaching Credentials')).toBeInTheDocument();
    expect(screen.getByText('EMP-7711')).toBeInTheDocument();
    expect(screen.getByText('Senior Faculty')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Physics I (PHY-101)')).toBeInTheDocument();
  });

  it('renders parent details and linked children records', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'usr-parent',
        firstName: 'David',
        lastName: 'Miller',
        email: 'david@parent.com',
        role: ROLES.PARENT,
        parentProfile: {
          phone: '+92 321 9998888',
          address: '42 Main Street, Lahore',
          children: [
            {
              id: 'child-1',
              name: 'Emily Miller',
              admissionNumber: 'ADM-1010',
              className: 'Grade 5',
              sectionName: 'Blue',
            },
          ],
        },
      },
      updateUser: mockUpdateUser,
      logout: mockLogout,
    });

    renderWithProviders(<ProfilePage />);

    expect(screen.getByText('Parent Profile & Linked Students')).toBeInTheDocument();
    expect(screen.getByText('Emily Miller')).toBeInTheDocument();
    expect(screen.getByText(/Adm #ADM-1010/i)).toBeInTheDocument();
    expect(screen.getByText('42 Main Street, Lahore')).toBeInTheDocument();
  });

  it('allows updating profile details (firstName, lastName, phone)', async () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'usr-1',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex@example.com',
        phone: '+92 300 0000000',
        role: ROLES.STAFF,
      },
      updateUser: mockUpdateUser,
      logout: mockLogout,
    });

    authApiModule.updateProfileApi.mockResolvedValueOnce({
      user: {
        id: 'usr-1',
        firstName: 'Alexander',
        lastName: 'Morgan-Smith',
        phone: '+92 300 9999999',
      },
    });

    renderWithProviders(<ProfilePage />);

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const phoneInput = screen.getByLabelText(/Phone Number/i);

    fireEvent.change(firstNameInput, { target: { value: 'Alexander' } });
    fireEvent.change(lastNameInput, { target: { value: 'Morgan-Smith' } });
    fireEvent.change(phoneInput, { target: { value: '+92 300 9999999' } });

    const submitBtn = screen.getByRole('button', { name: /Save Profile Changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApiModule.updateProfileApi).toHaveBeenCalledWith({
        firstName: 'Alexander',
        lastName: 'Morgan-Smith',
        phone: '+92 300 9999999',
      });
      expect(mockUpdateUser).toHaveBeenCalled();
    });
  });

  it('validates password requirements and changes password successfully, logging out and redirecting', async () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'usr-1',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex@example.com',
        role: ROLES.STUDENT,
      },
      updateUser: mockUpdateUser,
      logout: mockLogout,
    });

    authApiModule.changePasswordApi.mockResolvedValueOnce({
      message: 'Password changed. Please login again.',
    });

    renderWithProviders(<ProfilePage />);

    const currentPwdInput = screen.getByLabelText(/Current Password/i);
    const newPwdInput = screen.getByLabelText(/^New Password/i);
    const confirmPwdInput = screen.getByLabelText(/Confirm New Password/i);
    const updatePwdBtn = screen.getByRole('button', { name: /Update Password/i });

    // Try mismatched passwords first
    fireEvent.change(currentPwdInput, { target: { value: 'OldPass123!' } });
    fireEvent.change(newPwdInput, { target: { value: 'NewPass123!' } });
    fireEvent.change(confirmPwdInput, { target: { value: 'DifferentPass123!' } });
    fireEvent.click(updatePwdBtn);

    expect(screen.getAllByText(/New passwords do not match/i)[0]).toBeInTheDocument();
    expect(authApiModule.changePasswordApi).not.toHaveBeenCalled();

    // Now matching valid passwords
    fireEvent.change(confirmPwdInput, { target: { value: 'NewPass123!' } });
    fireEvent.click(updatePwdBtn);

    await waitFor(() => {
      expect(authApiModule.changePasswordApi).toHaveBeenCalledWith({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      });
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('allows removing profile avatar when present', async () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'usr-1',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex@example.com',
        role: ROLES.STUDENT,
        avatar: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
      },
      updateUser: mockUpdateUser,
      logout: mockLogout,
    });

    authApiModule.updateProfileApi.mockResolvedValueOnce({
      user: {
        id: 'usr-1',
        avatar: null,
      },
    });

    renderWithProviders(<ProfilePage />);

    const removeBtn = screen.getByRole('button', { name: /Remove avatar photo/i });
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(authApiModule.updateProfileApi).toHaveBeenCalledWith({ avatar: null });
      expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({ avatar: null }));
    });
  });
});
