# Repository Structure (Detailed)

```
portfolio_iu/
├── backend/                    # Spring Boot API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/beworking/backend/
│   │   │   │   ├── controllers/    # REST API endpoints
│   │   │   │   ├── services/       # Business logic
│   │   │   │   ├── entities/       # JPA entities (User, Booking, MailboxItem)
│   │   │   │   ├── repositories/   # Data access layer
│   │   │   │   ├── dto/            # Data Transfer Objects
│   │   │   │   ├── security/       # JWT authentication & Spring Security config
│   │   │   │   └── config/         # Application configuration
│   │   │   └── resources/
│   │   │       ├── application.properties  # Backend configuration
│   │   │       ├── data.sql                # Initial data (tutor user + mailbox items)
│   │   │       └── static/pdfs/            # PDF files for mailbox
│   │   └── test/                  # Unit tests
│   └── pom.xml                   # Maven dependencies
│
├── frontend/                     # Next.js application
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── page.tsx          # Landing/Registration page
│   │   │   ├── login/            # Login page
│   │   │   ├── dashboard/        # Dashboard page
│   │   │   ├── mailbox/          # Mailbox page
│   │   │   ├── bookings/         # Bookings page
│   │   │   └── subscription/     # Stripe success/cancel pages
│   │   ├── components/           # Reusable React components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── FrontLayout.tsx
│   │   │   └── ...
│   │   ├── utils/                # Utility functions (auth, time parsing)
│   │   ├── config/               # Configuration (API_URL, Stripe keys)
│   │   ├── theme.ts              # Material-UI theme configuration
│   │   └── types/                # TypeScript type definitions
│   ├── public/                   # Static assets (logos, icons, PDFs)
│   └── package.json              # Node.js dependencies
│
└── README.md                     # Quick start
```
