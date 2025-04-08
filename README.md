# Book_My_Desk
Building a cloud-hosted Workstation Booking System for college use, supporting real-time seat booking, admin approvals, and user notifications.

# 💻 Workstation Booking System - Full Stack Project

A full-stack cloud-based **Workstation Booking System** designed to manage and automate seat bookings for students and faculty at Symbiosis Institute of Technology (SIT). This project features real-time seat visualization, admin approval workflows, and email notifications, ensuring efficient use of shared workspaces.

---

## 🧠 Kipling Model Explanation (6W Analysis)

| Aspect   | Explanation |
|----------|-------------|
| **What** | A modern booking platform for reserving workstations at SIT, with authentication, visual seat selection, real-time queues, and admin-controlled approvals. |
| **Why**  | To replace inefficient manual systems with a seamless, automated solution that enhances transparency, reduces conflicts, and optimizes seat usage. |
| **When** | Booking is available 24/7. Admins approve long-duration bookings. Real-time updates reflect changes instantly. |
| **How**  | Built using a MERN + PostgreSQL stack. MongoDB manages booking data, PostgreSQL handles authentication. Node.js APIs and ReactJS UI manage user interaction. |
| **Where**| Applicable to the 4th and 5th floor workstations:<br>- 🖥️ **5th Floor**: 8 rows × 6 seats (last row reserved)<br>- ⚙️ **4th Floor NVIDIA Workstation**: 6 high-performance seats |
| **Who**  | 👨‍🎓 Students and researchers as users<br>👩‍💼 Admins for approvals<br>👨‍💻 Dev team: Dhwani, Shubh, Het (What/Why/When/How/Where/Who) |

---

## 🚀 Tech Stack

| Layer        | Technology         |
|--------------|--------------------|
| **Frontend** | ReactJS (TypeScript), HTML, CSS |
| **Backend**  | Node.js + Express.js |
| **Databases**| MongoDB (Bookings), PostgreSQL (Authentication) |
| **Hosting**  | AWS / Firebase / Render / Vercel |
| **Other**    | Nodemailer (emails), Cloudinary (images), WebPacket (real-time), TailwindCSS |

---

## 🎯 Key Features

### ✅ Interactive Seat Map

- Floors:
  - **5th Floor Workstation**: 8 rows × 6 seats (3 left + 3 right)
    - Last row:
      - Left 3 → Reserved for Other Departments
      - Right 3 → Reserved for **SCAAI**
  - **4th Floor NVIDIA Workstation**: 6 seats
- Real-time status: Available / Reserved / Booked
- Visual feedback and filtering by floor

### ✅ Real-Time Queue System

- Automatically places users in a queue if all seats are occupied.
- Notifies users when a seat becomes available.

### ✅ Admin Approval Workflow

- If a user books for more than **4 days**, admin approval is required.
- Admin can accept/reject requests via dashboard.

### ✅ Email Notifications

- Users receive:
  - Booking confirmations
  - Approval/rejection updates
  - Seat release/reminders

### ✅ User Profiles & Booking History

- Users can view booking history and active reservations.
- Admins can track seat usage trends.

---

## 🗃️ Database Design

### MongoDB (Booking Data)
```json
{
  "user_id": "uuid",
  "seat_id": "5R06",
  "floor": "5th",
  "booking_date": "2025-04-08",
  "duration_days": 3,
  "status": "pending | approved | rejected",
  "timestamp": "2025-04-06T12:00:00Z"
}
```

## 🧱 Folder Structure
📦 workstation-booking
├── client                # React frontend
│   ├── public
│   └── src
│       ├── components
│       ├── pages
│       ├── assets
│       └── App.tsx
├── server                # Node.js backend
│   ├── routes
│   ├── controllers
│   ├── models
│   ├── config
│   └── server.js
├── database
│   ├── postgresql
│   └── mongodb
└── README.md
## 🧪 Testing & Validation
	•	✅ User authentication flows tested
	•	✅ Booking form with validations
	•	✅ Admin approval tested for edge cases (4+ day booking)
	•	✅ Queue logic tested for full capacity
	•	✅ Email notifications verified using test SMTP
## ✅ Roadmap
	•	Seat map visualization
	•	Basic booking & login system
	•	Admin approval
	•	Queue handling
	•	Google OAuth integration
	•	Admin analytics dashboard
	•	Mobile-responsive UI
	•	PDF Booking Slip


