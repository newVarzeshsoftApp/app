export interface CreateAdvertisementBody {
  title: string;
  link: string;
  description?: string;
  linkAction: 0 | 1;
  image: number;
  organization: number;
  priority: number;
  ratio: number;
}
