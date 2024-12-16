INSERT INTO users (email, password, first_name, last_name, dob, username, about_me, avatar) 
VALUES ('asd@asd.ee', '$2a$10$SoSjc4fBxSbXvl1R15ispOhE70e2tZoLAzISkc.2Ky8hzysC7FNbC', 'Taylor', 'Lorenzo', '1990-03-01 00:00:00+00:00', 'taylor_l', 'I am a student of the University of Tartu.', 'default_avatar.jpg');
INSERT INTO users (email, password, first_name, last_name, dob, username, about_me, avatar) 
VALUES ('qwe@qwe.ee', '$2a$10$SoSjc4fBxSbXvl1R15ispOhE70e2tZoLAzISkc.2Ky8hzysC7FNbC', 'qwe', 'qwe', '1990-03-01 00:00:00+00:00', 'qwe', 'testuser', 'default_avatar.jpg');
INSERT INTO users (email, password, first_name, last_name, dob, username, about_me, avatar) 
VALUES ('test@mail.ee', '$2a$10$SoSjc4fBxSbXvl1R15ispOhE70e2tZoLAzISkc.2Ky8hzysC7FNbC', 'Peter', 'Parker', '1985-03-01 00:00:00+00:00', 'pparker', 
'Aspiring software engineer from Paide, Estonia. I like to play tennis and play video games, read autobiographies and listen to classical music.', 'peter.jpg');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (4, 'From Skeptic to Believer: My Experience with Loora AI', 
'I recently started brushing up on my English skills for a big job interview with an international company. At first, I was super skeptical about practicing with an AI tool like Loora AI—talking to a machine felt a bit…awkward.<br><br>But once I got over the initial weirdness, I was pleasantly surprised! Loora was not just responsive—it felt like I was chatting with a real tutor who understood my mistakes and helped me improve without judgment. It even gave me confidence in speaking fluently and naturally.<br><br>If you are ever doubted AI learning tools, trust me: give them a shot. They might just surprise you! <br><br>#LanguageLearning #AItools #LooraAI #JobPrep #InterviewReady', 'public');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (4, 
'Overcoming Creative Block with DALL·E', 
'I was stuck on a project, staring at a blank canvas for hours. Nothing clicked—until I decided to give OpenAI''s DALL·E a try. <br><br>I typed in a few prompts, and within seconds, it generated stunning visuals that sparked a flood of ideas! It felt like having a brainstorming partner who''s always full of fresh inspiration. <br><br>AI tools like DALL·E are redefining how we approach creativity. If you''re ever in a creative slump, give it a shot—you might be amazed at what you create together. <br><br>#Creativity #AIart #Dalle #Inspiration #Innovation', 
'public');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (4, 
'Conquering Public Speaking with AI Assistance', 
'Public speaking has always been a huge challenge for me. The fear, the nerves—it''s overwhelming. But then I discovered an AI-powered presentation coach, and wow, what a game-changer! <br><br>The AI gave me real-time feedback on tone, pacing, and even body language through my webcam. Practicing with it felt awkward at first, but soon, it became my secret weapon. <br><br>This tool didn''t just improve my speaking—it boosted my confidence. Now, walking on stage feels empowering instead of terrifying. Highly recommend it to anyone struggling with presentations! <br><br>#PublicSpeaking #AItools #PresentationSkills #ConfidenceBoost', 
'public');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (4, 
'Writing the Perfect Resume with ChatGPT', 
'Creating a resume has always felt daunting. How do you make it stand out? Enter ChatGPT. <br><br>I was skeptical about using AI for something so personal, but I gave it a try. After feeding it my job details, it helped me craft a resume that felt polished and professional. It even suggested keywords tailored to the roles I was applying for! <br><br>Sometimes, we underestimate how much technology can simplify our lives. If you''re stuck updating your resume, give AI a chance—it might just land you your dream job. <br><br>#CareerGrowth #ResumeTips #ChatGPT #AItools', 
'public');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (4, 
'Fitness Goals with AI-Powered Trackers', 
'I have always struggled with staying consistent in my fitness journey—until I started using an AI-powered tracker. <br><br>The app not only created customized workout plans based on my goals but also tracked my progress and adjusted recommendations in real-time. It even sent gentle reminders when I was slacking off (ouch, but effective!). <br><br>In just a few weeks, I started seeing results I hadn''t achieved in months. Sometimes, all you need is a little accountability—and AI nailed it. <br><br>#FitnessJourney #AItools #HealthTech #GoalsAchieved', 
'public');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (4, 
'Rediscovering Reading with AI Recommendations', 
'I would have fallen out of the habit of reading, but I wanted to get back into it. That''s when I stumbled upon an AI-driven book recommendation app—and it reignited my love for books. <br><br>The AI suggested novels and genres I''d never considered, based on my past favorites. The first book it recommended? A page-turner that had me hooked from chapter one! <br><br>It''s amazing how AI can breathe life into old hobbies. If you''re in a reading rut, let AI guide you—you might discover your next favorite book. <br><br>#BookLovers #AItools #Reading #RekindleTheLove', 
'public');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (1, 'Hällõu', 'Test post content for User 1', 'public');
INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (2, 'Tere', 'Test post content for User 2', 'private');
INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (3, 'Testering', 'Test post content for User 3', 'almost_private');

INSERT INTO followers (follower_id, followed_id, status)
VALUES (1, 2, 'accepted');

INSERT INTO comments (user_id, post_id, content, created_at) 
VALUES (1, 1, 'Test comment content for User 1', '1990-03-01 00:00:00+00:00');

INSERT INTO post_access (post_id, follower_id) 
VALUES (3, 2);

INSERT INTO groups (group_name, creator_id, description, created_at) 
VALUES ('Nature photo enthusiasts', 4, 'Group for nature lovers. Join us and share your favorite photos of nature, from the forest to the sky.', '1990-03-01 00:00:00+00:00');

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (1, 4, "admin", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (1, 1, "member", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (1, 2, "pending", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (1, 3, "member", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO groups (group_name, creator_id, description, created_at) 
VALUES ('Houseplant Enthusiasts', 4, 'Welcome to Houseplant Haven — a cozy corner for all plant lovers!<br><br>Share your favorite plant care tips, showcase your lush indoor jungles, and get advice on keeping your green friends thriving. Whether you''re a seasoned botanist or just bought your first pothos, you''ll find a home here!', '1990-03-01 00:00:00+00:00');

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (2, 4, "admin", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (2, 1, "member", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO groups (group_name, creator_id, description, created_at) 
VALUES ('Farmhouse Revival', 1, 'Passionate about preserving history through the art of restoration?<br><br>Join Farmhouse Revival to connect with like-minded renovators, share your before-and-after transformations, and swap tips on tackling those stubborn barn beams or creaky floors. Together, let''s bring old farmhouses back to life, one plank at a time!', '1990-03-01 00:00:00+00:00');

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (3, 1, "admin", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (3, 2, "member", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO groups (group_name, creator_id, description, created_at) 
VALUES ('Jack Russell Pack', 2, 'This group is for all proud Jack Russell Terrier parents!<br><br> From training tips to hilarious antics, this is the perfect space to connect with other JRT lovers. Share stories, photos, and advice about caring for these feisty and lovable companions', '1990-03-01 00:00:00+00:00');

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (4, 3, "admin", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (4, 4, "member", "2024-12-12 15:05:49.419539+02:00");