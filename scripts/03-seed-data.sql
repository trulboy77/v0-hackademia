-- Insert sample admin user
INSERT INTO users (id, email, display_name, username, full_name, role, rating) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@hackademia.uz',
  'Admin User',
  'admin',
  'System Administrator',
  'admin',
  1000
) ON CONFLICT (email) DO NOTHING;

-- Insert sample challenges
INSERT INTO challenges (title, description, category, difficulty, points, flag_hash, hints, files) VALUES
(
  'Basic Web Challenge',
  'Find the hidden flag in this simple web application.',
  'Web',
  'easy',
  100,
  hash_flag('flag{welcome_to_hackademia}'),
  '["Look at the source code", "Check for hidden elements"]',
  '[]'
),
(
  'Cryptography 101',
  'Decode this simple cipher to find the flag.',
  'Crypto',
  'medium',
  200,
  hash_flag('flag{caesar_cipher_solved}'),
  '["This is a substitution cipher", "Try different shift values"]',
  '[{"name": "cipher.txt", "url": "/files/cipher.txt"}]'
),
(
  'Binary Exploitation',
  'Exploit this vulnerable binary to get the flag.',
  'Pwn',
  'hard',
  300,
  hash_flag('flag{buffer_overflow_master}'),
  '["Look for buffer overflow vulnerabilities", "Check the stack layout"]',
  '[{"name": "vuln_binary", "url": "/files/vuln_binary"}]'
),
(
  'Reverse Engineering',
  'Analyze this binary and find the hidden flag.',
  'Reverse',
  'expert',
  500,
  hash_flag('flag{reverse_engineering_expert}'),
  '["Use a disassembler", "Look for string comparisons", "Check for anti-debugging techniques"]',
  '[{"name": "mystery.exe", "url": "/files/mystery.exe"}]'
);

-- Insert sample courses
INSERT INTO courses (title, description, content, difficulty, is_published, created_by) VALUES
(
  'Introduction to Cybersecurity',
  'Learn the fundamentals of cybersecurity and ethical hacking.',
  '{"lessons": [{"title": "What is Cybersecurity?", "content": "Introduction to the field", "duration": 30}, {"title": "Common Attack Vectors", "content": "Understanding different types of attacks", "duration": 45}]}',
  'beginner',
  true,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Web Application Security',
  'Deep dive into web application vulnerabilities and how to exploit them.',
  '{"lessons": [{"title": "OWASP Top 10", "content": "Most common web vulnerabilities", "duration": 60}, {"title": "SQL Injection", "content": "Understanding and exploiting SQL injection", "duration": 90}]}',
  'intermediate',
  true,
  '00000000-0000-0000-0000-000000000001'
);

-- Insert sample forum threads
INSERT INTO forum_threads (title, category, content, created_by) VALUES
(
  'Welcome to Hackademia!',
  'General',
  'Welcome to our cybersecurity learning platform! Feel free to introduce yourself and ask any questions.',
  '00000000-0000-0000-0000-000000000001'
),
(
  'Tips for Beginners',
  'Tutorials',
  'Share your best tips and resources for people just starting their cybersecurity journey.',
  '00000000-0000-0000-0000-000000000001'
);

-- Insert sample library resources
INSERT INTO library_resources (title, description, category, file_url, file_name, file_size, file_type, uploaded_by, status) VALUES
(
  'Cybersecurity Fundamentals PDF',
  'A comprehensive guide to cybersecurity basics.',
  'Documentation',
  '/files/cybersecurity-fundamentals.pdf',
  'cybersecurity-fundamentals.pdf',
  2048576,
  'application/pdf',
  '00000000-0000-0000-0000-000000000001',
  'approved'
),
(
  'Common Vulnerability Examples',
  'Collection of real-world vulnerability examples and explanations.',
  'Examples',
  '/files/vulnerability-examples.zip',
  'vulnerability-examples.zip',
  5242880,
  'application/zip',
  '00000000-0000-0000-0000-000000000001',
  'approved'
);
