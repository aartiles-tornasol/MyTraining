import { reviewScreens } from '@/lib/program/review';
import { ReviewPlayer } from '@/components/ReviewPlayer';

export const dynamic = 'force-dynamic';

/**
 * Review mode: every working screen in the programme, in the real player
 * chrome, with nothing running and nothing saved. Not linked from the tab bar
 * — it is a tool for going through the catalogue, not part of training.
 */
export default function Revision() {
  return <ReviewPlayer screens={reviewScreens()} />;
}
