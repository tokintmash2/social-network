-- Users


INSERT INTO users (email, password, first_name, last_name, dob, username, about_me, avatar) 
VALUES ('asd@asd.ee', '$2a$10$SoSjc4fBxSbXvl1R15ispOhE70e2tZoLAzISkc.2Ky8hzysC7FNbC', 'Taylor', 'Lorenzo', '1990-03-01 00:00:00+00:00', 'taylor_l', 'I am a student of the University of Tartu.', 'default_avatar.jpg');
INSERT INTO users (email, password, first_name, last_name, dob, username, about_me, avatar) 
VALUES ('qwe@qwe.ee', '$2a$10$SoSjc4fBxSbXvl1R15ispOhE70e2tZoLAzISkc.2Ky8hzysC7FNbC', 'qwe', 'qwe', '1990-03-01 00:00:00+00:00', 'qwe', 'testuser', 'default_avatar.jpg');
INSERT INTO users (email, password, first_name, last_name, dob, username, about_me, avatar, is_public) 
VALUES ('test@mail.ee', '$2a$10$SoSjc4fBxSbXvl1R15ispOhE70e2tZoLAzISkc.2Ky8hzysC7FNbC', 'Peter', 'Parker', '1985-03-01 00:00:00+00:00', 'pparker', 
'Aspiring software engineer from Paide, Estonia. I like to play tennis and play video games, read autobiographies and listen to classical music.', 'peter.jpg', false);



-- Followers

INSERT INTO followers (follower_id, followed_id, status)
VALUES (1, 2, 'accepted');

INSERT INTO followers (follower_id, followed_id, status)
VALUES (4, 1, 'accepted');

INSERT INTO followers (follower_id, followed_id, status)
VALUES (4, 2, 'accepted');

INSERT INTO followers (follower_id, followed_id, status)
VALUES (4, 3, 'accepted');

INSERT INTO followers (follower_id, followed_id, status)
VALUES (1, 3, 'accepted');

INSERT INTO followers (follower_id, followed_id, status)
VALUES (1, 4, 'accepted');

INSERT INTO followers (follower_id, followed_id, status)
VALUES (2, 4, 'accepted');



INSERT INTO post_access (post_id, follower_id) 
VALUES (3, 2);


