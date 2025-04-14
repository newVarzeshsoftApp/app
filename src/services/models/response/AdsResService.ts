export interface ProfileImageAds {
  name: string;
  width: number;
  height: number;
  size: number;
  data: Record<string, any>;
  dataUrl: string;
  ratio: number;
}

export interface BannerContent {
  profile: ProfileImageAds;
  id: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  title: string;
  link: string;
  description: string;
  linkAction: number;
  priority: number;
  ratio: string;
}

export interface BannerListResponse {
  content: BannerContent[];
  count: number;
}
