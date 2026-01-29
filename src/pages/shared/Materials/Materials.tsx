import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IMaterial, IEnrollment } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  FileText, 
  BookOpen,
  Download,
  ExternalLink,
  Search
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { Input } from '@/components/ui/Input';
import { categoryIcons, categoryColors, fileTypeIcons } from '@/constants/ui';
import { logger } from '@/lib/logger';

export function Materials() {
  const { t } = useTranslation();
  useAuthStore();
  const { error: showError } = useToastStore();
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, materialsData] = await Promise.all([
          api.getMyCourses({ semester: 'current' }).catch(() => []),
          api.getCourseMaterials().catch(() => [])
        ]);
        
        const coursesArray = Array.isArray(coursesData) ? coursesData : [];
        const materialsArray = Array.isArray(materialsData) ? materialsData : [];
        
        setMyCourses(coursesArray);
        setMaterials(materialsArray);
      } catch (error) {
        logger.error('Failed to fetch materials', {
          context: 'Materials',
          error,
        });
        showError('Failed to load materials');
        setMaterials([]);
        setMyCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- showError stable, fetch once

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesCourse = selectedCourse === 'all' || 
      material.courseOffering.id === selectedCourse;
    const matchesCategory = selectedCategory === 'all' || 
      material.category === selectedCategory;
    const matchesSearch = 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCourse && matchesCategory && matchesSearch;
  });

  // Group materials by course
  const materialsByCourse = filteredMaterials.reduce((acc, material) => {
    const courseId = material.courseOffering.id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: material.courseOffering.course,
        materials: [],
      };
    }
    acc[courseId].materials.push(material);
    return acc;
  }, {} as Record<string, { course: { code: string; title: string }; materials: IMaterial[] }>);

  const getFileIcon = (material: IMaterial) => {
    if (material.isExternalLink) {
      return ExternalLink;
    }
    
    if (material.fileType) {
      const icon = fileTypeIcons[material.fileType.toLowerCase()];
      if (icon) return icon;
    }
    
    return FileText;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.materials')}</h1>
        <p className="text-gray-600 mt-1">Access course materials, lectures, and resources</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Courses</option>
              {myCourses.map(course => (
                <option key={course.courseOffering?.id} value={course.courseOffering?.id}>
                  {course.courseOffering?.course?.code} - {course.courseOffering?.course?.title}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              <option value="Lectures">Lectures</option>
              <option value="Sheets">Sheets</option>
              <option value="Readings">Readings</option>
              <option value="Links">Links</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No materials found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(materialsByCourse).map(({ course, materials: courseMaterials }) => (
            <Card key={course.code}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  {course.code} - {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courseMaterials.map((material) => {
                    const CategoryIcon = categoryIcons[material.category];
                    const FileIcon = getFileIcon(material);
                    
                    return (
                      <div
                        key={material.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${categoryColors[material.category]}`}>
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${categoryColors[material.category]}`}>
                              {material.category}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {material.title}
                        </h3>
                        
                        {material.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {material.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <FileIcon className="h-4 w-4" />
                            {material.isExternalLink ? (
                              <span>External Link</span>
                            ) : (
                              <span>{material.fileType?.toUpperCase() || 'File'}</span>
                            )}
                          </div>
                          <a
                            href={material.url}
                            target={material.isExternalLink ? '_blank' : undefined}
                            rel={material.isExternalLink ? 'noopener noreferrer' : undefined}
                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {material.isExternalLink ? (
                              <>
                                <ExternalLink className="h-4 w-4" />
                                Open
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                Download
                              </>
                            )}
                          </a>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-400">
                          Uploaded {new Date(material.uploadedAt).toLocaleDateString()} by {material.uploadedBy.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredMaterials.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredMaterials.length} of {materials.length} materials
        </div>
      )}
    </div>
  );
}

