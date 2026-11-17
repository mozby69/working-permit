

export type QueryParamWP = {
  page?: number;
  limit?: number;
  search?: string;
  userId: number;
  roles: string[];
};



export type UploadedAttachment = {
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
};


export type AttachmentParams = {
  permitId: string;
  attachmentId: string;
};