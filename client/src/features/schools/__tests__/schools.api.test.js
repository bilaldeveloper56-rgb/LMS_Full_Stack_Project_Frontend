import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  fetchSchools,
  fetchSchoolStats,
  fetchSchoolById,
  createSchool,
  updateSchool,
  changeSchoolStatus,
  resendAdminInvitation,
  acceptInvitation,
} from '../api/schools.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('Schools API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchSchools should call GET /schools with params', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 's1', name: 'Springfield High' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });

    const res = await fetchSchools({ search: 'Springfield' });
    expect(api.get).toHaveBeenCalledWith('/schools', { params: { search: 'Springfield' } });
    expect(res.schools).toHaveLength(1);
    expect(res.pagination.total).toBe(1);
  });

  it('fetchSchoolStats and fetchSchoolById should call endpoints', async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: { total: 10, active: 8 } },
    });
    const stats = await fetchSchoolStats();
    expect(api.get).toHaveBeenCalledWith('/schools/stats');
    expect(stats.total).toBe(10);

    api.get.mockResolvedValueOnce({
      data: { success: true, data: { school: { id: 's1', name: 'Springfield' } } },
    });
    const school = await fetchSchoolById('s1');
    expect(api.get).toHaveBeenCalledWith('/schools/s1');
    expect(school.name).toBe('Springfield');
  });

  it('createSchool, updateSchool, changeSchoolStatus, resendAdminInvitation should call endpoints', async () => {
    api.post.mockResolvedValueOnce({
      data: { success: true, data: { school: { id: 's1' } } },
    });
    const created = await createSchool({ school: { name: 'New' } });
    expect(api.post).toHaveBeenCalledWith('/schools', { school: { name: 'New' } });
    expect(created.school.id).toBe('s1');

    api.patch.mockResolvedValueOnce({
      data: { success: true, data: { school: { id: 's1', name: 'Updated' } } },
    });
    const updated = await updateSchool('s1', { name: 'Updated' });
    expect(api.patch).toHaveBeenCalledWith('/schools/s1', { name: 'Updated' });
    expect(updated.name).toBe('Updated');

    api.patch.mockResolvedValueOnce({
      data: { success: true, data: { school: { id: 's1', status: 'SUSPENDED' } } },
    });
    const changed = await changeSchoolStatus('s1', { status: 'SUSPENDED' });
    expect(api.patch).toHaveBeenCalledWith('/schools/s1/status', { status: 'SUSPENDED' });
    expect(changed.status).toBe('SUSPENDED');

    api.post.mockResolvedValueOnce({
      data: { success: true, message: 'Invitation resent' },
    });
    const resent = await resendAdminInvitation('s1');
    expect(api.post).toHaveBeenCalledWith('/schools/s1/resend-admin-invitation');
    expect(resent.success).toBe(true);

    api.post.mockResolvedValueOnce({
      data: { success: true, message: 'Account activated successfully' },
    });
    const activated = await acceptInvitation({
      token: 'raw-token-123',
      password: 'AdminPassword@123',
      confirmPassword: 'AdminPassword@123',
    });
    expect(api.post).toHaveBeenCalledWith('/schools/accept-invitation', {
      token: 'raw-token-123',
      password: 'AdminPassword@123',
      confirmPassword: 'AdminPassword@123',
    });
    expect(activated.success).toBe(true);
  });
});
