import { describe, it, expect } from 'vitest';
import router from '../router';

describe('Application Router Architecture', () => {
  it('should have configured routes matching LMS functional specifications', () => {
    expect(router.routes).toBeDefined();
    expect(router.routes.length).toBeGreaterThanOrEqual(3);

    // Find main app route with children
    const appRoute = router.routes.find((r) => r.children && r.children.some((c) => c.path === '/dashboard'));
    expect(appRoute).toBeDefined();

    const childPaths = appRoute.children.map((c) => c.path);
    expect(childPaths).toContain('/dashboard');
    expect(childPaths).toContain('/students');
    expect(childPaths).toContain('/teachers');
    expect(childPaths).toContain('/parents');
    expect(childPaths).toContain('/academic-sessions');
    expect(childPaths).toContain('/academics/sessions');
    expect(childPaths).toContain('/classes');
    expect(childPaths).toContain('/academics/classes');
    expect(childPaths).toContain('/subjects');
    expect(childPaths).toContain('/academics/subjects');
    expect(childPaths).toContain('/attendance');
    expect(childPaths).toContain('/assignments');
    expect(childPaths).toContain('/quizzes');
    expect(childPaths).toContain('/notifications');
    expect(childPaths).toContain('/messages');
    expect(childPaths).toContain('/exams');
    expect(childPaths).toContain('/results');
    expect(childPaths).toContain('/fees');
    expect(childPaths).toContain('/notices');
    expect(childPaths).toContain('/reports');
    expect(childPaths).toContain('/audit-logs');
    expect(childPaths).toContain('/analytics');
    expect(childPaths).toContain('/schools');

    // Verify /accept-invitation route is registered
    const acceptInviteRoute = router.routes.find((r) => r.children && r.children.some((c) => c.path === '/accept-invitation'));
    expect(acceptInviteRoute).toBeDefined();
  });
});
