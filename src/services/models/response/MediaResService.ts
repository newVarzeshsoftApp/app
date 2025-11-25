export interface MediaDto {
  id: string;
  name: string;
  srcset: Record<string, string>;
  mimetype: string;
  fileSize: number;
  title: string;
}
