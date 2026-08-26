import { Resend } from 'resend';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let cachedResendClient = null;

/**
 * Creates or retrieves the cached Resend HTTP API client.
 *
 * @returns {Resend | null}
 */
export const getResendClient = () => {
  if (cachedResendClient === false) {
    return null;
  }

  if (cachedResendClient) {
    return cachedResendClient;
  }

  if (!env.RESEND_API_KEY) {
    return null;
  }

  cachedResendClient = new Resend(env.RESEND_API_KEY);

  return cachedResendClient;
};

/**
 * Override or inject a Resend client.
 * Primarily used in automated tests.
 *
 * @param {Resend | null | false} client
 */
export const setResendClient = (client) => {
  cachedResendClient = client;
};

/**
 * Reset the cached Resend client.
 */
export const resetResendClient = () => {
  cachedResendClient = null;
};

/**
 * Send an email using the Resend HTTP API.
 *
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   messageId?: string,
 *   error?: string
 * }>}
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !subject) {
    logger.warn('Email sending skipped: missing recipient or subject', {
      recipient: to || null,
      subject: subject || null,
    });

    return {
      success: false,
      error: 'Missing recipient or subject',
    };
  }

  const resend = getResendClient();

  /**
   * IMPORTANT:
   * Never report fake success in production.
   *
   * If the Resend API key is missing, the email was NOT sent.
   */
  if (!resend) {
    logger.error('RESEND_EMAIL_FAILED: Resend API is not configured', {
      recipient: to,
      provider: 'resend',
      from: env.SMTP_FROM,
      reason: 'RESEND_API_KEY is missing',
    });

    return {
      success: false,
      error: 'Resend API is not configured',
    };
  }

  logger.info('RESEND_EMAIL_ATTEMPT', {
    recipient: to,
    provider: 'resend',
    from: env.SMTP_FROM,
    subject,
  });

  try {
    const payload = {
      from: env.SMTP_FROM,
      to: [to],
      subject,
      html,
    };

    if (text) {
      payload.text = text;
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      logger.error('RESEND_EMAIL_FAILED', {
        recipient: to,
        provider: 'resend',
        from: env.SMTP_FROM,
        subject,
        error: error.message || String(error),
      });

      return {
        success: false,
        error: error.message || 'Resend API rejected the email',
      };
    }

    if (!data?.id) {
      logger.error('RESEND_EMAIL_FAILED', {
        recipient: to,
        provider: 'resend',
        from: env.SMTP_FROM,
        subject,
        error: 'Resend API returned no message ID',
      });

      return {
        success: false,
        error: 'Resend API returned no message ID',
      };
    }

    logger.info('EMAIL_ACCEPTED_BY_RESEND', {
      recipient: to,
      provider: 'resend',
      from: env.SMTP_FROM,
      subject,
      messageId: data.id,
    });

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    logger.error('RESEND_EMAIL_EXCEPTION', {
      recipient: to,
      provider: 'resend',
      from: env.SMTP_FROM,
      subject,
      error: error?.message || String(error),
    });

    return {
      success: false,
      error: error?.message || 'Unexpected Resend API error',
    };
  }
};