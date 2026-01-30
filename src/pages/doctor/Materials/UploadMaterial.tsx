import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IEnrollment } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Upload, 
  FileText,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

const materialSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  courseOffering: z.string().min(1, 'Course is required'),
  category: z.enum(['Lectures', 'Sheets', 'Readings', 'Links']),
  isExternalLink: z.boolean(),
  url: z.string().min(1, 'URL is required'),
  file: z.instanceof(File).optional(),
});

type MaterialFormData = z.infer<typeof materialSchema>;

export function UploadMaterial() {
  const navigate = useNavigate();
  useAuthStore();
  const { success, error: showError } = useToastStore();
  const [myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExternalLink, setIsExternalLink] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      isExternalLink: false,
      category: 'Lectures',
    },
  });

  watch('courseOffering');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await api.getMyCourses({ semester: 'current' }).catch(() => []);
        setMyCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (error) {
        logger.error('Failed to fetch courses', {
          context: 'UploadMaterial',
          error,
        });
        showError('Failed to load courses');
      }
    };

    fetchCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- fetch once, showError stable

  useEffect(() => {
    setValue('isExternalLink', isExternalLink);
  }, [isExternalLink, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue('url', file.name);
    }
  };

  const onSubmit = async (_data: MaterialFormData) => {
    try {
      setLoading(true);
      
      // In real app, upload file to server and get URL
      // const formData = new FormData();
      // if (selectedFile) {
      //   formData.append('file', selectedFile);
      // }
      // formData.append('title', data.title);
      // formData.append('description', data.description || '');
      // formData.append('courseOffering', data.courseOffering);
      // formData.append('category', data.category);
      // formData.append('isExternalLink', String(data.isExternalLink));
      // 
      // const response = await api.uploadMaterial(formData);
      
      // Mock success
      success('Material uploaded successfully');
      navigate('/dashboard/materials');
    } catch (error) {
      logger.error('Failed to upload material', {
        context: 'UploadMaterial',
        error,
      });
      showError('Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Upload New Material
        </h1>
        <p className="text-gray-600 mt-1">
          Add new materials to your courses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary-600" />
            Material Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <select
                {...register('courseOffering')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">
                  Select a course...
                </option>
                {myCourses.map(course => (
                  <option key={course.courseOffering?.id} value={course.courseOffering?.id}>
                    {course.courseOffering?.course?.code} - {course.courseOffering?.course?.title}
                  </option>
                ))}
              </select>
              {errors.courseOffering && (
                <p className="mt-1 text-sm text-red-600">{errors.courseOffering.message}</p>
              )}
            </div>

            {/* Title */}
            <Input
              label="Title"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Enter material title..."
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter material description..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Lectures">Lectures</option>
                <option value="Sheets">Sheets</option>
                <option value="Readings">Readings</option>
                <option value="Links">Links</option>
              </select>
            </div>

            {/* Material Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsExternalLink(false)}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                    !isExternalLink
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FileText className="h-5 w-5 mx-auto mb-2" />
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setIsExternalLink(true)}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                    isExternalLink
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <LinkIcon className="h-5 w-5 mx-auto mb-2" />
                  External Link
                </button>
              </div>
            </div>

            {/* File Upload or URL */}
            {!isExternalLink ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag file here
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, PPT, XLS, TXT, ZIP (Max 50MB)
                    </p>
                  </label>
                  {selectedFile && (
                    <div className="mt-4 flex items-center justify-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setValue('url', '');
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {errors.file && (
                  <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
                )}
              </div>
            ) : (
              <Input
                label="URL Link"
                type="url"
                {...register('url')}
                error={errors.url?.message}
                placeholder="https://example.com/material"
              />
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard/materials')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

