export interface UploadMediaBody {
  file: any; // File object for multipart/form-data
  title: 'brandedLogo' | 'officialLogo' | 'banner' | 'advertisement';
  ratio?: number;
}
