import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { inngest } from "@/lib/inngest/client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompt";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import { formatDateToday } from "@/lib/utils";

export const sendSignUpEmail = inngest.createFunction(
  {
    id: "sign-up-email",
  },
  {
    event: "app/user.created",
  },
  async ({ event, step }) => {
    const userProfile = `- Country: ${event.data.country}
                            - Investment goals: ${event.data.investmentGoals}
                            - Risk tolerance: ${event.data.riskTolerance}
                            - Preferred Industrys: ${event.data.preferredIndustries}
                            `;
    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({
        model: "gemini-2.5-flash-lite",
      }),
      body: {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      },
    });

    await step.run("send-welcome-email", async () => {
        const part = response.candidates?.[0]?.content?.parts?.[0];
        const introText = (part && 'text' in part ? part.text: null) ||  "Welcome to Dukem Stock! We're excited to have you on board.";

        const {data: {
          email, name
        }} = event;
        // email sending logic
        return await sendWelcomeEmail({
          email, name, intro: introText
        })
    })

    return {
        success: true,
        message: "Welcome email process completed"
    }
  }
);


export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: "daily-news-summary",
  },
  [
    {
      event: "app/send.daily.news",
    },
    {
      cron: "0 12 * * *", // Every day at 12 PM UTC
    },
  ],
  async ({ step }) => {
    // Step 1: Get all users for news delivery
    const users = await step.run("get-all-users", async () => {
      return await getAllUsersForNewsEmail();
    });

    if (!users || users.length === 0) {
      return {
        success: false,
        message: "No users found for news delivery",
      };
    }

    // Step 2: For each user, get watchlist symbols and fetch news
    const newsData = await step.run("fetch-personalized-news", async () => {
      const userNewsPromises = users.map(async (user) => {
        try {
          // Get user's watchlist symbols
          const symbols = await getWatchlistSymbolsByEmail(user.email);

          // Fetch news (personalized if symbols exist, general otherwise)
          const news =
            symbols.length > 0 ? await getNews(symbols) : await getNews();

          return {
            user,
            news,
          };
        } catch (error) {
          console.error(`Error fetching news for user ${user.email}:`, error);
          return {
            user,
            news: [],
          };
        }
      });

      return await Promise.all(userNewsPromises);
    });

    // Step 3: Summarize news using AI (placeholder)
    const userNewsSummaries :{ user: User; newsContent: string| null}[] = []

    for (const { user, news } of newsData) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(news,null,2)
        );

        const response = await step.ai.infer(`summarize-news-${user.email}`, {
          model: step.ai.models.gemini({
            model: "gemini-2.5-flash-lite",
          }),
          body: {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }
        })

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const newsContent = (part && 'text' in part ? part.text: null) || "No market news available today.";
        userNewsSummaries.push({ user, newsContent: newsContent });
      } catch (error) {
        console.error(`Error summarizing news for user ${user.email}:`, error);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }

    // Step 4: Send emails with news summary (placeholder)
    await step.run("send-news-emails", async () => {
      // TODO: Implement email sending logic
      await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return false;
          return await sendNewsSummaryEmail({
            email: user.email,
            date: formatDateToday,
            newsContent,
          })
        })
      )
    });

    return {
      success: true,
      message: `Daily news summary processed for ${users.length} users`,
    };
  }
);