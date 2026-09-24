import type { Access, Role, Tier } from "../domain/rules";
import type { ChannelIconKey } from "../domain/inputs";

/** View models passed from the data layer to components (plain, serializable shapes). */

export interface PersonRef {
  id: string;
  nickname: string;
  headline: string;
  role: Role;
  tier: Tier;
}

export interface ViewerInfo extends PersonRef {
  bio: string;
  joinedAt: Date;
  premiumSince: Date | null;
}

export interface ChannelRef {
  id: string;
  name: string;
  icon: ChannelIconKey;
  access: Access;
}

export interface ChannelSummary extends ChannelRef {
  description: string;
  position: number;
  postCount: number;
  lastPostAt: Date | null;
}

export interface FeedItem {
  id: string;
  title: string;
  /** null when the viewer may not read the post (대외비). */
  excerpt: string | null;
  bodyLength: number;
  locked: boolean;
  premiumOnly: boolean;
  pinned: boolean;
  createdAt: Date;
  edited: boolean;
  channel: ChannelRef;
  author: PersonRef;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
}

export interface CommentView {
  id: string;
  body: string;
  createdAt: Date;
  author: PersonRef;
  canDelete: boolean;
}

export interface PostView extends Omit<FeedItem, "excerpt"> {
  body: string | null;
  channelId: string;
  canEdit: boolean;
  canDelete: boolean;
  canPin: boolean;
  comments: CommentView[];
}

export interface Neighbors {
  index: number;
  total: number;
  previousId: string | null;
  nextId: string | null;
}

export interface MeetupView {
  id: string;
  title: string;
  description: string;
  startsAt: Date;
  durationMinutes: number;
  location: string;
  format: "offline" | "online";
  capacity: number;
  access: Access;
  going: number;
  viewerGoing: boolean;
}

export interface MeetupDetail extends MeetupView {
  attendees: PersonRef[];
}