-- Group members

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (1, 4, "admin", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (1, 1, "member", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (1, 2, "pending", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (1, 3, "member", "2024-12-12 15:05:49.419539+02:00");


INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (2, 4, "admin", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (2, 1, "member", "2024-12-12 15:05:49.419539+02:00");


INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (3, 1, "admin", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (3, 2, "member", "2024-12-12 15:05:49.419539+02:00");


INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (4, 3, "admin", "2024-12-12 15:05:49.419539+02:00");

INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (4, 4, "member", "2024-12-12 15:05:49.419539+02:00");

-- Groups
INSERT INTO groups (group_name, creator_id, description, created_at) 
VALUES ('Jack Russell Pack', 2, 'This group is for all proud Jack Russell Terrier parents!<br><br> From training tips to hilarious antics, this is the perfect space to connect with other JRT lovers. Share stories, photos, and advice about caring for these feisty and lovable companions', '1990-03-01 00:00:00+00:00');

INSERT INTO groups (group_name, creator_id, description, created_at) 
VALUES ('Nature photo enthusiasts', 4, 'Group for nature lovers. Join us and share your favorite photos of nature, from the forest to the sky.', '1990-03-01 00:00:00+00:00');

INSERT INTO groups (group_name, creator_id, description, created_at) 
VALUES ('Houseplant Enthusiasts', 4, 'Welcome to Houseplant Haven — a cozy corner for all plant lovers!<br><br>Share your favorite plant care tips, showcase your lush indoor jungles, and get advice on keeping your green friends thriving. Whether you''re a seasoned botanist or just bought your first pothos, you''ll find a home here!', '1990-03-01 00:00:00+00:00');

INSERT INTO groups (group_name, creator_id, description, created_at) 
VALUES ('Farmhouse Revival', 1, 'Passionate about preserving history through the art of restoration?<br><br>Join Farmhouse Revival to connect with like-minded renovators, share your before-and-after transformations, and swap tips on tackling those stubborn barn beams or creaky floors. Together, let''s bring old farmhouses back to life, one plank at a time!', '1990-03-01 00:00:00+00:00');


-- Group events

INSERT INTO events (group_id, title, description, date_time, created_by) 
VALUES (1, 'Book Club Meeting', 'Join us for a virtual book club discussion!', '2024-03-01 10:00:00+00:00', 4);

INSERT INTO events (group_id, title, description, date_time, created_by) 
VALUES (1, 'Nature Photography Workshop', 'Learn the basics of nature photography!', '2024-04-01 10:00:00+00:00', 4);

INSERT INTO events (group_id, title, description, date_time, created_by) 
VALUES (2, 'Houseplant Care Tips', 'Discover the secrets of houseplant care!', '2024-05-01 10:00:00+00:00', 4);

INSERT INTO events (group_id, title, description, date_time, created_by) 
VALUES (3, 'Farmhouse Renovation', 'Transform your farmhouse into a cozy haven!', '2024-06-01 10:00:00+00:00', 4);

INSERT INTO events (group_id, title, description, date_time, created_by) 
VALUES (4, 'Dog Training Workshop', 'Learn the basics of dog training!', '2024-07-01 10:00:00+00:00', 4);

INSERT INTO events (group_id, title, description, date_time, created_by)
VALUES (4, 'Puppy Playdate', 'Join us for a fun puppy playdate!', '2024-07-01 10:00:00+00:00', 4);

INSERT INTO events (group_id, title, description, date_time, created_by)
VALUES (4, 'Puppy Playdate', 'Join us for a fun puppy playdate!', '2024-08-01 20:00:00+00:00', 4);

INSERT INTO events (group_id, title, description, date_time, created_by)
VALUES (4, 'Puppy Playdate', 'Join us for a fun puppy playdate!', '2024-09-01 20:00:00+00:00', 4);

INSERT INTO events (group_id, title, description, date_time, created_by)
VALUES (4, 'Puppy Playdate', 'Join us for a fun puppy playdate!', '2024-10-01 20:00:00+00:00', 4);

--  Group Posts
INSERT INTO group_posts (group_id, user_id, title, content) 
VALUES (2, 1, 'My Monstera is Thriving!', 'Check out these new leaves on my Monstera Deliciosa. The fenestration is amazing this season!');

INSERT INTO group_posts (group_id, user_id, title, content) 
VALUES (3, 2, 'Barn Door Restoration Complete', 'Finally finished restoring this 100-year-old barn door. Swipe to see the before and after!');

INSERT INTO group_posts (group_id, user_id, title, content, timestamp) 
VALUES (1, 2, 'Beautiful Saaremaa Sunset', 'Just captured this amazing sunset at Saaremaa! The orange sky reflecting off the Baltic Sea was breathtaking. What do you think?', '2024-01-15 19:30:00+02:00');

INSERT INTO group_posts (group_id, user_id, title, content, timestamp) 
VALUES (1, 1, 'Spring Wildflowers in Lahemaa', 'Found these beautiful wildflowers during my hike in Lahemaa National Park. The colors this spring are incredible!', '2024-01-14 14:15:00+02:00');

INSERT INTO group_posts (group_id, user_id, title, content, timestamp) 
VALUES (1, 3, 'Misty Morning in Tartu', 'Morning fog in Tartu. The way the mist rolls over the Emajõgi river creates such a mystical atmosphere. Who else loves early morning nature photography?', '2024-01-13 08:45:00+02:00');


--  Regular Posts
INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (3, 'Weekend Hiking Adventure', 'Just completed a 15km hike in Soomaa National Park. The views were incredible!', 'public');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (2, 'My Secret Recipe', 'Grandmother''s special black bread recipe - only sharing with close friends!', 'almost_private');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (1, 'A Day at the Beach', 'Spent a sunny day at the beach with friends. Waves were amazing!', 'public');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (1, 'Personal Reflection', 'Life has been a rollercoaster lately, but I''m finding my balance.', 'private');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (2, 'My Secret Recipe', 'Grandmother''s special black bread recipe - only sharing with close friends!', 'almost_private');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (2, 'Hiking Adventures', 'Explored the local mountains today. Nature is so calming!', 'public');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (3, 'Workout Progress', 'Feeling stronger every week! Loving this new routine.', 'private');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (3, 'Travel Bucket List', 'Dreaming of visiting Iceland and seeing the Northern Lights.', 'almost_private');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (4, 'Book Recommendations', 'Just finished "The Alchemist" - a must-read for everyone!', 'public');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (4, 'Coding Journey', 'Learning React has been a rewarding challenge. Excited for more!', 'almost_private');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (5, 'Garden Update', 'My roses are blooming beautifully this season!', 'private');

INSERT INTO posts (user_id, title, content, privacy_setting) 
VALUES (5, 'Weekend Plans', 'Planning a relaxing weekend with family and good food.', 'public');

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


-- Comments on  Posts
INSERT INTO comments (post_id, user_id, content) 
VALUES (1, 2, 'This is exactly what I needed to hear about AI tools!');

INSERT INTO comments (post_id, user_id, content) 
VALUES (1, 3, 'Great insights! Which AI tool did you use specifically?');

INSERT INTO comments (user_id, post_id, content, created_at) 
VALUES (1, 1, 'Amazing!', '1990-03-01 00:00:00+00:00');

-- Comments on Group Posts
INSERT INTO group_post_comments (group_post_id, user_id, content) 
VALUES (1, 3, 'Stunning capture! The colors are absolutely magical.');

INSERT INTO group_post_comments (group_post_id, user_id, content) 
VALUES (2, 4, 'The composition in this shot is perfect! What camera settings did you use?');

--  Group Membership for Context
INSERT INTO group_memberships (group_id, user_id, role, joined_at) 
VALUES (2, 3, 'member', CURRENT_TIMESTAMP);
