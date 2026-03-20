const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.database();

// EMAIL CONFIGURATION - USING YOUR GMAIL AND APP PASSWORD
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'legateakanjimusab@gmail.com',
    pass: 'spsu skgw qghx vwpm'
  }
});

// 1. Send email when new contact message is received
exports.onNewMessage = functions.database.ref('/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const msg = snapshot.val();
    
    const mailOptions = {
      from: '"Phantom Creative" <legateakanjimusab@gmail.com>',
      to: 'legateakanjimusab@gmail.com',
      subject: `📬 New Contact Message: ${msg.subject || 'No Subject'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #ff5e00, #ff9a3c); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #ff5e00; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✨ New Message from Phantom Creative</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">📝 From:</div>
                <div class="value">${msg.name} (${msg.email})</div>
              </div>
              <div class="field">
                <div class="label">📌 Subject:</div>
                <div class="value">${msg.subject || 'No Subject'}</div>
              </div>
              <div class="field">
                <div class="label">💬 Message:</div>
                <div class="value">${msg.message.replace(/\n/g, '<br>')}</div>
              </div>
              <p style="margin-top: 20px; color: #666;">📅 Received on: ${new Date(msg.timestamp).toLocaleString()}</p>
            </div>
            <div class="footer">
              <p>© 2026 Phantom Creative. All rights reserved. | Made with ❤️ by Akanji Mus'ab</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      await snapshot.ref.update({ emailSent: true, emailSentAt: Date.now() });
      console.log(`✅ Email sent for message from ${msg.name}`);
    } catch (error) {
      console.error('❌ Email error:', error);
      await snapshot.ref.update({ emailSent: false, emailError: error.message });
    }
  });

// 2. Send welcome email to new subscribers
exports.onNewSubscriber = functions.database.ref('/subscribers/{subscriberId}')
  .onCreate(async (snapshot, context) => {
    const sub = snapshot.val();
    
    const mailOptions = {
      from: '"Akanji Mus'ab - Phantom Creative" <legateakanjimusab@gmail.com>',
      to: sub.email,
      subject: '🎨 Welcome to Phantom Creative!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #ff5e00, #ff9a3c); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #ff5e00, #ff9a3c); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Welcome to Phantom Creative!</h1>
              <p>Your creative journey starts here</p>
            </div>
            <div class="content">
              <h2>Hello! 👋</h2>
              <p>Thank you for subscribing to the Phantom Creative newsletter. I'm thrilled to have you on board!</p>
              <p>As a subscriber, you'll receive:</p>
              <ul>
                <li>🎨 Exclusive design tips and tutorials</li>
                <li>🔥 Early access to new services and special offers</li>
                <li>✨ Behind-the-scenes looks at our creative process</li>
                <li>💡 Industry trends and insights</li>
              </ul>
              <p>Stay tuned for our first newsletter coming soon!</p>
              <div style="text-align: center;">
                <a href="https://phantom-creative.vercel.app/portfolio.html" class="button">View Our Portfolio</a>
              </div>
              <p style="margin-top: 30px;">Cheers,<br><strong>Akanji Mus'ab</strong><br>Founder & Creative Director<br>Phantom Creative</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you subscribed to our newsletter.</p>
              <p>© 2026 Phantom Creative. All rights reserved. | Made with ❤️ by Akanji Mus'ab</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      await snapshot.ref.update({ welcomeEmailSent: true });
      console.log(`✅ Welcome email sent to ${sub.email}`);
    } catch (error) {
      console.error('❌ Welcome email error:', error);
    }
  });

// 3. Send newsletter to all subscribers when new blog post is published
exports.onNewBlogPost = functions.database.ref('/blog/{postId}')
  .onCreate(async (snapshot, context) => {
    const post = snapshot.val();
    
    // Get all active subscribers
    const subscribersSnap = await db.ref('subscribers').once('value');
    const subscribers = subscribersSnap.val();
    
    if (!subscribers) return;
    
    const emails = [];
    Object.values(subscribers).forEach(sub => {
      if (sub.status === 'active') {
        emails.push(sub.email);
      }
    });
    
    if (emails.length === 0) return;
    
    const mailOptions = {
      from: '"Phantom Creative Blog" <legateakanjimusab@gmail.com>',
      to: 'legateakanjimusab@gmail.com',
      bcc: emails.join(','),
      subject: `📝 New Blog Post: ${post.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #ff5e00, #ff9a3c); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #ff5e00, #ff9a3c); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📝 New Blog Post Alert!</h2>
            </div>
            <div class="content">
              <h1 style="color: #ff5e00;">${post.title}</h1>
              ${post.imageUrl ? `<div style="margin: 20px 0;"><img src="${post.imageUrl}" style="max-width: 100%; border-radius: 10px;"></div>` : ''}
              <p>${post.content.substring(0, 300)}${post.content.length > 300 ? '...' : ''}</p>
              <div style="text-align: center;">
                <a href="https://phantom-creative.vercel.app/blog.html" class="button">Read Full Article</a>
              </div>
              <p style="margin-top: 30px;">Stay creative,<br><strong>The Phantom Creative Team</strong></p>
            </div>
            <div class="footer">
              <p>You received this because you subscribed to our newsletter.</p>
              <p>© 2026 Phantom Creative. All rights reserved. | Made with ❤️ by Akanji Mus'ab</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      await snapshot.ref.update({ newsletterSent: true });
      console.log(`✅ Newsletter sent to ${emails.length} subscribers for post: ${post.title}`);
    } catch (error) {
      console.error('❌ Newsletter error:', error);
    }
  });