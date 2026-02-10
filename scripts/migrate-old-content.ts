import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get UK country ID
async function getCountryId(code: string) {
  const { data } = await supabase
    .from("countries")
    .select("id")
    .eq("code", code)
    .single();
  return data?.id;
}

async function createPages() {
  const ukId = await getCountryId("gb");

  if (!ukId) {
    console.error("UK country not found");
    return;
  }

  const pages = [
    {
      page_key: "dating-tips",
      country_id: ukId,
      language_code: "en",
      title: "Dating Tips",
      meta_title: "Dating Tips | TheSpeedDating",
      meta_description: "Expert dating tips to help you make the most of your speed dating experience",
      is_published: true,
      content_html: `
<h2>General Tips</h2>
<ul>
  <li><strong>Be who you are</strong> - Authenticity is key to making genuine connections.</li>
  <li><strong>First impressions are the most powerful ones</strong> - Make them count!</li>
  <li><strong>Try to talk and listen equally</strong> - Balance is important in conversation.</li>
  <li><strong>Avoid asking the same questions each time</strong> - Keep it fresh and interesting.</li>
  <li><strong>Be creative</strong> - Stand out from the crowd with original questions.</li>
  <li><strong>Try and make it entertaining</strong> - Keep the conversation light and fun.</li>
</ul>

<p>You can ask any questions you like, but remember that first impressions count and being original is a plus. Instead of asking "What do you do for work?" or "Where do you live?", try more surprising questions like:</p>
<ul>
  <li>"Where would you go for a romantic holiday?"</li>
  <li>"What do you look at first when meeting someone for the first time?"</li>
</ul>

<p><strong>Enjoy dating for what it is</strong> - meeting people and socializing. Most people have something interesting to offer. While you may not be looking for new friends, you may well find one or two fabulous people along the way.</p>

<h2>Tips for Men</h2>
<ul>
  <li><strong>Smile</strong> - Women are smile addicts. A few well-placed smiles and a happy attitude can win hearts faster than looks alone.</li>
  <li><strong>Stand straight and sit up</strong> - Good posture shows confidence and strength.</li>
  <li><strong>Use her name throughout your conversation</strong> - This creates a more intimate atmosphere.</li>
  <li><strong>Keep your hands to yourself</strong> - Even if you feel close, it's only a first mini date!</li>
  <li><strong>Use deodorant</strong> - Personal hygiene matters. The main idea is being non-smelling, which is more important than good-smelling.</li>
  <li><strong>Avoid controversial topics</strong> - Keep conversations light and friendly. Avoid subjects that might cause tension.</li>
  <li><strong>Show tolerance and open-mindedness</strong> - Demonstrate emotional strength and self-confidence.</li>
  <li><strong>Know yourself</strong> - Be ready to talk about your hobbies, job, and interests. This shows you have a stable background.</li>
</ul>

<h2>Tips for Women</h2>
<ul>
  <li><strong>Always look great</strong> - Looking your best will make you feel your best.</li>
  <li><strong>Be a little mysterious</strong> - You don't have to reveal everything. An enigmatic woman is intriguing.</li>
  <li><strong>Don't talk about ex-boyfriends</strong> - Your past relationships are your business only.</li>
  <li><strong>Assume nothing</strong> - You cannot always tell by looking. Give people a chance.</li>
  <li><strong>Take pride in your appearance</strong> - Men appreciate a woman who cares about how she looks.</li>
  <li><strong>Be trustworthy</strong> - Show you're someone they can have faith in.</li>
  <li><strong>Retain your femininity</strong> - Be caring and kind.</li>
  <li><strong>Be challenging</strong> - Keep them on their toes.</li>
  <li><strong>Watch your posture</strong> - An open posture shows you're an open person. Turn toward the person you're talking with and lean forward to show interest.</li>
</ul>
      `,
    },
    {
      page_key: "what-is-speed-dating",
      country_id: ukId,
      language_code: "en",
      title: "What Is Speed Dating",
      meta_title: "What Is Speed Dating | TheSpeedDating",
      meta_description: "Learn about speed dating and how our events work",
      is_published: true,
      content_html: `
<h2>What is Speed Dating?</h2>
<p>Speed Dating is a fun and efficient way to meet multiple potential partners in one evening. Our events are designed to give you the opportunity to have 7-minute one-on-one conversations with each participant.</p>

<h2>How Does It Work?</h2>
<ol>
  <li><strong>Register for an Event</strong> - Choose an event that suits your age group and preferences.</li>
  <li><strong>Arrive at the Venue</strong> - Come to our professionally organized event at the designated time.</li>
  <li><strong>Meet Everyone</strong> - You'll have 7 minutes with each person. When the bell rings, move to the next date.</li>
  <li><strong>Make Your Choices</strong> - After each mini-date, mark on your card if you'd like to see them again.</li>
  <li><strong>Get Your Matches</strong> - If there's mutual interest, we'll send you their contact details within 48 hours.</li>
</ol>

<h2>Why Speed Dating?</h2>
<ul>
  <li><strong>Efficient</strong> - Meet 10-15 potential partners in a single evening</li>
  <li><strong>Safe</strong> - All events are held in reputable venues with professional hosts</li>
  <li><strong>Fun</strong> - Enjoy a social evening out, even if you don't meet "the one"</li>
  <li><strong>No Pressure</strong> - Only exchange details if there's mutual interest</li>
  <li><strong>Real Connections</strong> - Face-to-face interaction beats online chatting</li>
</ul>

<p><strong>Please note:</strong> We accept advance bookings only to ensure the evening's success and maintain a good gender balance.</p>
      `,
    },
    {
      page_key: "matchmaking",
      country_id: ukId,
      language_code: "en",
      title: "Personal Matchmaking Services",
      meta_title: "Personal Matchmaking | TheSpeedDating",
      meta_description: "Personalized matchmaking services for Jewish singles seeking serious relationships",
      is_published: true,
      content_html: `
<h2>Personal Matchmaking</h2>
<p>Looking for something more personalized than speed dating? Our matchmaking service offers a tailored approach to finding your perfect match.</p>

<h2>How Our Matchmaking Works</h2>
<p>Our experienced matchmakers take the time to understand you, your values, lifestyle, and what you're looking for in a partner. We then carefully select potential matches from our extensive database of verified Jewish singles.</p>

<h3>The Process</h3>
<ol>
  <li><strong>Initial Consultation</strong> - We meet with you to understand your preferences and requirements</li>
  <li><strong>Profile Creation</strong> - We create a detailed profile highlighting your best qualities</li>
  <li><strong>Careful Matching</strong> - Our team personally reviews and selects compatible matches</li>
  <li><strong>Arranged Introductions</strong> - We facilitate introductions with your selected matches</li>
  <li><strong>Ongoing Support</strong> - We provide feedback and guidance throughout your dating journey</li>
</ol>

<h2>Why Choose Our Matchmaking Service?</h2>
<ul>
  <li><strong>Personal Attention</strong> - Dedicated matchmaker working specifically for you</li>
  <li><strong>Quality Over Quantity</strong> - Carefully vetted matches based on compatibility</li>
  <li><strong>Discretion</strong> - Complete confidentiality and privacy</li>
  <li><strong>Time-Saving</strong> - We do the searching and screening for you</li>
  <li><strong>Expert Guidance</strong> - Professional dating coaches to support you</li>
</ul>

<h2>Who Is It For?</h2>
<p>Our matchmaking service is ideal for busy professionals and those who prefer a more personalized approach to finding love. If you're serious about finding a long-term relationship and want expert help, this service is for you.</p>

<p><strong>Interested?</strong> Contact us to schedule your confidential consultation and learn more about our matchmaking packages.</p>
      `,
    },
    {
      page_key: "online-dating",
      country_id: ukId,
      language_code: "en",
      title: "Online Dating Tips & Advice",
      meta_title: "Online Dating Tips | TheSpeedDating",
      meta_description: "Expert advice for successful online dating in the Jewish community",
      is_published: true,
      content_html: `
<h2>Online Dating in the Jewish Community</h2>
<p>While we believe nothing beats face-to-face interaction at our speed dating events, we understand that online dating can be a useful complement to your search for love.</p>

<h2>Making Online Dating Work for You</h2>

<h3>Creating Your Profile</h3>
<ul>
  <li><strong>Be Honest</strong> - Use recent photos and be truthful about yourself</li>
  <li><strong>Show Your Personality</strong> - Let your unique qualities shine through</li>
  <li><strong>Be Specific</strong> - Mention your interests, hobbies, and what makes you tick</li>
  <li><strong>Proofread</strong> - Check for spelling and grammar errors</li>
</ul>

<h3>Safety First</h3>
<ul>
  <li><strong>Keep Personal Info Private</strong> - Don't share your address, phone number, or workplace initially</li>
  <li><strong>Meet in Public</strong> - First meetings should always be in public places</li>
  <li><strong>Tell a Friend</strong> - Let someone know where you're going and who you're meeting</li>
  <li><strong>Trust Your Instincts</strong> - If something feels off, it probably is</li>
</ul>

<h3>Effective Communication</h3>
<ul>
  <li><strong>Ask Questions</strong> - Show genuine interest in getting to know them</li>
  <li><strong>Be Responsive</strong> - Reply to messages in a timely manner</li>
  <li><strong>Move Offline</strong> - Don't message for months; suggest meeting after a few exchanges</li>
  <li><strong>Be Respectful</strong> - Treat others how you'd want to be treated</li>
</ul>

<h2>Why Consider In-Person Events?</h2>
<p>While online dating has its place, our speed dating events offer advantages that can't be replicated digitally:</p>
<ul>
  <li>Immediate chemistry and connection</li>
  <li>No catfishing or misleading profiles</li>
  <li>More authentic conversations</li>
  <li>Meet multiple people in one evening</li>
  <li>Fun social atmosphere</li>
</ul>

<p><strong>Ready to try something different?</strong> Check out our upcoming speed dating events and experience the difference of meeting people face-to-face!</p>
      `,
    },
  ];

  console.log("Creating pages...\n");

  for (const page of pages) {
    console.log(`Creating: ${page.title}...`);

    // Check if page already exists
    const { data: existing } = await supabase
      .from("pages")
      .select("id")
      .eq("page_key", page.page_key)
      .eq("country_id", page.country_id)
      .eq("language_code", page.language_code)
      .single();

    if (existing) {
      console.log(`  ⚠️  Page already exists, skipping`);
      continue;
    }

    const { error } = await supabase.from("pages").insert(page);

    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Created successfully`);
    }
  }

  console.log("\n✨ All pages migrated!");
}

createPages().catch(console.error);
