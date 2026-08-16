import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let cachedTransporter = null;

/**
 * Creates or retrieves the cached Nodemailer transporter.
 * Supports Resend SMTP (e.g. smtp.resend.com, port 465, secure SSL/TLS)
 * or standard SMTP configurations.
 *
 * @returns {import('nodemailer').Transporter | null}
 */
export const getTransporter = () => {
  if (cachedTransporter === false) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    return null;
  }

  const isSecure = Number(env.SMTP_PORT) === 465;

  cachedTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: isSecure,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    // Safe network timeouts
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return cachedTransporter;
};

/**
 * Override or inject a transporter (primarily used in automated testing).
 * @param {import('nodemailer').Transporter | null} transporter
 */
export const setTransporter = (transporter) => {
  cachedTransporter = transporter;
};

/**
 * Reset the cached transporter instance.
 */
export const resetTransporter = () => {
  cachedTransporter = null;
};

/**
 * Send an email using Nodemailer with Resend SMTP or mock logger fallback.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML body content
 * @param {string} [options.text] - Plaintext fallback content
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !subject) {
    logger.warn('Email sending skipped: missing recipient or subject');
    return { success: false, error: 'Missing recipient or subject' };
  }

  const transporter = getTransporter();

  // Development/Test mock mode when SMTP credentials are not configured
  if (!transporter) {
    logger.info('📧 Email (SMTP not configured — mock mode):', {
      to,
      subject,
    });
    return { success: true, messageId: 'mock-delivery-id' };
  }

  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
      text,
    });

    logger.info(`📧 Email successfully sent to ${to}: "${subject}"`, {
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log safe error message without credentials or tokens
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};
