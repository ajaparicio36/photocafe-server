import cron from "node-cron";
import { deleteOldFiles } from "./storage";

export const startCleanupCron = () => {
  // Run every 8 hours: at 00:00, 08:00, and 16:00
  cron.schedule(
    "0 */8 * * *",
    async () => {
      console.log("Starting scheduled cleanup...");
      try {
        const { deleted, failed } = await deleteOldFiles();
        console.log(
          `Cleanup completed: ${deleted.length} deleted, ${failed.length} failed`
        );
      } catch (error) {
        console.error("Scheduled cleanup failed:", error);
      }
    },
    {
      timezone: "Asia/Manila", // Adjust to your timezone
    }
  );

  console.log("Cleanup cron job scheduled to run every 8 hours");
};
