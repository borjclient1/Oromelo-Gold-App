// @ts-nocheck
/* eslint-env node */

import { Resend } from 'resend';

/**
 * Netlify serverless function to handle contact form submissions
 * @param {Object} event - The event object from Netlify
 * @param {string} event.httpMethod - The HTTP method used
 * @param {string} event.body - The request body
 * @returns {Promise<Object>} Response object
 */
export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { name, email, phone, message, itemTitle } = JSON.parse(event.body);
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Determine the email subject and type
    const isContactForm = !itemTitle;
    const emailSubject = isContactForm 
      ? `New Contact Form Submission from ${name}` 
      : `Oromelo - New Item Listing: ${itemTitle}`;

    // Response data is intentionally unused
    // eslint-disable-next-line no-unused-vars
    const { data, error } = await resend.emails.send({
      from: 'Oromelo Gold Pawn <noreply@oromelo.ph>',
      to: process.env.ADMIN_EMAILS.split(',').map(e => e.trim()),
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Oromelo Gold Pawn</h1>
            <h2 style="color: #ffffff; margin: 10px 0 0; font-size: 20px;">
              ${isContactForm ? 'New Contact Form Submission' : 'New Item Listing'}
            </h2>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            ${itemTitle ? `<p><strong>Item Title:</strong> ${itemTitle}</p>` : ''}
            <p><strong>Message:</strong></p>
            <div style="background-color: #f8f9fa; padding: 12px; border-radius: 4px; margin-top: 8px; border-left: 4px solid #d4af37;">
              <p style="margin: 0; white-space: pre-line;">${message}</p>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };
  } catch (error) {
    console.error('Error in send-email function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email', details: error.message }),
    };
  }
};
