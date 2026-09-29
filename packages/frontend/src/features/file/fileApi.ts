import { api } from '../../app/api';

export interface FileDoc {
  _id: string;
  organizationId: string;
  todoId?: string;
  userId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
}

export const fileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<{ data: FileDoc }, FormData>({
      query: (formData) => ({
        url: '/files/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['File'],
    }),

    getFiles: builder.query<{ data: FileDoc[] }, { todoId?: string }>({
      query: (params) => ({
        url: '/files',
        params,
      }),
      providesTags: ['File'],
    }),

    deleteFile: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['File'],
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetFilesQuery,
  useDeleteFileMutation,
} = fileApi;