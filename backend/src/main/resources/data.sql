-- Tutor use with password: "tutor1234"

INSERT INTO users (name, email, password) 
VALUES (
    'Tutor',
    'tutor@be-working.com',
    '$2b$10$qIg9sIH4IcV7JbvQC1GJZ.mwV2MUseIg.YONAd07VRLXmTEM7tlzC' -- bcrypt("tutor1234")
)
ON CONFLICT (email) DO NOTHING;

-- Insert 5 mailbox items for the tutor (only if no items exist)
INSERT INTO mailbox_items (user_id, subject, message, timestamp, pdf_url)
SELECT u.id, x.subject, x.message, x.ts, x.pdf_url
FROM users u
CROSS JOIN (
    VALUES 
        ('Welcome to BeWorking', 'Your virtual office is set up. Explore the dashboard to get started.', NOW() - INTERVAL '1 day', 'http://localhost:8081/pdfs/mail-1.pdf'),
        ('Booking reminder', 'Don’t forget your meeting room booking tomorrow at 10:00.', NOW() - INTERVAL '12 hours', 'http://localhost:8081/pdfs/mail-2.pdf'),
        ('Invoice pending', 'Your invoice #INV-2025-001 is pending. Please review.', NOW() - INTERVAL '6 hours', 'http://localhost:8081/pdfs/mail-3.pdf'),
        ('Product update', 'New desk booking features are now available. Check them out!', NOW() - INTERVAL '3 hours', 'http://localhost:8081/pdfs/mail-4.pdf'),
        ('Support tips', 'Visit Help & Support for quick guides on automation.', NOW() - INTERVAL '30 minutes', 'http://localhost:8081/pdfs/mail-5.pdf')
) AS x(subject, message, ts, pdf_url)
WHERE u.email = 'tutor@be-working.com'
  AND NOT EXISTS (
      SELECT 1 FROM mailbox_items mi 
      WHERE mi.user_id = u.id 
      LIMIT 1
  );
