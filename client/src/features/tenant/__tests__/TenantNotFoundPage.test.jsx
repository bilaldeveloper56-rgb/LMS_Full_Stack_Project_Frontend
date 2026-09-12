import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TenantNotFoundPage } from '../pages/TenantNotFoundPage';

describe('TenantNotFoundPage Component', () => {
  it('should render school not found title and message', () => {
    render(<TenantNotFoundPage />);

    expect(screen.getByText('School Not Found')).toBeInTheDocument();
    expect(
      screen.getByText(/The school URL you entered does not exist or is no longer available/i)
    ).toBeInTheDocument();
  });

  it('should render safe link to platform host app.lmsprime.online', () => {
    render(<TenantNotFoundPage />);

    const link = screen.getByRole('link', { name: /Go to LMSPrime Platform/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://app.lmsprime.online');
  });
});
