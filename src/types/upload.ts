export interface File {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype: string;
  buffer?: any;
  size: number;
  url?: string; // Added for frontend previews
}
