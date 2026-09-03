import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('SEO Static Assets (sitemap.xml & robots.txt)', () => {
  const publicDir = path.resolve(__dirname, '../../../public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  const robotsPath = path.join(publicDir, 'robots.txt');

  it('should have a valid sitemap.xml file in public directory', () => {
    expect(fs.existsSync(sitemapPath)).toBe(true);
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

    // XML structure
    expect(sitemapContent).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(sitemapContent).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    // Public pages included
    expect(sitemapContent).toContain('<loc>https://app.lmsprime.online/</loc>');
    expect(sitemapContent).toContain('<loc>https://app.lmsprime.online/login</loc>');
    expect(sitemapContent).toContain('<loc>https://app.lmsprime.online/register</loc>');

    // Private / authenticated routes MUST NOT be present
    const forbiddenPatterns = [
      '/dashboard',
      '/students',
      '/teachers',
      '/parents',
      '/academics',
      '/academic-sessions',
      '/classes',
      '/subjects',
      '/attendance',
      '/leaves',
      '/timetable',
      '/assignments',
      '/quizzes',
      '/notifications',
      '/messages',
      '/exams',
      '/results',
      '/fees',
      '/notices',
      '/reports',
      '/audit-logs',
      '/analytics',
      '/schools',
      '/settings',
      '/profile',
      '/accept-invitation',
    ];

    forbiddenPatterns.forEach((route) => {
      expect(sitemapContent).not.toContain(`<loc>https://app.lmsprime.online${route}</loc>`);
      expect(sitemapContent).not.toContain(`<loc>https://app.lmsprime.online${route}/</loc>`);
    });
  });

  it('should have a valid robots.txt file in public directory', () => {
    expect(fs.existsSync(robotsPath)).toBe(true);
    const robotsContent = fs.readFileSync(robotsPath, 'utf-8');

    expect(robotsContent).toContain('User-agent: *');
    expect(robotsContent).toContain('Sitemap: https://app.lmsprime.online/sitemap.xml');
    expect(robotsContent).toContain('Disallow: /dashboard');
    expect(robotsContent).toContain('Disallow: /students');
    expect(robotsContent).toContain('Disallow: /teachers');
  });
});
