// Replace the simulated email service with a real one
import nodemailer from "nodemailer"
import { env } from "@/app/env"

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: Number(env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  })
}

export async function sendBookingConfirmationEmail(booking: any, user: any, seat: any): Promise<void> {
  try {
    // If email credentials are not set, log and return without throwing an error
    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
      console.log("Email credentials not set. Skipping email notification.")
      return
    }

    const transporter = createTransporter()

    // Format dates for email
    const startDate = new Date(booking.startTime).toLocaleString()
    const endDate = new Date(booking.endTime).toLocaleString()

    // Email content
    const mailOptions = {
      from: `"BOOK MY DESK" <${env.EMAIL_USER}>`,
      to: user.email,
      subject: `Booking ${booking.status === "pending" ? "Request Received" : "Confirmed"} - Floor ${booking.floor}, ${seat.pcLabel || `PC${seat.seatNumber}`}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #e01e2b; margin-bottom: 5px;">BOOK MY DESK</h1>
            <p style="color: #666; margin-top: 0;">Workstation Booking System</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>Dear ${user.name},</p>
            <p>Your booking for ${seat.pcLabel || `PC${seat.seatNumber}`} on floor ${booking.floor} has been ${booking.status === "pending" ? "submitted and is pending approval" : "confirmed"}.</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 18px; margin-top: 0;">Booking Details</h2>
            <p><strong>Floor:</strong> ${booking.floor}</p>
            <p><strong>Seat:</strong> ${seat.pcLabel || `PC${seat.seatNumber}`}</p>
            <p><strong>Start Time:</strong> ${startDate}</p>
            <p><strong>End Time:</strong> ${endDate}</p>
            <p><strong>Status:</strong> <span style="color: ${booking.status === "approved" ? "green" : booking.status === "pending" ? "orange" : "red"}">${booking.status}</span></p>
          </div>
          
          ${
            booking.status === "pending"
              ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
              <p style="margin: 0;"><strong>Note:</strong> Your booking requires admin approval because it exceeds 4 days. You will receive another email once it's approved or rejected.</p>
            </div>
          `
              : ""
          }
          
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Thank you for using BOOK MY DESK!</p>
            <p>If you have any questions, please contact the administrator.</p>
            <p style="margin-top: 20px; font-size: 12px;">© ${new Date().getFullYear()} BOOK MY DESK - Website created by Team Symbiosis</p>
          </div>
        </div>
      `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)
  } catch (error) {
    console.error("Error sending email:", error)
    // Don't throw the error, just log it
  }
}

export async function sendStatusUpdateNotification(booking: any, user: any, seat: any): Promise<void> {
  try {
    // If email credentials are not set, log and return without throwing an error
    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
      console.log("Email credentials not set. Skipping email notification.")
      return
    }

    const transporter = createTransporter()

    // Format dates for email
    const startDate = new Date(booking.startTime).toLocaleString()
    const endDate = new Date(booking.endTime).toLocaleString()

    // Email content
    const mailOptions = {
      from: `"BOOK MY DESK" <${env.EMAIL_USER}>`,
      to: user.email,
      subject: `Booking Status Updated: ${booking.status.toUpperCase()} - Floor ${booking.floor}, ${seat.pcLabel || `PC${seat.seatNumber}`}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #e01e2b; margin-bottom: 5px;">BOOK MY DESK</h1>
            <p style="color: #666; margin-top: 0;">Workstation Booking System</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>Dear ${user.name},</p>
            <p>The status of your booking for ${seat.pcLabel || `PC${seat.seatNumber}`} on floor ${booking.floor} has been updated to <strong>${booking.status}</strong>.</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 18px; margin-top: 0;">Booking Details</h2>
            <p><strong>Floor:</strong> ${booking.floor}</p>
            <p><strong>Seat:</strong> ${seat.pcLabel || `PC${seat.seatNumber}`}</p>
            <p><strong>Start Time:</strong> ${startDate}</p>
            <p><strong>End Time:</strong> ${endDate}</p>
            <p><strong>Status:</strong> <span style="color: ${booking.status === "approved" ? "green" : booking.status === "pending" ? "orange" : "red"}">${booking.status}</span></p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Thank you for using BOOK MY DESK!</p>
            <p>If you have any questions, please contact the administrator.</p>
            <p style="margin-top: 20px; font-size: 12px;">© ${new Date().getFullYear()} BOOK MY DESK - Website created by Team Symbiosis</p>
          </div>
        </div>
      `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Status update email sent:", info.messageId)
  } catch (error) {
    console.error("Error sending status update email:", error)
    // Don't throw the error, just log it
  }
}

export async function sendCancellationEmail(booking: any, user: any, seat: any): Promise<void> {
  try {
    // If email credentials are not set, log and return without throwing an error
    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
      console.log("Email credentials not set. Skipping email notification.")
      return
    }

    const transporter = createTransporter()

    // Format dates for email
    const startDate = new Date(booking.startTime).toLocaleString()
    const endDate = new Date(booking.endTime).toLocaleString()

    // Email content
    const mailOptions = {
      from: `"BOOK MY DESK" <${env.EMAIL_USER}>`,
      to: user.email,
      subject: `Booking Cancellation Confirmation - Floor ${booking.floor}, ${seat.pcLabel || `PC${seat.seatNumber}`}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #e01e2b; margin-bottom: 5px;">BOOK MY DESK</h1>
            <p style="color: #666; margin-top: 0;">Workstation Booking System</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>Dear ${user.name},</p>
            <p>Your booking for ${seat.pcLabel || `PC${seat.seatNumber}`} on floor ${booking.floor} has been successfully cancelled.</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 18px; margin-top: 0;">Cancelled Booking Details</h2>
            <p><strong>Floor:</strong> ${booking.floor}</p>
            <p><strong>Seat:</strong> ${seat.pcLabel || `PC${seat.seatNumber}`}</p>
            <p><strong>Start Time:</strong> ${startDate}</p>
            <p><strong>End Time:</strong> ${endDate}</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Thank you for using BOOK MY DESK!</p>
            <p>If you have any questions, please contact the administrator.</p>
            <p style="margin-top: 20px; font-size: 12px;">© ${new Date().getFullYear()} BOOK MY DESK - Website created by Shubh Agarwal, Het Sevalia, Dhwani Bhavankar</p>
          </div>
        </div>
      `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Cancellation email sent:", info.messageId)
  } catch (error) {
    console.error("Error sending cancellation email:", error)
    // Don't throw the error, just log it
  }
}

export async function sendApprovalEmail(booking: any, user: any, seat: any): Promise<void> {
  try {
    // If email credentials are not set, log and return without throwing an error
    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
      console.log("Email credentials not set. Skipping email notification.")
      return
    }

    const transporter = createTransporter()

    // Format dates for email
    const startDate = new Date(booking.startTime).toLocaleString()
    const endDate = new Date(booking.endTime).toLocaleString()

    // Email content
    const mailOptions = {
      from: `"BOOK MY DESK" <${env.EMAIL_USER}>`,
      to: user.email,
      subject: `Booking Approved - Floor ${booking.floor}, ${seat.pcLabel || `PC${seat.seatNumber}`}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #e01e2b; margin-bottom: 5px;">BOOK MY DESK</h1>
            <p style="color: #666; margin-top: 0;">Workstation Booking System</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>Dear ${user.name},</p>
            <p>Good news! Your booking request for ${seat.pcLabel || `PC${seat.seatNumber}`} on floor ${booking.floor} has been approved.</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 18px; margin-top: 0;">Booking Details</h2>
            <p><strong>Floor:</strong> ${booking.floor}</p>
            <p><strong>Seat:</strong> ${seat.pcLabel || `PC${seat.seatNumber}`}</p>
            <p><strong>Start Time:</strong> ${startDate}</p>
            <p><strong>End Time:</strong> ${endDate}</p>
            <p><strong>Status:</strong> <span style="color: green">Approved</span></p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Thank you for using BOOK MY DESK!</p>
            <p>If you have any questions, please contact the administrator.</p>
            <p style="margin-top: 20px; font-size: 12px;">© ${new Date().getFullYear()} BOOK MY DESK - Website created by Shubh Agarwal, Het Sevalia, Dhwani Bhavankar</p>
          </div>
        </div>
      `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Approval email sent:", info.messageId)
  } catch (error) {
    console.error("Error sending approval email:", error)
    // Don't throw the error, just log it
  }
}

export async function sendRejectionEmail(booking: any, user: any, seat: any): Promise<void> {
  try {
    // If email credentials are not set, log and return without throwing an error
    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
      console.log("Email credentials not set. Skipping email notification.")
      return
    }

    const transporter = createTransporter()

    // Format dates for email
    const startDate = new Date(booking.startTime).toLocaleString()
    const endDate = new Date(booking.endTime).toLocaleString()

    // Email content
    const mailOptions = {
      from: `"BOOK MY DESK" <${env.EMAIL_USER}>`,
      to: user.email,
      subject: `Booking Rejected - Floor ${booking.floor}, ${seat.pcLabel || `PC${seat.seatNumber}`}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #e01e2b; margin-bottom: 5px;">BOOK MY DESK</h1>
            <p style="color: #666; margin-top: 0;">Workstation Booking System</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>Dear ${user.name},</p>
            <p>We regret to inform you that your booking request for ${seat.pcLabel || `PC${seat.seatNumber}`} on floor ${booking.floor} has been rejected.</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 18px; margin-top: 0;">Booking Details</h2>
            <p><strong>Floor:</strong> ${booking.floor}</p>
            <p><strong>Seat:</strong> ${seat.pcLabel || `PC${seat.seatNumber}`}</p>
            <p><strong>Start Time:</strong> ${startDate}</p>
            <p><strong>End Time:</strong> ${endDate}</p>
            <p><strong>Status:</strong> <span style="color: red">Rejected</span></p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Note:</strong> Please contact the administrator for more information or to discuss alternative booking options.</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Thank you for using BOOK MY DESK!</p>
            <p>If you have any questions, please contact the administrator.</p>
            <p style="margin-top: 20px; font-size: 12px;">© ${new Date().getFullYear()} BOOK MY DESK - Website created by Shubh Agarwal, Het Sevalia, Dhwani Bhavankar</p>
          </div>
        </div>
      `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Rejection email sent:", info.messageId)
  } catch (error) {
    console.error("Error sending rejection email:", error)
    // Don't throw the error, just log it
  }
}
